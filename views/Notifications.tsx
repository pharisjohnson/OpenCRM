"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { Bell, Check, CheckCircle2, AlertCircle, Info, Mail, Phone, Users, FileText, Activity } from 'lucide-react';
import { useNotifications } from '../contexts/NotificationContext';
import { Notification } from '../types';
import { MOCK_ACTIVITIES } from '../constants';

export const Notifications: React.FC = () => {
  const { notifications, markAsRead, markAllAsRead } = useNotifications();
  const router = useRouter();

  const getIcon = (type: string) => {
    switch (type) {
      case 'alert': return <AlertCircle size={18} />;
      case 'success': return <CheckCircle2 size={18} />;
      default: return <Info size={18} />;
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'email': return <Mail size={16} />;
      case 'call': return <Phone size={16} />;
      case 'meeting': return <Users size={16} />;
      case 'note': return <FileText size={16} />;
      default: return <Activity size={16} />;
    }
  };


  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    if (notification.link) {
      router.push(notification.link);
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

      <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-dark-border bg-gray-50/50 dark:bg-dark-bg/50">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Notifications</h2>
        </div>
        <div className="divide-y divide-gray-100 dark:divide-dark-border">
          {notifications.length > 0 ? (
            notifications.map(notification => (
              <div
                key={notification.id}
                className={`p-4 hover:bg-gray-50 dark:hover:bg-dark-border/50 transition-colors flex gap-4 cursor-pointer ${!notification.read ? 'bg-blue-50/40 dark:bg-blue-900/10' : ''}`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className={`mt-1 p-2 rounded-full flex-shrink-0 ${notification.type === 'alert' ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' :
                  notification.type === 'success' ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' :
                    'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                  }`}>
                  {getIcon(notification.type)}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h3 className={`text-sm font-medium ${!notification.read ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>
                      {notification.title}
                    </h3>
                    <span className="text-xs text-gray-400 whitespace-nowrap ml-2">{notification.time}</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{notification.message}</p>
                </div>
                {!notification.read && (
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full" title="Unread"></div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="p-12 text-center text-gray-500 dark:text-gray-400 flex flex-col items-center justify-center gap-3">
              <Bell className="text-gray-300 dark:text-gray-600" size={48} />
              <p>No notifications to display</p>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Recent Activity</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">History of actions across the workspace.</p>
        </div>

        <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border shadow-sm overflow-hidden">
          <div className="divide-y divide-gray-100 dark:divide-dark-border">
            {MOCK_ACTIVITIES.length > 0 ? (
              MOCK_ACTIVITIES.map(activity => (
                <div key={activity.id} className="p-4 flex gap-4 hover:bg-gray-50 dark:hover:bg-dark-border/50 transition-colors">
                  <div className="mt-1 p-2 bg-gray-100 dark:bg-dark-bg rounded-full flex-shrink-0 text-gray-600 dark:text-gray-400">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                        {activity.title}
                      </h3>
                      <span className="text-xs text-gray-400 whitespace-nowrap ml-2">{activity.date}</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{activity.content}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-dark-bg text-gray-600 dark:text-gray-300 capitalize">
                        {activity.type}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center text-gray-500 dark:text-gray-400">
                No recent activity found.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};