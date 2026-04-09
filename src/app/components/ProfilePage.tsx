import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import {
  User, Heart, CreditCard, ClipboardList, ChevronRight,
  Settings, HelpCircle, LogOut, Bell, Shield, Star, Edit3, Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAppContext } from './AppContext';
import { IMAGES } from './data';
import { logout } from '../services/auth';
import { seedFirestore } from '../services/seed';

const favoriteOrders = [
  { id: '1', name: 'Caramel Frappé', size: 'Large', image: IMAGES.frappe },
  { id: '2', name: 'Classic Lemonade', size: 'Regular', image: IMAGES.lemonJuice },
  { id: '3', name: 'Café Latte', size: 'Medium', image: IMAGES.latte },
];

const orderHistory = [
  { id: 'BJC-004', date: 'Mar 4, 2026', total: 338, items: 2, status: 'Completed' },
  { id: 'BJC-003', date: 'Mar 3, 2026', total: 267, items: 3, status: 'Completed' },
  { id: 'BJC-002', date: 'Mar 2, 2026', total: 129, items: 1, status: 'Completed' },
  { id: 'BJC-001', date: 'Mar 1, 2026', total: 198, items: 2, status: 'Completed' },
];

export function ProfilePage() {
  const navigate = useNavigate();
  const { loyaltyPoints, setIsLoggedIn, userProfile, firebaseUser, resetState, authLoading } = useAppContext();
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [seeding, setSeeding] = useState(false);

  const displayName = userProfile?.name || firebaseUser?.displayName || 'Guest User';
  const displayEmail = userProfile?.email || firebaseUser?.email || '';

  const handleLogout = async () => {
    await logout();
    resetState();
    setIsLoggedIn(false);
    navigate('/splash');
  };

  return (
    <div className="pb-6">
      {/* Profile Header */}
      <div className="px-5 pt-12 pb-6" style={{ background: 'linear-gradient(135deg, #362415, #00704A)' }}>
        {authLoading ? (
          <div className="flex items-center gap-4">
            <div className="w-[72px] h-[72px] rounded-full bg-white/20 animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-5 w-36 bg-white/20 rounded animate-pulse" />
              <div className="h-4 w-44 bg-white/10 rounded animate-pulse" />
              <div className="h-4 w-24 bg-white/10 rounded animate-pulse" />
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <div className="w-[72px] h-[72px] rounded-full bg-white/20 flex items-center justify-center relative">
              <User size={36} color="white" />
              <button className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#00704A] border-2 border-white flex items-center justify-center cursor-pointer">
                <Edit3 size={12} color="white" />
              </button>
            </div>
            <div>
              <h1 className="text-white text-[22px]" style={{ fontWeight: 700 }}>{displayName}</h1>
              <p className="text-white/60 text-[13px]">{displayEmail}</p>
              <div className="flex items-center gap-1 mt-1">
                <Star size={14} color="#FFD700" fill="#FFD700" />
                <span className="text-white/80 text-[13px]" style={{ fontWeight: 500 }}>
                  {loyaltyPoints.toLocaleString()} points
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Favorite Orders */}
      <div className="px-4 pt-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[16px] text-[#362415]" style={{ fontWeight: 700 }}>
            <Heart size={16} className="inline mr-1.5" color="#D32F2F" fill="#D32F2F" />
            Favorite Orders
          </h2>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 no-scrollbar">
          {favoriteOrders.map((item, i) => (
            <motion.button
              key={item.id}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="min-w-[130px] rounded-[16px] overflow-hidden bg-white cursor-pointer"
              style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
            >
              <img src={item.image} alt={item.name} className="w-full h-[80px] object-cover" />
              <div className="p-2.5">
                <p className="text-[13px] text-[#362415] line-clamp-1" style={{ fontWeight: 600 }}>{item.name}</p>
                <p className="text-[11px] text-[#757575]">{item.size}</p>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Payment Preferences */}
      <div className="px-4 pt-5">
        <h2 className="text-[16px] text-[#362415] mb-3" style={{ fontWeight: 700 }}>
          <CreditCard size={16} className="inline mr-1.5" />
          Payment Methods
        </h2>
        <div className="space-y-2">
          {[
            { name: 'GCash', detail: '•••• 1234', color: '#0070E0' },
            { name: 'PayMaya', detail: '•••• 5678', color: '#00C853' },
          ].map((pm, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-[12px] bg-[#F5F5F5]">
              <div className="w-10 h-10 rounded-[10px] flex items-center justify-center" style={{ background: pm.color + '15' }}>
                <CreditCard size={18} color={pm.color} />
              </div>
              <div className="flex-1">
                <p className="text-[14px] text-[#362415]" style={{ fontWeight: 500 }}>{pm.name}</p>
                <p className="text-[12px] text-[#757575]">{pm.detail}</p>
              </div>
              <ChevronRight size={16} color="#E0E0E0" />
            </div>
          ))}
          <button className="w-full py-2.5 rounded-[12px] border border-dashed border-[rgba(0,0,0,0.2)] text-[13px] text-[#00704A] cursor-pointer"
            style={{ fontWeight: 500 }}>
            + Add Payment Method
          </button>
        </div>
      </div>

      {/* Order History */}
      <div className="px-4 pt-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[16px] text-[#362415]" style={{ fontWeight: 700 }}>
            <ClipboardList size={16} className="inline mr-1.5" />
            Order History
          </h2>
          <button className="text-[13px] text-[#00704A] cursor-pointer" style={{ fontWeight: 500 }}>See All</button>
        </div>
        <div className="space-y-2">
          {orderHistory.map((order, i) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.05 }}
              className="flex items-center justify-between p-3 rounded-[12px] bg-[#F5F5F5]"
            >
              <div>
                <p className="text-[14px] text-[#362415]" style={{ fontWeight: 600 }}>#{order.id}</p>
                <p className="text-[12px] text-[#757575]">{order.date} &bull; {order.items} items</p>
              </div>
              <div className="text-right">
                <p className="text-[14px] text-[#00704A]" style={{ fontWeight: 600 }}>&#8369;{order.total}</p>
                <span className="text-[11px] text-[#2E7D32] bg-[#E8F5E9] px-2 py-0.5 rounded-[8px]" style={{ fontWeight: 500 }}>
                  {order.status}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Settings Menu */}
      <div className="px-4 pt-5">
        <h2 className="text-[16px] text-[#362415] mb-3" style={{ fontWeight: 700 }}>Settings</h2>
        <div className="rounded-[16px] overflow-hidden border border-[rgba(0,0,0,0.06)]">
          {[
            { icon: Bell, label: 'Notifications', color: '#FF9800' },
            { icon: Shield, label: 'Privacy & Security', color: '#2196F3' },
            { icon: Settings, label: 'App Settings', color: '#757575' },
            { icon: HelpCircle, label: 'Help & Support', color: '#00704A' },
          ].map((item, i) => (
            <button
              key={item.label}
              className="w-full flex items-center gap-3 px-4 py-3.5 cursor-pointer text-left border-b border-[rgba(0,0,0,0.04)] last:border-0"
            >
              <div className="w-9 h-9 rounded-[10px] flex items-center justify-center" style={{ background: item.color + '15' }}>
                <item.icon size={18} color={item.color} />
              </div>
              <span className="flex-1 text-[14px] text-[#362415]" style={{ fontWeight: 500 }}>{item.label}</span>
              <ChevronRight size={16} color="#E0E0E0" />
            </button>
          ))}
        </div>
      </div>

      {/* Logout */}
      <div className="px-4 pt-5">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-[12px] border border-[#D32F2F] text-[#D32F2F] text-[14px] cursor-pointer"
          style={{ fontWeight: 600 }}
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>

      {/* Dev-only Seed Button */}
      {import.meta.env.DEV && (
        <div className="px-4 pt-3">
          <button
            onClick={async () => {
              setSeeding(true);
              try {
                await seedFirestore();
                toast.success('Firestore seeded!');
              } catch {
                toast.error('Seed failed!');
              } finally {
                setSeeding(false);
              }
            }}
            disabled={seeding}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-[12px] text-white text-[14px] cursor-pointer disabled:opacity-60"
            style={{ fontWeight: 600, background: '#362415' }}
          >
            {seeding ? <Loader2 size={18} className="animate-spin" /> : '🌱'}
            {seeding ? 'Seeding…' : 'Seed Firestore (Dev Only)'}
          </button>
        </div>
      )}

      <p className="text-center text-[11px] text-[#757575] mt-6">BJC App v1.0.0</p>
    </div>
  );
}