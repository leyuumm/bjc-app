import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  LayoutDashboard,
  Package,
  Settings2,
  LogOut,
  ChevronRight,
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router';
import { useAppContext } from './AppContext';
import { logout } from '../services/auth';

interface AdminNavPanelProps {
  open: boolean;
  onClose: () => void;
}

interface NavItem {
  label: string;
  path: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    path: '/admin',
    icon: LayoutDashboard,
  },
  {
    label: 'Manage Products',
    path: '/admin/products',
    icon: Package,
  },
  {
    label: 'Profile',
    path: '/admin/profile',
    icon: Settings2,
  },
];

function isActivePath(currentPath: string, targetPath: string): boolean {
  if (targetPath === '/admin') {
    return currentPath === '/admin';
  }

  return currentPath.startsWith(targetPath);
}

export function AdminNavPanel({ open, onClose }: AdminNavPanelProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { userProfile, resetState, setIsLoggedIn } = useAppContext();

  const handleNavigate = (path: string) => {
    if (!isActivePath(location.pathname, path)) {
      navigate(path);
    }
    onClose();
  };

  const handleSignOut = async () => {
    await logout();
    resetState();
    setIsLoggedIn(false);
    onClose();
    navigate('/splash');
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/45 z-[70]"
            onClick={onClose}
          />

          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 26 }}
            className="fixed top-0 bottom-0 left-[calc(50%-206px)] w-[320px] max-w-[85vw] bg-white z-[70] flex flex-col"
            style={{ boxShadow: '8px 0 24px rgba(0,0,0,0.15)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-3 pt-5 pb-2 shrink-0 bg-white">
              <button
                onClick={onClose}
                className="cursor-pointer p-2 rounded-full hover:bg-[#F5F5F5] transition-colors"
                aria-label="Close navigation panel"
              >
                <X size={22} color="#362415" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto bg-[#FAFAFA] px-3 py-2" style={{ overscrollBehaviorY: 'contain' }}>
              <div className="space-y-2">
                {navItems.map((item) => {
                  const active = isActivePath(location.pathname, item.path);

                  return (
                    <button
                      key={item.path}
                      onClick={() => handleNavigate(item.path)}
                      className={`w-full text-left rounded-[14px] px-3.5 py-3 cursor-pointer transition-all border ${
                        active
                          ? 'bg-[#E8F5E9] border-[#B7E2CF]'
                          : 'bg-white border-[rgba(0,0,0,0.06)] hover:bg-[#F7F7F7]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-[11px] flex items-center justify-center ${active ? 'bg-white' : 'bg-[#F5F5F5]'}`}>
                          <item.icon size={18} color={active ? '#00704A' : '#5F5F5F'} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className={`text-[14px] ${active ? 'text-[#00704A]' : 'text-[#362415]'}`} style={{ fontWeight: 700 }}>
                            {item.label}
                          </p>
                        </div>
                        <ChevronRight size={16} color={active ? '#00704A' : '#9E9E9E'} />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="px-4 py-3 bg-white border-t border-[rgba(0,0,0,0.08)]">
              <button
                onClick={handleSignOut}
                aria-label="Logout"
                title="Logout"
                className="w-full h-11 rounded-[12px] bg-[#D32F2F] text-white cursor-pointer flex items-center justify-center gap-2"
                style={{ boxShadow: '0 2px 8px rgba(211,47,47,0.3)', fontWeight: 600 }}
              >
                <LogOut size={17} />
                Sign out
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
