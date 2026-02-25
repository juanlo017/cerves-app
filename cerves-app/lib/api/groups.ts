import { supabase } from '@/lib/supabase';

export interface Group {
  id: string;
  code: string;
  name: string;
  created_at: string;
}

export interface GroupMember {
  id: string;
  group_id: string;
  user_id: string;
  role: string;
  joined_at: string;
}

export interface GroupMemberWithPlayer extends GroupMember {
  players: {
    id: string;
    display_name: string;
    avatar_key: string;
  };
}

export interface GroupLeaderboardEntry {
  player_id: string;
  display_name: string;
  avatar_key: string;
  total_drinks: number;
  total_liters: number;
  total_calories: number;
  total_spent: number;
  rank: number;
}

export const groupsApi = {
  /**
   * Get group by code
   */
  async getByCode(code: string): Promise<Group | null> {
    const { data, error } = await supabase
      .from('groups')
      .select('*')
      .eq('code', code.toUpperCase())
      .single();

    if (error) {
      console.error('Error fetching group by code:', error);
      return null;
    }

    return data;
  },

  /**
   * Get group by ID
   */
  async getById(groupId: string): Promise<Group | null> {
    const { data, error } = await supabase
      .from('groups')
      .select('*')
      .eq('id', groupId)
      .single();

    if (error) {
      console.error('Error fetching group:', error);
      return null;
    }

    return data;
  },

  /**
   * Create a new group and add creator as leader
   */
  async create(name: string, creatorUserId: string, code?: string): Promise<Group> {
    const groupCode = code || generateGroupCode();

    const { data, error } = await supabase
      .from('groups')
      .insert({
        name,
        code: groupCode.toUpperCase()
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating group:', error);
      throw new Error('Failed to create group');
    }

    // Add creator as leader
    await this.addMember(data.id, creatorUserId, 'leader');

    return data;
  },

  /**
   * Update group details
   */
  async update(
    groupId: string,
    updates: Partial<Pick<Group, 'name' | 'code'>>
  ): Promise<Group> {
    const { data, error } = await supabase
      .from('groups')
      .update(updates)
      .eq('id', groupId)
      .select()
      .single();

    if (error) {
      console.error('Error updating group:', error);
      throw new Error('Failed to update group');
    }

    return data;
  },

  /**
   * Delete a group and remove all its members.
   * Consumptions are preserved — only consumption_groups entries are cascade-deleted by the DB.
   */
  async delete(groupId: string): Promise<void> {
    // Remove all members first (group_members may not have ON DELETE CASCADE)
    const { error: membersError } = await supabase
      .from('group_members')
      .delete()
      .eq('group_id', groupId);

    if (membersError) {
      console.error('Error removing group members:', membersError);
      throw new Error('Failed to remove group members');
    }

    const { error } = await supabase
      .from('groups')
      .delete()
      .eq('id', groupId);

    if (error) {
      console.error('Error deleting group:', error);
      throw new Error('Failed to delete group');
    }
  },

  /**
   * Add member to group
   */
  async addMember(
    groupId: string,
    userId: string,
    role: string = 'member'
  ): Promise<GroupMember> {
    const { data, error } = await supabase
      .from('group_members')
      .insert({
        group_id: groupId,
        user_id: userId,
        role,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding group member:', error);
      throw new Error('Failed to add group member');
    }

    return data;
  },

  /**
   * Remove member from group
   */
  async removeMember(groupId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('group_members')
      .delete()
      .eq('group_id', groupId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error removing group member:', error);
      throw new Error('Failed to remove group member');
    }
  },

  /**
   * Get all members of a group with player info
   */
  async getMembers(groupId: string): Promise<GroupMemberWithPlayer[]> {
    // Step 1: Get group members
    const { data: members, error: membersError } = await supabase
      .from('group_members')
      .select('*')
      .eq('group_id', groupId);

    if (membersError || !members || members.length === 0) {
      if (membersError) console.error('Error fetching group members:', membersError);
      return [];
    }

    // Step 2: Get player info for each member's user_id
    const userIds = members.map(m => m.user_id);
    const { data: players, error: playersError } = await supabase
      .from('players')
      .select('id, user_id, display_name, avatar_key')
      .in('user_id', userIds);

    if (playersError) {
      console.error('Error fetching players for group:', playersError);
      return [];
    }

    // Step 3: Merge members with player info
    const playerMap = new Map(
      (players || []).map(p => [p.user_id, p])
    );

    return members
      .filter(m => playerMap.has(m.user_id))
      .map(m => ({
        ...m,
        players: playerMap.get(m.user_id)!,
      })) as GroupMemberWithPlayer[];
  },

  /**
   * Get a member's role in a group
   */
  async getMemberRole(groupId: string, userId: string): Promise<string | null> {
    const { data, error } = await supabase
      .from('group_members')
      .select('role')
      .eq('group_id', groupId)
      .eq('user_id', userId)
      .single();

    if (error) return null;
    return data?.role || null;
  },

  /**
   * Check if a user is a member of a group
   */
  async isMember(groupId: string, userId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('group_members')
      .select('id')
      .eq('group_id', groupId)
      .eq('user_id', userId)
      .single();

    return !error && !!data;
  },

  /**
   * Join a group by its code
   */
  async joinByCode(code: string, userId: string): Promise<Group> {
    const group = await this.getByCode(code);
    if (!group) {
      throw new Error('Grupo no encontrado');
    }

    const alreadyMember = await this.isMember(group.id, userId);
    if (alreadyMember) {
      throw new Error('Ya eres miembro de este grupo');
    }

    await this.addMember(group.id, userId, 'member');
    return group;
  },

  /**
   * Get group leaderboard - uses consumption_groups join table
   * Only counts consumptions explicitly tagged for this group
   */
  async getLeaderboard(
    groupId: string,
    periodStart?: string,
    periodEnd?: string
  ): Promise<GroupLeaderboardEntry[]> {
    // Step 1: Get all members with their player info
    const members = await this.getMembers(groupId);
    if (members.length === 0) return [];

    const playerIds = members.map(m => m.players.id);

    // Step 2: Query consumptions linked to this group via join table
    let query = supabase
      .from('consumption_groups')
      .select(`
        consumptions!inner (
          player_id,
          qty,
          day,
          eur_spent,
          drinks (
            liters_per_unit,
            kcal_per_unit
          )
        )
      `)
      .eq('group_id', groupId)
      .in('consumptions.player_id', playerIds);

    if (periodStart) query = query.gte('consumptions.day', periodStart);
    if (periodEnd) query = query.lte('consumptions.day', periodEnd);

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching group leaderboard:', error);
      return [];
    }

    // Step 3: Aggregate per player
    const playerStats: Record<string, GroupLeaderboardEntry> = {};

    // Initialize all members (even those with 0 consumption)
    for (const member of members) {
      const playerId = member.players.id;
      playerStats[playerId] = {
        player_id: playerId,
        display_name: member.players.display_name,
        avatar_key: member.players.avatar_key,
        total_drinks: 0,
        total_liters: 0,
        total_calories: 0,
        total_spent: 0,
        rank: 0,
      };
    }

    for (const row of (data || [])) {
      const consumption = (row as any).consumptions;
      const drink = consumption.drinks;
      const stats = playerStats[consumption.player_id];
      if (!stats) continue;

      stats.total_drinks += consumption.qty;
      stats.total_liters += consumption.qty * drink.liters_per_unit;
      stats.total_calories += consumption.qty * drink.kcal_per_unit;
      stats.total_spent += consumption.eur_spent || 0;
    }

    // Step 4: Sort by total_liters and assign ranks
    const leaderboard = Object.values(playerStats)
      .sort((a, b) => b.total_liters - a.total_liters);

    leaderboard.forEach((entry, index) => {
      entry.rank = index + 1;
    });

    return leaderboard;
  },
};

/**
 * Generate a random group code
 */
function generateGroupCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}
