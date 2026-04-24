import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router';
import { Clock, ChefHat, Coffee, CheckCircle2, ArrowRight, Loader2, MapPin } from 'lucide-react';
import { useAppContext } from './AppContext';
import { SIZE_LABELS } from '../config/menuRules';
import {
  onBranchOrdersSnapshot,
  updateOrderStatus as updateFirestoreOrderStatus,
  sendNotification,
  getBranchDetails,
} from '../services/firestore';
import type { OrderDoc, OrderStatusEnum } from '../types/firestore';
import type { Order, OrderStatus } from '../types/order';
import { mapOrderDocToOrder } from '../utils/mappers';

const localStatusToFirestore: Record<string, OrderStatusEnum> = {
  waiting_for_arrival: 'Pending',
  preparing: 'In Progress',
  ready: 'Ready',
  completed: 'Completed',
  payment_failed: 'Cancelled',
};

const statusColors: Record<string, { bg: string; text: string; border: string }> = {
  waiting_for_arrival: { bg: '#FFF3E0', text: '#E65100', border: '#FFB74D' },
  preparing: { bg: '#E3F2FD', text: '#1565C0', border: '#64B5F6' },
  ready: { bg: '#E8F5E9', text: '#2E7D32', border: '#81C784' },
  completed: { bg: '#F5F5F5', text: '#757575', border: '#E0E0E0' },
  payment_failed: { bg: '#FFEBEE', text: '#D32F2F', border: '#EF9A9A' },
};

const statusIcons: Record<string, React.ElementType> = {
  waiting_for_arrival: Clock,
  preparing: ChefHat,
  ready: Coffee,
  completed: CheckCircle2,
  payment_failed: Clock,
};

const nextStatus: Record<string, Order['status'] | null> = {
  waiting_for_arrival: 'preparing',
  preparing: 'ready',
  ready: 'completed',
  completed: null,
  payment_failed: null,
};

const filterTabs = ['All', 'Waiting', 'Preparing', 'Ready', 'Completed'];

export function CashierDashboard() {
  const navigate = useNavigate();
  const { userProfile } = useAppContext();
  const [activeFilter, setActiveFilter] = useState('All');
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderDocs, setOrderDocs] = useState<OrderDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [branchLabel, setBranchLabel] = useState('');
  const [storeLabel, setStoreLabel] = useState('');

  const branchId = userProfile?.activeBranchId ?? userProfile?.assignedBranchId ?? '';
  const storeId = userProfile?.activeStoreId ?? null;

  useEffect(() => {
    if (!branchId) {
      setLoading(false);
      return;
    }

    const timeoutId = setTimeout(() => setLoading(false), 10000);

    const unsub = onBranchOrdersSnapshot(branchId, storeId, (docs) => {
      clearTimeout(timeoutId);
      setOrderDocs(docs);
      setOrders(docs.map(mapOrderDocToOrder));
      setLoading(false);
    }, (error) => {
      clearTimeout(timeoutId);
      console.error('Cashier orders snapshot error:', error);
      setLoading(false);
    });
    return () => {
      clearTimeout(timeoutId);
      unsub();
    };
  }, [branchId, storeId]);

  useEffect(() => {
    if (!storeId) {
      setStoreLabel('');
      return;
    }
    setStoreLabel(storeId === 'lehmuhn' ? 'the leh-muhn' : storeId === 'kohfee' ? 'the koh-fee' : storeId);
  }, [storeId]);

  useEffect(() => {
    if (!branchId) {
      setBranchLabel('');
      return;
    }
    let cancelled = false;
    getBranchDetails(branchId).then((branch) => {
      if (!cancelled) {
        setBranchLabel(branch?.branchName ?? branchId);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [branchId]);

  const handleUpdateStatus = async (orderId: string, newLocalStatus: OrderStatus) => {
    const firestoreStatus = localStatusToFirestore[newLocalStatus];
    if (!firestoreStatus) return;
    await updateFirestoreOrderStatus(orderId, firestoreStatus);

    // Find the order doc to get userId
    const orderDoc = orderDocs.find(d => d.orderId === orderId);
    if (orderDoc) {
      const messages: Record<string, string> = {
        preparing: `Your order #${orderId} is now being prepared!`,
        ready: `Your order #${orderId} is ready for pickup!`,
        completed: `Your order #${orderId} has been completed. Thank you!`,
      };
      const msg = messages[newLocalStatus];
      if (msg) {
        sendNotification(orderDoc.userId, msg);
      }
    }
  };

  const filtered = activeFilter === 'All'
    ? orders
    : orders.filter(o => o.status === (activeFilter === 'Waiting' ? 'waiting_for_arrival' : activeFilter.toLowerCase()));

  return (
    <div className="px-4 pt-10 pb-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-[22px] text-[#362415]" style={{ fontWeight: 700 }}>Cashier Dashboard</h1>
          <p className="text-[13px] text-[#757575] mt-0.5">Manage incoming orders</p>
        </div>
        <button
          onClick={() => navigate('/cashier/select-branch')}
          className="px-3 py-2 rounded-[10px] bg-[#F5F5F5] text-[#362415] text-[12px] cursor-pointer"
          style={{ fontWeight: 600 }}
        >
          Switch Branch
        </button>
      </div>

      {branchId && (
        <div className="mt-3 mb-4 rounded-[12px] bg-[#E8F5E9] border border-[#81C784] px-3 py-2.5 flex items-center gap-2">
          <MapPin size={16} color="#2E7D32" />
          <p className="text-[13px] text-[#2E7D32]" style={{ fontWeight: 600 }}>
            Active: {branchLabel || branchId}{storeLabel ? ` · ${storeLabel}` : ''}
          </p>
        </div>
      )}

      {!branchId && (
        <div className="text-center py-12">
          <p className="text-[#757575] text-[14px]">Select your branch to start receiving orders.</p>
          <button
            onClick={() => navigate('/cashier/select-branch')}
            className="mt-3 px-4 py-2 rounded-[10px] bg-[#00704A] text-white text-[13px] cursor-pointer"
            style={{ fontWeight: 600 }}
          >
            Select Branch
          </button>
        </div>
      )}

      {branchId && loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={32} color="#00704A" className="animate-spin" />
        </div>
      )}

      {branchId && !loading && (
      <>
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
                ({orders.filter(o => o.status === (tab === 'Waiting' ? 'waiting_for_arrival' : tab.toLowerCase())).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Order Cards */}
      <div className="space-y-3">
        {filtered.map((order, i) => {
          const colors = statusColors[order.status];
          const Icon = statusIcons[order.status];
          const next = nextStatus[order.status];

          return (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-[16px] bg-white p-4 border"
              style={{ borderColor: 'rgba(0,0,0,0.06)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-[15px] text-[#362415]" style={{ fontWeight: 700 }}>#{order.id}</h3>
                    <span
                      className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-[20px]"
                      style={{ background: colors.bg, color: colors.text, fontWeight: 600 }}
                    >
                      <Icon size={12} />
                      {order.status === 'waiting_for_arrival'
                        ? 'Waiting for Arrival'
                        : order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                    <span
                      className="text-[10px] px-2 py-1 rounded-[10px]"
                      style={{
                        background: order.paymentStatus === 'PAID' ? '#E8F5E9'
                          : order.paymentStatus === 'FAILED' ? '#FFEBEE'
                          : '#FFF3E0',
                        color: order.paymentStatus === 'PAID' ? '#2E7D32'
                          : order.paymentStatus === 'FAILED' ? '#D32F2F'
                          : '#E65100',
                        fontWeight: 700,
                      }}
                    >
                      {order.paymentStatus === 'PAID' ? 'PAID'
                        : order.paymentStatus === 'FAILED' ? 'FAILED'
                        : order.paymentMethod === 'PAY_AT_STORE' ? 'PAY AT STORE'
                        : 'PENDING'}
                    </span>
                  </div>
                  <p className="text-[13px] text-[#757575] mt-0.5">{order.customerName}</p>
                </div>
                <div className="text-right">
                  <p className="text-[14px] text-[#00704A]" style={{ fontWeight: 700 }}>&#8369;{order.total}</p>
                  <p className="text-[11px] text-[#757575]">{order.time}</p>
                </div>
              </div>

              <div className="bg-[#F5F5F5] rounded-[10px] p-2.5 mb-3">
                {order.items.map(item => (
                  <div key={item.cartItemId} className="flex justify-between text-[13px] py-0.5">
                    <span className="text-[#362415]">
                      {item.quantity}x {item.name}
                      {item.selectedSizeOz ? ` (${SIZE_LABELS[item.selectedSizeOz]} ${item.selectedSizeOz}oz)` : ''}
                      {item.selectedFoodPortion ? ` (${item.selectedFoodPortion === 'paraUno' ? 'Para Uno' : 'Para Amigos'})` : ''}
                    </span>
                  </div>
                ))}
                <p className="text-[11px] text-[#757575] mt-1">{order.orderType}</p>
                {order.paymentMethod === 'PAY_AT_STORE' && (
                  <p className="text-[11px] text-[#E65100] mt-1">Prepare once arrived</p>
                )}
              </div>

              {next && (
                <button
                  onClick={() => handleUpdateStatus(order.id, next)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-[12px] text-white text-[14px] cursor-pointer"
                  style={{ background: '#00704A', fontWeight: 600 }}
                >
                  Mark as {next.charAt(0).toUpperCase() + next.slice(1)}
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
      </>
      )}
    </div>
  );
}
