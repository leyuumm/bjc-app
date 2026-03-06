import React from 'react';
import { Outlet } from 'react-router';
import { BottomNav } from './BottomNav';

export function Layout() {
  return (
    <div className="flex justify-center bg-[#F0F0F0] min-h-screen">
      <div className="w-full max-w-[412px] min-h-screen bg-white relative" style={{ fontFamily: "'Roboto', sans-serif" }}>
        <div className="pb-[72px]">
          <Outlet />
        </div>
        <BottomNav />
      </div>
    </div>
  );
}
