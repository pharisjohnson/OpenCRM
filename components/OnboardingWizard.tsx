"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useConfig } from '../contexts/ConfigContext';
import { useData } from '../contexts/DataContext';
import { X, ArrowRight, Check, Sparkles, Layout, Users, Upload, Image as ImageIcon } from 'lucide-react';

export const OnboardingWizard: React.FC = () => {
    const { config, updateConfig } = useConfig();
    const { loadMockData } = useData();
    const [step, setStep] = useState(0);
    const [appName, setAppName] = useState(config.appName);
    const [primaryColor, setPrimaryColor] = useState(config.primaryColor);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [useMockData, setUseMockData] = useState(false);
    const [showWizard, setShowWizard] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Check if onboarding is needed
    useEffect(() => {
        const needsOnboarding = localStorage.getItem('needsOnboarding');
        if (needsOnboarding === 'true' && !config.onboardingCompleted) {
            setShowWizard(true);
            localStorage.removeItem('needsOnboarding');
        }
    }, [config.onboardingCompleted]);

    // If already completed or not needed, don't show
    if (config.onboardingCompleted || !showWizard) return null;

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleFinish = () => {
        // Save settings
        updateConfig({
            appName,
            primaryColor,
            logoUrl: logoPreview || undefined,
            onboardingCompleted: true
        });

        if (!useMockData) {
            // Clear any existing mock data for production
            localStorage.removeItem('mockDataLoaded');
        } else {
            loadMockData();
        }
        
        setShowWizard(false);
    };

    const nextStep = () => setStep(prev => prev + 1);
    const skip = () => handleFinish(); // "Skip" just finishes with defaults/current

    const steps = [
        // Step 0: Welcome
        {
            title: "Welcome to OpenCRM",
            description: "Let's set up your workspace in just a few seconds.",
            content: (
                <div className="flex flex-col items-center justify-center py-8">
                    <div className="w-20 h-20 bg-primary-100 text-primary-600 rounded-2xl flex items-center justify-center mb-6 animate-bounce-slow">
                        <Sparkles size={40} />
                    </div>
                    <p className="text-center text-gray-600 dark:text-gray-300 max-w-sm">
                        OpenCRM is a powerful, open-source relationship management tool designed for speed and simplicity.
                    </p>
                </div>
            )
        },
        // Step 1: Branding
        {
            title: "Brand Your Workspace",
            description: "Add your logo and customize your theme.",
            content: (
                <div className="space-y-6 py-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Workspace Name</label>
                        <input
                            value={appName}
                            onChange={(e) => setAppName(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-bg rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                            placeholder="My Company CRM"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Upload Logo (Optional)</label>
                        <div className="flex items-center gap-4">
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="px-4 py-2 border border-gray-300 dark:border-dark-border rounded-lg hover:bg-gray-50 dark:hover:bg-dark-border transition-colors flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300"
                            >
                                <Upload size={16} />
                                Choose File
                            </button>
                            {logoPreview && (
                                <div className="w-12 h-12 rounded-lg border-2 border-gray-200 dark:border-dark-border overflow-hidden">
                                    <img src={logoPreview} alt="Logo preview" className="w-full h-full object-cover" />
                                </div>
                            )}
                        </div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleLogoUpload}
                            className="hidden"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Theme Color</label>
                        <div className="flex gap-3">
                            <input
                                type="color"
                                value={primaryColor}
                                onChange={(e) => setPrimaryColor(e.target.value)}
                                className="h-10 w-16 p-1 rounded border border-gray-300 dark:border-dark-border cursor-pointer bg-white dark:bg-dark-bg"
                            />
                            <div className="text-sm flex flex-col justify-center text-gray-500">
                                <span>Selected: {primaryColor}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )
        },
        // Step 2: Data Preference
        {
            title: "Start Fresh?",
            description: "Choose how you want to begin.",
            content: (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
                    <button
                        onClick={() => setUseMockData(false)}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${!useMockData ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-gray-200 dark:border-dark-border hover:border-gray-300'}`}
                    >
                        <div className="w-10 h-10 bg-white dark:bg-dark-bg rounded-full shadow-sm flex items-center justify-center mb-3">
                            <Layout size={20} className="text-gray-700 dark:text-gray-200" />
                        </div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">Clean Slate</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Start with an empty dashboard. Perfect for production.</p>
                    </button>

                    <button
                        onClick={() => setUseMockData(true)}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${useMockData ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-gray-200 dark:border-dark-border hover:border-gray-300'}`}
                    >
                        <div className="w-10 h-10 bg-white dark:bg-dark-bg rounded-full shadow-sm flex items-center justify-center mb-3">
                            <Users size={20} className="text-gray-700 dark:text-gray-200" />
                        </div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">Demo Data</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Pre-fill with contacts and deals to explore features.</p>
                    </button>
                </div>
            )
        }
    ];

    const currentStep = steps[step];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white dark:bg-dark-surface w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-gray-100 dark:border-dark-border">
                {/* Header */}
                <div className="px-8 py-6 border-b border-gray-100 dark:border-dark-border flex justify-between items-center bg-gray-50/50 dark:bg-dark-bg/50">
                    <div>
                        <span className="text-xs font-bold text-primary-600 dark:text-primary-400 uppercase tracking-wider">Step {step + 1} of {steps.length}</span>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-1">{currentStep.title}</h2>
                    </div>
                    <button onClick={skip} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors" title="Skip Setup">
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="px-8 py-6 min-h-[250px] flex flex-col">
                    <p className="text-gray-500 dark:text-gray-400 mb-4">{currentStep.description}</p>
                    <div className="flex-1">
                        {currentStep.content}
                    </div>
                </div>

                {/* Footer */}
                <div className="px-8 py-5 bg-gray-50 dark:bg-dark-bg border-t border-gray-100 dark:border-dark-border flex justify-between items-center">
                    <div className="flex gap-2">
                        {steps.map((_, i) => (
                            <div
                                key={i}
                                className={`w-2 h-2 rounded-full transition-all ${i === step ? 'bg-primary-600 w-6' : 'bg-gray-300 dark:bg-dark-border'}`}
                            />
                        ))}
                    </div>

                    <div className="flex gap-3">
                        {/* Skip button only visible on first steps */}
                        {step < steps.length - 1 && (
                            <button
                                onClick={skip}
                                className="px-4 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors"
                            >
                                Skip
                            </button>
                        )}

                        <button
                            onClick={step === steps.length - 1 ? handleFinish : nextStep}
                            className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition-all shadow-md hover:shadow-lg flex items-center gap-2"
                        >
                            {step === steps.length - 1 ? 'Get Started' : 'Next'}
                            {step === steps.length - 1 ? <Check size={16} /> : <ArrowRight size={16} />}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
