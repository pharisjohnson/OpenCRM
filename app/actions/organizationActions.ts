'use server';

import { createClient } from '@supabase/supabase-js';

export async function createOrganizationForUser(userId: string, companyName: string, userName: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    return { success: false, error: 'Server configuration error: missing Supabase credentials' };
  }

  const supabaseAdmin = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  try {
    // Create organization with trial status
    const { data: org, error: orgError } = await supabaseAdmin
      .from('organizations')
      .insert({
        name: companyName || `${userName}'s Workspace`,
        subscription_status: 'trial',
        subscription_plan: 'free',
        trial_start_date: new Date().toISOString(),
        trial_end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
        max_team_members: 5,
      })
      .select()
      .single();

    if (orgError) {
      console.error('Error creating organization:', orgError);
      throw orgError;
    }

    // Create membership with owner role
    const { error: membershipError } = await supabaseAdmin
      .from('memberships')
      .insert({
        user_id: userId,
        organization_id: org.id,
        role: 'owner', // Owner is highest level, includes admin permissions
      });

    if (membershipError) {
      console.error('Error creating membership:', membershipError);
      throw membershipError;
    }

    return { success: true, organizationId: org.id };
  } catch (error) {
    console.error('Failed to create organization:', error);
    return { success: false, error: (error as Error).message };
  }
}
