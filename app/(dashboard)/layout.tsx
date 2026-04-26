"use client";

import React from 'react';
import { Layout } from '@/components/Layout';
import { useUser } from '@/contexts/UserContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, isLoaded } = useUser();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const publicPaths = ['/login', '/signup', '/accept-invite', '/onboarding', '/test-trial'];
        const isPublicPath = publicPaths.some(path => pathname.startsWith(path));

        if (isLoaded && !isAuthenticated && !isPublicPath) {
            router.push('/login');
        }

        // Check for onboarding
        if (isLoaded && isAuthenticated && localStorage.getItem('needsOnboarding') === 'true' && pathname !== '/onboarding') {
            router.push('/onboarding');
        }
    }, [isLoaded, isAuthenticated, router, pathname]);

    if (!isLoaded) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-dark-bg flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!isAuthenticated && !['/accept-invite', '/onboarding', '/test-trial'].some(path => pathname.startsWith(path))) {
        return null;
    }

    return (
        <Layout>
            {children}
        </Layout>
    );
}
