"use client";

import React, { useState } from 'react';
import { Camera, Lock, Mail, User, Shield, Check, Save, Bell, Globe, Moon, Plus, Type, Eye, Zap } from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import { useConfig } from '../contexts/ConfigContext';
import { supabase } from '../lib/supabaseClient';

export const Profile: React.FC = () => {
    const { currentUser, updateCurrentUser } = useUser();
    const { config, toggleDarkMode, updateConfig } = useConfig();
    const [isSaving, setIsSaving] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [passwordData, setPasswordData] = useState({ current: '', new: '', confirm: '' });

    const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSaving(true);
        const formData = new FormData(e.currentTarget);
        const newName = formData.get('name') as string;

        try {
            const { error } = await supabase.auth.updateUser({
                data: { full_name: newName }
            });

            if (error) throw error;

            updateCurrentUser({ name: newName });
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
        } catch (err: any) {
            console.error('Update profile error:', err);
            alert(err.message || 'Failed to update profile');
        } finally {
            setIsSaving(false);
        }
    };

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // In a real app, upload to storage first
            // For now, update metadata with data URL (or just keep as is)
            const reader = new FileReader();
            reader.onloadend = async () => {
                const dataUrl = reader.result as string;
                try {
                    const { error } = await supabase.auth.updateUser({
                        data: { avatar_url: dataUrl }
                    });
                    if (error) throw error;
                    updateCurrentUser({ avatarUrl: dataUrl });
                } catch (err) {
                    console.error('Avatar update error:', err);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCoverImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = async () => {
                const dataUrl = reader.result as string;
                try {
                    const { error } = await supabase.auth.updateUser({
                        data: { cover_url: dataUrl }
                    });
                    if (error) throw error;
                    updateCurrentUser({ coverImageUrl: dataUrl });
                } catch (err) {
                    console.error('Cover update error:', err);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordData.new !== passwordData.confirm) {
            alert("New passwords do not match");
            return;
        }

        setIsSaving(true);
        try {
            const { error } = await supabase.auth.updateUser({
                password: passwordData.new
            });

            if (error) throw error;

            setPasswordData({ current: '', new: '', confirm: '' });
            alert("Password updated successfully");
        } catch (err: any) {
            console.error('Password change error:', err);
            alert(err.message || 'Failed to update password');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto pb-10">
            {/* Profile Header Banner */}
            <div className="relative h-48 rounded-xl bg-gradient-to-r from-primary-600 to-indigo-600 overflow-hidden shadow-md mb-12">
                {currentUser.coverImageUrl ? (
                    <img
                        src={currentUser.coverImageUrl}
                        alt="Cover"
                        className="w-full h-full object-cover transition-opacity duration-500"
                    />
                ) : (
                    <div className="absolute inset-0 bg-black/10"></div>
                )}

                {/* Cover Image Upload Trigger */}
                <div className="absolute bottom-6 right-6 z-20">
                    <label className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all border border-white/30 border-dashed hover:border-solid">
                        <Camera size={14} />
                        Update Cover
                        <input type="file" className="hidden" accept="image/*" onChange={handleCoverImageChange} />
                    </label>
                </div>

                <div className="absolute top-0 left-0 right-0 p-8 pt-10 bg-gradient-to-b from-black/70 via-black/30 to-transparent">
                    <h1 className="text-3xl font-bold text-white tracking-tight drop-shadow-lg">Account Settings</h1>
                    <p className="text-white text-sm font-medium drop-shadow-md mt-1 opacity-90">Manage your personal details and workspace preferences.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-2 -mt-20 relative z-10">
                {/* Left Column: Profile Card & Quick Stats */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border shadow-sm p-6 flex flex-col items-center text-center">
                        <label className="relative group cursor-pointer mb-4 -mt-16 block group">
                            <div className="w-32 h-32 rounded-full bg-white dark:bg-dark-surface p-1 shadow-lg ring-4 ring-black/5 dark:ring-white/5 group-hover:ring-primary-500/30 transition-all">
                                <div className="w-full h-full rounded-full bg-gray-100 dark:bg-dark-bg flex items-center justify-center overflow-hidden border border-gray-200 dark:border-dark-border relative">
                                    {currentUser.avatarUrl ? (
                                        <img src={currentUser.avatarUrl} alt="Profile" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                    ) : (
                                        <User className="text-gray-400 dark:text-gray-600" size={48} />
                                    )}
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Camera className="text-white animate-bounce-subtle" size={24} />
                                    </div>
                                </div>
                            </div>
                            <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />

                            <div className="absolute bottom-1 right-1 bg-primary-600 text-white p-1.5 rounded-full shadow-lg border-2 border-white dark:border-dark-surface group-hover:scale-110 transition-transform flex items-center justify-center">
                                <Plus size={12} className="stroke-[3px]" />
                            </div>
                        </label>

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
                                    className={`
                                        px-5 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all disabled:opacity-70 shadow-sm hover:shadow
                                        ${showSuccess ? 'bg-green-600 text-white' : 'bg-primary-600 hover:bg-primary-700 text-white'}
                                    `}
                                >
                                    {isSaving ? (
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    ) : showSuccess ? (
                                        <Check size={16} />
                                    ) : (
                                        <Save size={16} />
                                    )}
                                    {isSaving ? 'Saving...' : showSuccess ? 'Profiles Updated!' : 'Save Changes'}
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
                                            onChange={e => setPasswordData({ ...passwordData, current: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Password</label>
                                    <input
                                        type="password"
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-bg rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
                                        value={passwordData.new}
                                        onChange={e => setPasswordData({ ...passwordData, new: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm Password</label>
                                    <input
                                        type="password"
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-bg rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
                                        value={passwordData.confirm}
                                        onChange={e => setPasswordData({ ...passwordData, confirm: e.target.value })}
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

                            {/* Accessibility Section */}
                            <div className="p-6 border-t border-gray-100 dark:border-dark-border">
                                <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Accessibility</h4>
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-gray-100 dark:bg-dark-bg rounded-lg text-gray-600 dark:text-gray-300">
                                                <Eye size={18} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900 dark:text-white">High Contrast</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">Increase color contrast</p>
                                            </div>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="sr-only peer"
                                                checked={config.accessibility?.highContrast || false}
                                                onChange={(e) => updateConfig({ accessibility: { ...config.accessibility!, highContrast: e.target.checked } })}
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                                        </label>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-gray-100 dark:bg-dark-bg rounded-lg text-gray-600 dark:text-gray-300">
                                                <Zap size={18} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900 dark:text-white">Reduce Motion</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">Minimize animations</p>
                                            </div>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="sr-only peer"
                                                checked={config.accessibility?.reduceMotion || false}
                                                onChange={(e) => updateConfig({ accessibility: { ...config.accessibility!, reduceMotion: e.target.checked } })}
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                                        </label>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-gray-100 dark:bg-dark-bg rounded-lg text-gray-600 dark:text-gray-300">
                                                <Type size={18} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900 dark:text-white">Font Size</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">Adjust text size</p>
                                            </div>
                                        </div>
                                        <select
                                            className="bg-gray-50/50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border text-gray-900 dark:text-white text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block p-2.5 transition-colors"
                                            value={config.accessibility?.fontSize || 'normal'}
                                            onChange={(e) => updateConfig({ accessibility: { ...config.accessibility!, fontSize: e.target.value as any } })}
                                        >
                                            <option value="normal">Normal</option>
                                            <option value="medium">Medium</option>
                                            <option value="large">Large</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
