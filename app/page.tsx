"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
    CheckCircle2,
    ArrowRight,
    LayoutDashboard,
    Shield,
    Zap,
    Users,
    Globe,
    BarChart3,
    Menu,
    X,
    Play,
    Mail,
    Sparkles
} from 'lucide-react';
import { useUser } from '@/contexts/UserContext';

export default function LandingPage() {
    const { currentUser } = useUser();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [showDemoModal, setShowDemoModal] = useState(false);
    const [demoEmail, setDemoEmail] = useState('');
    const [demoSubmitted, setDemoSubmitted] = useState(false);

    const handleDemoSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // Store demo request in localStorage for now
        localStorage.setItem('demoRequested', 'true');
        localStorage.setItem('demoEmail', demoEmail);
        localStorage.setItem('demoMode', 'true');
        setDemoSubmitted(true);
        setTimeout(() => {
            window.location.href = '/dashboard?demo=true';
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-blue-100">

            {/* Navigation */}
            <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                                O
                            </div>
                            <span className="font-bold text-xl tracking-tight text-slate-900">OpenCRM</span>
                        </div>

                        <div className="hidden md:flex items-center gap-8">
                            <a href="#features" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">Features</a>
                            <a href="#pricing" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">Pricing</a>
                            {currentUser ? (
                                <Link
                                    href="/dashboard"
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-full text-sm font-semibold transition-all shadow-md hover:shadow-lg flex items-center gap-2"
                                >
                                    Go to Dashboard <ArrowRight size={16} />
                                </Link>
                            ) : (
                                <div className="flex items-center gap-4">
                                    <Link href="/login" className="text-sm font-semibold text-slate-600 hover:text-slate-900">Log in</Link>
                                    <Link
                                        href="/signup"
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-full text-sm font-semibold transition-all shadow-md hover:shadow-lg"
                                    >
                                        Start Free Trial
                                    </Link>
                                </div>
                            )}
                        </div>

                        <div className="md:hidden">
                            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-slate-600">
                                {isMobileMenuOpen ? <X /> : <Menu />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="md:hidden bg-white border-b border-slate-100 p-4 space-y-4">
                        <a href="#features" className="block text-sm font-medium text-slate-600" onClick={() => setIsMobileMenuOpen(false)}>Features</a>
                        <a href="#pricing" className="block text-sm font-medium text-slate-600" onClick={() => setIsMobileMenuOpen(false)}>Pricing</a>
                        {currentUser ? (
                            <Link href="/dashboard" className="block w-full text-center bg-blue-600 text-white py-2 rounded-lg font-medium">Dashboard</Link>
                        ) : (
                            <>
                                <Link href="/login" className="block w-full text-center border border-slate-200 py-2 rounded-lg font-medium text-slate-600">Log in</Link>
                                <Link href="/signup" className="block w-full text-center bg-blue-600 text-white py-2 rounded-lg font-medium">Start Free Trial</Link>
                            </>
                        )}
                    </div>
                )}
            </nav>

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center text-center">
                <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold mb-6 animate-fade-in-up">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                    </span>
                    v2.0 is live with AI Insights
                </div>

                <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-6 max-w-4xl leading-tight">
                    The <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Simplest CRM</span><br />
                    for Growing Businesses.
                </h1>

                <p className="text-xl text-slate-500 max-w-2xl mb-10 leading-relaxed">
                    Manage relationships, track details, and organize your team without the clutter.
                    Built for speed, accessibility, and delightful user experiences.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 mb-20">
                    <Link
                        href="/signup"
                        className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-lg shadow-xl shadow-blue-500/20 transition-all hover:scale-105 flex items-center justify-center gap-2"
                    >
                        Start 7-Day Free Trial <ArrowRight size={20} />
                    </Link>
                    <button
                        onClick={() => setShowDemoModal(true)}
                        className="px-8 py-4 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl font-bold text-lg shadow-sm transition-all flex items-center justify-center gap-2"
                    >
                        <Play size={20} />
                        See a Demo
                    </button>
                </div>

                {/* Dashboard Preview */}
                <div className="relative w-full max-w-5xl mx-auto rounded-xl shadow-2xl border border-slate-200/60 overflow-hidden bg-slate-900">
                    <div className="absolute top-0 w-full h-full bg-slate-900/10 z-10 pointer-events-none"></div>
                    <Image
                        src="/landing/dashboard.png"
                        alt="OpenCRM Dashboard"
                        width={1200}
                        height={800}
                        className="w-full h-auto"
                        priority
                    />
                </div>

                {/* Social Proof */}
                <div className="mt-20 pt-10 border-t border-slate-100 w-full">
                    <p className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-8">Trusted by forward-thinking teams</p>
                    <div className="flex flex-wrap justify-center gap-12 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                        {/* Simple text placeholders for logos */}
                        <div className="flex items-center gap-2 font-bold text-xl text-slate-500"><Globe size={24} /> GlobalCorp</div>
                        <div className="flex items-center gap-2 font-bold text-xl text-slate-500"><Zap size={24} /> FastCo</div>
                        <div className="flex items-center gap-2 font-bold text-xl text-slate-500"><Shield size={24} /> SecureNet</div>
                        <div className="flex items-center gap-2 font-bold text-xl text-slate-500"><LayoutDashboard size={24} /> TechStart</div>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section id="features" className="py-24 bg-slate-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-20">
                        <h2 className="text-base text-blue-600 font-bold tracking-wide uppercase mb-2">Features</h2>
                        <h3 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6">Everything you need, nothing you don't.</h3>
                        <p className="text-lg text-slate-500">We stripped away the complexity of traditional CRMs to focus on what actually drives growth: your relationships.</p>
                    </div>

                    <div className="space-y-32">

                        {/* Feature 1: Accessibility */}
                        <div className="grid md:grid-cols-2 gap-12 items-center">
                            <div className="order-2 md:order-1">
                                <div className="bg-white p-2 rounded-2xl shadow-xl border border-slate-100 rotate-1 hover:rotate-0 transition-transform duration-500">
                                    <Image
                                        src="/landing/preferences.png"
                                        alt="Preferences"
                                        width={500}
                                        height={400}
                                        className="rounded-xl w-full h-auto"
                                    />
                                </div>
                                <div className="bg-white p-2 rounded-2xl shadow-xl border border-slate-100 -rotate-2 hover:rotate-0 transition-transform duration-500 -mt-20 ml-12 relative z-10 w-2/3">
                                    <Image
                                        src="/landing/accessibility.png"
                                        alt="Accessibility Settings"
                                        width={400}
                                        height={200}
                                        className="rounded-xl w-full h-auto"
                                    />
                                </div>
                            </div>
                            <div className="order-1 md:order-2">
                                <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mb-6">
                                    <Users size={24} />
                                </div>
                                <h4 className="text-3xl font-bold text-slate-900 mb-4">Designed for Everyone</h4>
                                <p className="text-slate-500 text-lg leading-relaxed mb-6">
                                    Inclusivity isn't an afterthought—it's a core feature. With built-in high contrast modes, reduced motion settings, and adjustable typography, OpenCRM adapts to your needs, ensuring a comfortable experience for every team member.
                                </p>
                                <ul className="space-y-3">
                                    <li className="flex items-center gap-3 text-slate-700 font-medium">
                                        <CheckCircle2 size={20} className="text-green-500" /> High Contrast Theme
                                    </li>
                                    <li className="flex items-center gap-3 text-slate-700 font-medium">
                                        <CheckCircle2 size={20} className="text-green-500" /> Reduced Motion Support
                                    </li>
                                    <li className="flex items-center gap-3 text-slate-700 font-medium">
                                        <CheckCircle2 size={20} className="text-green-500" /> Dynamic Font Scaling
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {/* Feature 2: Account Control */}
                        <div className="grid md:grid-cols-2 gap-12 items-center">
                            <div className="md:pr-12">
                                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-6">
                                    <Shield size={24} />
                                </div>
                                <h4 className="text-3xl font-bold text-slate-900 mb-4">Complete Control Over Your Profile</h4>
                                <p className="text-slate-500 text-lg leading-relaxed mb-6">
                                    Your workspace should feel like yours. Manage security settings, profile details, and notifications with granular control. We prioritize your data privacy and security above all else.
                                </p>
                                <ul className="space-y-3">
                                    <li className="flex items-center gap-3 text-slate-700 font-medium">
                                        <CheckCircle2 size={20} className="text-green-500" /> Secure Admin Accounts
                                    </li>
                                    <li className="flex items-center gap-3 text-slate-700 font-medium">
                                        <CheckCircle2 size={20} className="text-green-500" /> Custom Avatars & Covers
                                    </li>
                                    <li className="flex items-center gap-3 text-slate-700 font-medium">
                                        <CheckCircle2 size={20} className="text-green-500" /> Role-Based Permissions
                                    </li>
                                </ul>
                            </div>
                            <div>
                                <div className="bg-white p-2 rounded-2xl shadow-xl border border-slate-100 hover:scale-105 transition-transform duration-500">
                                    <Image
                                        src="/landing/account-settings.png"
                                        alt="Account Settings"
                                        width={600}
                                        height={500}
                                        className="rounded-xl w-full h-auto"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Feature 3: Analytics */}
                        <div className="grid md:grid-cols-2 gap-12 items-center">
                            <div className="order-2 md:order-1 relative">
                                <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/20 to-purple-600/20 rounded-full blur-3xl opacity-30"></div>
                                <div className="relative bg-white p-2 rounded-2xl shadow-xl border border-slate-100">
                                    <Image
                                        src="/landing/dashboard.png"
                                        alt="Analytics"
                                        width={600}
                                        height={500}
                                        className="rounded-xl w-full h-auto object-cover object-left-top"
                                    />
                                </div>
                            </div>
                            <div className="order-1 md:order-2 md:pl-8">
                                <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-6">
                                    <BarChart3 size={24} />
                                </div>
                                <h4 className="text-3xl font-bold text-slate-900 mb-4">Data-Driven Insights</h4>
                                <p className="text-slate-500 text-lg leading-relaxed mb-6">
                                    Stop guessing. Our dashboard gives you a real-time pulse on your business health. Track revenue, monitor active leads, and forecast your pipeline with beautiful, interactive charts.
                                </p>
                                <ul className="space-y-3">
                                    <li className="flex items-center gap-3 text-slate-700 font-medium">
                                        <CheckCircle2 size={20} className="text-green-500" /> Real-time Revenue Tracking
                                    </li>
                                    <li className="flex items-center gap-3 text-slate-700 font-medium">
                                        <CheckCircle2 size={20} className="text-green-500" /> Pipeline Visualization
                                    </li>
                                    <li className="flex items-center gap-3 text-slate-700 font-medium">
                                        <CheckCircle2 size={20} className="text-green-500" /> Activity Feed
                                    </li>
                                </ul>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* Pricing */}
            <section id="pricing" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-base text-blue-600 font-bold tracking-wide uppercase mb-2">Pricing</h2>
                    <h3 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6">Simple, transparent pricing.</h3>
                    <p className="text-lg text-slate-500">Start for free, then scale as you grow. No hidden fees or surprise contracts.</p>
                </div>

                <div className="max-w-lg mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 hover:border-blue-500 transition-colors duration-300">
                    <div className="p-8 sm:p-12 text-center bg-gradient-to-b from-blue-50/50 to-white">
                        <span className="inline-block px-4 py-1.5 rounded-full bg-blue-100 text-blue-700 font-bold text-sm mb-6">
                            MOST POPULAR
                        </span>
                        <h4 className="text-2xl font-bold text-slate-900">Pro Plan</h4>
                        <div className="mt-6 flex items-baseline justify-center gap-2">
                            <span className="text-6xl font-extrabold text-slate-900">$6</span>
                            <span className="text-lg text-slate-500 font-medium">/user/month</span>
                        </div>
                        <p className="mt-4 text-slate-500">Perfect for small to medium-sized teams.</p>

                        <Link
                            href="/signup"
                            className="mt-8 block w-full py-4 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 transition-all hover:-translate-y-1"
                        >
                            Start 7-Day Free Trial
                        </Link>
                        <p className="mt-4 text-xs text-slate-400">No credit card required for trial.</p>
                    </div>

                    <div className="p-8 sm:p-12 bg-slate-50 border-t border-slate-100">
                        <ul className="space-y-4">
                            {[
                                "Unlimited Contacts & Deals",
                                "Advanced Reporting",
                                "Email Integration (SMTP/Resend)",
                                "Document Storage (10GB)",
                                "AI Assistant (Gemini/Puter)",
                                "Team Roles & Permissions",
                                "Priority Support"
                            ].map((feature, i) => (
                                <li key={i} className="flex items-start gap-4">
                                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                                        <CheckCircle2 size={14} className="text-green-600" />
                                    </div>
                                    <span className="text-slate-700 font-medium">{feature}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-slate-900 text-slate-300 py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-12">
                    <div className="col-span-1 md:col-span-2">
                        <div className="flex items-center gap-2 mb-6">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                                O
                            </div>
                            <span className="font-bold text-xl text-white">OpenCRM</span>
                        </div>
                        <p className="text-slate-400 text-sm max-w-sm mb-6">
                            Making business relationships simpler, smarter, and more accessible for everyone.
                        </p>
                        <div className="flex gap-4">
                            <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors cursor-pointer">
                                <Globe size={18} />
                            </div>
                            {/* Add more social icons here */}
                        </div>
                    </div>

                    <div>
                        <h5 className="text-white font-bold mb-6">Product</h5>
                        <ul className="space-y-4 text-sm">
                            <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Roadmap</a></li>
                        </ul>
                    </div>

                    <div>
                        <h5 className="text-white font-bold mb-6">Company</h5>
                        <ul className="space-y-4 text-sm">
                            <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                        </ul>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 pt-8 border-t border-slate-800 text-xs text-slate-500 flex flex-col md:flex-row justify-between items-center">
                    <p>&copy; 2026 OpenCRM Inc. All rights reserved.</p>
                    <div className="flex gap-6 mt-4 md:mt-0">
                        <a href="#" className="hover:text-white">Privacy Policy</a>
                        <a href="#" className="hover:text-white">Terms of Service</a>
                    </div>
                </div>
            </footer>

            {/* Demo Modal */}
            {showDemoModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl relative animate-fade-in">
                        <button
                            onClick={() => setShowDemoModal(false)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            <X size={24} />
                        </button>

                        {!demoSubmitted ? (
                            <>
                                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6">
                                    <Play size={32} className="text-white" />
                                </div>
                                
                                <h3 className="text-2xl font-bold text-slate-900 mb-2">
                                    Try the Interactive Demo
                                </h3>
                                <p className="text-slate-600 mb-6">
                                    Enter your email to access a full demo with guided tooltips showing you how each feature works.
                                </p>

                                <form onSubmit={handleDemoSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Your Email
                                        </label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                            <input
                                                type="email"
                                                required
                                                value={demoEmail}
                                                onChange={(e) => setDemoEmail(e.target.value)}
                                                placeholder="you@company.com"
                                                className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Sparkles size={18} />
                                        Start Interactive Demo
                                    </button>

                                    <p className="text-xs text-slate-500 text-center">
                                        No credit card required. Demo includes full feature walkthrough.
                                    </p>
                                </form>
                            </>
                        ) : (
                            <div className="text-center py-8">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle className="text-green-600" size={32} />
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900 mb-2">
                                    Demo Ready!
                                </h3>
                                <p className="text-slate-600 mb-4">
                                    Redirecting you to the interactive demo...
                                </p>
                                <div className="animate-spin w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full mx-auto"></div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
