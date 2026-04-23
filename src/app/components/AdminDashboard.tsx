import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Edit2, Trash2, X, Save, Loader2, Package, Search, Menu, Megaphone } from 'lucide-react';
import { onProductsSnapshot, deleteProduct, addProduct, updateProduct, getCategories, createAnnouncement, notifyCustomersWhatsNew } from '../services/firestore';
import type { ProductDoc, ProductCategoryDoc } from '../types/firestore';
import type { StoreId } from '../types/menu';
import { toast } from 'sonner';
import { useNavigate } from 'react-router';
import { useAppContext } from './AppContext';
import { AdminNavPanel } from './AdminNavPanel';

const emptyForm: ProductDoc = {
  productId: '',
  storeId: 'lehmuhn',
  productName: '',
  price: 0,
  categoryId: '',
  imageUrl: '',
  isAvailable: true,
  meta: {},
};

const TEMPERATURE_CATEGORY_OPTIONS = [
  { value: 'hot', label: 'Hot' },
  { value: 'cold', label: 'Cold' },
  { value: 'hot-cold', label: 'Hot & Cold' },
] as const;

function isValidHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

function isKohfeeFoodCategory(storeId: string, categoryId?: string): boolean {
  const normalized = (categoryId ?? '').trim().toLowerCase();
  return storeId === 'kohfee' && (normalized === 'kf-food' || normalized === 'food');
}

export function AdminDashboard() {
  const navigate = useNavigate();
  const { userProfile, authLoading } = useAppContext();
  const [activeStore, setActiveStore] = useState<StoreId>('lehmuhn');
  const [products, setProducts] = useState<ProductDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNavPanel, setShowNavPanel] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductDoc | null>(null);
  const [form, setForm] = useState<ProductDoc>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [categories, setCategories] = useState<ProductCategoryDoc[]>([]);
  const [metaDescription, setMetaDescription] = useState('');
  const [metaIsBestSeller, setMetaIsBestSeller] = useState(false);
  const [metaIsFanFave, setMetaIsFanFave] = useState(false);
  const [metaIsTrending, setMetaIsTrending] = useState(false);
  const [lehmuhnGrandePrice, setLehmuhnGrandePrice] = useState('');
  const [lehmuhnExtraGrandePrice, setLehmuhnExtraGrandePrice] = useState('');
  const [notifyUsers, setNotifyUsers] = useState(false);

  const categoryOptions = React.useMemo(() => {
    const baseOptions = categories.map(cat => ({
      value: cat.categoryId,
      label: cat.name,
    }));
    const existingValues = new Set(baseOptions.map(option => option.value));
    const temperatureOptions = TEMPERATURE_CATEGORY_OPTIONS.filter(option => !existingValues.has(option.value));
    return [...temperatureOptions, ...baseOptions];
  }, [categories]);

  useEffect(() => {
    if (authLoading) return;
    if (userProfile?.role !== 'ADMIN') {
      navigate('/home', { replace: true });
    }
  }, [authLoading, userProfile, navigate]);

  useEffect(() => {
    setLoading(true);
    const unsub = onProductsSnapshot(activeStore, (docs) => {
      setProducts(docs);
      setLoading(false);
    });
    return unsub;
  }, [activeStore]);

  useEffect(() => {
    getCategories(activeStore).then(setCategories);
  }, [activeStore]);

  const filtered = products.filter(p =>
    p.productName.toLowerCase().includes(search.toLowerCase()),
  );
  const isFoodPricingMode = isKohfeeFoodCategory(form.storeId, form.categoryId);
  const hasRequiredFields = Boolean(
    form.productName.trim() &&
    form.imageUrl.trim() &&
    (
      isFoodPricingMode
        ? Number.isFinite(Number(form.price)) && Number(form.price) > 0
        : (lehmuhnGrandePrice.trim() && Number(lehmuhnGrandePrice) > 0)
    ),
  );

  const openAddForm = () => {
    setEditingProduct(null);
    setForm({ ...emptyForm, storeId: activeStore });
    setMetaDescription('');
    setMetaIsBestSeller(false);
    setMetaIsFanFave(false);
    setMetaIsTrending(false);
    setLehmuhnGrandePrice('');
    setLehmuhnExtraGrandePrice('');
    setNotifyUsers(false);
    setShowForm(true);
  };

  const openEditForm = (product: ProductDoc) => {
    setEditingProduct(product);
    setForm({ ...product });
    const meta = (product.meta ?? {}) as Record<string, unknown>;
    setMetaDescription((meta.description as string) ?? '');
    const isBestSeller = (meta.isBestSeller as boolean) ?? (meta.isPremium as boolean) ?? false;
    const priceBySizeOz = (meta.priceBySizeOz as Partial<Record<number, number>> | undefined) ?? {};
    setMetaIsBestSeller(isBestSeller);
    setMetaIsFanFave((meta.isFanFave as boolean) ?? false);
    setMetaIsTrending((meta.isTrending as boolean) ?? false);
    const isFood = isKohfeeFoodCategory(product.storeId as StoreId, product.categoryId);
    setLehmuhnGrandePrice(isFood ? '' : String(priceBySizeOz[16] ?? product.price ?? ''));
    setLehmuhnExtraGrandePrice(isFood ? '' : String(priceBySizeOz[22] ?? ''));
    setShowForm(true);
  };

  const handleSave = async () => {
    if (userProfile?.role !== 'ADMIN') return;
    const trimmedProductName = form.productName.trim();
    const trimmedImageUrl = form.imageUrl.trim();
    const trimmedCategoryId = (form.categoryId ?? '').trim();
    if (!trimmedProductName) {
      toast.error('Product name is required');
      return;
    }
    if (trimmedProductName.length < 2) {
      toast.error('Product name must be at least 2 characters');
      return;
    }
    if (!trimmedCategoryId) {
      toast.error('Category is required');
      return;
    }
    if (!trimmedImageUrl) {
      toast.error('Image URL is required');
      return;
    }
    if (!isValidHttpUrl(trimmedImageUrl)) {
      toast.error('Image URL must start with http:// or https://');
      return;
    }
    setSaving(true);

    try {
      const baseMeta = {
        ...(form.meta ?? {}),
        description: metaDescription,
        isBestSeller: metaIsBestSeller,
        isFanFave: metaIsFanFave,
        isTrending: metaIsTrending,
        // Keep legacy key in sync with Best Seller for older readers.
        isPremium: metaIsBestSeller,
      };
      const isFood = isKohfeeFoodCategory(form.storeId, trimmedCategoryId);
      const parsedFixedPrice = Number(form.price);
      const parsedGrande = Number(lehmuhnGrandePrice);
      const parsedExtraGrande = Number(lehmuhnExtraGrandePrice);
      const hasFixedPrice = Number.isFinite(parsedFixedPrice) && parsedFixedPrice > 0;
      const hasGrande = Number.isFinite(parsedGrande) && parsedGrande > 0;
      const hasExtraGrande = Number.isFinite(parsedExtraGrande) && parsedExtraGrande > 0;
      if (isFood && !hasFixedPrice) {
        toast.error('Price is required for Food category');
        setSaving(false);
        return;
      }
      if (!isFood && !hasGrande) {
        toast.error('Grande (16oz) price is required');
        setSaving(false);
        return;
      }
      const currentSizePrices = ((form.meta as Record<string, unknown> | undefined)?.priceBySizeOz as Partial<Record<number, number>> | undefined) ?? {};
      const normalizedSizePrices: Partial<Record<number, number>> = {
        ...currentSizePrices,
      };

      if (!isFood && hasGrande) {
        normalizedSizePrices[16] = parsedGrande;
      } else {
        delete normalizedSizePrices[16];
      }

      if (!isFood && hasExtraGrande) {
        normalizedSizePrices[22] = parsedExtraGrande;
      } else {
        delete normalizedSizePrices[22];
      }
      if (!isFood && hasExtraGrande && parsedExtraGrande < parsedGrande) {
        toast.error('Extra Grande price must be greater than or equal to Grande');
        setSaving(false);
        return;
      }

      const {
        priceBySizeOz: _ignoredPriceBySizeOz,
        basePrice: _ignoredLegacyBasePrice,
        ...restMeta
      } = baseMeta as Record<string, unknown>;
      const meta = {
        ...restMeta,
        ...(Object.keys(normalizedSizePrices).length > 0 ? { priceBySizeOz: normalizedSizePrices } : {}),
      };
      const normalizedBasePrice = isFood ? parsedFixedPrice : parsedGrande;

      if (editingProduct) {
        await updateProduct(editingProduct.productId, {
          storeId: form.storeId,
          productName: trimmedProductName,
          price: normalizedBasePrice,
          categoryId: trimmedCategoryId,
          imageUrl: trimmedImageUrl,
          isAvailable: form.isAvailable,
          meta,
        });
        toast.success('Product updated successfully');
      } else {
        const newProduct = await addProduct({
          storeId: form.storeId,
          productName: trimmedProductName,
          price: normalizedBasePrice,
          categoryId: trimmedCategoryId,
          imageUrl: trimmedImageUrl,
          isAvailable: form.isAvailable,
          meta,
        });
        if (notifyUsers) {
          const storeName = form.storeId === 'lehmuhn' ? 'the leh-muhn' : 'the koh-fee';
          const announcementTitle = `New item at ${storeName}!`;
          const announcementMessage = `${trimmedProductName} is now available. Check it out!`;
          await createAnnouncement({
            storeId: form.storeId,
            title: announcementTitle,
            message: announcementMessage,
            imageUrl: trimmedImageUrl || undefined,
            productId: newProduct.productId,
          });
          try {
            await notifyCustomersWhatsNew(announcementTitle, announcementMessage);
          } catch (notificationErr) {
            toast.error('Product saved, but failed to send customer notifications');
          }
        }
        toast.success('Product added successfully');
      }
      setShowForm(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      toast.error(`Failed to save product: ${message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (productId: string) => {
    if (userProfile?.role !== 'ADMIN') return;
    if (!productId) {
      toast.error('Invalid product ID');
      return;
    }
    try {
      await deleteProduct(productId);
      toast.success('Product deleted');
    } catch (err) {
      toast.error('Failed to delete product');
    }
    setConfirmDelete(null);
  };

  if (authLoading || userProfile?.role !== 'ADMIN') {
    return (
      <div className="px-4 pt-10 pb-6 flex items-center justify-center">
        <Loader2 size={28} color="#00704A" className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="px-4 pt-10 pb-6">
      <div className="flex items-center gap-2 mb-1">
        <button
          onClick={() => setShowNavPanel(true)}
          aria-label="Open admin menu"
          className="flex items-center justify-center w-10 h-10 rounded-full text-[#362415] cursor-pointer hover:bg-[#F2F2F2] transition-colors"
        >
          <Menu size={20} />
        </button>
        <h1 className="text-[22px] text-[#362415]" style={{ fontWeight: 700 }}>Manage Products</h1>
      </div>
      <p className="text-[13px] text-[#757575] mt-0.5 mb-4">Add, edit, and remove product catalog</p>

      {/* Store Tabs */}
      <div className="flex gap-2 mb-4">
        {(['lehmuhn', 'kohfee'] as StoreId[]).map(store => (
          <button
            key={store}
            onClick={() => setActiveStore(store)}
            className={`flex-1 py-2.5 rounded-[12px] text-[14px] cursor-pointer transition-all ${
              activeStore === store
                ? 'bg-[#00704A] text-white'
                : 'bg-[#F5F5F5] text-[#757575]'
            }`}
            style={{ fontWeight: activeStore === store ? 600 : 400 }}
          >
            {store === 'lehmuhn' ? 'the leh-muhn' : 'the koh-fee'}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="flex items-center bg-[#F5F5F5] rounded-[12px] px-4 py-3 mb-4">
        <Search size={18} color="#757575" className="mr-3" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search products..."
          className="bg-transparent flex-1 outline-none text-[14px]"
        />
      </div>

      {/* Product List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={32} color="#00704A" className="animate-spin" />
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((product, i) => (
            <motion.div
              key={product.productId}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="rounded-[16px] bg-white p-3 border border-[rgba(0,0,0,0.06)] flex items-center gap-3"
              style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
            >
              <div className="w-14 h-14 rounded-[10px] overflow-hidden shrink-0">
                <img src={product.imageUrl} alt={product.productName} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-[14px] text-[#362415] truncate" style={{ fontWeight: 600 }}>{product.productName}</h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[13px] text-[#00704A]" style={{ fontWeight: 700 }}>&#8369;{product.price}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-[8px] ${product.isAvailable ? 'bg-[#E8F5E9] text-[#2E7D32]' : 'bg-[#FFEBEE] text-[#D32F2F]'}`} style={{ fontWeight: 600 }}>
                    {product.isAvailable ? 'Available' : 'Unavailable'}
                  </span>
                </div>
              </div>
              <div className="flex gap-1.5 shrink-0">
                <button
                  onClick={() => openEditForm(product)}
                  className="w-9 h-9 rounded-[10px] bg-[#E3F2FD] flex items-center justify-center cursor-pointer"
                >
                  <Edit2 size={16} color="#1565C0" />
                </button>
                <button
                  onClick={() => setConfirmDelete(product.productId)}
                  className="w-9 h-9 rounded-[10px] bg-[#FFEBEE] flex items-center justify-center cursor-pointer"
                >
                  <Trash2 size={16} color="#D32F2F" />
                </button>
              </div>
            </motion.div>
          ))}

          {filtered.length === 0 && (
            <div className="text-center py-12">
              <Package size={40} color="#757575" className="mx-auto mb-2" />
              <p className="text-[#757575] text-[14px]">No products found</p>
            </div>
          )}
        </div>
      )}

      {/* Floating Add Button */}
      <button
        onClick={openAddForm}
        className="fixed bottom-6 right-[calc(50%-190px)] w-14 h-14 rounded-full bg-[#00704A] flex items-center justify-center cursor-pointer z-50"
        style={{ boxShadow: '0 4px 16px rgba(0,112,74,0.4)' }}
      >
        <Plus size={24} color="white" />
      </button>

      {/* Delete Confirmation Dialog */}
      <AnimatePresence>
        {confirmDelete && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-[60]"
              onClick={() => setConfirmDelete(null)}
            />
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] bg-white rounded-[20px] p-6 z-[60]"
              style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}
            >
              <h3 className="text-[18px] text-[#362415] mb-2" style={{ fontWeight: 700 }}>Delete Product?</h3>
              <p className="text-[14px] text-[#757575] mb-5">This action cannot be undone.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmDelete(null)}
                  className="flex-1 py-3 rounded-[12px] border border-[rgba(0,0,0,0.12)] text-[14px] text-[#757575] cursor-pointer"
                  style={{ fontWeight: 500 }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(confirmDelete)}
                  className="flex-1 py-3 rounded-[12px] bg-[#D32F2F] text-white text-[14px] cursor-pointer"
                  style={{ fontWeight: 600 }}
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Add/Edit Form Bottom Sheet */}
      <AnimatePresence>
        {showForm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-[60]"
              onClick={() => setShowForm(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[412px] bg-white rounded-t-[24px] z-[60] flex flex-col"
              style={{ maxHeight: '85vh' }}
              onClick={e => e.stopPropagation()}
            >
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-2 shrink-0">
                <div className="w-10 h-1 rounded-full bg-[#E0E0E0]" />
              </div>

              <div className="flex-1 overflow-y-auto px-5 pb-6" style={{ overscrollBehaviorY: 'contain' }}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-[20px] text-[#362415]" style={{ fontWeight: 700 }}>
                    {editingProduct ? 'Edit Product' : 'Add Product'}
                  </h2>
                  <button onClick={() => setShowForm(false)} className="cursor-pointer">
                    <X size={22} color="#757575" />
                  </button>
                </div>

                {/* Form Fields */}
                <div className="space-y-4">
                  <div>
                    <label className="text-[12px] text-[#757575] mb-1 block">Product Name</label>
                    <input
                      type="text"
                      value={form.productName}
                      onChange={e => setForm(f => ({ ...f, productName: e.target.value }))}
                      placeholder="Enter product name"
                      className="w-full bg-[#F5F5F5] rounded-[12px] px-4 py-3 text-[14px] outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[12px] text-[#757575] mb-1 block">Store</label>
                    <div className="flex gap-2">
                      {(['lehmuhn', 'kohfee'] as StoreId[]).map(store => (
                        <button
                          key={store}
                          onClick={() => setForm(f => ({ ...f, storeId: store }))}
                          className={`flex-1 py-2.5 rounded-[12px] text-[13px] cursor-pointer border transition-all ${
                            form.storeId === store
                              ? 'bg-[#00704A] text-white border-[#00704A]'
                              : 'bg-white text-[#362415] border-[rgba(0,0,0,0.12)]'
                          }`}
                          style={{ fontWeight: form.storeId === store ? 600 : 400 }}
                        >
                          {store === 'lehmuhn' ? 'the leh-muhn' : 'the koh-fee'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {isFoodPricingMode ? (
                    <div>
                      <label className="text-[12px] text-[#757575] mb-1 block">Price (Fixed)</label>
                      <input
                        type="number"
                        value={form.price || ''}
                        onChange={e => setForm(f => ({ ...f, price: Number(e.target.value) }))}
                        placeholder="0"
                        className="w-full bg-[#F5F5F5] rounded-[12px] px-4 py-3 text-[14px] outline-none"
                      />
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[12px] text-[#757575] mb-1 block">Grande (16oz)</label>
                        <input
                          type="number"
                          value={lehmuhnGrandePrice}
                          onChange={e => setLehmuhnGrandePrice(e.target.value)}
                          placeholder="0"
                          className="w-full bg-[#F5F5F5] rounded-[12px] px-4 py-3 text-[14px] outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[12px] text-[#757575] mb-1 block">Extra Grande (22oz)</label>
                        <input
                          type="number"
                          value={lehmuhnExtraGrandePrice}
                          onChange={e => setLehmuhnExtraGrandePrice(e.target.value)}
                          placeholder="0"
                          className="w-full bg-[#F5F5F5] rounded-[12px] px-4 py-3 text-[14px] outline-none"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="text-[12px] text-[#757575] mb-1 block">Category</label>
                    {categoryOptions.length > 0 ? (
                      <select
                        value={form.categoryId ?? ''}
                        onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))}
                        className="w-full bg-[#F5F5F5] rounded-[12px] px-4 py-3 text-[14px] outline-none"
                      >
                        <option value="">Select category</option>
                        {categoryOptions.map(option => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={form.categoryId ?? ''}
                        onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))}
                        placeholder="e.g. cold-drinks"
                        className="w-full bg-[#F5F5F5] rounded-[12px] px-4 py-3 text-[14px] outline-none"
                      />
                    )}
                  </div>

                  <div>
                    <label className="text-[12px] text-[#757575] mb-1 block">Image URL</label>
                    <input
                      type="text"
                      value={form.imageUrl}
                      onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))}
                      placeholder="https://..."
                      className="w-full bg-[#F5F5F5] rounded-[12px] px-4 py-3 text-[14px] outline-none"
                    />
                    {form.imageUrl.trim() && (
                      <div className="mt-2 w-20 h-20 rounded-[10px] overflow-hidden border border-[rgba(0,0,0,0.08)]">
                        <img
                          src={form.imageUrl}
                          alt="Preview"
                          className="w-full h-full object-cover"
                          onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-[12px] text-[#757575] mb-1 block">Description</label>
                    <textarea
                      value={metaDescription}
                      onChange={e => setMetaDescription(e.target.value)}
                      placeholder="Product description..."
                      rows={3}
                      className="w-full bg-[#F5F5F5] rounded-[12px] px-4 py-3 text-[14px] outline-none resize-none"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-[14px] text-[#362415]" style={{ fontWeight: 500 }}>Best Seller</label>
                    <button
                      onClick={() => setMetaIsBestSeller(v => !v)}
                      className={`w-12 h-7 rounded-full transition-colors cursor-pointer ${
                        metaIsBestSeller ? 'bg-[#362415]' : 'bg-[#E0E0E0]'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-white transition-transform mx-1 ${
                          metaIsBestSeller ? 'translate-x-5' : 'translate-x-0'
                        }`}
                        style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-[14px] text-[#362415]" style={{ fontWeight: 500 }}>Fan Fave</label>
                    <button
                      onClick={() => setMetaIsFanFave(v => !v)}
                      className={`w-12 h-7 rounded-full transition-colors cursor-pointer ${
                        metaIsFanFave ? 'bg-[#7C3AED]' : 'bg-[#E0E0E0]'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-white transition-transform mx-1 ${
                          metaIsFanFave ? 'translate-x-5' : 'translate-x-0'
                        }`}
                        style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-[14px] text-[#362415]" style={{ fontWeight: 500 }}>Trending</label>
                    <button
                      onClick={() => setMetaIsTrending(v => !v)}
                      className={`w-12 h-7 rounded-full transition-colors cursor-pointer ${
                        metaIsTrending ? 'bg-[#F59E0B]' : 'bg-[#E0E0E0]'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-white transition-transform mx-1 ${
                          metaIsTrending ? 'translate-x-5' : 'translate-x-0'
                        }`}
                        style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-[14px] text-[#362415]" style={{ fontWeight: 500 }}>Available</label>
                    <button
                      onClick={() => setForm(f => ({ ...f, isAvailable: !f.isAvailable }))}
                      className={`w-12 h-7 rounded-full transition-colors cursor-pointer ${
                        form.isAvailable ? 'bg-[#00704A]' : 'bg-[#E0E0E0]'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-white transition-transform mx-1 ${
                          form.isAvailable ? 'translate-x-5' : 'translate-x-0'
                        }`}
                        style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }}
                      />
                    </button>
                  </div>

                  {!editingProduct && (
                    <div className="flex items-center justify-between rounded-[14px] bg-[#FFF8E1] px-4 py-3 border border-[#FFE082]">
                      <div className="flex items-center gap-2">
                        <Megaphone size={16} color="#F59E0B" />
                        <div>
                          <p className="text-[13px] text-[#362415]" style={{ fontWeight: 600 }}>Announce to users</p>
                          <p className="text-[11px] text-[#757575]">Send a "What's New" notification</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setNotifyUsers(v => !v)}
                        className={`w-12 h-7 rounded-full transition-colors cursor-pointer ${
                          notifyUsers ? 'bg-[#F59E0B]' : 'bg-[#E0E0E0]'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full bg-white transition-transform mx-1 ${
                            notifyUsers ? 'translate-x-5' : 'translate-x-0'
                          }`}
                          style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }}
                        />
                      </button>
                    </div>
                  )}
                </div>

                {/* Save Button */}
                <button
                  onClick={handleSave}
                  disabled={saving || !hasRequiredFields}
                  className="w-full mt-6 py-4 rounded-[16px] text-white text-[16px] cursor-pointer flex items-center justify-center gap-2"
                  style={{
                    background: '#00704A',
                    fontWeight: 600,
                    boxShadow: '0 4px 16px rgba(0,112,74,0.3)',
                    opacity: saving || !hasRequiredFields ? 0.5 : 1,
                  }}
                >
                  {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                  {editingProduct ? 'Update Product' : 'Add Product'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AdminNavPanel open={showNavPanel} onClose={() => setShowNavPanel(false)} />
    </div>
  );
}
