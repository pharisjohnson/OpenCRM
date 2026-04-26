"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Camera, Lock, CheckCircle2, ArrowRight, AlertCircle, Shield, LogIn } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { acceptInvitation } from '../app/actions/inviteActions';
import { useUser } from '../contexts/UserContext';

export const AcceptInvite: React.FC = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { currentUser, isAuthenticated, isLoaded } = useUser();

    const token = searchParams?.get('token') || '';
    const invitedEmail = searchParams?.get('email') || '';

    const [step, setStep] = useState(1); // 1: Welcome/Auth Choice, 2: Profile, 3: Password (Signup), 4: Login, 5: Success
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [avatar, setAvatar] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [isExistingUser, setIsExistingUser] = useState(false);

    // Initial check for existing session or email match
    useEffect(() => {
        if (isLoaded && isAuthenticated && currentUser.email === invitedEmail) {
            setStep(1); // Already logged in as the right user
        }
    }, [isLoaded, isAuthenticated, currentUser.email, invitedEmail]);

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

    const handleJoinWithExistingAccount = async () => {
        setIsLoading(true);
        setError('');
        try {
            const result = await acceptInvitation(token, currentUser.id);
            if (!result.success) throw new Error(result.error);
            setStep(5);
            setTimeout(() => router.push('/dashboard'), 2000);
        } catch (err: any) {
            setError(err.message || 'Failed to join organization');
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            const { data, error: loginError } = await supabase.auth.signInWithPassword({
                email: invitedEmail,
                password
            });
            if (loginError) throw loginError;
            // The useEffect/UserContext will handle the state update
        } catch (err: any) {
            setError(err.message || 'Login failed');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError("Passwords do not match!");
            return;
        }
        setIsLoading(true);
        setError('');

        try {
            const { data, error: signupError } = await supabase.auth.signUp({
                email: invitedEmail,
                password,
                options: {
                    data: {
                        full_name: name,
                        avatar_url: avatar,
                    }
                }
            });

            if (signupError) throw signupError;

            if (data.user) {
                const result = await acceptInvitation(token, data.user.id);
                if (!result.success) throw new Error(result.error);

                if (data.session) {
                    setStep(5);
                    setTimeout(() => router.push('/dashboard'), 2000);
                } else {
                    setError('Account created! Please check your email to confirm.');
                }
            }
        } catch (err: any) {
            setError(err.message || 'Failed to complete setup');
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

                    {/* Step 1: Welcome & Context Aware Auth */}
                    {step === 1 && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            <div className="text-center">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Workspace Invitation</h2>
                                <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">
                                    You've been invited to join the team.
                                </p>
                            </div>

                            {isAuthenticated && currentUser.email === invitedEmail ? (
                                <div className="space-y-4">
                                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-900/30 text-center">
                                        <p className="text-sm text-blue-800 dark:text-blue-300">
                                            Logged in as <strong>{currentUser.email}</strong>
                                        </p>
                                    </div>
                                    <button 
                                        onClick={handleJoinWithExistingAccount}
                                        disabled={isLoading}
                                        className="w-full bg-primary-600 hover:bg-primary-700 text-white py-3 rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
                                    >
                                        {isLoading ? 'Joining...' : 'Accept Invitation & Join Team'}
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <button 
                                        onClick={() => setStep(2)}
                                        className="w-full bg-primary-600 hover:bg-primary-700 text-white py-3 rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
                                    >
                                        Create Account & Join <ArrowRight size={18} />
                                    </button>
                                    <button 
                                        onClick={() => setStep(4)}
                                        className="w-full bg-gray-100 dark:bg-dark-bg hover:bg-gray-200 dark:hover:bg-dark-border text-gray-700 dark:text-gray-300 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2"
                                    >
                                        I already have an account <LogIn size={18} />
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Step 2: Profile (Signup Flow) */}
                    {step === 2 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="text-center">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Setup Profile</h2>
                                <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">Let the team know who you are.</p>
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
                            </div>

                            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setStep(3); }}>
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
                                <button type="submit" className="w-full bg-primary-600 hover:bg-primary-700 text-white py-3 rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 group">
                                    Next <ArrowRight size={18} />
                                </button>
                            </form>
                        </div>
                    )}

                    {/* Step 3: Password (Signup Flow) */}
                    {step === 3 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="text-center">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Secure Account</h2>
                                <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">Create a password for {invitedEmail}</p>
                            </div>

                            <form onSubmit={handleSignup} className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider ml-1">Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input
                                            type="password"
                                            required
                                            minLength={6}
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

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full bg-primary-600 hover:bg-primary-700 text-white py-3 rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                                >
                                    {isLoading ? 'Creating Account...' : 'Complete Setup'}
                                </button>
                                <button type="button" onClick={() => setStep(2)} className="w-full text-xs font-bold text-gray-500 uppercase tracking-widest mt-2">Back</button>
                            </form>
                        </div>
                    )}

                    {/* Step 4: Login Flow */}
                    {step === 4 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="text-center">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome Back</h2>
                                <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">Sign in to join the workspace with {invitedEmail}</p>
                            </div>

                            <form onSubmit={handleLogin} className="space-y-4">
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
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full bg-primary-600 hover:bg-primary-700 text-white py-3 rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
                                >
                                    {isLoading ? 'Signing In...' : 'Sign In & Join'}
                                </button>
                                <button type="button" onClick={() => setStep(1)} className="w-full text-xs font-bold text-gray-500 uppercase tracking-widest mt-2">Cancel</button>
                            </form>
                        </div>
                    )}

                    {/* Step 5: Success */}
                    {step === 5 && (
                        <div className="text-center py-12 animate-in zoom-in duration-300">
                            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                                <CheckCircle2 size={40} />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">All Set!</h2>
                            <p className="text-gray-500 dark:text-gray-400 mt-2">You've successfully joined the workspace. Redirecting...</p>
                        </div>
                    )}
                </div>
                <div className="bg-gray-50 dark:bg-dark-bg/50 p-6 text-center border-t border-gray-100 dark:border-dark-border">
                    <div className="flex items-center justify-center gap-2 text-[10px] text-gray-400 uppercase font-medium tracking-widest">
                        <Shield size={12} /> Secure Invitation Flow
                    </div>
                </div>
            </div>
        </div>
    );
};

