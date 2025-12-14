
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Check, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { useNotifications } from '../contexts/NotificationContext';
import { Notification } from '../types';

export const Notifications: React.FC = () => {
  const { notifications, markAsRead, markAllAsRead } = useNotifications();
  const navigate = useNavigate();

  const getIcon = (type: string) => {
    switch (type) {
      case 'alert': return <AlertCircle size={18} />;
      case 'success': return <CheckCircle2 size={18} />;
      default: return <Info size={18} />;
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    if (notification.link) {
      navigate(notification.link);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
            <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
            <p className="text-gray-500">Stay updated with latest activities and alerts.</p>
        </div>
        <button 
          onClick={markAllAsRead}
          className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 font-medium flex items-center gap-2 px-4 py-2 rounded-lg transition-colors shadow-sm text-sm"
        >
          <Check size={16} /> Mark all as read
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="divide-y divide-gray-100">
            {notifications.length > 0 ? (
                notifications.map(notification => (
                    <div 
                        key={notification.id} 
                        className={`p-4 hover:bg-gray-50 transition-colors flex gap-4 cursor-pointer ${!notification.read ? 'bg-blue-50/40' : ''}`}
                        onClick={() => handleNotificationClick(notification)}
                    >
                        <div className={`mt-1 p-2 rounded-full flex-shrink-0 ${
                            notification.type === 'alert' ? 'bg-red-100 text-red-600' : 
                            notification.type === 'success' ? 'bg-green-100 text-green-600' : 
                            'bg-blue-100 text-blue-600'
                        }`}>
                            {getIcon(notification.type)}
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between items-start">
                                <h3 className={`text-sm font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-600'}`}>
                                    {notification.title}
                                </h3>
                                <span className="text-xs text-gray-400 whitespace-nowrap ml-2">{notification.time}</span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                        </div>
                        {!notification.read && (
                            <div className="flex items-center">
                                <div className="w-2 h-2 bg-blue-500 rounded-full" title="Unread"></div>
                            </div>
                        )}
                    </div>
                ))
            ) : (
                <div className="p-12 text-center text-gray-500 flex flex-col items-center justify-center gap-3">
                    <Bell className="text-gray-300" size={48} />
                    <p>No notifications to display</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};