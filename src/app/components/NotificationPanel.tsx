import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Bell, BellOff, Check } from 'lucide-react';
import { useAppContext } from './AppContext';
import { markNotificationAsRead } from '../services/firestore';
import type { NotificationDoc } from '../types/firestore';

function formatTimestamp(ts: Date | unknown): string {
  if (ts instanceof Date) {
    return ts.toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  }
  // Firestore Timestamp objects have a toDate() method
  if (ts && typeof ts === 'object' && 'toDate' in ts) {
    return (ts as { toDate: () => Date }).toDate().toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  }
  return '';
}

export function NotificationPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { notifications } = useAppContext();

  const handleMarkRead = async (notificationId: string) => {
    await markNotificationAsRead(notificationId);
  };

  const handleMarkAllRead = async () => {
    const unread = notifications.filter(n => !n.isRead);
    await Promise.all(unread.map(n => markNotificationAsRead(n.notificationId)));
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-[70]"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-[360px] bg-white z-[70] flex flex-col"
            style={{ boxShadow: '-4px 0 20px rgba(0,0,0,0.1)' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-4 pt-12 pb-3 border-b border-[rgba(0,0,0,0.08)] flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-[20px] text-[#362415]" style={{ fontWeight: 700 }}>Notifications</h2>
                <p className="text-[12px] text-[#757575]">
                  {notifications.filter(n => !n.isRead).length} unread
                </p>
              </div>
              <div className="flex items-center gap-2">
                {notifications.some(n => !n.isRead) && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[12px] text-[#00704A] px-3 py-1.5 rounded-[8px] bg-[#E8F5E9] cursor-pointer"
                    style={{ fontWeight: 600 }}
                  >
                    Mark all read
                  </button>
                )}
                <button onClick={onClose} className="cursor-pointer p-1">
                  <X size={22} color="#757575" />
                </button>
              </div>
            </div>

            {/* Notification List */}
            <div className="flex-1 overflow-y-auto" style={{ overscrollBehaviorY: 'contain' }}>
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center px-6">
                  <div className="w-16 h-16 rounded-full bg-[#F5F5F5] flex items-center justify-center mb-3">
                    <BellOff size={28} color="#757575" />
                  </div>
                  <p className="text-[#757575] text-[15px]" style={{ fontWeight: 500 }}>No notifications yet</p>
                  <p className="text-[#757575] text-[12px] mt-1">Order updates will appear here</p>
                </div>
              ) : (
                <div className="divide-y divide-[rgba(0,0,0,0.06)]">
                  {notifications.map((notif, i) => (
                    <motion.button
                      key={notif.notificationId}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      onClick={() => !notif.isRead && handleMarkRead(notif.notificationId)}
                      className={`w-full px-4 py-3.5 text-left cursor-pointer transition-colors ${
                        notif.isRead ? 'bg-white' : 'bg-[#E8F5E9]/30'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`mt-0.5 w-2.5 h-2.5 rounded-full shrink-0 ${
                          notif.isRead ? 'bg-transparent' : 'bg-[#00704A]'
                        }`} />
                        <div className="flex-1 min-w-0">
                          <p className={`text-[14px] text-[#362415] ${notif.isRead ? '' : ''}`}
                            style={{ fontWeight: notif.isRead ? 400 : 500 }}>
                            {notif.message}
                          </p>
                          <p className="text-[11px] text-[#757575] mt-1">
                            {formatTimestamp(notif.timestamp)}
                          </p>
                        </div>
                        {notif.isRead && (
                          <Check size={14} color="#757575" className="shrink-0 mt-1" />
                        )}
                      </div>
                    </motion.button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
