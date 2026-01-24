"use client";

import { useEffect, useState } from 'react';
import { useUser } from '@/contexts/UserContext';
import { supabase } from '@/lib/supabaseClient';
import { Organization } from '@/types';

interface SubscriptionStatus {
  isActive: boolean;
  isTrialExpired: boolean;
  daysRemaining: number;
  plan: string;
  canAddMembers: boolean;
  currentMemberCount: number;
  maxMembers: number;
}

export function useSubscription() {
  const { currentOrganization, organizations } = useUser();
  const [status, setStatus] = useState<SubscriptionStatus>({
    isActive: true,
    isTrialExpired: false,
    daysRemaining: 7,
    plan: 'trial',
    canAddMembers: true,
    currentMemberCount: 0,
    maxMembers: 5
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSubscription = async () => {
      if (!currentOrganization) {
        setLoading(false);
        return;
      }

      try {
        // Get fresh organization data with subscription fields
        const { data: org, error: orgError } = await supabase
          .from('organizations')
          .select('*')
          .eq('id', currentOrganization.id)
          .single();

        if (orgError) throw orgError;

        // Get member count
        const { data: members, error: memberError } = await supabase
          .from('memberships')
          .select('id', { count: 'exact', head: true })
          .eq('organization_id', currentOrganization.id);

        const memberCount = members?.length || 0;

        // Calculate days remaining
        const trialEnd = org.trial_end_date ? new Date(org.trial_end_date) : new Date();
        const now = new Date();
        const diffTime = trialEnd.getTime() - now.getTime();
        const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        const isTrialExpired = org.subscription_status === 'trial' && daysRemaining <= 0;
        const isActive = org.subscription_status === 'active' || (org.subscription_status === 'trial' && daysRemaining > 0);

        setStatus({
          isActive,
          isTrialExpired,
          daysRemaining: Math.max(0, daysRemaining),
          plan: org.subscription_plan || 'free',
          canAddMembers: memberCount < (org.max_team_members || 5),
          currentMemberCount: memberCount,
          maxMembers: org.max_team_members || 5
        });
      } catch (error) {
        console.error('Error checking subscription:', error);
      } finally {
        setLoading(false);
      }
    };

    checkSubscription();
    
    // Check every minute for trial expiration
    const interval = setInterval(checkSubscription, 60000);
    return () => clearInterval(interval);
  }, [currentOrganization]);

  const upgradePlan = async (plan: 'starter' | 'professional' | 'enterprise') => {
    if (!currentOrganization) return { success: false, error: 'No organization selected' };

    try {
      const maxMembers = {
        starter: 10,
        professional: 25,
        enterprise: 999
      }[plan];

      const { error } = await supabase
        .from('organizations')
        .update({
          subscription_status: 'active',
          subscription_plan: plan,
          max_team_members: maxMembers
        })
        .eq('id', currentOrganization.id);

      if (error) throw error;

      // Refresh status
      setStatus(prev => ({
        ...prev,
        isActive: true,
        isTrialExpired: false,
        plan,
        maxMembers
      }));

      return { success: true };
    } catch (error: any) {
      console.error('Upgrade error:', error);
      return { success: false, error: error.message };
    }
  };

  return { status, loading, upgradePlan };
}
