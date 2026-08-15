// src/pages/Customer/Notifications.tsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'complaint' | 'repair' | 'payment' | 'system';
  icon: string;
  color: string;
}

const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'Complaint Update',
      message: 'Your complaint #REC-2045 has been updated to In Progress',
      time: '2 hours ago',
      read: false,
      type: 'complaint',
      icon: 'chat',
      color: 'bg-blue-50 text-blue-600'
    },
    {
      id: '2',
      title: 'Repair Completed',
      message: 'Your device repair #REC-2030 is now complete and ready for pickup',
      time: '5 hours ago',
      read: false,
      type: 'repair',
      icon: 'build',
      color: 'bg-emerald-50 text-emerald-600'
    },
    {
      id: '3',
      title: 'Payment Received',
      message: 'Payment of ₦45,000 received for repair #REC-2045',
      time: '1 day ago',
      read: true,
      type: 'payment',
      icon: 'payments',
      color: 'bg-green-50 text-green-600'
    },
    {
      id: '4',
      title: 'System Update',
      message: 'New SLA policies have been updated. Review changes.',
      time: '2 days ago',
      read: true,
      type: 'system',
      icon: 'settings',
      color: 'bg-slate-100 text-slate-600'
    }
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n =>
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  return (
    <div className="min-h-screen bg-[#F8F6F1] px-4 py-6 md:px-6 md:py-8">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold text-[#1A365D] tracking-tight">Notifications</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              {unreadCount > 0 ? `You have ${unreadCount} unread notifications` : 'All caught up! ✨'}
            </p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-[#D97706] hover:text-[#b85f00] transition-colors hover:underline"
            >
              <span className="material-symbols-outlined text-base">done_all</span>
              Mark all as read
            </button>
          )}
        </div>

        {/* Notifications List */}
        {notifications.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/80 shadow-sm">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-3xl text-slate-400">notifications_off</span>
            </div>
            <h3 className="text-lg font-display font-bold text-[#1A365D] mb-2">No Notifications</h3>
            <p className="text-sm text-slate-500">You're all caught up! 🎉</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`bg-white rounded-2xl p-5 border transition-all ${
                  notification.read
                    ? 'border-slate-200/80 opacity-70 hover:opacity-100'
                    : 'border-[#1A365D]/20 shadow-sm hover:shadow-md'
                } hover:border-[#1A365D]/30`}
              >
                <div className="flex gap-4">
                  <div className={`w-11 h-11 rounded-xl ${notification.color} flex items-center justify-center flex-shrink-0`}>
                    <span className="material-symbols-outlined text-base">{notification.icon}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-[#1A365D]">{notification.title}</h4>
                          {!notification.read && (
                            <span className="w-2 h-2 rounded-full bg-[#1A365D] flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-sm text-slate-600 mt-0.5">{notification.message}</p>
                      </div>
                      <span className="text-[10px] text-slate-400 whitespace-nowrap flex-shrink-0">
                        {notification.time}
                      </span>
                    </div>
                    {!notification.read && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="text-xs font-medium text-[#D97706] hover:text-[#b85f00] hover:underline transition-colors mt-1.5 inline-flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-sm">check_circle</span>
                        Mark as read
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer note */}
        <div className="text-center text-xs text-slate-400 pt-4">
          <p>Notifications are updated in real-time. Stay tuned for important updates.</p>
        </div>

        <style>{`
          .font-display {
            font-family: 'Space Grotesk', system-ui, sans-serif;
          }
          .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
            vertical-align: middle;
            display: inline-block;
            line-height: 1;
          }
        `}</style>
      </div>
    </div>
  );
};

export default Notifications;