import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingCart, Plus, X, Minus, Check } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useAppContext } from './AppContext';
import { products, Product, CartItem } from './data';

export function MenuPage() {
  const navigate = useNavigate();
  const { selectedBrand, cart, addToCart } = useAppContext();
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const brandProducts = products.filter(p => p.brand === selectedBrand);
  const categories = ['All', ...new Set(brandProducts.map(p => p.category))];
  const filteredProducts = activeCategory === 'All'
    ? brandProducts
    : brandProducts.filter(p => p.category === activeCategory);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="relative">
      {/* Header */}
      <div className="px-4 pt-10 pb-4 bg-white sticky top-0 z-10" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-[22px] text-[#362415]" style={{ fontWeight: 700 }}>Menu</h1>
            <p className="text-[13px] text-[#757575]">
              {selectedBrand === 'lehmuhn' ? 'Leh-muhn Juices & Tea' : 'Koh-fee'}
            </p>
          </div>
          <button onClick={() => navigate('/cart')} className="relative cursor-pointer p-2">
            <ShoppingCart size={24} color="#362415" />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-[#D32F2F] text-white text-[11px] flex items-center justify-center"
                style={{ fontWeight: 600 }}>
                {cartCount}
              </span>
            )}
          </button>
        </div>

        {/* Category Chips */}
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 no-scrollbar">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-[20px] text-[13px] whitespace-nowrap cursor-pointer transition-all ${
                activeCategory === cat
                  ? 'bg-[#00704A] text-white'
                  : 'bg-[#F5F5F5] text-[#757575]'
              }`}
              style={{ fontWeight: activeCategory === cat ? 600 : 400 }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      <div className="px-4 pt-4 pb-4 grid grid-cols-2 gap-3">
        {filteredProducts.map((product, i) => (
          <motion.button
            key={product.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setSelectedProduct(product)}
            className="rounded-[16px] bg-white overflow-hidden text-left cursor-pointer"
            style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
          >
            <div className="h-[120px] overflow-hidden">
              <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
            </div>
            <div className="p-3">
              <h3 className="text-[14px] text-[#362415] line-clamp-1" style={{ fontWeight: 600 }}>{product.name}</h3>
              <p className="text-[12px] text-[#757575] mt-0.5 line-clamp-1">{product.description}</p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-[15px] text-[#00704A]" style={{ fontWeight: 700 }}>
                  &#8369;{product.price}
                </span>
                <div className="w-8 h-8 rounded-full bg-[#00704A] flex items-center justify-center">
                  <Plus size={16} color="white" />
                </div>
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Product Detail Bottom Sheet */}
      <AnimatePresence>
        {selectedProduct && (
          <ProductDetailSheet
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
            onAddToCart={addToCart}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function ProductDetailSheet({
  product,
  onClose,
  onAddToCart,
}: {
  product: Product;
  onClose: () => void;
  onAddToCart: (item: CartItem) => void;
}) {
  const [size, setSize] = useState('Regular');
  const [sugarLevel, setSugarLevel] = useState('100%');
  const [quantity, setQuantity] = useState(1);
  const [toppings, setToppings] = useState<string[]>([]);
  const [addOns, setAddOns] = useState<string[]>([]);

  const sizes = ['Regular', 'Medium', 'Large'];
  const sugarLevels = ['0%', '25%', '50%', '75%', '100%'];
  const toppingOptions = ['Whipped Cream', 'Nata de Coco', 'Pearl Boba', 'Jelly'];
  const addOnOptions = ['Extra Shot', 'Oat Milk', 'Vanilla Syrup', 'Caramel Drizzle'];

  const sizePrice = size === 'Regular' ? 0 : size === 'Medium' ? 20 : 40;
  const toppingsPrice = toppings.length * 15;
  const addOnsPrice = addOns.length * 20;
  const totalPrice = (product.price + sizePrice + toppingsPrice + addOnsPrice) * quantity;

  const toggleTopping = (t: string) =>
    setToppings(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);
  const toggleAddOn = (a: string) =>
    setAddOns(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a]);

  const handleAdd = () => {
    onAddToCart({
      ...product,
      quantity,
      size,
      sugarLevel,
      toppings,
      addOns,
    });
    onClose();
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50"
        onClick={onClose}
      />
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25 }}
        className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[412px] bg-white rounded-t-[24px] z-50 max-h-[85vh] overflow-y-auto"
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 rounded-full bg-[#E0E0E0]" />
        </div>

        {/* Image */}
        <div className="h-[200px] mx-4 rounded-[16px] overflow-hidden relative">
          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center cursor-pointer"
          >
            <X size={18} color="#362415" />
          </button>
        </div>

        <div className="px-5 pt-4 pb-6">
          <h2 className="text-[22px] text-[#362415]" style={{ fontWeight: 700 }}>{product.name}</h2>
          <p className="text-[14px] text-[#757575] mt-1">{product.description}</p>
          <p className="text-[20px] text-[#00704A] mt-2" style={{ fontWeight: 700 }}>&#8369;{product.price}</p>

          {/* Size */}
          <div className="mt-5">
            <h4 className="text-[14px] text-[#362415] mb-2" style={{ fontWeight: 600 }}>Size</h4>
            <div className="flex gap-2">
              {sizes.map(s => (
                <button
                  key={s}
                  onClick={() => setSize(s)}
                  className={`flex-1 py-2.5 rounded-[12px] text-[13px] cursor-pointer border transition-all ${
                    size === s
                      ? 'bg-[#00704A] text-white border-[#00704A]'
                      : 'bg-white text-[#362415] border-[rgba(0,0,0,0.12)]'
                  }`}
                  style={{ fontWeight: size === s ? 600 : 400 }}
                >
                  {s}
                  {s !== 'Regular' && <span className="block text-[11px] opacity-70">+&#8369;{s === 'Medium' ? 20 : 40}</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Sugar Level */}
          <div className="mt-5">
            <h4 className="text-[14px] text-[#362415] mb-2" style={{ fontWeight: 600 }}>Sugar Level</h4>
            <div className="flex gap-1.5">
              {sugarLevels.map(s => (
                <button
                  key={s}
                  onClick={() => setSugarLevel(s)}
                  className={`flex-1 py-2 rounded-[10px] text-[12px] cursor-pointer transition-all ${
                    sugarLevel === s
                      ? 'bg-[#00704A] text-white'
                      : 'bg-[#F5F5F5] text-[#757575]'
                  }`}
                  style={{ fontWeight: sugarLevel === s ? 600 : 400 }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Toppings */}
          <div className="mt-5">
            <h4 className="text-[14px] text-[#362415] mb-2" style={{ fontWeight: 600 }}>Toppings (+&#8369;15 each)</h4>
            <div className="space-y-2">
              {toppingOptions.map(t => (
                <button
                  key={t}
                  onClick={() => toggleTopping(t)}
                  className="w-full flex items-center justify-between py-2.5 px-3 rounded-[12px] border cursor-pointer transition-all text-left"
                  style={{
                    borderColor: toppings.includes(t) ? '#00704A' : 'rgba(0,0,0,0.12)',
                    backgroundColor: toppings.includes(t) ? '#E8F5E9' : 'white',
                  }}
                >
                  <span className="text-[14px] text-[#362415]">{t}</span>
                  {toppings.includes(t) && <Check size={18} color="#00704A" />}
                </button>
              ))}
            </div>
          </div>

          {/* Add-ons */}
          <div className="mt-5">
            <h4 className="text-[14px] text-[#362415] mb-2" style={{ fontWeight: 600 }}>Add-ons (+&#8369;20 each)</h4>
            <div className="space-y-2">
              {addOnOptions.map(a => {
                const isActive = addOns.includes(a);
                return (
                  <button
                    key={a}
                    onClick={() => toggleAddOn(a)}
                    className="w-full flex items-center justify-between py-2.5 px-3 rounded-[12px] border cursor-pointer text-left"
                    style={{
                      borderColor: isActive ? '#00704A' : 'rgba(0,0,0,0.12)',
                      backgroundColor: isActive ? '#E8F5E9' : 'white',
                    }}
                  >
                    <span className="text-[14px] text-[#362415]">{a}</span>
                    <div className={`w-10 h-6 rounded-full flex items-center px-0.5 transition-all ${isActive ? 'bg-[#00704A] justify-end' : 'bg-[#E0E0E0] justify-start'}`}>
                      <div className="w-5 h-5 rounded-full bg-white" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quantity */}
          <div className="mt-5 flex items-center justify-between">
            <h4 className="text-[14px] text-[#362415]" style={{ fontWeight: 600 }}>Quantity</h4>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-9 h-9 rounded-full border border-[rgba(0,0,0,0.12)] flex items-center justify-center cursor-pointer"
              >
                <Minus size={16} color="#362415" />
              </button>
              <span className="text-[18px] text-[#362415] w-8 text-center" style={{ fontWeight: 600 }}>{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-9 h-9 rounded-full bg-[#00704A] flex items-center justify-center cursor-pointer"
              >
                <Plus size={16} color="white" />
              </button>
            </div>
          </div>

          {/* Add to Cart */}
          <button
            onClick={handleAdd}
            className="w-full py-4 rounded-[16px] text-white text-[16px] mt-6 cursor-pointer"
            style={{ background: '#00704A', fontWeight: 600, boxShadow: '0 4px 16px rgba(0,112,74,0.3)' }}
          >
            Add to Cart &mdash; &#8369;{totalPrice}
          </button>
        </div>
      </motion.div>
    </>
  );
}
