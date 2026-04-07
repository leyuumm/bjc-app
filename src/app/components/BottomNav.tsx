import React from 'react';
import { useNavigate, useLocation } from 'react-router';
import { Home, Coffee, ClipboardList, Gift, User, LayoutDashboard, Package } from 'lucide-react';
import { useAppContext } from './AppContext';

const customerTabs = [
  { label: 'Home', icon: Home, path: '/home' },
  { label: 'Menu', icon: Coffee, path: '/menu' },
  { label: 'Orders', icon: ClipboardList, path: '/orders' },
  { label: 'Rewards', icon: Gift, path: '/rewards' },
  { label: 'Profile', icon: User, path: '/profile' },
];

const adminTabs = [
  { label: 'Products', icon: Package, path: '/admin' },
  { label: 'Profile', icon: User, path: '/profile' },
];

export function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { userProfile } = useAppContext();

  const role = userProfile?.role ?? 'CUSTOMER';

  // Cashier gets no bottom nav
  if (role === 'CASHIER') return null;

  const tabs = role === 'ADMIN' ? adminTabs : customerTabs;

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[412px] bg-white border-t border-[rgba(0,0,0,0.12)] z-50"
      style={{ boxShadow: '0 -2px 8px rgba(0,0,0,0.06)' }}>
      <div className="flex justify-around items-center py-2">
        {tabs.map(tab => {
          const isActive = location.pathname.startsWith(tab.path);
          return (
            <button
              key={tab.label}
              onClick={() => navigate(tab.path)}
              className="flex flex-col items-center gap-0.5 px-3 py-1 min-w-[56px] transition-colors"
            >
              <div className={`rounded-[16px] px-4 py-1 transition-colors ${isActive ? 'bg-[#E8F5E9]' : ''}`}>
                <tab.icon size={22} color={isActive ? '#00704A' : '#757575'} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className={`text-[11px] ${isActive ? 'text-[#00704A]' : 'text-[#757575]'}`}
                style={{ fontWeight: isActive ? 600 : 400 }}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
