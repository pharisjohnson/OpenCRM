
"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Organization } from '../types';
import { CURRENT_USER as DEFAULT_USER } from '../constants';
import { supabase } from '../lib/supabaseClient';

interface UserContextType {
  currentUser: User;
  isAuthenticated: boolean;
  isLoaded: boolean;
  organizations: Organization[];
  currentOrganization: Organization | null;
  updateCurrentUser: (updates: Partial<User>) => void;
  switchOrganization: (orgId: string) => void;
  login: () => void;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User>(DEFAULT_USER);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null);

  const fetchUserData = async (userId: string) => {
    try {
      // 1. Fetch Profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      // 2. Fetch Memberships & Organizations
      const { data: membershipsData, error: memError } = await supabase
        .from('memberships')
        .select(`
          organization_id,
          role,
          organizations (*)
        `)
        .eq('user_id', userId);

      if (membershipsData && membershipsData.length > 0) {
        const orgs = membershipsData.map(m => m.organizations as unknown as Organization);
        setOrganizations(orgs);

        // Use last selected or first organization
        const savedOrgId = localStorage.getItem('opencrm_selected_org');
        const activeOrg = orgs.find(o => o.id === savedOrgId) || orgs[0];
        setCurrentOrganization(activeOrg);

        setCurrentUser({
          id: userId,
          name: profile?.full_name || 'User',
          email: '', // Get from session
          role: profile?.role || 'user',
          avatarUrl: profile?.avatar_url,
          coverImageUrl: profile?.cover_url,
          currentOrganizationId: activeOrg.id
        });
      }
    } catch (err) {
      console.error('Error fetching user data:', err);
    }
  };

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        setIsAuthenticated(true);
        await fetchUserData(session.user.id);
        setCurrentUser(prev => ({ ...prev, email: session.user.email || '' }));
      }
      setIsLoaded(true);
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setIsAuthenticated(true);
        await fetchUserData(session.user.id);
        setCurrentUser(prev => ({ ...prev, email: session.user.email || '' }));
      } else {
        setIsAuthenticated(false);
        setCurrentUser(DEFAULT_USER);
        setOrganizations([]);
        setCurrentOrganization(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const switchOrganization = (orgId: string) => {
    const org = organizations.find(o => o.id === orgId);
    if (org) {
      setCurrentOrganization(org);
      localStorage.setItem('opencrm_selected_org', orgId);
      setCurrentUser(prev => ({ ...prev, currentOrganizationId: orgId }));
    }
  };

  const updateCurrentUser = (updates: Partial<User>) => {
    setCurrentUser(prev => ({ ...prev, ...updates }));
  };

  const login = () => setIsAuthenticated(true);

  const logout = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
  };

  return (
    <UserContext.Provider value={{
      currentUser,
      isAuthenticated,
      isLoaded,
      organizations,
      currentOrganization,
      updateCurrentUser,
      switchOrganization,
      login,
      logout
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
