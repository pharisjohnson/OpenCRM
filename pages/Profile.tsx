
import React, { useState } from 'react';
import { Camera, Lock, Mail, User, Shield, Check, Save, Bell, Globe, Moon } from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import { useConfig } from '../contexts/ConfigContext';

export const Profile: React.FC = () => {
  const { currentUser, updateCurrentUser } = useUser();
  const { config, toggleDarkMode } = useConfig();
  const [isSaving, setIsSaving] = useState(false);
  const [passwordData, setPasswordData] = useState({ current: '', new: '', confirm: '' });

  const handleUpdateProfile = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    const formData = new FormData(e.currentTarget);
    
    updateCurrentUser({
      name: formData.get('name') as string,
      email: formData.get('email') as string,
    });

    // Simulate API delay
    setTimeout(() => setIsSaving(false), 1000);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateCurrentUser({ avatarUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePasswordChange = (e: React.FormEvent) => {
      e.preventDefault();
      if (passwordData.new !== passwordData.confirm) {
          alert("New passwords do not match");
          return;
      }
      setIsSaving(true);
      setTimeout(() => {
          setIsSaving(false);
          setPasswordData({ current: '', new: '', confirm: '' });
          alert("Password updated successfully");
      }, 1000);
  };

  return (
    <div className="max-w-6xl mx-auto pb-10">
      {/* Profile Header Banner */}
      <div className="relative h-48 rounded-xl bg-gradient-to-r from-primary-600 to-indigo-600 overflow-hidden shadow-md mb-12">
         <div className="absolute inset-0 bg-black/10"></div>
         <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/50 to-transparent">
            <h1 className="text-3xl font-bold text-white tracking-tight">Account Settings</h1>
            <p className="text-primary-100 opacity-90 text-sm">Manage your personal details and workspace preferences.</p>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-2 -mt-20 relative z-10">
        {/* Left Column: Profile Card & Quick Stats */}
        <div className="lg:col-span-1 space-y-6">
            <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border shadow-sm p-6 flex flex-col items-center text-center">
                <div className="relative group cursor-pointer mb-4 -mt-16">
                    <div className="w-32 h-32 rounded-full bg-white dark:bg-dark-surface p-1 shadow-lg">
                        <div className="w-full h-full rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200 dark:border-dark-border relative">
                            {currentUser.avatarUrl ? (
                                <img src={currentUser.avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <User className="text-gray-400" size={48} />
                            )}
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Camera className="text-white" size={24} />
                            </div>
                        </div>
                    </div>
                    <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
                </div>
                
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{currentUser.name}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{currentUser.email}</p>
                
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wide
                    ${currentUser.role === 'admin' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'}
                `}>
                    <Shield size={12} className="mr-1.5" />
                    {currentUser.role} Account
                </span>
            </div>

             <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border shadow-sm p-6">
                <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Permissions</h3>
                <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                        <div className="p-1 rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"><Check size={12} /></div>
                        <span>View Dashboard Analytics</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                        <div className="p-1 rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"><Check size={12} /></div>
                        <span>Manage Contacts & Deals</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                        <div className="p-1 rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"><Check size={12} /></div>
                        <span>Access Document Vault</span>
                    </div>
                    {currentUser.role === 'admin' && (
                        <>
                             <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                                <div className="p-1 rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"><Check size={12} /></div>
                                <span className="font-medium text-purple-700 dark:text-purple-400">Manage Team Users</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                                <div className="p-1 rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"><Check size={12} /></div>
                                <span className="font-medium text-purple-700 dark:text-purple-400">System Configuration</span>
                            </div>
                        </>
                    )}
                </div>
             </div>
        </div>

        {/* Right Column: Forms & Settings */}
        <div className="lg:col-span-2 space-y-6">
            {/* Personal Details */}
            <form onSubmit={handleUpdateProfile} className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 dark:border-dark-border bg-gray-50/50 dark:bg-dark-bg/50 flex justify-between items-center">
                    <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <User size={18} className="text-primary-600 dark:text-primary-400" />
                        Personal Information
                    </h3>
                </div>
                <div className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                            <input 
                                name="name"
                                defaultValue={currentUser.name}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-bg rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white transition-shadow"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <input 
                                    name="email"
                                    type="email"
                                    defaultValue={currentUser.email}
                                    className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-bg rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white transition-shadow"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <button 
                            type="submit"
                            disabled={isSaving}
                            className="bg-primary-600 hover:bg-primary-700 text-white px-5 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all disabled:opacity-70 shadow-sm hover:shadow"
                        >
                            <Save size={16} />
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </div>
            </form>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Security */}
                <form onSubmit={handlePasswordChange} className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border shadow-sm overflow-hidden flex flex-col h-full">
                    <div className="px-6 py-4 border-b border-gray-100 dark:border-dark-border bg-gray-50/50 dark:bg-dark-bg/50">
                        <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            <Shield size={18} className="text-primary-600 dark:text-primary-400" />
                            Security
                        </h3>
                    </div>
                    <div className="p-6 space-y-4 flex-1">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <input 
                                    type="password" 
                                    className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-bg rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
                                    value={passwordData.current}
                                    onChange={e => setPasswordData({...passwordData, current: e.target.value})}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Password</label>
                            <input 
                                type="password" 
                                className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-bg rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
                                value={passwordData.new}
                                onChange={e => setPasswordData({...passwordData, new: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm Password</label>
                            <input 
                                type="password" 
                                className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-bg rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
                                value={passwordData.confirm}
                                onChange={e => setPasswordData({...passwordData, confirm: e.target.value})}
                            />
                        </div>
                        <div className="pt-2 mt-auto">
                            <button 
                                type="submit"
                                disabled={isSaving || !passwordData.current}
                                className="w-full bg-white dark:bg-dark-bg border border-gray-200 dark:border-dark-border text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-border px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                            >
                                Update Password
                            </button>
                        </div>
                    </div>
                </form>

                {/* Preferences */}
                <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border shadow-sm overflow-hidden flex flex-col h-full">
                    <div className="px-6 py-4 border-b border-gray-100 dark:border-dark-border bg-gray-50/50 dark:bg-dark-bg/50">
                        <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            <Globe size={18} className="text-primary-600 dark:text-primary-400" />
                            Preferences
                        </h3>
                    </div>
                    <div className="p-6 space-y-6 flex-1">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-gray-100 dark:bg-dark-bg rounded-lg text-gray-600 dark:text-gray-300">
                                    <Moon size={18} />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">Dark Mode</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Toggle dark theme</p>
                                </div>
                            </div>
                            <button 
                                onClick={toggleDarkMode}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${config.darkMode ? 'bg-primary-600' : 'bg-gray-200'}`}
                            >
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${config.darkMode ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-gray-100 dark:bg-dark-bg rounded-lg text-gray-600 dark:text-gray-300">
                                    <Bell size={18} />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">Email Digests</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Receive daily summaries</p>
                                </div>
                            </div>
                            <input type="checkbox" className="h-5 w-5 text-primary-600 rounded border-gray-300 focus:ring-primary-500" defaultChecked />
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};
