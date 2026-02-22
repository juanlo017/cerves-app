import { supabase } from '@/lib/supabase';
import { groupsApi } from './groups';

export interface Invitation {
  id: string;
  group_id: string;
  invited_by: string;
  invited_user_id: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  created_at: string;
  responded_at: string | null;
}

export interface InvitationWithDetails extends Invitation {
  groups: {
    id: string;
    name: string;
    code: string;
  };
  inviter_player: {
    display_name: string;
    avatar_key: string;
  } | null;
}

export const invitationsApi = {
  /**
   * Send an invitation to a player
   */
  async create(
    groupId: string,
    invitedByUserId: string,
    invitedUserId: string
  ): Promise<Invitation> {
    const { data, error } = await supabase
      .from('invitations')
      .insert({
        group_id: groupId,
        invited_by: invitedByUserId,
        invited_user_id: invitedUserId,
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating invitation:', error);
      throw new Error('Failed to create invitation');
    }

    return data;
  },

  /**
   * Get pending invitations for a user (inbox)
   */
  async getPendingForUser(userId: string): Promise<InvitationWithDetails[]> {
    // Get invitations with group info
    const { data: invitations, error } = await supabase
      .from('invitations')
      .select(`
        *,
        groups (
          id,
          name,
          code
        )
      `)
      .eq('invited_user_id', userId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching pending invitations:', error);
      return [];
    }

    if (!invitations || invitations.length === 0) return [];

    // Get inviter player info separately (invited_by is a user_id, not player_id)
    const inviterUserIds = [...new Set(invitations.map(i => i.invited_by))];
    const { data: inviters } = await supabase
      .from('players')
      .select('user_id, display_name, avatar_key')
      .in('user_id', inviterUserIds);

    const inviterMap = new Map(
      (inviters || []).map(p => [p.user_id, { display_name: p.display_name, avatar_key: p.avatar_key }])
    );

    return invitations.map(inv => ({
      ...inv,
      inviter_player: inviterMap.get(inv.invited_by) || null,
    }));
  },

  /**
   * Accept an invitation
   */
  async accept(invitationId: string, userId: string): Promise<void> {
    // Get the invitation to know which group
    const { data: invitation, error: fetchError } = await supabase
      .from('invitations')
      .select('group_id')
      .eq('id', invitationId)
      .eq('invited_user_id', userId)
      .eq('status', 'pending')
      .single();

    if (fetchError || !invitation) {
      console.error('Error fetching invitation:', fetchError);
      throw new Error('Invitation not found or already responded');
    }

    // Update invitation status
    const { error: updateError } = await supabase
      .from('invitations')
      .update({
        status: 'accepted',
        responded_at: new Date().toISOString(),
      })
      .eq('id', invitationId);

    if (updateError) {
      console.error('Error accepting invitation:', updateError);
      throw new Error('Failed to accept invitation');
    }

    // Add user to the group
    await groupsApi.addMember(invitation.group_id, userId, 'member');
  },

  /**
   * Decline an invitation
   */
  async decline(invitationId: string): Promise<void> {
    const { error } = await supabase
      .from('invitations')
      .update({
        status: 'declined',
        responded_at: new Date().toISOString(),
      })
      .eq('id', invitationId);

    if (error) {
      console.error('Error declining invitation:', error);
      throw new Error('Failed to decline invitation');
    }
  },

  /**
   * Get count of pending invitations (for badge)
   */
  async getPendingCount(userId: string): Promise<number> {
    const { count, error } = await supabase
      .from('invitations')
      .select('id', { count: 'exact', head: true })
      .eq('invited_user_id', userId)
      .eq('status', 'pending');

    if (error) {
      console.error('Error fetching invitation count:', error);
      return 0;
    }

    return count || 0;
  },

  /**
   * Search players by display name (for invite-by-name)
   */
  async searchPlayers(
    query: string,
    excludeUserIds: string[] = []
  ): Promise<Array<{ id: string; user_id: string; display_name: string; avatar_key: string }>> {
    let dbQuery = supabase
      .from('players')
      .select('id, user_id, display_name, avatar_key')
      .ilike('display_name', `%${query}%`)
      .limit(10);

    if (excludeUserIds.length > 0) {
      // Filter out users already in the group or already invited
      dbQuery = dbQuery.not('user_id', 'in', `(${excludeUserIds.join(',')})`);
    }

    const { data, error } = await dbQuery;

    if (error) {
      console.error('Error searching players:', error);
      return [];
    }

    return data || [];
  },
};
