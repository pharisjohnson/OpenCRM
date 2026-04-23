"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useConfig } from '../contexts/ConfigContext';
import { useUser } from '../contexts/UserContext';
import { inviteUserToOrganization } from '../app/actions/inviteActions';
import { X, ArrowRight, Check, Sparkles, Upload, Plus, Trash2, Mail, Building2, Palette } from 'lucide-react';

export const OnboardingWizard: React.FC = () => {
    const { config, updateConfig } = useConfig();
    const { currentUser, currentOrganization } = useUser();
    const [step, setStep] = useState(0);
    const [appName, setAppName] = useState(config.appName);
    const [primaryColor, setPrimaryColor] = useState(config.primaryColor);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [inviteEmails, setInviteEmails] = useState<string[]>(['']);
    const [inviteRole, setInviteRole] = useState<'member' | 'admin'>('member');
    const [inviteStatus, setInviteStatus] = useState<{ [email: string]: 'sending' | 'sent' | 'error' }>({});
    const [showWizard, setShowWizard] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const needsOnboarding = localStorage.getItem('needsOnboarding');
        if (needsOnboarding === 'true' && !config.onboardingCompleted) {
            setShowWizard(true);
            localStorage.removeItem('needsOnboarding');
        }
    }, [config.onboardingCompleted]);

    if (config.onboardingCompleted || !showWizard) return null;

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setLogoPreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleFinish = () => {
        updateConfig({
            appName,
            primaryColor,
            logoUrl: logoPreview || undefined,
            onboardingCompleted: true
        });
        setShowWizard(false);
    };

    const handleSendInvites = async () => {
        const validEmails = inviteEmails.filter(e => e.trim() && e.includes('@'));
        if (validEmails.length === 0) {
            handleFinish();
            return;
        }

        const statuses: typeof inviteStatus = {};
        for (const email of validEmails) {
            statuses[email] = 'sending';
        }
        setInviteStatus({ ...statuses });

        for (const email of validEmails) {
            if (!currentOrganization?.id || !currentUser?.id) {
                statuses[email] = 'error';
                continue;
            }
            const result = await inviteUserToOrganization({
                organizationId: currentOrganization.id,
                email: email.trim(),
                role: inviteRole,
                invitedBy: currentUser.id
            });
            statuses[email] = result.success ? 'sent' : 'error';
            setInviteStatus({ ...statuses });
        }

        setTimeout(handleFinish, 1200);
    };

    const addEmailField = () => setInviteEmails([...inviteEmails, '']);
    const removeEmailField = (i: number) => setInviteEmails(inviteEmails.filter((_, idx) => idx !== i));
    const updateEmail = (i: number, val: string) => {
        const updated = [...inviteEmails];
        updated[i] = val;
        setInviteEmails(updated);
    };

    const allSent = inviteEmails.filter(e => e.trim()).length > 0 &&
        Object.values(inviteStatus).every(s => s === 'sent' || s === 'error');

    const STEPS = [
        {
            title: "Welcome to OpenCRM",
            description: "Let's set up your workspace in just a few steps.",
            icon: <Sparkles size={36} className="text-primary-600" />,
            content: (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                    <div className="w-20 h-20 bg-primary-50 dark:bg-primary-900/20 rounded-2xl flex items-center justify-center mb-6">
                        <Sparkles size={40} className="text-primary-600" />
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 max-w-sm text-base leading-relaxed">
                        You're moments away from a clean, fast workspace for managing your team's relationships and pipeline.
                    </p>
                    <div className="mt-6 flex flex-col gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-2"><Check size={16} className="text-green-500" /> Brand your workspace</div>
                        <div className="flex items-center gap-2"><Check size={16} className="text-green-500" /> Invite your team</div>
                        <div className="flex items-center gap-2"><Check size={16} className="text-green-500" /> Start with a clean slate</div>
                    </div>
                </div>
            )
        },
        {
            title: "Brand Your Workspace",
            description: "Customize the name, logo, and colour of your CRM.",
            content: (
                <div className="space-y-5 py-2">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-2">
                            <Building2 size={15} className="text-gray-400" /> Workspace Name
                        </label>
                        <input
                            value={appName}
                            onChange={(e) => setAppName(e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-bg rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all text-gray-900 dark:text-white placeholder:text-gray-400"
                            placeholder="Acme CRM"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-2">
                            <Upload size={15} className="text-gray-400" /> Logo (Optional)
                        </label>
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="px-4 py-2 border border-gray-300 dark:border-dark-border rounded-lg hover:bg-gray-50 dark:hover:bg-dark-border transition-colors flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300"
                            >
                                <Upload size={15} /> Choose File
                            </button>
                            {logoPreview ? (
                                <div className="w-10 h-10 rounded-lg border-2 border-gray-200 dark:border-dark-border overflow-hidden">
                                    <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                                </div>
                            ) : (
                                <span className="text-sm text-gray-400">No file chosen</span>
                            )}
                        </div>
                        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-2">
                            <Palette size={15} className="text-gray-400" /> Theme Colour
                        </label>
                        <div className="flex items-center gap-3">
                            <input
                                type="color"
                                value={primaryColor}
                                onChange={(e) => setPrimaryColor(e.target.value)}
                                className="h-10 w-14 p-1 rounded-lg border border-gray-300 dark:border-dark-border cursor-pointer bg-white dark:bg-dark-bg"
                            />
                            <span className="text-sm text-gray-500 dark:text-gray-400 font-mono">{primaryColor}</span>
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: "Invite Your Team",
            description: "Add team members now, or skip and do it later from Settings.",
            content: (
                <div className="space-y-4 py-2">
                    <div className="flex items-center gap-2 mb-1">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Role</label>
                        <div className="flex gap-2 ml-auto">
                            {(['member', 'admin'] as const).map(r => (
                                <button
                                    key={r}
                                    type="button"
                                    onClick={() => setInviteRole(r)}
                                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all capitalize ${inviteRole === r ? 'bg-primary-600 text-white' : 'border border-gray-200 dark:border-dark-border text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-bg'}`}
                                >{r}</button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                        {inviteEmails.map((email, i) => (
                            <div key={i} className="flex items-center gap-2">
                                <div className="relative flex-1">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => updateEmail(i, e.target.value)}
                                        className="w-full pl-9 pr-4 py-2 border border-gray-200 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-gray-50 dark:bg-dark-bg text-gray-900 dark:text-white placeholder:text-gray-400 text-sm transition-all"
                                        placeholder="colleague@company.com"
                                        disabled={!!inviteStatus[email]}
                                    />
                                </div>
                                {inviteStatus[email] === 'sent' && <Check size={16} className="text-green-500 shrink-0" />}
                                {inviteStatus[email] === 'error' && <span className="text-xs text-red-500 shrink-0">Failed</span>}
                                {inviteStatus[email] === 'sending' && <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin shrink-0" />}
                                {!inviteStatus[email] && inviteEmails.length > 1 && (
                                    <button type="button" onClick={() => removeEmailField(i)} className="text-gray-400 hover:text-red-500 transition-colors shrink-0">
                                        <Trash2 size={15} />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>

                    {!Object.keys(inviteStatus).length && (
                        <button
                            type="button"
                            onClick={addEmailField}
                            className="flex items-center gap-1.5 text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors"
                        >
                            <Plus size={15} /> Add another
                        </button>
                    )}
                </div>
            )
        }
    ];

    const current = STEPS[step];
    const isLastStep = step === STEPS.length - 1;
    const isSending = Object.values(inviteStatus).some(s => s === 'sending');

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white dark:bg-dark-surface w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-gray-100 dark:border-dark-border">
                {/* Header */}
                <div className="px-8 py-5 border-b border-gray-100 dark:border-dark-border flex justify-between items-center bg-gray-50/50 dark:bg-dark-bg/50">
                    <div>
                        <span className="text-xs font-bold text-primary-600 dark:text-primary-400 uppercase tracking-wider">
                            Step {step + 1} of {STEPS.length}
                        </span>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">{current.title}</h2>
                    </div>
                    <button
                        onClick={handleFinish}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                        title="Skip setup"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="px-8 py-5 min-h-[260px] flex flex-col">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{current.description}</p>
                    <div className="flex-1">{current.content}</div>
                </div>

                {/* Footer */}
                <div className="px-8 py-4 bg-gray-50 dark:bg-dark-bg border-t border-gray-100 dark:border-dark-border flex justify-between items-center">
                    <div className="flex gap-1.5">
                        {STEPS.map((_, i) => (
                            <div
                                key={i}
                                className={`h-2 rounded-full transition-all duration-300 ${i === step ? 'bg-primary-600 w-6' : i < step ? 'bg-primary-300 w-2' : 'bg-gray-300 dark:bg-dark-border w-2'}`}
                            />
                        ))}
                    </div>

                    <div className="flex gap-3">
                        {isLastStep && (
                            <button
                                type="button"
                                onClick={handleFinish}
                                className="px-4 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors"
                                disabled={isSending}
                            >
                                Skip
                            </button>
                        )}
                        <button
                            onClick={isLastStep ? handleSendInvites : () => setStep(s => s + 1)}
                            disabled={isSending || allSent}
                            className="bg-primary-600 hover:bg-primary-700 disabled:opacity-70 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg text-sm font-semibold transition-all shadow-md hover:shadow-lg flex items-center gap-2"
                        >
                            {isSending ? (
                                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sending...</>
                            ) : isLastStep ? (
                                <>{inviteEmails.some(e => e.trim()) ? 'Send Invites' : 'Go to Dashboard'} <Check size={15} /></>
                            ) : (
                                <>Next <ArrowRight size={15} /></>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
