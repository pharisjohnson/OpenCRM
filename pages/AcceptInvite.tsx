"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Camera, Lock, CheckCircle2, ArrowRight, AlertCircle, Shield } from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import { supabase } from '../lib/supabaseClient';

export const AcceptInvite: React.FC = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { login, updateCurrentUser } = useUser();

    // Get email from URL if present
    const invitedEmail = searchParams?.get('email') || '';

    const [step, setStep] = useState(1);
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [avatar, setAvatar] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatar(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleComplete = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError("Passwords do not match!");
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters long.");
            return;
        }

        setIsLoading(true);

        try {
            // For an invitation flow using a public signUp:
            const { data, error: signupError } = await supabase.auth.signUp({
                email: invitedEmail,
                password: password,
                options: {
                    data: {
                        full_name: name,
                        role: 'user', // Invited users are 'user' by default
                        avatar_url: avatar
                    }
                }
            });

            if (signupError) throw signupError;

            if (data.user) {
                if (data.session) {
                    setStep(3);
                    setTimeout(() => {
                        router.push('/');
                    }, 2000);
                } else {
                    setError('Account created! Please check your email to confirm and log in.');
                }
            }
        } catch (err: any) {
            console.error('Accept invite error:', err);
            setError(err.message || 'Failed to complete setup. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-dark-bg flex flex-col items-center justify-center p-4">
            <div className="mb-8 flex items-center gap-2">
                <div className="w-10 h-10 bg-primary-600 text-white rounded-lg flex items-center justify-center font-bold text-xl shadow-lg">
                    O
                </div>
                <span className="text-2xl font-bold text-gray-900 dark:text-white">OpenCRM</span>
            </div>

            <div className="bg-white dark:bg-dark-surface rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-gray-100 dark:border-dark-border">
                <div className="p-8">
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-xl flex items-center gap-3 text-red-700 dark:text-red-400 text-sm animate-in fade-in slide-in-from-top-2">
                            <AlertCircle size={18} className="shrink-0" />
                            <p>{error}</p>
                        </div>
                    )}

                    {step === 1 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="text-center">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome to the Team!</h2>
                                <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">You&apos;ve been invited to join the workspace. Let&apos;s set up your profile.</p>
                            </div>

                            <div className="flex flex-col items-center gap-4">
                                <div className="relative group cursor-pointer">
                                    <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-dark-bg flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-dark-border overflow-hidden transition-colors group-hover:border-primary-500">
                                        {avatar ? (
                                            <img src={avatar} alt="Profile" className="w-full h-full object-cover" />
                                        ) : (
                                            <Camera className="text-gray-400" size={32} />
                                        )}
                                    </div>
                                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileUpload} accept="image/*" />
                                    <div className="absolute bottom-0 right-0 bg-primary-600 text-white p-2 rounded-full shadow-lg border-2 border-white dark:border-dark-surface">
                                        <Camera size={14} />
                                    </div>
                                </div>
                                <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wider">Upload a profile photo</p>
                            </div>

                            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setStep(2); }}>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider ml-1">Full Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full px-4 py-2.5 border border-gray-200 dark:border-dark-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 bg-gray-50 dark:bg-dark-bg text-gray-900 dark:text-white transition-all"
                                        placeholder="John Doe"
                                    />
                                </div>
                                <button type="submit" className="w-full bg-primary-600 hover:bg-primary-700 text-white py-3 rounded-xl font-bold text-sm shadow-md shadow-primary-500/20 transition-all flex items-center justify-center gap-2 group">
                                    Next Step <ArrowRight size={18} className="transition-transform group-hover:translate-x-0.5" />
                                </button>
                            </form>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="text-center">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Secure Your Account</h2>
                                <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">Create a strong password to access your dashboard.</p>
                            </div>

                            <form onSubmit={handleComplete} className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider ml-1">Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input
                                            type="password"
                                            required
                                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-dark-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 bg-gray-50 dark:bg-dark-bg text-gray-900 dark:text-white transition-all"
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider ml-1">Confirm Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input
                                            type="password"
                                            required
                                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-dark-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 bg-gray-50 dark:bg-dark-bg text-gray-900 dark:text-white transition-all"
                                            placeholder="••••••••"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full bg-primary-600 hover:bg-primary-700 text-white py-3 rounded-xl font-bold text-sm shadow-md shadow-primary-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                    >
                                        {isLoading ? (
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        ) : (
                                            <>Complete Setup</>
                                        )}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setStep(1)}
                                        className="w-full mt-4 text-xs font-bold text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 uppercase tracking-widest transition-colors"
                                    >
                                        Back to Profile
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="text-center py-12 animate-in zoom-in duration-300">
                            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner shadow-green-500/10">
                                <CheckCircle2 size={40} />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">All Set!</h2>
                            <p className="text-gray-500 dark:text-gray-400 mt-2">Your account has been successfully created. Redirecting to workspace...</p>
                        </div>
                    )}
                </div>
                <div className="bg-gray-50 dark:bg-dark-bg/50 p-6 text-center border-t border-gray-100 dark:border-dark-border">
                    <div className="flex items-center justify-center gap-2 text-[10px] text-gray-400 uppercase font-medium tracking-widest">
                        <Shield size={12} /> Secure Account Setup
                    </div>
                </div>
            </div>
        </div>
    );
};
