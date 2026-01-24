"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '../contexts/UserContext';
import { Mail, Lock, LogIn, ArrowRight, UserPlus, Shield, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '../lib/supabaseClient';

export const Login: React.FC = () => {
    const router = useRouter();
    const { login, updateCurrentUser, isAuthenticated, isLoaded } = useUser();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    React.useEffect(() => {
        if (isLoaded && isAuthenticated) {
            router.push('/');
        }
    }, [isLoaded, isAuthenticated, router]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            if (data.user) {
                // Auth change listener in UserContext will handle state update
                router.push('/');
            }
        } catch (err: any) {
            console.error('Login error:', err);
            setError(err.message || 'Failed to sign in. Please check your credentials.');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isLoaded) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-dark-bg flex items-center justify-center p-4">
                <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (isAuthenticated) return null; // Prevent rendering form while redirecting

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
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome Back</h2>
                        <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">Please sign in to access your dashboard</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-xl flex items-center gap-3 text-red-700 dark:text-red-400 text-sm animate-in fade-in slide-in-from-top-2">
                            <AlertCircle size={18} className="shrink-0" />
                            <p>{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-5">
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider ml-1">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-dark-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 bg-gray-50 dark:bg-dark-bg text-gray-900 dark:text-white placeholder:text-gray-400 transition-all"
                                    placeholder="name@company.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <div className="flex justify-between items-center ml-1">
                                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Password</label>
                                <a href="#" className="text-xs text-primary-600 hover:text-primary-700 font-medium">Forgot?</a>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-dark-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 bg-gray-50 dark:bg-dark-bg text-gray-900 dark:text-white placeholder:text-gray-400 transition-all"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full bg-primary-600 hover:bg-primary-700 text-white py-3 rounded-xl font-bold text-sm shadow-md shadow-primary-500/20 transition-all flex items-center justify-center gap-2 group ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    Sign In <LogIn size={18} className="transition-transform group-hover:translate-x-0.5" />
                                </>
                            )}
                        </button>

                        <div className="relative my-8">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-100 dark:border-dark-border"></div>
                            </div>
                            <div className="relative flex justify-center text-xs">
                                <span className="px-2 bg-white dark:bg-dark-surface text-gray-400 uppercase tracking-widest font-medium">Demo Access</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => { setEmail('admin@opencrm.com'); setPassword('password'); }}
                                className="flex items-center justify-center gap-2 p-2.5 border border-gray-200 dark:border-dark-border rounded-xl hover:bg-gray-50 dark:hover:bg-dark-bg text-xs font-semibold text-gray-600 dark:text-gray-300 transition-all"
                            >
                                <Shield size={14} className="text-primary-500" /> Admin
                            </button>
                            <button
                                type="button"
                                onClick={() => { setEmail('user@opencrm.com'); setPassword('password'); }}
                                className="flex items-center justify-center gap-2 p-2.5 border border-gray-200 dark:border-dark-border rounded-xl hover:bg-gray-50 dark:hover:bg-dark-bg text-xs font-semibold text-gray-600 dark:text-gray-300 transition-all"
                            >
                                <ArrowRight size={14} className="text-gray-400" /> Standard
                            </button>
                        </div>
                    </form>
                </div>
                <div className="bg-gray-50 dark:bg-dark-bg/50 p-6 text-center border-t border-gray-100 dark:border-dark-border">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Don't have an account?{' '}
                        <Link href="/signup" className="text-primary-600 hover:text-primary-700 font-bold ml-1">
                            Create Workspace
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};
