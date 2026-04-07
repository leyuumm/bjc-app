import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, X, Check, Clock } from 'lucide-react';
import { useAppContext } from './AppContext';

export function NotificationBell() {
  const { unreadNotificationCount } = useAppContext();
  const [showPanel, setShowPanel] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowPanel(true)}
        className="relative p-2 cursor-pointer"
        aria-label="Notifications"
      >
        <Bell size={22} color="#362415" />
        {unreadNotificationCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-[#D32F2F] text-white text-[11px] flex items-center justify-center"
            style={{ fontWeight: 600 }}>
            {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {showPanel && (
          <NotificationPanel onClose={() => setShowPanel(false)} />
        )}
      </AnimatePresence>
    </>
  );
}

function NotificationPanel({ onClose }: { onClose: () => void }) {
  const { notifications, markNotificationAsRead } = useAppContext();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25 }}
        className="w-full max-w-[412px] bg-white rounded-t-[20px] max-h-[75vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-[rgba(0,0,0,0.06)]">
          <div className="flex items-center gap-2">
            <Bell size={20} color="#362415" />
            <h2 className="text-[18px] text-[#362415]" style={{ fontWeight: 700 }}>
              Notifications
            </h2>
            {notifications.filter(n => !n.isRead).length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-[#D32F2F] text-white text-[11px]" style={{ fontWeight: 600 }}>
                {notifications.filter(n => !n.isRead).length} new
              </span>
            )}
          </div>
          <button onClick={onClose} className="p-1 cursor-pointer">
            <X size={20} color="#757575" />
          </button>
        </div>

        {/* Notification List */}
        <div className="flex-1 overflow-y-auto px-5 py-3">
          {notifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell size={36} className="mx-auto text-[#E0E0E0] mb-3" />
              <p className="text-[#757575] text-[14px]">No notifications yet</p>
              <p className="text-[#BDBDBD] text-[12px] mt-1">
                You&apos;ll be notified about your order status here
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {notifications.map((notif, i) => (
                <motion.div
                  key={notif.notificationId}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className={`p-3 rounded-[12px] border transition-colors ${
                    notif.isRead
                      ? 'bg-white border-[rgba(0,0,0,0.06)]'
                      : 'bg-[#E8F5E9] border-[#81C784]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2.5 flex-1 min-w-0">
                      <div className={`mt-0.5 p-1.5 rounded-full ${notif.isRead ? 'bg-[#F5F5F5]' : 'bg-[#00704A]/10'}`}>
                        {notif.isRead ? (
                          <Check size={12} color="#757575" />
                        ) : (
                          <Clock size={12} color="#00704A" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-[13px] ${notif.isRead ? 'text-[#757575]' : 'text-[#362415]'}`}
                          style={{ fontWeight: notif.isRead ? 400 : 500 }}>
                          {notif.message}
                        </p>
                        <p className="text-[11px] text-[#BDBDBD] mt-1">
                          {notif.timestamp && typeof (notif.timestamp as unknown as { toDate?: () => Date }).toDate === 'function'
                            ? (notif.timestamp as unknown as { toDate: () => Date }).toDate().toLocaleString()
                            : notif.timestamp instanceof Date
                              ? notif.timestamp.toLocaleString()
                              : 'Just now'}
                        </p>
                      </div>
                    </div>
                    {!notif.isRead && (
                      <button
                        onClick={() => markNotificationAsRead(notif.notificationId)}
                        className="text-[11px] text-[#00704A] px-2 py-1 rounded-[8px] bg-white cursor-pointer whitespace-nowrap"
                        style={{ fontWeight: 600 }}
                      >
                        Mark read
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
