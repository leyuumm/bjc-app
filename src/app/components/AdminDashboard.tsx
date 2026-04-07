import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Edit2, Trash2, X, Save, Loader2, Package, Search } from 'lucide-react';
import { onProductsSnapshot, seedDocument, deleteProduct } from '../services/firestore';
import type { ProductDoc } from '../types/firestore';
import type { StoreId } from '../types/menu';

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

export function AdminDashboard() {
  const [activeStore, setActiveStore] = useState<StoreId>('lehmuhn');
  const [products, setProducts] = useState<ProductDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductDoc | null>(null);
  const [form, setForm] = useState<ProductDoc>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    setLoading(true);
    const unsub = onProductsSnapshot(activeStore, (docs) => {
      setProducts(docs);
      setLoading(false);
    });
    return unsub;
  }, [activeStore]);

  const filtered = products.filter(p =>
    p.productName.toLowerCase().includes(search.toLowerCase()),
  );

  const openAddForm = () => {
    setEditingProduct(null);
    setForm({ ...emptyForm, storeId: activeStore });
    setShowForm(true);
  };

  const openEditForm = (product: ProductDoc) => {
    setEditingProduct(product);
    setForm({ ...product });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.productName.trim() || !form.imageUrl.trim()) return;
    setSaving(true);

    const productId = editingProduct
      ? editingProduct.productId
      : form.productName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

    const data: Record<string, unknown> = {
      productId,
      storeId: form.storeId,
      productName: form.productName.trim(),
      price: form.price,
      categoryId: form.categoryId,
      imageUrl: form.imageUrl.trim(),
      isAvailable: form.isAvailable,
      branchId: form.branchId ?? '',
      meta: form.meta ?? {},
    };

    await seedDocument('products', productId, data);
    setSaving(false);
    setShowForm(false);
  };

  const handleDelete = async (productId: string) => {
    await deleteProduct(productId);
    setConfirmDelete(null);
  };

  return (
    <div className="px-4 pt-10 pb-6">
      <h1 className="text-[22px] text-[#362415]" style={{ fontWeight: 700 }}>Admin Dashboard</h1>
      <p className="text-[13px] text-[#757575] mt-0.5 mb-4">Manage products</p>

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
            {store === 'lehmuhn' ? 'Leh-muhn' : 'Koh-fee'}
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
                    <label className="text-[12px] text-[#757575] mb-1 block">Price (₱)</label>
                    <input
                      type="number"
                      value={form.price || ''}
                      onChange={e => setForm(f => ({ ...f, price: Number(e.target.value) }))}
                      placeholder="0"
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
                          {store === 'lehmuhn' ? 'Leh-muhn' : 'Koh-fee'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-[12px] text-[#757575] mb-1 block">Category ID</label>
                    <input
                      type="text"
                      value={form.categoryId ?? ''}
                      onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))}
                      placeholder="e.g. cold-drinks"
                      className="w-full bg-[#F5F5F5] rounded-[12px] px-4 py-3 text-[14px] outline-none"
                    />
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
                  </div>

                  <div>
                    <label className="text-[12px] text-[#757575] mb-1 block">Branch ID (optional)</label>
                    <input
                      type="text"
                      value={form.branchId ?? ''}
                      onChange={e => setForm(f => ({ ...f, branchId: e.target.value }))}
                      placeholder="e.g. branch-01"
                      className="w-full bg-[#F5F5F5] rounded-[12px] px-4 py-3 text-[14px] outline-none"
                    />
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
                </div>

                {/* Save Button */}
                <button
                  onClick={handleSave}
                  disabled={saving || !form.productName.trim() || !form.imageUrl.trim()}
                  className="w-full mt-6 py-4 rounded-[16px] text-white text-[16px] cursor-pointer flex items-center justify-center gap-2"
                  style={{
                    background: '#00704A',
                    fontWeight: 600,
                    boxShadow: '0 4px 16px rgba(0,112,74,0.3)',
                    opacity: saving || !form.productName.trim() || !form.imageUrl.trim() ? 0.5 : 1,
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
    </div>
  );
}
