import React from 'react';
import { Outlet } from 'react-router';
import { BottomNav } from './BottomNav';
import { NotificationBell } from './NotificationPanel';
import { useAppContext } from './AppContext';

export function Layout() {
  const { userProfile } = useAppContext();
  const isCustomer = !userProfile || userProfile.role === 'CUSTOMER';

  return (
    <div className="flex justify-center bg-[#F0F0F0] min-h-screen">
      <div className="w-full max-w-[412px] min-h-screen bg-white relative" style={{ fontFamily: "'Roboto', sans-serif" }}>
        {/* Notification bell for customers */}
        {isCustomer && (
          <div className="absolute top-3 right-3 z-20">
            <NotificationBell />
          </div>
        )}
        <div className="pb-[72px]">
          <Outlet />
        </div>
        <BottomNav />
      </div>
    </div>
  );
}
