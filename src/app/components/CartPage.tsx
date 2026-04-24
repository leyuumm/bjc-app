import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { ArrowLeft, Minus, Plus, Trash2, Tag, ShoppingBag } from 'lucide-react';
import { useAppContext } from './AppContext';
import { getCartItemLineTotal } from './data';
import { SIZE_LABELS } from '../config/menuRules';

export function CartPage() {
  const navigate = useNavigate();
  const { cart, updateCartQuantity, removeFromCart } = useAppContext();
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoError, setPromoError] = useState('');

  const VALID_PROMO_CODES = ['BJC10', 'WELCOME10', 'FIRSTORDER'];

  const subtotal = cart.reduce((sum, item) => sum + getCartItemLineTotal(item), 0);

  const discount = promoApplied ? Math.round(subtotal * 0.1) : 0;
  const total = subtotal - discount;

  if (cart.length === 0) {
    return (
      <div className="px-4 pt-12 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-20 h-20 rounded-full bg-[#F5F5F5] flex items-center justify-center mb-4">
          <ShoppingBag size={36} color="#757575" />
        </div>
        <h2 className="text-[18px] text-[#362415]" style={{ fontWeight: 600 }}>Your cart is empty</h2>
        <p className="text-[14px] text-[#757575] mt-1">Add some items from the menu</p>
        <button
          onClick={() => navigate('/menu')}
          className="mt-6 px-8 py-3 rounded-[12px] bg-[#00704A] text-white text-[14px] cursor-pointer"
          style={{ fontWeight: 600 }}
        >
          Browse Menu
        </button>
      </div>
    );
  }

  return (
    <div className="px-4 pt-12 pb-6">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="cursor-pointer">
          <ArrowLeft size={24} color="#362415" />
        </button>
        <h1 className="text-[22px] text-[#362415]" style={{ fontWeight: 700 }}>My Cart</h1>
        <span className="text-[14px] text-[#757575] ml-auto">{cart.length} items</span>
      </div>

      {/* Cart Items */}
      <div className="space-y-3 mb-6">
        {cart.map((item, i) => (
          <motion.div
            key={item.cartItemId}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-[16px] p-3 bg-white border border-[rgba(0,0,0,0.06)]"
            style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
          >
            <div className="flex gap-3">
              <img src={item.image} alt={item.name} className="w-[72px] h-[72px] rounded-[12px] object-cover" />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-[15px] text-[#362415]" style={{ fontWeight: 600 }}>{item.name}</h3>
                    <p className="text-[12px] text-[#757575] mt-0.5">
                      {item.storeId === 'lehmuhn' ? 'the leh-muhn' : 'the koh-fee'}
                      {item.selectedDrinkType ? ` • ${item.selectedDrinkType}` : ''}
                      {item.selectedMenuGroup ? ` • ${item.selectedMenuGroup}` : ''}
                      {item.selectedSubGroup ? ` • ${item.selectedSubGroup === 'NON_COFFEE' ? 'NON-COFFEE' : item.selectedSubGroup}` : ''}
                    </p>
                    {item.selectedSizeOz && (
                      <p className="text-[11px] text-[#757575]">Size: {SIZE_LABELS[item.selectedSizeOz]} ({item.selectedSizeOz}oz)</p>
                    )}
                    {item.selectedFoodPortion && (
                      <p className="text-[11px] text-[#757575]">
                        Serving: {item.selectedFoodPortion === 'paraUno' ? 'Para Uno (Good for solo)' : 'Para Amigos (Good for sharing)'}
                      </p>
                    )}
                    {item.addOns.length > 0 && (
                      <p className="text-[11px] text-[#00704A]">Add-ons: {item.addOns.map(addOn => addOn.name).join(', ')}</p>
                    )}
                    {item.toppingsLabel && (
                      <p className="text-[11px] text-[#757575]">
                        Toppings: {item.toppingsRemoved ? 'Removed' : item.toppingsLabel}
                      </p>
                    )}
                    {item.selectedHotOption && (
                      <p className="text-[11px] text-[#757575]">Hot option: {item.selectedHotOption}</p>
                    )}
                    {item.selectedFruits && item.selectedFruits.length > 0 && (
                      <p className="text-[11px] text-[#757575]">Fruits: {item.selectedFruits.join(', ')}</p>
                    )}
                  </div>
                  <button onClick={() => removeFromCart(item.cartItemId)} className="cursor-pointer p-1">
                    <Trash2 size={16} color="#D32F2F" />
                  </button>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => updateCartQuantity(item.cartItemId, item.quantity - 1)}
                      className="w-7 h-7 rounded-full border border-[rgba(0,0,0,0.12)] flex items-center justify-center cursor-pointer"
                    >
                      <Minus size={14} color="#362415" />
                    </button>
                    <span className="text-[14px]" style={{ fontWeight: 600 }}>{item.quantity}</span>
                    <button
                      onClick={() => updateCartQuantity(item.cartItemId, item.quantity + 1)}
                      className="w-7 h-7 rounded-full bg-[#00704A] flex items-center justify-center cursor-pointer"
                    >
                      <Plus size={14} color="white" />
                    </button>
                  </div>
                  <span className="text-[15px] text-[#00704A]" style={{ fontWeight: 700 }}>
                    &#8369;{getCartItemLineTotal(item)}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Promo Code */}
      <div className="rounded-[12px] border border-[rgba(0,0,0,0.12)] p-3 flex items-center gap-2 mb-6">
        <Tag size={18} color="#757575" />
        <input
          type="text"
          value={promoCode}
          onChange={e => setPromoCode(e.target.value)}
          placeholder="Enter promo code"
          className="flex-1 text-[14px] outline-none"
        />
        <button
          onClick={() => {
            if (!promoCode.trim()) return;
            if (VALID_PROMO_CODES.includes(promoCode.trim().toUpperCase())) {
              setPromoApplied(true);
              setPromoError('');
            } else {
              setPromoApplied(false);
              setPromoError('Invalid promo code');
            }
          }}
          className="px-4 py-1.5 rounded-[8px] bg-[#00704A] text-white text-[13px] cursor-pointer"
          style={{ fontWeight: 500 }}
        >
          Apply
        </button>
      </div>
      {promoError && (
        <p className="text-[12px] text-[#D32F2F] mt-1 mb-4">{promoError}</p>
      )}

      {/* Order Summary */}
      <div className="rounded-[16px] bg-[#F5F5F5] p-4 mb-6">
        <h3 className="text-[15px] text-[#362415] mb-3" style={{ fontWeight: 600 }}>Order Summary</h3>
        <div className="space-y-2 text-[14px]">
          <div className="flex justify-between">
            <span className="text-[#757575]">Subtotal</span>
            <span className="text-[#362415]" style={{ fontWeight: 500 }}>&#8369;{subtotal}</span>
          </div>
          {promoApplied && (
            <div className="flex justify-between text-[#00704A]">
              <span>Promo Discount (10%)</span>
              <span style={{ fontWeight: 500 }}>-&#8369;{discount}</span>
            </div>
          )}
          <div className="h-px bg-[rgba(0,0,0,0.08)] my-1" />
          <div className="flex justify-between text-[16px]">
            <span className="text-[#362415]" style={{ fontWeight: 600 }}>Total</span>
            <span className="text-[#00704A]" style={{ fontWeight: 700 }}>&#8369;{total}</span>
          </div>
        </div>
      </div>

      {/* Checkout Button */}
      <button
        onClick={() => navigate('/checkout')}
        className="w-full py-4 rounded-[16px] text-white text-[16px] cursor-pointer"
        style={{ background: '#00704A', fontWeight: 600, boxShadow: '0 4px 16px rgba(0,112,74,0.3)' }}
      >
        Proceed to Checkout
      </button>
    </div>
  );
}
