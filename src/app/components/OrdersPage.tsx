import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { Clock, ChefHat, Coffee, CheckCircle2, ChevronRight, AlertCircle } from 'lucide-react';
import { useAppContext } from './AppContext';

const statusColors: Record<string, { bg: string; text: string }> = {
  waiting_for_arrival: { bg: '#FFF3E0', text: '#E65100' },
  preparing: { bg: '#E3F2FD', text: '#1565C0' },
  ready: { bg: '#E8F5E9', text: '#2E7D32' },
  completed: { bg: '#F5F5F5', text: '#757575' },
  payment_failed: { bg: '#FFEBEE', text: '#D32F2F' },
};

const statusIcons: Record<string, React.ElementType> = {
  waiting_for_arrival: Clock,
  preparing: ChefHat,
  ready: Coffee,
  completed: CheckCircle2,
  payment_failed: AlertCircle,
};

export function OrdersPage() {
  const navigate = useNavigate();
  const { orders, authLoading } = useAppContext();
  const [tab, setTab] = useState<'active' | 'history'>('active');

  const activeOrders = orders.filter(o => o.status !== 'completed');
  const historyOrders = orders.filter(o => o.status === 'completed');
  const displayOrders = tab === 'active' ? activeOrders : historyOrders;

  return (
    <div className="px-4 pt-10 pb-6">
      <h1 className="text-[22px] text-[#362415]" style={{ fontWeight: 700 }}>My Orders</h1>

      {/* Tabs */}
      <div className="flex mt-4 mb-5 bg-[#F5F5F5] rounded-[12px] p-1">
        {(['active', 'history'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2.5 rounded-[10px] text-[14px] cursor-pointer transition-all ${
              tab === t ? 'bg-white text-[#362415]' : 'text-[#757575]'
            }`}
            style={{ fontWeight: tab === t ? 600 : 400, boxShadow: tab === t ? '0 1px 4px rgba(0,0,0,0.08)' : 'none' }}
          >
            {t === 'active' ? 'Active' : 'History'}
            {t === 'active' && activeOrders.length > 0 && (
              <span className="ml-1.5 w-5 h-5 inline-flex items-center justify-center rounded-full bg-[#00704A] text-white text-[11px]">
                {activeOrders.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Order List */}
      <div className="space-y-3">
        {authLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-[16px] bg-white p-4 border border-[rgba(0,0,0,0.06)] animate-pulse" style={{ boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}>
              <div className="flex items-start justify-between mb-3">
                <div className="space-y-2">
                  <div className="h-4 w-24 bg-[#E0E0E0] rounded" />
                  <div className="h-3 w-36 bg-[#E0E0E0] rounded" />
                </div>
                <div className="h-6 w-20 bg-[#E0E0E0] rounded-[20px]" />
              </div>
              <div className="space-y-1 mb-3">
                <div className="h-3 w-full bg-[#E0E0E0] rounded" />
                <div className="h-3 w-3/4 bg-[#E0E0E0] rounded" />
              </div>
              <div className="flex justify-between pt-2 border-t border-[rgba(0,0,0,0.06)]">
                <div className="h-4 w-16 bg-[#E0E0E0] rounded" />
                <div className="h-4 w-20 bg-[#E0E0E0] rounded" />
              </div>
            </div>
          ))
        ) : (
          <>{displayOrders.map((order, i) => {
          const colors = statusColors[order.status];
          const Icon = statusIcons[order.status];
          return (
            <motion.button
              key={order.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(`/order-tracking/${order.id}`)}
              className="w-full rounded-[16px] bg-white p-4 border border-[rgba(0,0,0,0.06)] text-left cursor-pointer"
              style={{ boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-[15px] text-[#362415]" style={{ fontWeight: 700 }}>#{order.id}</h3>
                  <p className="text-[12px] text-[#757575] mt-0.5">{order.time} &bull; {order.orderType}</p>
                </div>
                <span
                  className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-[20px]"
                  style={{ background: colors.bg, color: colors.text, fontWeight: 600 }}
                >
                  <Icon size={12} />
                  {order.status === 'waiting_for_arrival'
                    ? 'Waiting for Arrival'
                    : order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              </div>

              <div className="mt-2">
                {order.items.slice(0, 2).map(item => (
                  <p key={item.cartItemId} className="text-[13px] text-[#757575]">
                    {item.quantity}x {item.name}
                  </p>
                ))}
              </div>

              <div className="flex items-center justify-between mt-3 pt-2 border-t border-[rgba(0,0,0,0.06)]">
                <span className="text-[14px] text-[#00704A]" style={{ fontWeight: 700 }}>&#8369;{order.total}</span>
                <span className="text-[12px] text-[#00704A] flex items-center gap-1" style={{ fontWeight: 500 }}>
                  Track Order <ChevronRight size={14} />
                </span>
              </div>
            </motion.button>
          );
        })}

        {displayOrders.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-[#F5F5F5] flex items-center justify-center mx-auto mb-3">
              <Clock size={28} color="#757575" />
            </div>
            <p className="text-[#757575] text-[14px]">
              {tab === 'active' ? 'No active orders' : 'No order history yet'}
            </p>
          </div>
        )}
        </>
        )}
      </div>
    </div>
  );
}
