import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Clock, ChefHat, Coffee, CheckCircle2, ArrowRight, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { useAppContext } from './AppContext';
import {
  updateOrderStatus as updateFirestoreOrderStatus,
  sendNotification,
} from '../services/firestore';
import { logout } from '../services/auth';
import type { OrderDoc, OrderStatusEnum } from '../types/firestore';

const statusColors: Record<string, { bg: string; text: string; border: string }> = {
  Pending: { bg: '#FFF3E0', text: '#E65100', border: '#FFB74D' },
  'In Progress': { bg: '#E3F2FD', text: '#1565C0', border: '#64B5F6' },
  Ready: { bg: '#E8F5E9', text: '#2E7D32', border: '#81C784' },
  Completed: { bg: '#F5F5F5', text: '#757575', border: '#E0E0E0' },
  Cancelled: { bg: '#FFEBEE', text: '#D32F2F', border: '#EF9A9A' },
};

const statusIcons: Record<string, React.ElementType> = {
  Pending: Clock,
  'In Progress': ChefHat,
  Ready: Coffee,
  Completed: CheckCircle2,
  Cancelled: Clock,
};

const nextStatus: Record<string, OrderStatusEnum | null> = {
  Pending: 'In Progress',
  'In Progress': 'Ready',
  Ready: 'Completed',
  Completed: null,
  Cancelled: null,
};

const statusNotificationMessages: Record<string, string> = {
  'In Progress': 'Your order is now being prepared! 🍵',
  Ready: 'Your order is ready for pickup! ☕',
  Completed: 'Your order has been completed. Thank you! ✅',
};

const filterTabs = ['All', 'Pending', 'In Progress', 'Ready', 'Completed'];

export function CashierDashboard() {
  const navigate = useNavigate();
  const { firestoreOrders, firestoreProducts, userProfile, resetState, setIsLoggedIn } = useAppContext();
  const [activeFilter, setActiveFilter] = useState('All');

  const orders = firestoreOrders;

  // Build a lookup map for product names
  const productNameMap = new Map(firestoreProducts.map(p => [p.productId, p.productName]));

  const filtered = activeFilter === 'All'
    ? orders
    : orders.filter(o => o.status === activeFilter);

  const handleStatusUpdate = async (order: OrderDoc, newStatus: OrderStatusEnum) => {
    try {
      await updateFirestoreOrderStatus(order.orderId, newStatus);

      // Send notification to customer
      const message = statusNotificationMessages[newStatus];
      if (message) {
        await sendNotification(
          order.userId,
          `Order #${order.orderId}: ${message}`,
        );
      }

      toast.success(`Order #${order.orderId} marked as ${newStatus}`);
    } catch (error) {
      console.error('Status update error:', error);
      toast.error('Failed to update order status');
    }
  };

  const handleLogout = async () => {
    await logout();
    resetState();
    setIsLoggedIn(false);
    navigate('/login');
  };

  if (!userProfile || (userProfile.role !== 'CASHIER' && userProfile.role !== 'ADMIN')) {
    return (
      <div className="px-4 pt-14 text-center">
        <p className="text-[#757575]">Access denied. Cashier/Admin only.</p>
        <button onClick={() => navigate('/home')} className="text-[#00704A] mt-4 cursor-pointer">Go Home</button>
      </div>
    );
  }

  return (
    <div className="px-4 pt-10 pb-6">
      <div className="flex items-start justify-between mb-1">
        <div>
          <h1 className="text-[22px] text-[#362415]" style={{ fontWeight: 700 }}>Cashier Dashboard</h1>
          <p className="text-[13px] text-[#757575] mt-0.5 mb-4">
            Manage incoming orders • {orders.filter(o => o.status !== 'Completed' && o.status !== 'Cancelled').length} active
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1 text-[13px] text-[#757575] hover:text-[#362415] cursor-pointer mt-1"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-3 -mx-4 px-4 no-scrollbar">
        {filterTabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveFilter(tab)}
            className={`px-4 py-2 rounded-[20px] text-[13px] whitespace-nowrap cursor-pointer transition-all ${
              activeFilter === tab
                ? 'bg-[#362415] text-white'
                : 'bg-[#F5F5F5] text-[#757575]'
            }`}
            style={{ fontWeight: activeFilter === tab ? 600 : 400 }}
          >
            {tab}
            {tab !== 'All' && (
              <span className="ml-1.5 text-[11px] opacity-70">
                ({orders.filter(o => o.status === tab).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Order Cards */}
      <div className="space-y-3">
        {filtered.map((order, i) => {
          const colors = statusColors[order.status] ?? statusColors.Pending;
          const Icon = statusIcons[order.status] ?? Clock;
          const next = nextStatus[order.status] ?? null;

          return (
            <motion.div
              key={order.orderId}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-[16px] bg-white p-4 border"
              style={{ borderColor: 'rgba(0,0,0,0.06)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-[15px] text-[#362415]" style={{ fontWeight: 700 }}>#{order.orderId}</h3>
                    <span
                      className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-[20px]"
                      style={{ background: colors.bg, color: colors.text, fontWeight: 600 }}
                    >
                      <Icon size={12} />
                      {order.status}
                    </span>
                    <span
                      className="text-[10px] px-2 py-1 rounded-[10px]"
                      style={{
                        background: order.paymentStatus === 'Completed' ? '#E8F5E9'
                          : order.paymentStatus === 'Failed' ? '#FFEBEE'
                          : '#FFF3E0',
                        color: order.paymentStatus === 'Completed' ? '#2E7D32'
                          : order.paymentStatus === 'Failed' ? '#D32F2F'
                          : '#E65100',
                        fontWeight: 700,
                      }}
                    >
                      {order.paymentStatus}
                    </span>
                  </div>
                  <p className="text-[13px] text-[#757575] mt-0.5">{order.customerName}</p>
                </div>
                <div className="text-right">
                  <p className="text-[14px] text-[#00704A]" style={{ fontWeight: 700 }}>&#8369;{order.total}</p>
                  <p className="text-[11px] text-[#757575]">{order.orderType}</p>
                </div>
              </div>

              <div className="bg-[#F5F5F5] rounded-[10px] p-2.5 mb-3">
                {order.orderDetails.map(item => (
                  <div key={item.orderItemId} className="flex justify-between text-[13px] py-0.5">
                    <span className="text-[#362415]">
                      {item.quantity}x {productNameMap.get(item.productId) ?? item.productId}
                    </span>
                  </div>
                ))}
                <p className="text-[11px] text-[#757575] mt-1">{order.paymentMethod}</p>
              </div>

              {next && (
                <button
                  onClick={() => handleStatusUpdate(order, next)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-[12px] text-white text-[14px] cursor-pointer"
                  style={{ background: '#00704A', fontWeight: 600 }}
                >
                  Mark as {next}
                  <ArrowRight size={16} />
                </button>
              )}
            </motion.div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <p className="text-[#757575] text-[14px]">No orders in this category</p>
        </div>
      )}
    </div>
  );
}
