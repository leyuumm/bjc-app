import React from 'react';
import { useParams, useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { CheckCircle2, Clock, ChefHat, Coffee, PartyPopper } from 'lucide-react';
import { useAppContext } from './AppContext';

const steps = [
  { label: 'Pending', icon: Clock },
  { label: 'Preparing', icon: ChefHat },
  { label: 'Ready', icon: Coffee },
  { label: 'Completed', icon: PartyPopper },
];

const statusIndex: Record<string, number> = {
  pending: 0,
  preparing: 1,
  ready: 2,
  completed: 3,
};

export function OrderTracking() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { orders } = useAppContext();
  const order = orders.find(o => o.id === orderId);

  if (!order) {
    return (
      <div className="px-4 pt-12 text-center">
        <p className="text-[#757575]">Order not found</p>
        <button onClick={() => navigate('/orders')} className="text-[#00704A] mt-4 cursor-pointer">
          Go to Orders
        </button>
      </div>
    );
  }

  const currentStep = statusIndex[order.status];

  return (
    <div className="px-4 pt-12 pb-6">
      {/* Success Animation */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', delay: 0.2 }}
        className="flex flex-col items-center mb-8"
      >
        <div className="w-20 h-20 rounded-full bg-[#E8F5E9] flex items-center justify-center mb-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.5 }}
          >
            <CheckCircle2 size={44} color="#00704A" />
          </motion.div>
        </div>
        <h2 className="text-[20px] text-[#362415]" style={{ fontWeight: 700 }}>Order Placed!</h2>
        <p className="text-[14px] text-[#757575] mt-1">Order #{order.id}</p>
        <p className="text-[13px] text-[#757575]">Pickup at {order.time}</p>
      </motion.div>

      {/* Stepper */}
      <div className="rounded-[16px] bg-white p-5 mb-6" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
        <h3 className="text-[15px] text-[#362415] mb-6" style={{ fontWeight: 600 }}>Order Status</h3>
        <div className="flex items-center justify-between relative">
          {/* Line */}
          <div className="absolute top-5 left-[10%] right-[10%] h-[3px] bg-[#E0E0E0] rounded-full">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(currentStep / 3) * 100}%` }}
              transition={{ duration: 1, delay: 0.5 }}
              className="h-full bg-[#00704A] rounded-full"
            />
          </div>

          {steps.map((step, i) => {
            const isComplete = i <= currentStep;
            const isCurrent = i === currentStep;
            return (
              <motion.div
                key={step.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.15 }}
                className="flex flex-col items-center z-10"
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all ${
                    isComplete ? 'bg-[#00704A]' : 'bg-[#E0E0E0]'
                  } ${isCurrent ? 'ring-4 ring-[#00704A]/20' : ''}`}
                >
                  <step.icon size={18} color={isComplete ? 'white' : '#757575'} />
                </div>
                <span className={`text-[11px] ${isComplete ? 'text-[#00704A]' : 'text-[#757575]'}`}
                  style={{ fontWeight: isCurrent ? 600 : 400 }}>
                  {step.label}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Order Details */}
      <div className="rounded-[16px] bg-[#F5F5F5] p-4 mb-6">
        <h3 className="text-[15px] text-[#362415] mb-3" style={{ fontWeight: 600 }}>Order Details</h3>
        {order.items.map(item => (
          <div key={item.id} className="flex justify-between py-2 text-[14px]">
            <span className="text-[#362415]">{item.quantity}x {item.name} ({item.size})</span>
            <span className="text-[#757575]" style={{ fontWeight: 500 }}>&#8369;{item.price * item.quantity}</span>
          </div>
        ))}
        <div className="h-px bg-[rgba(0,0,0,0.08)] my-2" />
        <div className="flex justify-between text-[16px]">
          <span className="text-[#362415]" style={{ fontWeight: 600 }}>Total</span>
          <span className="text-[#00704A]" style={{ fontWeight: 700 }}>&#8369;{order.total}</span>
        </div>
      </div>

      <button
        onClick={() => navigate('/orders')}
        className="w-full py-3.5 rounded-[12px] border border-[#00704A] text-[#00704A] text-[15px] cursor-pointer"
        style={{ fontWeight: 600 }}
      >
        View All Orders
      </button>

      <button
        onClick={() => navigate('/menu')}
        className="w-full py-3.5 rounded-[12px] text-[#757575] text-[14px] mt-2 cursor-pointer"
      >
        Order More
      </button>
    </div>
  );
}
