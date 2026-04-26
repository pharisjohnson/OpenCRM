"use server";

import { createClient } from '@supabase/supabase-js';
import { sendInviteEmail } from '@/services/emailService';

const getSupabaseAdmin = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Missing Supabase server credentials');
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
};

interface InviteUserParams {
  organizationId: string;
  email: string;
  role: 'admin' | 'member';
  invitedBy: string;
}

export async function inviteUserToOrganization(params: InviteUserParams) {
  const { organizationId, email, role, invitedBy } = params;

  try {
    const supabaseAdmin = getSupabaseAdmin();

    // 1. Verify inviter is an admin
    const { data: membership, error: memberError } = await supabaseAdmin
      .from('memberships')
      .select('role')
      .eq('user_id', invitedBy)
      .eq('organization_id', organizationId)
      .single();

    if (memberError || !membership) {
      return { success: false, error: 'You are not a member of this organization' };
    }

    if (membership.role !== 'admin' && membership.role !== 'owner') {
      return { success: false, error: 'Only admins can invite new members' };
    }

    // 2. Check if organization can add more members
    const { data: org, error: orgError } = await supabaseAdmin
      .from('organizations')
      .select('max_team_members, subscription_plan, name')
      .eq('id', organizationId)
      .single();

    if (orgError) {
      return { success: false, error: 'Organization not found' };
    }

    const { count, error: countError } = await supabaseAdmin
      .from('memberships')
      .select('id', { count: 'exact', head: true })
      .eq('organization_id', organizationId);

    if (countError) {
      return { success: false, error: 'Failed to check team size' };
    }

    if (org.subscription_plan !== 'enterprise' && count && count >= (org.max_team_members || 5)) {
      return { success: false, error: 'Team limit reached. Upgrade your plan to add more members.' };
    }

    // 3. Check if a pending invitation for this email already exists
    const { data: existingInvite } = await supabaseAdmin
      .from('invitations')
      .select('id')
      .eq('organization_id', organizationId)
      .eq('email', email)
      .eq('status', 'pending')
      .single();

    if (existingInvite) {
      return { success: false, error: 'A pending invitation for this email already exists' };
    }

    // 4. Create invitation token
    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    const { error: inviteError } = await supabaseAdmin
      .from('invitations')
      .insert({
        organization_id: organizationId,
        invited_by: invitedBy,
        email,
        role,
        token,
        status: 'pending',
        expires_at: expiresAt,
      });

    if (inviteError) {
      return { success: false, error: inviteError.message };
    }

    // 5. Send invitation email
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const inviteUrl = `${appUrl}/accept-invite?token=${token}&email=${encodeURIComponent(email)}`;

    try {
      await sendInviteEmail(email, org.name || 'your team', inviteUrl);
    } catch (emailErr) {
      console.error('Failed to send invite email:', emailErr);
      // Invitation is still created — don't fail the whole operation
    }

    return { success: true, inviteUrl, message: 'Invitation sent successfully' };

  } catch (error: any) {
    console.error('Invite error:', error);
    return { success: false, error: error.message || 'Failed to send invitation' };
  }
}

export async function acceptInvitation(token: string, userId: string) {
  try {
    const supabaseAdmin = getSupabaseAdmin();

    // 1. Get invitation
    const { data: invitation, error: inviteError } = await supabaseAdmin
      .from('invitations')
      .select('*, organizations(*)')
      .eq('token', token)
      .eq('status', 'pending')
      .single();

    if (inviteError || !invitation) {
      return { success: false, error: 'Invalid or expired invitation' };
    }

    // Check if expired
    const expiresAt = new Date(invitation.expires_at);
    if (expiresAt < new Date()) {
      await supabaseAdmin
        .from('invitations')
        .update({ status: 'expired' })
        .eq('id', invitation.id);
      
      return { success: false, error: 'This invitation has expired' };
    }

    // 2. Check if user already member
    const { data: existingMember } = await supabaseAdmin
      .from('memberships')
      .select('id')
      .eq('user_id', userId)
      .eq('organization_id', invitation.organization_id)
      .single();

    if (existingMember) {
      return { success: false, error: 'You are already a member of this organization' };
    }

    // 3. Create membership
    const { error: membershipError } = await supabaseAdmin
      .from('memberships')
      .insert({
        user_id: userId,
        organization_id: invitation.organization_id,
        role: invitation.role
      });

    if (membershipError) {
      return { success: false, error: 'Failed to create membership' };
    }

    // 4. Mark invitation as accepted
    await supabaseAdmin
      .from('invitations')
      .update({ status: 'accepted' })
      .eq('id', invitation.id);

    return { 
      success: true, 
      organization: invitation.organizations,
      message: 'Successfully joined organization'
    };

  } catch (error: any) {
    console.error('Accept invitation error:', error);
    return { success: false, error: error.message || 'Failed to accept invitation' };
  }
}

export async function getOrganizationInvitations(organizationId: string, userId: string) {
  try {
    const supabaseAdmin = getSupabaseAdmin();

    // Verify user is admin
    const { data: membership } = await supabaseAdmin
      .from('memberships')
      .select('role')
      .eq('user_id', userId)
      .eq('organization_id', organizationId)
      .single();

    if (!membership || (membership.role !== 'admin' && membership.role !== 'owner')) {
      return { success: false, error: 'Unauthorized' };
    }

    const { data: invitations, error } = await supabaseAdmin
      .from('invitations')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return { success: true, invitations };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
