"use client";

import React from 'react';
import { Layout } from '@/components/Layout';
import { useUser } from '@/contexts/UserContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { isAuthenticated } = useUser();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!isAuthenticated && pathname !== '/accept-invite') {
            router.push('/login');
        }
    }, [isAuthenticated, router, pathname]);

    if (!isAuthenticated && pathname !== '/accept-invite') {
        return null; // Or a loading spinner
    }

    return (
        <Layout>
            {children}
        </Layout>
    );
}
