import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, BellOff, Check, Megaphone, AlertTriangle } from 'lucide-react';
import { useAppContext } from './AppContext';
import { markNotificationAsRead } from '../services/firestore';

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
  const { notifications, announcements, unreadAnnouncementsCount } = useAppContext();
  const unreadOrderNotificationsCount = notifications.filter(n => !n.isRead).length;
  const totalUnreadCount = unreadOrderNotificationsCount + unreadAnnouncementsCount;

  const handleMarkRead = async (notificationId: string) => {
    await markNotificationAsRead(notificationId);
  };

  const handleMarkAllRead = async () => {
    const unread = notifications.filter(n => !n.isRead);
    await Promise.all(unread.map(n => markNotificationAsRead(n.notificationId)));
  };

  const isEmpty = notifications.length === 0 && announcements.length === 0;

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
                  {totalUnreadCount} unread
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
              {isEmpty ? (
                <div className="flex flex-col items-center justify-center h-full text-center px-6">
                  <div className="w-16 h-16 rounded-full bg-[#F5F5F5] flex items-center justify-center mb-3">
                    <BellOff size={28} color="#757575" />
                  </div>
                  <p className="text-[#757575] text-[15px]" style={{ fontWeight: 500 }}>No notifications yet</p>
                  <p className="text-[#757575] text-[12px] mt-1">Order updates and new items will appear here</p>
                </div>
              ) : (
                <>
                  {/* What's New — Announcements */}
                  {announcements.length > 0 && (
                    <div>
                      <div className="px-4 pt-4 pb-2 flex items-center gap-2">
                        <Megaphone size={14} color="#F59E0B" />
                        <p className="text-[12px] text-[#757575] uppercase tracking-wide" style={{ fontWeight: 600 }}>
                          What's New
                        </p>
                        {unreadAnnouncementsCount > 0 && (
                          <span className="text-[11px] text-[#F59E0B]" style={{ fontWeight: 600 }}>
                            {unreadAnnouncementsCount} new
                          </span>
                        )}
                      </div>
                      <div className="divide-y divide-[rgba(0,0,0,0.06)]">
                        {announcements.map((ann, i) => (
                          <motion.div
                            key={ann.announcementId}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.03 }}
                            className="w-full px-4 py-3.5 text-left bg-[#FFF8E1]/60"
                          >
                            <div className="flex items-start gap-3">
                              <div className="mt-0.5 w-2.5 h-2.5 rounded-full shrink-0 bg-[#F59E0B]" />
                              {ann.imageUrl ? (
                                <div className="w-10 h-10 rounded-[8px] overflow-hidden shrink-0 border border-[rgba(0,0,0,0.06)]">
                                  <img src={ann.imageUrl} alt={ann.title} className="w-full h-full object-cover" />
                                </div>
                              ) : (
                                <div className="w-10 h-10 rounded-[8px] bg-[#FFE082] flex items-center justify-center shrink-0">
                                  <Megaphone size={18} color="#F59E0B" />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-[13px] text-[#362415]" style={{ fontWeight: 600 }}>
                                  {ann.title}
                                </p>
                                <p className="text-[13px] text-[#757575] mt-0.5">
                                  {ann.message}
                                </p>
                                <p className="text-[11px] text-[#BDBDBD] mt-1">
                                  {formatTimestamp(ann.timestamp)}
                                </p>
                              </div>
                              <AlertTriangle size={14} color="#F59E0B" className="shrink-0 mt-1" />
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Order Notifications */}
                  {notifications.length > 0 && (
                    <div>
                      <div className="px-4 pt-4 pb-2">
                        <p className="text-[12px] text-[#757575] uppercase tracking-wide" style={{ fontWeight: 600 }}>
                          Order Updates
                        </p>
                      </div>
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
                                <p className="text-[14px] text-[#362415]"
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
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

