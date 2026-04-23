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
        if (isLoaded && !isAuthenticated && pathname !== '/accept-invite') {
            router.push('/login');
        }
    }, [isLoaded, isAuthenticated, router, pathname]);

    if (!isLoaded) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-dark-bg flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!isAuthenticated && pathname !== '/accept-invite') {
        return null;
    }

    return (
        <Layout>
            {children}
        </Layout>
    );
}
