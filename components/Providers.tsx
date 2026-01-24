"use client";

import React from 'react';
import { ConfigProvider } from '../contexts/ConfigContext';
import { UserProvider } from '../contexts/UserContext';
import { CustomFieldsProvider } from '../contexts/CustomFieldsContext';
import { NotificationProvider } from '../contexts/NotificationContext';
import { DataProvider } from '../contexts/DataContext';

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <UserProvider>
            <ConfigProvider>
                <CustomFieldsProvider>
                    <DataProvider>
                        <NotificationProvider>
                            {children}
                        </NotificationProvider>
                    </DataProvider>
                </CustomFieldsProvider>
            </ConfigProvider>
        </UserProvider>
    );
}
