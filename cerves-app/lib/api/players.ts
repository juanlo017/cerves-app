import { supabase } from '@/lib/supabase';

export interface Player {
  id: string;
  user_id: string;
  display_name: string;
  avatar_key: string;
  created_at: string;
  updated_at: string;
}

export const playersApi = {
  /**
   * Get a player by their user_id (device_id)
   */
  async getByUserId(userId: string): Promise<Player | null> {
    try {
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .eq('user_id', userId)
        .single();
      return data;
    } catch (error) {
      console.error('Error fetching player by user_id:', error);
      return null;
    }    
  },

  /**
   * Get a player by their ID
   */
  async getById(playerId: string): Promise<Player | null> {
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .eq('id', playerId)
      .single();

    if (error) {
      console.error('Error fetching player by id:', error);
      return null;
    }

    return data;
  },

  /**
   * Create a new player
   */
  async create(userId: string, displayName: string, avatarKey: string): Promise<Player> {
    const { data, error } = await supabase
      .from('players')
      .insert({
        user_id: userId,
        display_name: displayName,
        avatar_key: avatarKey,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating player:', error);
      throw new Error('Failed to create player');
    }

    return data;
  },

  /**
   * Update player profile
   */
  async update(
    playerId: string, 
    updates: Partial<Pick<Player, 'display_name' | 'avatar_key'>>
  ): Promise<Player> {
    const { data, error } = await supabase
      .from('players')
      .update(updates)
      .eq('id', playerId)
      .select()
      .single();

    if (error) {
      console.error('Error updating player:', error);
      throw new Error('Failed to update player');
    }

    return data;
  },

  /**
   * Delete a player
   */
  async delete(playerId: string): Promise<void> {
    const { error } = await supabase
      .from('players')
      .delete()
      .eq('id', playerId);

    if (error) {
      console.error('Error deleting player:', error);
      throw new Error('Failed to delete player');
    }
  },

  /**
   * Get all groups a player is a member of
   */
  async getGroups(playerId: string): Promise<any[]> {
    const { data: player } = await supabase
      .from('players')
      .select('user_id')
      .eq('id', playerId)
      .single();

    if (!player) return [];

    const { data, error } = await supabase
      .from('group_members')
      .select(`
        *,
        groups (
          id,
          code,
          name,
          created_at
        )
      `)
      .eq('user_id', player.user_id);

    if (error) {
      console.error('Error fetching player groups:', error);
      return [];
    }

    return data || [];
  },
};