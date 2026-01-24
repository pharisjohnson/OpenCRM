"use server";

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Server-side Supabase client with service role for admin operations
const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

interface InviteUserParams {
  organizationId: string;
  email: string;
  role: 'admin' | 'member';
  invitedBy: string;
}

export async function inviteUserToOrganization(params: InviteUserParams) {
  const { organizationId, email, role, invitedBy } = params;

  try {
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
      .select('max_team_members, subscription_plan')
      .eq('id', organizationId)
      .single();

    if (orgError) {
      return { success: false, error: 'Organization not found' };
    }

    // Count current members
    const { count, error: countError } = await supabaseAdmin
      .from('memberships')
      .select('id', { count: 'exact', head: true })
      .eq('organization_id', organizationId);

    if (countError) {
      return { success: false, error: 'Failed to check team size' };
    }

    if (org.subscription_plan !== 'enterprise' && count && count >= (org.max_team_members || 5)) {
      return { 
        success: false, 
        error: `Team limit reached. Upgrade your plan to add more members.` 
      };
    }

    // 3. Check if user already exists
    const { data: existingUser } = await supabaseAdmin
      .from('memberships')
      .select('id')
      .eq('organization_id', organizationId)
      .eq('user_id', email); // This would need to lookup by email

    if (existingUser && existingUser.length > 0) {
      return { success: false, error: 'User is already a member of this organization' };
    }

    // 4. Create invitation token
    const token = `inv_${Math.random().toString(36).substring(2, 15)}${Date.now()}`;
    
    const { data: invitation, error: inviteError } = await supabaseAdmin
      .from('invitations')
      .insert({
        organization_id: organizationId,
        invited_by: invitedBy,
        email: email,
        role: role,
        token: token,
        status: 'pending'
      })
      .select()
      .single();

    if (inviteError) {
      if (inviteError.code === '23505') { // Unique constraint violation
        return { success: false, error: 'An invitation for this email already exists' };
      }
      return { success: false, error: inviteError.message };
    }

    // 5. TODO: Send email with invitation link
    const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/accept-invite?token=${token}`;
    
    // For now, return the URL (in production, send via email)
    return { 
      success: true, 
      inviteUrl,
      message: 'Invitation created successfully'
    };

  } catch (error: any) {
    console.error('Invite error:', error);
    return { success: false, error: error.message || 'Failed to send invitation' };
  }
}

export async function acceptInvitation(token: string, userId: string) {
  try {
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
