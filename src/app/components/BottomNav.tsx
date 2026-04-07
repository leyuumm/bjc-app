import React from 'react';
import { useNavigate, useLocation } from 'react-router';
import { Home, Coffee, ClipboardList, Gift, User, Bell } from 'lucide-react';
import { useAppContext } from './AppContext';

const tabs = [
  { label: 'Home', icon: Home, path: '/home' },
  { label: 'Menu', icon: Coffee, path: '/menu' },
  { label: 'Orders', icon: ClipboardList, path: '/orders' },
  { label: 'Rewards', icon: Gift, path: '/rewards' },
  { label: 'Profile', icon: User, path: '/profile' },
];

export function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { unreadNotificationCount } = useAppContext();

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[412px] bg-white border-t border-[rgba(0,0,0,0.12)] z-50"
      style={{ boxShadow: '0 -2px 8px rgba(0,0,0,0.06)' }}>
      <div className="flex justify-around items-center py-2">
        {tabs.map(tab => {
          const isActive = location.pathname.startsWith(tab.path);
          const showBadge = tab.label === 'Orders' && unreadNotificationCount > 0;
          return (
            <button
              key={tab.label}
              onClick={() => navigate(tab.path)}
              className="flex flex-col items-center gap-0.5 px-3 py-1 min-w-[56px] transition-colors relative"
            >
              <div className={`rounded-[16px] px-4 py-1 transition-colors ${isActive ? 'bg-[#E8F5E9]' : ''}`}>
                <tab.icon size={22} color={isActive ? '#00704A' : '#757575'} strokeWidth={isActive ? 2.5 : 2} />
                {showBadge && (
                  <span className="absolute top-0 right-2 w-4 h-4 rounded-full bg-[#D32F2F] text-white text-[9px] flex items-center justify-center"
                    style={{ fontWeight: 700 }}>
                    {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
                  </span>
                )}
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
