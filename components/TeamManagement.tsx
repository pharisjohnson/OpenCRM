"use client";

import React, { useState, useEffect } from 'react';
import { Plus, Mail, Trash2, Shield, User as UserIcon, Clock, CheckCircle } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { useSubscription } from '@/hooks/useSubscription';
import { inviteUserToOrganization, getOrganizationInvitations } from '@/app/actions/inviteActions';
import { supabase } from '@/lib/supabaseClient';
import { Invitation } from '@/types';

export const TeamManagement: React.FC = () => {
  const { currentUser, currentOrganization, organizations } = useUser();
  const { status } = useSubscription();
  const [members, setMembers] = useState<any[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'member'>('member');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const isAdmin = currentUser.role === 'admin' || currentUser.role === 'owner' as any;

  useEffect(() => {
    loadTeamData();
  }, [currentOrganization]);

  const loadTeamData = async () => {
    if (!currentOrganization) return;

    try {
      // Load members
      const { data: membershipsData, error: membersError } = await supabase
        .from('memberships')
        .select(`
          id,
          role,
          created_at,
          profiles (id, full_name, avatar_url)
        `)
        .eq('organization_id', currentOrganization.id);

      if (membersError) throw membersError;
      setMembers(membershipsData || []);

      // Load pending invitations (admin only)
      if (isAdmin) {
        const result = await getOrganizationInvitations(currentOrganization.id, currentUser.id);
        if (result.success && result.invitations) {
          setInvitations(result.invitations);
        }
      }
    } catch (err: any) {
      console.error('Error loading team:', err);
    }
  };

  const handleInvite = async () => {
    if (!inviteEmail.trim()) {
      setError('Please enter an email address');
      return;
    }

    if (!isAdmin) {
      setError('Only admins can invite new members');
      return;
    }

    if (!status.canAddMembers) {
      setError(`Team limit reached (${status.currentMemberCount}/${status.maxMembers}). Upgrade your plan to add more members.`);
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await inviteUserToOrganization({
        organizationId: currentOrganization!.id,
        email: inviteEmail,
        role: inviteRole,
        invitedBy: currentUser.id
      });

      if (result.success) {
        setSuccess(`Invitation sent to ${inviteEmail}!`);
        setInviteEmail('');
        setInviteRole('member');
        setIsInviteModalOpen(false);
        loadTeamData();
        
        // Show invite URL (in production, this would be sent via email)
        if (result.inviteUrl) {
          alert(`Invitation link (send this via email):\n${result.inviteUrl}`);
        }
      } else {
        setError(result.error || 'Failed to send invitation');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Team Members</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {status.currentMemberCount} / {status.maxMembers === 999 ? 'Unlimited' : status.maxMembers} members
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setIsInviteModalOpen(true)}
            disabled={!status.canAddMembers}
            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            title={!status.canAddMembers ? 'Team limit reached' : 'Invite new member'}
          >
            <Plus size={16} />
            Invite Member
          </button>
        )}
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900 text-green-700 dark:text-green-400 px-4 py-3 rounded-lg text-sm">
          {success}
        </div>
      )}

      {/* Current Members */}
      <div className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 dark:bg-dark-bg text-gray-600 dark:text-gray-400 font-medium">
            <tr>
              <th className="px-6 py-3">Member</th>
              <th className="px-6 py-3">Role</th>
              <th className="px-6 py-3">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-dark-border">
            {members.map((member: any) => (
              <tr key={member.id} className="hover:bg-gray-50 dark:hover:bg-dark-border/50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    {member.profiles?.avatar_url ? (
                      <img src={member.profiles.avatar_url} alt="" className="w-9 h-9 rounded-full" />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-primary-100 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 flex items-center justify-center font-bold text-sm">
                        {member.profiles?.full_name?.charAt(0) || 'U'}
                      </div>
                    )}
                    <span className="font-medium text-gray-900 dark:text-white">
                      {member.profiles?.full_name || 'Unknown User'}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    member.role === 'admin' || member.role === 'owner'
                      ? 'bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400'
                      : 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                  }`}>
                    {member.role === 'admin' || member.role === 'owner' ? <Shield size={12} /> : <UserIcon size={12} />}
                    {member.role.toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                  {new Date(member.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pending Invitations (Admin only) */}
      {isAdmin && invitations.length > 0 && (
        <div className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-xl overflow-hidden">
          <div className="px-6 py-3 bg-gray-50 dark:bg-dark-bg border-b border-gray-200 dark:border-dark-border">
            <h4 className="font-medium text-gray-900 dark:text-white text-sm">Pending Invitations</h4>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-dark-border">
            {invitations.filter(inv => inv.status === 'pending').map((inv) => (
              <div key={inv.id} className="px-6 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-dark-border/50">
                <div className="flex items-center gap-3">
                  <Mail size={16} className="text-gray-400" />
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{inv.email}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Invited {new Date(inv.created_at).toLocaleDateString()} • Expires {new Date(inv.expires_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  inv.role === 'admin'
                    ? 'bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400'
                    : 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                }`}>
                  <Clock size={12} />
                  Pending ({inv.role})
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Invite Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-dark-surface rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Invite Team Member</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="colleague@company.com"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-bg rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as 'admin' | 'member')}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-bg rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
                >
                  <option value="member">Member - Can view and edit data</option>
                  <option value="admin">Admin - Full access including settings</option>
                </select>
              </div>

              <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-dark-bg p-3 rounded-lg">
                💡 The invitation link will be valid for 7 days. They'll need to create an account or sign in to accept.
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setIsInviteModalOpen(false);
                  setError('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-dark-border text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-border transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleInvite}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send Invite'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
