import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Plus, Edit3, Trash2, X, Save, Package, Search,
  LogOut, LayoutDashboard, ShoppingCart,
} from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router';
import { useAppContext } from './AppContext';
import { logout } from '../services/auth';
import {
  addProduct,
  updateProduct,
  deleteProduct,
  onAllProductsSnapshot,
  onAllOrdersSnapshot,
} from '../services/firestore';
import type { ProductDoc, OrderDoc } from '../types/firestore';

type AdminTab = 'products' | 'orders';

export function AdminDashboard() {
  const navigate = useNavigate();
  const { userProfile, resetState, setIsLoggedIn } = useAppContext();

  const [activeTab, setActiveTab] = useState<AdminTab>('products');
  const [products, setProducts] = useState<ProductDoc[]>([]);
  const [orders, setOrders] = useState<OrderDoc[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductDoc | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    productId: '',
    storeId: '',
    productName: '',
    price: '',
    imageUrl: '',
    isAvailable: true,
    categoryId: '',
  });

  // Realtime listeners
  useEffect(() => {
    const unsubProducts = onAllProductsSnapshot(setProducts);
    const unsubOrders = onAllOrdersSnapshot(setOrders);
    return () => {
      unsubProducts();
      unsubOrders();
    };
  }, []);

  // Guard: only admins
  if (!userProfile || userProfile.role !== 'ADMIN') {
    return (
      <div className="px-4 pt-14 text-center">
        <p className="text-[#757575]">Access denied. Admin only.</p>
        <button onClick={() => navigate('/home')} className="text-[#00704A] mt-4 cursor-pointer">Go Home</button>
      </div>
    );
  }

  const handleLogout = async () => {
    await logout();
    resetState();
    setIsLoggedIn(false);
    navigate('/login');
  };

  const resetForm = () => {
    setFormData({
      productId: '',
      storeId: 'lehmuhn',
      productName: '',
      price: '',
      imageUrl: '',
      isAvailable: true,
      categoryId: '',
    });
    setEditingProduct(null);
    setShowForm(false);
  };

  const openAddForm = () => {
    resetForm();
    setFormData(prev => ({ ...prev, storeId: 'lehmuhn' }));
    setShowForm(true);
  };

  const openEditForm = (product: ProductDoc) => {
    setEditingProduct(product);
    setFormData({
      productId: product.productId,
      storeId: product.storeId,
      productName: product.productName,
      price: String(product.price),
      imageUrl: product.imageUrl,
      isAvailable: product.isAvailable,
      categoryId: product.categoryId ?? '',
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!formData.productName.trim() || !formData.price || !formData.storeId) {
      toast.error('Please fill in all required fields.');
      return;
    }

    const price = parseFloat(formData.price);
    if (isNaN(price) || price <= 0) {
      toast.error('Please enter a valid price.');
      return;
    }

    try {
      const productId = editingProduct
        ? editingProduct.productId
        : `prod-${Date.now()}`;

      const productDoc: ProductDoc = {
        productId,
        storeId: formData.storeId,
        productName: formData.productName.trim(),
        price,
        imageUrl: formData.imageUrl.trim(),
        isAvailable: formData.isAvailable,
        categoryId: formData.categoryId || undefined,
      };

      if (editingProduct) {
        await updateProduct(productId, productDoc);
        toast.success('Product updated successfully!');
      } else {
        await addProduct(productDoc);
        toast.success('Product added successfully!');
      }

      resetForm();
    } catch (error) {
      console.error('Save product error:', error);
      toast.error('Failed to save product. Please try again.');
    }
  };

  const handleDelete = async (productId: string) => {
    try {
      await deleteProduct(productId);
      toast.success('Product deleted successfully!');
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Delete product error:', error);
      toast.error('Failed to delete product. Please try again.');
    }
  };

  const filteredProducts = products.filter(p =>
    p.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.storeId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeOrders = orders.filter(o => o.status !== 'Completed' && o.status !== 'Cancelled');

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      {/* Header */}
      <div className="bg-[#362415] text-white px-4 pt-10 pb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <LayoutDashboard size={22} />
            <h1 className="text-[20px]" style={{ fontWeight: 700 }}>Admin Dashboard</h1>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1 text-[13px] text-white/80 hover:text-white cursor-pointer"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
        <p className="text-[13px] text-white/60">
          Welcome, {userProfile.name} • {products.length} products • {activeOrders.length} active orders
        </p>
      </div>

      {/* Tabs */}
      <div className="flex bg-white border-b border-[rgba(0,0,0,0.08)]">
        <button
          onClick={() => setActiveTab('products')}
          className={`flex-1 py-3 text-[14px] cursor-pointer transition-colors ${
            activeTab === 'products'
              ? 'text-[#00704A] border-b-2 border-[#00704A]'
              : 'text-[#757575]'
          }`}
          style={{ fontWeight: activeTab === 'products' ? 600 : 400 }}
        >
          <div className="flex items-center justify-center gap-1.5">
            <Package size={16} />
            Products ({products.length})
          </div>
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`flex-1 py-3 text-[14px] cursor-pointer transition-colors ${
            activeTab === 'orders'
              ? 'text-[#00704A] border-b-2 border-[#00704A]'
              : 'text-[#757575]'
          }`}
          style={{ fontWeight: activeTab === 'orders' ? 600 : 400 }}
        >
          <div className="flex items-center justify-center gap-1.5">
            <ShoppingCart size={16} />
            Orders ({activeOrders.length})
          </div>
        </button>
      </div>

      {/* Content */}
      <div className="px-4 pt-4 pb-6">
        {activeTab === 'products' && (
          <>
            {/* Search + Add */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex-1 relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#757575]" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-[12px] bg-white border border-[rgba(0,0,0,0.08)] text-[14px] outline-none focus:border-[#00704A]"
                />
              </div>
              <button
                onClick={openAddForm}
                className="flex items-center gap-1 px-4 py-2.5 bg-[#00704A] text-white rounded-[12px] text-[14px] cursor-pointer"
                style={{ fontWeight: 600 }}
              >
                <Plus size={16} />
                Add
              </button>
            </div>

            {/* Product List */}
            <div className="space-y-3">
              {filteredProducts.map((product, i) => (
                <motion.div
                  key={product.productId}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="bg-white rounded-[14px] p-3 border border-[rgba(0,0,0,0.06)]"
                  style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
                >
                  <div className="flex items-start gap-3">
                    {product.imageUrl && (
                      <img
                        src={product.imageUrl}
                        alt={product.productName}
                        className="w-14 h-14 rounded-[10px] object-cover flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-[14px] text-[#362415] truncate" style={{ fontWeight: 600 }}>
                            {product.productName}
                          </h3>
                          <p className="text-[12px] text-[#757575] mt-0.5">
                            {product.storeId === 'lehmuhn' ? "Leh'-muhn" : 'Koh-fee'}
                            {product.categoryId && ` • ${product.categoryId}`}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`text-[11px] px-2 py-0.5 rounded-[8px] ${
                              product.isAvailable
                                ? 'bg-[#E8F5E9] text-[#2E7D32]'
                                : 'bg-[#FFEBEE] text-[#D32F2F]'
                            }`}
                            style={{ fontWeight: 600 }}
                          >
                            {product.isAvailable ? 'Available' : 'Unavailable'}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-[15px] text-[#00704A]" style={{ fontWeight: 700 }}>
                          &#8369;{product.price}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEditForm(product)}
                            className="p-1.5 rounded-[8px] bg-[#E3F2FD] text-[#1565C0] cursor-pointer"
                          >
                            <Edit3 size={14} />
                          </button>
                          {deleteConfirm === product.productId ? (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleDelete(product.productId)}
                                className="px-2 py-1 rounded-[8px] bg-[#D32F2F] text-white text-[11px] cursor-pointer"
                                style={{ fontWeight: 600 }}
                              >
                                Confirm
                              </button>
                              <button
                                onClick={() => setDeleteConfirm(null)}
                                className="px-2 py-1 rounded-[8px] bg-[#F5F5F5] text-[#757575] text-[11px] cursor-pointer"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeleteConfirm(product.productId)}
                              className="p-1.5 rounded-[8px] bg-[#FFEBEE] text-[#D32F2F] cursor-pointer"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}

              {filteredProducts.length === 0 && (
                <div className="text-center py-12">
                  <Package size={40} className="mx-auto text-[#E0E0E0] mb-3" />
                  <p className="text-[#757575] text-[14px]">
                    {searchQuery ? 'No products match your search' : 'No products yet. Add your first product!'}
                  </p>
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-3">
            {orders.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingCart size={40} className="mx-auto text-[#E0E0E0] mb-3" />
                <p className="text-[#757575] text-[14px]">No orders yet</p>
              </div>
            ) : (
              orders.map((order, i) => (
                <motion.div
                  key={order.orderId}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="bg-white rounded-[14px] p-4 border border-[rgba(0,0,0,0.06)]"
                  style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-[14px] text-[#362415]" style={{ fontWeight: 700 }}>
                        #{order.orderId}
                      </h3>
                      <p className="text-[12px] text-[#757575]">{order.customerName}</p>
                    </div>
                    <div className="text-right">
                      <span
                        className={`text-[11px] px-2 py-1 rounded-[10px] ${
                          order.status === 'Completed' ? 'bg-[#E8F5E9] text-[#2E7D32]'
                            : order.status === 'Cancelled' ? 'bg-[#FFEBEE] text-[#D32F2F]'
                            : 'bg-[#FFF3E0] text-[#E65100]'
                        }`}
                        style={{ fontWeight: 600 }}
                      >
                        {order.status}
                      </span>
                      <p className="text-[14px] text-[#00704A] mt-1" style={{ fontWeight: 700 }}>
                        &#8369;{order.total}
                      </p>
                    </div>
                  </div>
                  <div className="bg-[#F5F5F5] rounded-[10px] p-2.5">
                    {order.orderDetails.map(item => (
                      <div key={item.orderItemId} className="flex justify-between text-[12px] py-0.5">
                        <span className="text-[#362415]">{item.quantity}x {item.productId}</span>
                      </div>
                    ))}
                    <p className="text-[11px] text-[#757575] mt-1">{order.orderType} • {order.paymentMethod}</p>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Add/Edit Product Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/40"
            onClick={() => resetForm()}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="w-full max-w-[412px] bg-white rounded-t-[20px] p-5 max-h-[85vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-[18px] text-[#362415]" style={{ fontWeight: 700 }}>
                  {editingProduct ? 'Edit Product' : 'Add Product'}
                </h2>
                <button onClick={resetForm} className="p-1 cursor-pointer">
                  <X size={20} color="#757575" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[13px] text-[#362415] mb-1 block" style={{ fontWeight: 600 }}>
                    Product Name *
                  </label>
                  <input
                    type="text"
                    value={formData.productName}
                    onChange={e => setFormData(prev => ({ ...prev, productName: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-[10px] border border-[rgba(0,0,0,0.12)] text-[14px] outline-none focus:border-[#00704A]"
                    placeholder="e.g. Iced Classic Zesty Leh-Muhnade"
                  />
                </div>

                <div>
                  <label className="text-[13px] text-[#362415] mb-1 block" style={{ fontWeight: 600 }}>
                    Store *
                  </label>
                  <select
                    value={formData.storeId}
                    onChange={e => setFormData(prev => ({ ...prev, storeId: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-[10px] border border-[rgba(0,0,0,0.12)] text-[14px] outline-none focus:border-[#00704A] bg-white"
                  >
                    <option value="lehmuhn">Leh&apos;-muhn Juices &amp; Tea</option>
                    <option value="kohfee">Koh-fee</option>
                  </select>
                </div>

                <div>
                  <label className="text-[13px] text-[#362415] mb-1 block" style={{ fontWeight: 600 }}>
                    Price (₱) *
                  </label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={e => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-[10px] border border-[rgba(0,0,0,0.12)] text-[14px] outline-none focus:border-[#00704A]"
                    placeholder="0"
                    min="0"
                    step="1"
                  />
                </div>

                <div>
                  <label className="text-[13px] text-[#362415] mb-1 block" style={{ fontWeight: 600 }}>
                    Image URL
                  </label>
                  <input
                    type="text"
                    value={formData.imageUrl}
                    onChange={e => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-[10px] border border-[rgba(0,0,0,0.12)] text-[14px] outline-none focus:border-[#00704A]"
                    placeholder="https://..."
                  />
                </div>

                <div>
                  <label className="text-[13px] text-[#362415] mb-1 block" style={{ fontWeight: 600 }}>
                    Category ID
                  </label>
                  <input
                    type="text"
                    value={formData.categoryId}
                    onChange={e => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-[10px] border border-[rgba(0,0,0,0.12)] text-[14px] outline-none focus:border-[#00704A]"
                    placeholder="e.g. cold, hot, blended"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <label className="text-[13px] text-[#362415]" style={{ fontWeight: 600 }}>Available</label>
                  <button
                    onClick={() => setFormData(prev => ({ ...prev, isAvailable: !prev.isAvailable }))}
                    className={`w-10 h-6 rounded-full transition-colors cursor-pointer ${
                      formData.isAvailable ? 'bg-[#00704A]' : 'bg-[#E0E0E0]'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full transition-transform shadow-sm ${
                        formData.isAvailable ? 'translate-x-[18px]' : 'translate-x-[2px]'
                      }`}
                    />
                  </button>
                </div>

                <button
                  onClick={handleSave}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-[12px] bg-[#00704A] text-white text-[15px] cursor-pointer"
                  style={{ fontWeight: 600 }}
                >
                  <Save size={18} />
                  {editingProduct ? 'Update Product' : 'Add Product'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
