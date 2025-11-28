
import React, { useState } from 'react';
import { Camera, Lock, Mail, User, Shield, Check, Save } from 'lucide-react';
import { useUser } from '../contexts/UserContext';

export const Profile: React.FC = () => {
  const { currentUser, updateCurrentUser } = useUser();
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
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
        <p className="text-gray-500">Manage your profile information and security.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Profile Card */}
        <div className="md:col-span-1 space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex flex-col items-center text-center">
                <div className="relative group cursor-pointer mb-4">
                    <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm">
                        {currentUser.avatarUrl ? (
                            <img src={currentUser.avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <User className="text-gray-400" size={40} />
                        )}
                    </div>
                    <label className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white">
                        <Camera size={20} />
                        <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
                    </label>
                </div>
                
                <h2 className="text-lg font-bold text-gray-900">{currentUser.name}</h2>
                <p className="text-sm text-gray-500 mb-3">{currentUser.email}</p>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 capitalize">
                    {currentUser.role}
                </span>
            </div>

             <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Role Permissions</h3>
                <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                        <Check size={16} className="text-green-500" />
                        <span>View Dashboard</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                        <Check size={16} className="text-green-500" />
                        <span>Manage Contacts</span>
                    </div>
                    {currentUser.role === 'admin' && (
                        <>
                             <div className="flex items-center gap-3 text-sm text-gray-600">
                                <Check size={16} className="text-green-500" />
                                <span>Manage Users</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-600">
                                <Check size={16} className="text-green-500" />
                                <span>System Settings</span>
                            </div>
                        </>
                    )}
                </div>
             </div>
        </div>

        {/* Right Column: Forms */}
        <div className="md:col-span-2 space-y-6">
            {/* Personal Details */}
            <form onSubmit={handleUpdateProfile} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <User size={20} className="text-gray-400" />
                    Personal Information
                </h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <input 
                            name="name"
                            defaultValue={currentUser.name}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input 
                                name="email"
                                type="email"
                                defaultValue={currentUser.email}
                                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                        </div>
                    </div>
                </div>
                <div className="mt-6 flex justify-end">
                    <button 
                        type="submit"
                        disabled={isSaving}
                        className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors disabled:opacity-70"
                    >
                        <Save size={18} />
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>

            {/* Security */}
            <form onSubmit={handlePasswordChange} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Shield size={20} className="text-gray-400" />
                    Security
                </h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input 
                                type="password" 
                                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                value={passwordData.current}
                                onChange={e => setPasswordData({...passwordData, current: e.target.value})}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                            <input 
                                type="password" 
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                value={passwordData.new}
                                onChange={e => setPasswordData({...passwordData, new: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                            <input 
                                type="password" 
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                value={passwordData.confirm}
                                onChange={e => setPasswordData({...passwordData, confirm: e.target.value})}
                            />
                        </div>
                    </div>
                </div>
                <div className="mt-6 flex justify-end">
                    <button 
                         type="submit"
                        disabled={isSaving || !passwordData.current}
                        className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                    >
                        Update Password
                    </button>
                </div>
            </form>
        </div>
      </div>
    </div>
  );
};
