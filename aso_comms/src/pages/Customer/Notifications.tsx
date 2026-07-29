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
      color: 'bg-[#2563eb]/10 text-[#004ac6]'
    },
    {
      id: '2',
      title: 'Repair Completed',
      message: 'Your device repair #REC-2030 is now complete and ready for pickup',
      time: '5 hours ago',
      read: false,
      type: 'repair',
      icon: 'build',
      color: 'bg-green-100 text-green-600'
    },
    {
      id: '3',
      title: 'Payment Received',
      message: 'Payment of ₦45,000 received for repair #REC-2045',
      time: '1 day ago',
      read: true,
      type: 'payment',
      icon: 'payments',
      color: 'bg-[#d5e4f8]/30 text-[#576676]'
    },
    {
      id: '4',
      title: 'System Update',
      message: 'New SLA policies have been updated. Review changes.',
      time: '2 days ago',
      read: true,
      type: 'system',
      icon: 'settings',
      color: 'bg-[#e1e2ed] text-[#434655]'
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
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#191b23]">Notifications</h1>
          <p className="text-sm text-[#434655]">
            {unreadCount > 0 ? `You have ${unreadCount} unread notifications` : 'All caught up!'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="text-sm font-semibold text-[#004ac6] hover:underline"
          >
            Mark all as read
          </button>
        )}
      </div>

      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center border border-[#e1e2ed]/50">
            <div className="w-16 h-16 rounded-full bg-[#f3f3fe] flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-[#737686] text-3xl">notifications_off</span>
            </div>
            <h3 className="text-lg font-bold text-[#191b23] mb-2">No Notifications</h3>
            <p className="text-sm text-[#434655]">You're all caught up!</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`bg-white rounded-xl p-4 shadow-sm border transition-all ${notification.read
                  ? 'border-[#e1e2ed]/50 opacity-70'
                  : 'border-[#004ac6]/20 bg-[#faf8ff]'
                }`}
            >
              <div className="flex gap-3">
                <div className={`w-10 h-10 rounded-lg ${notification.color} flex items-center justify-center flex-shrink-0`}>
                  <span className="material-symbols-outlined text-base">{notification.icon}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-semibold text-[#191b23]">{notification.title}</h4>
                        {!notification.read && (
                          <span className="w-2 h-2 rounded-full bg-[#004ac6] flex-shrink-0"></span>
                        )}
                      </div>
                      <p className="text-sm text-[#434655] mt-0.5">{notification.message}</p>
                    </div>
                    <span className="text-[10px] text-[#434655] whitespace-nowrap flex-shrink-0">
                      {notification.time}
                    </span>
                  </div>
                  {!notification.read && (
                    <button
                      onClick={() => markAsRead(notification.id)}
                      className="text-xs font-semibold text-[#004ac6] hover:underline mt-1"
                    >
                      Mark as read
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <style>{`
        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
          display: inline-block;
          line-height: 1;
        }
      `}</style>
    </div>
  );
};

export default Notifications;