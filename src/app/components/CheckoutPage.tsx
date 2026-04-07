import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { ArrowLeft, Clock, MapPin, CreditCard, Store, Check, AlertCircle } from 'lucide-react';
import { useAppContext } from './AppContext';
import { getCartItemLineTotal } from './data';
import { createPaymongoCheckout } from '../lib/paymongo';
import { createOrder, sendNotification, getLoyaltyPoints, updateLoyaltyPoints } from '../services/firestore';
import type { OrderItemDoc, CustomizationDoc } from '../types/firestore';
import type { PaymentMethod } from '../types/order';
import type { CartItem } from '../types/menu';
import { toast } from 'sonner';

export function CheckoutPage() {
  const navigate = useNavigate();
  const { cart, clearCart, addOrder, selectedBrand, selectedBranch, firebaseUser, userProfile, setLoyaltyPoints } = useAppContext();
  const [orderType, setOrderType] = useState<'advance' | 'onsite'>('advance');
  const [pickupTime, setPickupTime] = useState('10:30 AM');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('PAY_AT_STORE');
  const [submitting, setSubmitting] = useState(false);
  const [validationError, setValidationError] = useState('');

  const subtotal = cart.reduce((sum, item) => sum + getCartItemLineTotal(item), 0);

  const pickupTimes = ['9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM', '1:00 PM'];

  const paymentMethods: Array<{ id: PaymentMethod; name: string; icon: React.ElementType; color: string }> = [
    { id: 'PAY_AT_STORE', name: 'Pay at Store', icon: Store, color: '#362415' },
    { id: 'ONLINE_PAYMONGO', name: 'Online (PayMongo)', icon: CreditCard, color: '#0070E0' },
  ];

  const handlePlaceOrder = async () => {
    if (cart.length === 0 || submitting) {
      return;
    }

    if (!selectedBrand || !selectedBranch) {
      setValidationError('Please select a store and branch before placing an order.');
      return;
    }

    if (orderType === 'advance' && !pickupTime) {
      setValidationError('Please select a pickup time for your advance order.');
      return;
    }

    setValidationError('');
    setSubmitting(true);

    function mapCartToOrderItems(items: CartItem[]): OrderItemDoc[] {
      return items.map(item => {
        const customizations: CustomizationDoc[] = [];
        customizations.push({ optionId: 'name', productId: item.productId, name: 'Product Name', optionType: 'productName', optionValue: item.name, extraCost: 0 });
        customizations.push({ optionId: 'img', productId: item.productId, name: 'Image', optionType: 'image', optionValue: item.image, extraCost: 0 });
        customizations.push({ optionId: 'bp', productId: item.productId, name: 'Base Price', optionType: 'basePrice', optionValue: String(item.basePrice), extraCost: item.basePrice });
        if (item.selectedSizeOz) {
          customizations.push({ optionId: `size-${item.selectedSizeOz}`, productId: item.productId, name: `Size ${item.selectedSizeOz}oz`, optionType: 'size', optionValue: String(item.selectedSizeOz), extraCost: 0 });
        }
        if (item.toppingsRemoved) {
          customizations.push({ optionId: 'toppings-removed', productId: item.productId, name: 'Toppings Removed', optionType: 'toppingsRemoved', optionValue: 'true', extraCost: 0 });
        }
        for (const addOn of item.addOns) {
          customizations.push({ optionId: addOn.id, productId: item.productId, name: addOn.name, optionType: 'addOn', optionValue: addOn.name, extraCost: addOn.extraCost });
        }
        return {
          orderItemId: item.cartItemId,
          productId: item.productId,
          quantity: item.quantity,
          customizations,
        };
      });
    }

    let paymentStatus: 'UNPAID' | 'PAID' | 'FAILED' | 'PENDING' = 'UNPAID';
    let statusMessage = 'Prepare once you arrived in the store';
    let status: 'waiting_for_arrival' | 'preparing' | 'payment_failed' = 'waiting_for_arrival';

    if (paymentMethod === 'ONLINE_PAYMONGO') {
      const tempId = `BJC-${Date.now().toString(36).toUpperCase().slice(-4)}${String(Math.floor(Math.random() * 99)).padStart(2, '0')}`;
      const result = await createPaymongoCheckout({ id: tempId, total: subtotal, items: cart });

      if (result.status === 'PAID') {
        paymentStatus = 'PAID';
        status = 'preparing';
        statusMessage = 'We\'re now processing your order';
      } else if (result.status === 'PENDING') {
        paymentStatus = 'PENDING';
        status = 'preparing';
        statusMessage = 'We\'re now processing your order';
      } else {
        paymentStatus = 'FAILED';
        status = 'payment_failed';
        statusMessage = 'Online payment failed. Please try again or switch to Pay at Store.';
      }
    }

    const displayTime = orderType === 'onsite' ? 'Now' : pickupTime;
    const userId = firebaseUser?.uid ?? '';
    const customerName = userProfile?.name ?? 'Customer';

    // Write to Firestore
    const orderDoc = await createOrder(
      userId,
      selectedBranch!,
      mapCartToOrderItems(cart),
      subtotal,
      paymentMethod,
      paymentStatus,
      customerName,
      orderType === 'advance' ? 'Advance Order' : 'On-site',
    );

    const orderId = orderDoc.orderId;

    // Send notification
    if (userId && paymentStatus !== 'FAILED') {
      sendNotification(userId, `Your order #${orderId} has been placed!`);
    }

    // Award loyalty points
    if (firebaseUser && paymentStatus !== 'FAILED') {
      const earned = Math.floor(subtotal / 10);
      if (earned > 0) {
        try {
          const currentPoints = await getLoyaltyPoints(firebaseUser.uid);
          const newTotal = currentPoints + earned;
          await updateLoyaltyPoints(firebaseUser.uid, newTotal);
          setLoyaltyPoints(newTotal);
          toast.success(`You earned ${earned} loyalty points! 🌟`);
        } catch {
          // Non-blocking — don't fail the order for loyalty points
        }
      }
    }

    addOrder({
      id: orderId,
      items: cart,
      total: subtotal,
      status,
      time: displayTime,
      customerName,
      orderType: orderType === 'advance' ? 'Advance Order' : 'On-site',
      paymentMethod,
      paymentStatus,
      statusMessage,
    });

    if (paymentStatus !== 'FAILED') {
      clearCart();
    }

    setSubmitting(false);
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

      {/* Validation Error */}
      {validationError && (
        <div className="mb-4 p-3 rounded-[12px] bg-[#FFEBEE] border border-[#EF9A9A] flex items-start gap-2">
          <AlertCircle size={18} color="#D32F2F" className="mt-0.5 shrink-0" />
          <p className="text-[13px] text-[#D32F2F]">{validationError}</p>
        </div>
      )}

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

      <div className="mb-6 rounded-[12px] bg-[#F5F5F5] p-3">
        <p className="text-[12px] text-[#757575]">
          {paymentMethod === 'PAY_AT_STORE'
            ? 'Prepare once you arrived in the store'
            : 'We\'re now processing your order'}
        </p>
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
        disabled={submitting || cart.length === 0}
        className="w-full py-4 rounded-[16px] text-white text-[16px] cursor-pointer"
        style={{
          background: '#00704A',
          fontWeight: 600,
          boxShadow: '0 4px 16px rgba(0,112,74,0.3)',
          opacity: submitting || cart.length === 0 ? 0.5 : 1,
        }}
      >
        {submitting ? 'Placing Order...' : `Place Order — ₱${subtotal}`}
      </button>
    </div>
  );
}
