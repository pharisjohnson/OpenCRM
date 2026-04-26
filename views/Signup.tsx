"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '../contexts/UserContext';
import { Mail, Lock, User, Shield, ArrowRight, Building2, AlertCircle, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '../lib/supabaseClient';
import { createOrganizationForUser } from '../app/actions/organizationActions';

export const Signup: React.FC = () => {
    const router = useRouter();
    const { login, updateCurrentUser, isAuthenticated, isLoaded } = useUser();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        company: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    React.useEffect(() => {
        if (isLoaded && isAuthenticated) {
            router.push('/');
        }
    }, [isLoaded, isAuthenticated, router]);

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            // Step 1: Create auth user
            const { data, error: signupError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        full_name: formData.name,
                        role: 'owner',
                        company_name: formData.company
                    }
                }
            });

            if (signupError) throw signupError;

            if (data.user) {
                // Step 2: Create organization and membership
                const result = await createOrganizationForUser(
                    data.user.id,
                    formData.company || formData.name,
                    formData.name
                );

                if (!result.success) {
                    throw new Error(result.error || 'Failed to create organization');
                }

                // Step 3: Check if email confirmation is required
                if (data.session) {
                    // Mark that user needs onboarding
                    localStorage.setItem('needsOnboarding', 'true');
                    router.push('/onboarding');
                } else {
                    setError('Signup successful! Please check your email for a confirmation link.');
                }
            }
        } catch (err: any) {
            console.error('Signup error:', err);
            setError(err.message || 'Failed to create account. Please try again.');
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

    if (isAuthenticated) return null;

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
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Start Your Workspace</h2>
                        <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">Join thousands of teams managing relationships better.</p>
                    </div>

                    {error && (
                        <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 text-sm animate-in fade-in slide-in-from-top-2 ${error.includes('successful') ? 'bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900/30 text-green-700 dark:text-green-400' : 'bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 text-red-700 dark:text-red-400'}`}>
                            {error.includes('successful') ? <CheckCircle2 size={18} className="shrink-0" /> : <AlertCircle size={18} className="shrink-0" />}
                            <p>{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSignup} className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider ml-1">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-dark-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 bg-gray-50 dark:bg-dark-bg text-gray-900 dark:text-white placeholder:text-gray-400 transition-all"
                                    placeholder="John Doe"
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider ml-1">Company Name</label>
                            <div className="relative">
                                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    required
                                    value={formData.company}
                                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-dark-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 bg-gray-50 dark:bg-dark-bg text-gray-900 dark:text-white placeholder:text-gray-400 transition-all"
                                    placeholder="Acme Inc."
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider ml-1">Work Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-dark-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 bg-gray-50 dark:bg-dark-bg text-gray-900 dark:text-white placeholder:text-gray-400 transition-all"
                                    placeholder="name@company.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider ml-1">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="password"
                                    required
                                    minLength={8}
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-dark-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 bg-gray-50 dark:bg-dark-bg text-gray-900 dark:text-white placeholder:text-gray-400 transition-all"
                                    placeholder="Min. 8 characters"
                                />
                            </div>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`w-full bg-primary-600 hover:bg-primary-700 text-white py-3.5 rounded-xl font-bold text-sm shadow-md shadow-primary-500/20 transition-all flex items-center justify-center gap-2 group ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                {isLoading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        Get Started Free <ArrowRight size={18} className="transition-transform group-hover:translate-x-0.5" />
                                    </>
                                )}
                            </button>
                        </div>

                        <div className="flex items-center gap-2 text-[10px] text-gray-500 dark:text-gray-400 px-2 mt-4 leading-relaxed">
                            <Shield size={12} className="shrink-0 text-green-500" />
                            <span>By signing up, you agree to our Terms and that you will be assigned as the **Admin** of this workspace.</span>
                        </div>
                    </form>
                </div>
                <div className="bg-gray-50 dark:bg-dark-bg/50 p-6 text-center border-t border-gray-100 dark:border-dark-border">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Already have a workspace?{' '}
                        <Link href="/login" className="text-primary-600 hover:text-primary-700 font-bold ml-1">
                            Sign In
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};
