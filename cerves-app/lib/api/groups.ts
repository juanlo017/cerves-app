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
   * Create a new group
   */
  async create(name: string, code?: string): Promise<Group> {
    // Generate random code if not provided
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
   * Delete a group
   */
  async delete(groupId: string): Promise<void> {
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
   * Get all members of a group
   */
  async getMembers(groupId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('group_members')
      .select(`
        *,
        players!inner (
          id,
          display_name,
          avatar_key
        )
      `)
      .eq('group_id', groupId);

    if (error) {
      console.error('Error fetching group members:', error);
      return [];
    }

    return data || [];
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
   * Get group leaderboard
   */
  async getLeaderboard(groupId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('consumptions')
      .select(`
        player_id,
        qty,
        drinks (
          liters_per_unit,
          kcal_per_unit,
          eur_per_unit
        ),
        players (
          id,
          display_name,
          avatar_key
        )
      `)
      .eq('group_id', groupId);

    if (error) {
      console.error('Error fetching group leaderboard:', error);
      return [];
    }

    // Aggregate stats per player
    const playerStats = data.reduce((acc: any, consumption: any) => {
      const playerId = consumption.player_id;
      const drink = consumption.drinks;
      const player = consumption.players;

      if (!acc[playerId]) {
        acc[playerId] = {
          player_id: playerId,
          display_name: player.display_name,
          avatar_key: player.avatar_key,
          total_drinks: 0,
          total_liters: 0,
          total_calories: 0,
          total_spent: 0,
        };
      }

      acc[playerId].total_drinks += consumption.qty;
      acc[playerId].total_liters += consumption.qty * drink.liters_per_unit;
      acc[playerId].total_calories += consumption.qty * drink.kcal_per_unit;
      acc[playerId].total_spent += consumption.qty * drink.eur_per_unit;

      return acc;
    }, {});

    // Convert to array and sort by total_drinks
    return Object.values(playerStats).sort(
      (a: any, b: any) => b.total_drinks - a.total_drinks
    );
  },
};

/**
 * Generate a random group code (e.g., "PARTY2024")
 */
function generateGroupCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed confusing chars
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}