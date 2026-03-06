import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { ArrowLeft, Clock, MapPin, CreditCard, Smartphone, Check } from 'lucide-react';
import { useAppContext } from './AppContext';

export function CheckoutPage() {
  const navigate = useNavigate();
  const { cart, clearCart, addOrder } = useAppContext();
  const [orderType, setOrderType] = useState<'advance' | 'onsite'>('advance');
  const [pickupTime, setPickupTime] = useState('10:30 AM');
  const [paymentMethod, setPaymentMethod] = useState('gcash');

  const subtotal = cart.reduce((sum, item) => {
    const sizePrice = item.size === 'Regular' ? 0 : item.size === 'Medium' ? 20 : 40;
    const extras = item.toppings.length * 15 + item.addOns.length * 20;
    return sum + (item.price + sizePrice + extras) * item.quantity;
  }, 0);

  const pickupTimes = ['9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM', '1:00 PM'];

  const paymentMethods = [
    { id: 'gcash', name: 'GCash', icon: Smartphone, color: '#0070E0' },
    { id: 'paymaya', name: 'PayMaya', icon: Smartphone, color: '#00C853' },
    { id: 'stripe', name: 'Stripe', icon: CreditCard, color: '#6772E5' },
    { id: 'paypal', name: 'PayPal', icon: CreditCard, color: '#003087' },
  ];

  const handlePlaceOrder = () => {
    const orderId = `BJC-${String(Math.floor(Math.random() * 999)).padStart(3, '0')}`;
    addOrder({
      id: orderId,
      items: cart,
      total: subtotal,
      status: 'pending',
      time: pickupTime,
      customerName: 'You',
      orderType: orderType === 'advance' ? 'Advance Order' : 'On-site',
    });
    clearCart();
    navigate('/order-tracking/' + orderId);
  };

  return (
    <div className="px-4 pt-12 pb-6">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="cursor-pointer">
          <ArrowLeft size={24} color="#362415" />
        </button>
        <h1 className="text-[22px] text-[#362415]" style={{ fontWeight: 700 }}>Checkout</h1>
      </div>

      {/* Order Type */}
      <div className="mb-6">
        <h3 className="text-[15px] text-[#362415] mb-3" style={{ fontWeight: 600 }}>Order Type</h3>
        <div className="flex gap-3">
          {([
            { id: 'advance' as const, label: 'Advance Order', desc: 'Pick up later', icon: Clock },
            { id: 'onsite' as const, label: 'On-site Order', desc: 'Order now at store', icon: MapPin },
          ]).map(type => (
            <button
              key={type.id}
              onClick={() => setOrderType(type.id)}
              className={`flex-1 p-4 rounded-[16px] text-left cursor-pointer border transition-all ${
                orderType === type.id
                  ? 'border-[#00704A] bg-[#E8F5E9]'
                  : 'border-[rgba(0,0,0,0.12)] bg-white'
              }`}
            >
              <type.icon size={24} color={orderType === type.id ? '#00704A' : '#757575'} />
              <h4 className="text-[14px] text-[#362415] mt-2" style={{ fontWeight: 600 }}>{type.label}</h4>
              <p className="text-[12px] text-[#757575]">{type.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Pickup Time */}
      {orderType === 'advance' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mb-6"
        >
          <h3 className="text-[15px] text-[#362415] mb-3" style={{ fontWeight: 600 }}>Pickup Time</h3>
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            {pickupTimes.map(time => (
              <button
                key={time}
                onClick={() => setPickupTime(time)}
                className={`px-4 py-2.5 rounded-[12px] text-[13px] whitespace-nowrap cursor-pointer transition-all ${
                  pickupTime === time
                    ? 'bg-[#00704A] text-white'
                    : 'bg-[#F5F5F5] text-[#757575]'
                }`}
                style={{ fontWeight: pickupTime === time ? 600 : 400 }}
              >
                {time}
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Payment Method */}
      <div className="mb-6">
        <h3 className="text-[15px] text-[#362415] mb-3" style={{ fontWeight: 600 }}>Payment Method</h3>
        <div className="space-y-2">
          {paymentMethods.map(pm => (
            <button
              key={pm.id}
              onClick={() => setPaymentMethod(pm.id)}
              className={`w-full flex items-center gap-3 p-4 rounded-[12px] border cursor-pointer transition-all text-left ${
                paymentMethod === pm.id
                  ? 'border-[#00704A] bg-[#E8F5E9]'
                  : 'border-[rgba(0,0,0,0.12)] bg-white'
              }`}
            >
              <div className="w-10 h-10 rounded-[10px] flex items-center justify-center" style={{ background: pm.color + '15' }}>
                <pm.icon size={20} color={pm.color} />
              </div>
              <span className="flex-1 text-[14px] text-[#362415]" style={{ fontWeight: 500 }}>{pm.name}</span>
              {paymentMethod === pm.id && (
                <div className="w-6 h-6 rounded-full bg-[#00704A] flex items-center justify-center">
                  <Check size={14} color="white" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Order Summary */}
      <div className="rounded-[16px] bg-[#F5F5F5] p-4 mb-6">
        <h3 className="text-[15px] text-[#362415] mb-3" style={{ fontWeight: 600 }}>Order Summary</h3>
        <div className="space-y-2 text-[14px]">
          <div className="flex justify-between">
            <span className="text-[#757575]">Items ({cart.reduce((s, i) => s + i.quantity, 0)})</span>
            <span className="text-[#362415]" style={{ fontWeight: 500 }}>&#8369;{subtotal}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#757575]">Service Fee</span>
            <span className="text-[#362415]" style={{ fontWeight: 500 }}>&#8369;0</span>
          </div>
          <div className="h-px bg-[rgba(0,0,0,0.08)] my-1" />
          <div className="flex justify-between text-[16px]">
            <span className="text-[#362415]" style={{ fontWeight: 600 }}>Total</span>
            <span className="text-[#00704A]" style={{ fontWeight: 700 }}>&#8369;{subtotal}</span>
          </div>
        </div>
      </div>

      {/* Place Order */}
      <button
        onClick={handlePlaceOrder}
        className="w-full py-4 rounded-[16px] text-white text-[16px] cursor-pointer"
        style={{ background: '#00704A', fontWeight: 600, boxShadow: '0 4px 16px rgba(0,112,74,0.3)' }}
      >
        Place Order &mdash; &#8369;{subtotal}
      </button>
    </div>
  );
}
