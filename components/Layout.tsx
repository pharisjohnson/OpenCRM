
import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  KanbanSquare, 
  Mail, 
  FileText, 
  Settings, 
  LogOut,
  Menu,
  X,
  Building2,
  FolderKanban,
  MessageCircle,
  Calendar,
  Bell,
  UserCircle,
  ChevronLeft,
  ChevronRight,
  LifeBuoy,
  Receipt,
  Moon,
  Sun
} from 'lucide-react';
import { useNotifications } from '../contexts/NotificationContext';
import { useUser } from '../contexts/UserContext';
import { useConfig } from '../contexts/ConfigContext';
import { AIAssistant } from './AIAssistant';
import { Notification } from '../types';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = React.useState(true);
  const [isNotificationsOpen, setIsNotificationsOpen] = React.useState(false);
  const { notifications, unreadCount, markAllAsRead, markAsRead } = useNotifications();
  const { currentUser, logout } = useUser();
  const { config, toggleDarkMode } = useConfig();
  const location = useLocation();
  const navigate = useNavigate();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Helpdesk', href: '/helpdesk', icon: LifeBuoy },
    { name: 'Notifications', href: '/notifications', icon: Bell },
    { name: 'Team Chat', href: '/chat', icon: MessageCircle },
    { name: 'Calendar', href: '/calendar', icon: Calendar },
    { name: 'Companies', href: '/companies', icon: Building2 },
    { name: 'Contacts', href: '/contacts', icon: Users },
    { name: 'Deals', href: '/deals', icon: KanbanSquare },
    { name: 'Projects', href: '/projects', icon: FolderKanban },
    { name: 'Finance', href: '/finance', icon: Receipt },
    { name: 'Email', href: '/email', icon: Mail },
    { name: 'Documents', href: '/documents', icon: FileText },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const handleSignOut = () => {
    if (confirm('Are you sure you want to sign out?')) {
      logout();
      navigate('/accept-invite');
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    setIsNotificationsOpen(false);
    if (notification.link) {
      navigate(notification.link);
    }
  };

  const NotificationDropdown = () => (
    <>
      <div className="fixed inset-0 z-10" onClick={() => setIsNotificationsOpen(false)}></div>
      <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-dark-surface rounded-xl shadow-xl border border-gray-100 dark:border-dark-border py-2 z-20 animate-in fade-in zoom-in-95 origin-top-right">
        <div className="px-4 py-2 border-b border-gray-100 dark:border-dark-border flex justify-between items-center">
            <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
            {unreadCount > 0 && (
                <button onClick={markAllAsRead} className="text-xs text-primary-600 dark:text-primary-400 hover:underline">Mark all read</button>
            )}
        </div>
        <div className="max-h-80 overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map(n => (
                <div 
                  key={n.id} 
                  onClick={() => handleNotificationClick(n)}
                  className={`px-4 py-3 hover:bg-gray-50 dark:hover:bg-dark-border/50 border-b border-gray-50 dark:border-dark-border last:border-0 cursor-pointer ${!n.read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
                >
                  <div className="flex justify-between items-start mb-1">
                      <span className={`text-xs font-bold uppercase tracking-wider px-1.5 py-0.5 rounded
                        ${n.type === 'alert' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' : n.type === 'success' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-gray-100 dark:bg-dark-border text-gray-600 dark:text-gray-400'}
                      `}>{n.type}</span>
                      <span className="text-xs text-gray-400">{n.time}</span>
                  </div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">{n.title}</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{n.message}</p>
                </div>
              ))
            ) : (
              <div className="px-4 py-6 text-center text-gray-500 dark:text-gray-400 text-sm">No notifications</div>
            )}
        </div>
        <div className="border-t border-gray-100 dark:border-dark-border px-4 py-2 text-center">
            <NavLink to="/notifications" onClick={() => setIsNotificationsOpen(false)} className="text-xs font-medium text-primary-600 dark:text-primary-400 hover:underline">
                View all notifications
            </NavLink>
        </div>
      </div>
    </>
  );

  return (
    <div className="h-screen bg-gray-50 dark:bg-dark-bg flex overflow-hidden transition-colors duration-200">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:relative inset-y-0 left-0 z-50 bg-white dark:bg-dark-surface border-r border-gray-200 dark:border-dark-border transition-all duration-300 ease-in-out flex flex-col h-full
        w-64
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        ${isDesktopSidebarOpen ? 'lg:w-64 lg:translate-x-0' : 'lg:w-0 lg:translate-x-0 lg:border-r-0 lg:overflow-hidden'}
      `}>
          <div className="h-16 flex items-center px-6 border-b border-gray-200 dark:border-dark-border flex-shrink-0 whitespace-nowrap overflow-hidden">
            <div className="flex items-center gap-2 font-bold text-xl text-primary-600 dark:text-primary-400">
              {config.logoUrl ? (
                <img src={config.logoUrl} alt="Logo" className="w-8 h-8 rounded-lg object-contain" />
              ) : (
                <div className="w-8 h-8 bg-primary-600 text-white rounded-lg flex items-center justify-center flex-shrink-0">
                  {config.appName.charAt(0)}
                </div>
              )}
              <span className={!isDesktopSidebarOpen ? 'lg:opacity-0' : 'lg:opacity-100 transition-opacity text-gray-900 dark:text-white'}>
                {config.appName}
              </span>
            </div>
            <button 
              className="ml-auto lg:hidden text-gray-500 dark:text-gray-400"
              onClick={() => setIsSidebarOpen(false)}
            >
              <X size={20} />
            </button>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto overflow-x-hidden">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href || (item.href !== '/' && location.pathname.startsWith(item.href));
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap
                    ${isActive 
                      ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400' 
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-border hover:text-gray-900 dark:hover:text-white'}
                  `}
                >
                  <div className="relative flex-shrink-0">
                    <item.icon size={18} className={isActive ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400 dark:text-gray-500'} />
                    {item.name === 'Notifications' && unreadCount > 0 && (
                       <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full lg:hidden"></span>
                    )}
                  </div>
                  <span className="flex-1">{item.name}</span>
                  {item.name === 'Notifications' && unreadCount > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                      {unreadCount}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>

          <div className="p-4 border-t border-gray-200 dark:border-dark-border flex-shrink-0 whitespace-nowrap overflow-hidden">
            <NavLink 
              to="/profile"
              onClick={() => setIsSidebarOpen(false)}
              className="flex items-center gap-3 mb-4 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-border transition-colors group cursor-pointer"
            >
              <img 
                src={currentUser.avatarUrl} 
                alt="User" 
                className="w-10 h-10 rounded-full bg-gray-200 dark:bg-dark-border object-cover flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{currentUser.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{currentUser.email}</p>
              </div>
              <UserCircle size={18} className="text-gray-400 dark:text-gray-500 group-hover:text-primary-600 dark:group-hover:text-primary-400" />
            </NavLink>
            <button 
              onClick={handleSignOut}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors"
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative h-full">
        
        {/* Desktop Sidebar Toggle Button */}
        <button
          onClick={() => setIsDesktopSidebarOpen(!isDesktopSidebarOpen)}
          className="hidden lg:flex absolute left-0 top-1/2 -translate-y-1/2 z-30 bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border border-l-0 rounded-r-lg p-1.5 shadow-sm hover:bg-gray-50 dark:hover:bg-dark-border text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors items-center justify-center group"
          title={isDesktopSidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
        >
          {isDesktopSidebarOpen ? (
             <ChevronLeft size={16} className="text-gray-400 dark:text-gray-500 group-hover:text-primary-600 dark:group-hover:text-primary-400" />
          ) : (
             <ChevronRight size={16} className="text-gray-400 dark:text-gray-500 group-hover:text-primary-600 dark:group-hover:text-primary-400" />
          )}
        </button>

        {/* Mobile Header */}
        <header className="h-16 bg-white dark:bg-dark-surface border-b border-gray-200 dark:border-dark-border flex items-center justify-between px-4 lg:hidden z-20 flex-shrink-0">
          <div className="flex items-center">
            <button 
              onClick={toggleSidebar}
              className="p-2 -ml-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-border rounded-lg"
            >
              <Menu size={20} />
            </button>
            <span className="ml-3 font-semibold text-gray-900 dark:text-white">{config.appName}</span>
          </div>
          <div className="flex items-center gap-2">
             <button
                onClick={toggleDarkMode}
                className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-border rounded-lg"
             >
                {config.darkMode ? <Sun size={20} /> : <Moon size={20} />}
             </button>
             <div className="relative">
                <button 
                    onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                    className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-border rounded-lg relative"
                >
                    <Bell size={20} />
                    {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
                    )}
                </button>
                {isNotificationsOpen && <NotificationDropdown />}
             </div>
          </div>
        </header>

        {/* Desktop Header */}
        <header className="hidden lg:flex h-16 bg-white dark:bg-dark-surface border-b border-gray-200 dark:border-dark-border items-center justify-end px-8 z-20 flex-shrink-0">
           <div className="flex items-center gap-4">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
              
              {/* Dark Mode Toggle */}
              <button
                onClick={toggleDarkMode}
                className="p-2 bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-full hover:bg-gray-50 dark:hover:bg-dark-border shadow-sm text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                title={config.darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
              >
                 {config.darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>

              <div className="h-4 w-px bg-gray-300 dark:bg-dark-border mx-2"></div>
              
              {/* Notification Bell */}
              <div className="relative">
                  <button 
                     onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                     className="p-2 bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-full hover:bg-gray-50 dark:hover:bg-dark-border shadow-sm relative text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                     title="Notifications"
                  >
                     <Bell size={20} />
                     {unreadCount > 0 && (
                        <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white dark:border-dark-surface"></span>
                     )}
                  </button>

                  {isNotificationsOpen && <NotificationDropdown />}
               </div>
           </div>
        </header>

        {/* Scrollable Page Content */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
        
        {/* Global AI Assistant Widget */}
        <AIAssistant />
        
      </main>
    </div>
  );
};
