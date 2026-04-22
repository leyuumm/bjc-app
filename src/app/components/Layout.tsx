import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router';
import { BottomNav } from './BottomNav';
import { useAppContext } from './AppContext';
import { NotificationPanel } from './NotificationPanel';
import { Bell, Loader2 } from 'lucide-react';

export function Layout() {
  const { firebaseUser, userProfile, unreadNotificationsCount, authLoading } = useAppContext();
  const location = useLocation();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);

  const role = userProfile?.role ?? 'CUSTOMER';
  const cashierBranchPath = '/cashier/select-branch';
  const cashierBranchId = userProfile?.activeBranchId ?? userProfile?.assignedBranchId;
  const cashierStoreId = userProfile?.activeStoreId;

  // Route guard by role
  useEffect(() => {
    if (authLoading) return;

    if (!firebaseUser) {
      navigate('/splash', { replace: true });
      return;
    }

    if (role === 'CASHIER') {
      if (!location.pathname.startsWith('/cashier')) {
        navigate(cashierBranchPath, { replace: true });
        return;
      }

      // Cashier must choose a branch first before opening the dashboard.
      if (!cashierBranchId && location.pathname !== cashierBranchPath) {
        navigate(cashierBranchPath, { replace: true });
        return;
      }

      // Cashier must choose a store assignment for realtime branch-store queue.
      if (!cashierStoreId && location.pathname !== cashierBranchPath) {
        navigate(cashierBranchPath, { replace: true });
      }
    } else if (role === 'ADMIN' && !location.pathname.startsWith('/admin')) {
      navigate('/admin', { replace: true });
    } else if (role === 'CUSTOMER') {
      if (location.pathname.startsWith('/admin') || location.pathname.startsWith('/cashier')) {
        navigate('/home', { replace: true });
      }
    }
  }, [role, location.pathname, firebaseUser, navigate, cashierBranchPath, cashierBranchId, cashierStoreId, authLoading]);

  if (authLoading) {
    return (
      <div className="flex justify-center bg-[#F0F0F0] min-h-screen">
        <div className="w-full max-w-[412px] min-h-screen bg-white relative flex items-center justify-center" style={{ fontFamily: "'Roboto', sans-serif" }}>
          <Loader2 size={28} color="#00704A" className="animate-spin" />
        </div>
      </div>
    );
  }

  if (!firebaseUser) {
    return null;
  }

  return (
    <div className="flex justify-center bg-[#F0F0F0] min-h-screen">
      <div className="w-full max-w-[412px] min-h-screen bg-white relative" style={{ fontFamily: "'Roboto', sans-serif" }}>
        {/* Bell icon for notifications (customer only) */}
        {role === 'CUSTOMER' && (
          <button
            onClick={() => setShowNotifications(true)}
            className="fixed top-3 right-[calc(50%-190px)] z-[55] w-10 h-10 rounded-full bg-white flex items-center justify-center cursor-pointer"
            style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
          >
            <Bell size={20} color="#362415" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-[#D32F2F] text-white text-[11px] flex items-center justify-center" style={{ fontWeight: 600 }}>
                {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
              </span>
            )}
          </button>
        )}

        <div className={role === 'CASHIER' || role === 'ADMIN' ? '' : 'pb-[72px]'}>
          <Outlet />
        </div>
        {role === 'CUSTOMER' && <BottomNav />}

        {/* Notification Panel */}
        <NotificationPanel open={showNotifications} onClose={() => setShowNotifications(false)} />
      </div>
    </div>
  );
}
