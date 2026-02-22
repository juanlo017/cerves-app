import { supabase } from '@/lib/supabase';

export interface Consumption {
  id: string;
  player_id: string;
  drink_id: string;
  qty: number;
  consumed_at: string;
  day: string;
  group_id?: string | null;
  eur_spent?: number | null;
  created_at: string;
}

export interface ConsumptionWithDrink extends Consumption {
  drinks: {
    id: string;
    name: string;
    category: string;
    liters_per_unit: number;
    kcal_per_unit: number;
  };
}

export const consumptionsApi = {
  /**
   * Get all consumptions for a player (optionally filter by group via join table)
   */
  async getByPlayerId(
    playerId: string,
    groupId?: string | null
  ): Promise<ConsumptionWithDrink[]> {
    // When filtering by a specific group, use the join table
    if (groupId && groupId !== null) {
      const { data, error } = await supabase
        .from('consumption_groups')
        .select(`
          consumptions!inner (
            *,
            drinks (
              id,
              name,
              category,
              liters_per_unit,
              kcal_per_unit
            )
          )
        `)
        .eq('group_id', groupId)
        .eq('consumptions.player_id', playerId)
        .order('consumptions(consumed_at)', { ascending: false });

      if (error) {
        console.error('Error fetching consumptions by group:', error);
        return [];
      }

      return (data || []).map((row: any) => row.consumptions);
    }

    // Personal or all consumptions
    let query = supabase
      .from('consumptions')
      .select(`
        *,
        drinks (
          id,
          name,
          category,
          liters_per_unit,
          kcal_per_unit
        )
      `)
      .eq('player_id', playerId);

    if (groupId === null) {
      query = query.is('group_id', null);
    }

    const { data, error } = await query.order('consumed_at', { ascending: false });

    if (error) {
      console.error('Error fetching consumptions:', error);
      return [];
    }

    return data || [];
  },

  /**
   * Get consumptions for a specific day
   */
  async getByDay(
    playerId: string,
    day: string,
    groupId?: string | null
  ): Promise<ConsumptionWithDrink[]> {
    // When filtering by a specific group, use the join table
    if (groupId && groupId !== null) {
      const { data, error } = await supabase
        .from('consumption_groups')
        .select(`
          consumptions!inner (
            *,
            drinks (
              id,
              name,
              category,
              liters_per_unit,
              kcal_per_unit
            )
          )
        `)
        .eq('group_id', groupId)
        .eq('consumptions.player_id', playerId)
        .eq('consumptions.day', day)
        .order('consumptions(consumed_at)', { ascending: false });

      if (error) {
        console.error('Error fetching consumptions by day+group:', error);
        return [];
      }

      return (data || []).map((row: any) => row.consumptions);
    }

    let query = supabase
      .from('consumptions')
      .select(`
        *,
        drinks (
          id,
          name,
          category,
          liters_per_unit,
          kcal_per_unit
        )
      `)
      .eq('player_id', playerId)
      .eq('day', day);

    if (groupId === null) {
      query = query.is('group_id', null);
    }

    const { data, error } = await query.order('consumed_at', { ascending: false });

    if (error) {
      console.error('Error fetching consumptions by day:', error);
      return [];
    }

    return data || [];
  },

  /**
   * Get all consumptions for a group via join table
   */
  async getByGroupId(groupId: string): Promise<ConsumptionWithDrink[]> {
    const { data, error } = await supabase
      .from('consumption_groups')
      .select(`
        consumptions!inner (
          *,
          drinks (
            id,
            name,
            category,
            liters_per_unit,
            kcal_per_unit
          )
        )
      `)
      .eq('group_id', groupId)
      .order('consumptions(consumed_at)', { ascending: false });

    if (error) {
      console.error('Error fetching group consumptions:', error);
      return [];
    }

    return (data || []).map((row: any) => row.consumptions);
  },

  /**
   * Create a new consumption and optionally link it to groups
   */
  async create(
    playerId: string,
    drinkId: string,
    qty: number,
    eurSpent: number,
    consumedAt?: string,
    groupIds?: string[] | null
  ): Promise<Consumption> {
    const timestamp = consumedAt || new Date().toISOString();
    const day = timestamp.split('T')[0];

    // Always create ONE consumption row with group_id null
    const { data, error } = await supabase
      .from('consumptions')
      .insert({
        player_id: playerId,
        drink_id: drinkId,
        qty,
        eur_spent: eurSpent,
        consumed_at: timestamp,
        day,
        group_id: null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating consumption:', error);
      throw new Error('Failed to create consumption');
    }

    // Link to groups via join table
    if (groupIds && groupIds.length > 0) {
      const { error: linkError } = await supabase
        .from('consumption_groups')
        .insert(
          groupIds.map(gId => ({
            consumption_id: data.id,
            group_id: gId,
          }))
        );

      if (linkError) {
        console.error('Error linking consumption to groups:', linkError);
        // Consumption was created, just the group links failed
      }
    }

    return data;
  },

  /**
   * Update a consumption
   */
  async update(
    consumptionId: string,
    updates: Partial<Pick<Consumption, 'qty' | 'consumed_at' | 'group_id'>>
  ): Promise<Consumption> {
    const { data, error } = await supabase
      .from('consumptions')
      .update(updates)
      .eq('id', consumptionId)
      .select()
      .single();

    if (error) {
      console.error('Error updating consumption:', error);
      throw new Error('Failed to update consumption');
    }

    return data;
  },

  /**
   * Delete a consumption (cascade will remove consumption_groups entries)
   */
  async delete(consumptionId: string): Promise<void> {
    const { error } = await supabase
      .from('consumptions')
      .delete()
      .eq('id', consumptionId);

    if (error) {
      console.error('Error deleting consumption:', error);
      throw new Error('Failed to delete consumption');
    }
  },

  /**
   * Get player stats (total drinks, liters, calories, euros spent)
   */
  async getPlayerStats(playerId: string, groupId?: string | null) {
      // When filtering by a specific group, use the join table
      if (groupId && groupId !== null) {
        const { data, error } = await supabase
          .from('consumption_groups')
          .select(`
            consumptions!inner (
              qty,
              eur_spent,
              player_id,
              drinks (
                liters_per_unit,
                kcal_per_unit
              )
            )
          `)
          .eq('group_id', groupId)
          .eq('consumptions.player_id', playerId);

        if (error) {
          console.error('Error fetching player stats by group:', error);
          return { totalDrinks: 0, totalLiters: 0, totalCalories: 0, totalSpent: 0 };
        }

        return (data || []).reduce(
          (acc, row: any) => {
            const c = row.consumptions;
            const drink = c.drinks;
            return {
              totalDrinks: acc.totalDrinks + c.qty,
              totalLiters: acc.totalLiters + (c.qty * drink.liters_per_unit),
              totalCalories: acc.totalCalories + (c.qty * drink.kcal_per_unit),
              totalSpent: acc.totalSpent + (c.eur_spent || 0),
            };
          },
          { totalDrinks: 0, totalLiters: 0, totalCalories: 0, totalSpent: 0 }
        );
      }

      let query = supabase
        .from('consumptions')
        .select(`
          qty,
          eur_spent,
          drinks (
            liters_per_unit,
            kcal_per_unit
          )
        `)
        .eq('player_id', playerId);

      if (groupId === null) {
        query = query.is('group_id', null);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching player stats:', error);
        return {
          totalDrinks: 0,
          totalLiters: 0,
          totalCalories: 0,
          totalSpent: 0,
        };
      }

      const stats = data.reduce(
        (acc, consumption: any) => {
          const drink = consumption.drinks;
          return {
            totalDrinks: acc.totalDrinks + consumption.qty,
            totalLiters: acc.totalLiters + (consumption.qty * drink.liters_per_unit),
            totalCalories: acc.totalCalories + (consumption.qty * drink.kcal_per_unit),
            totalSpent: acc.totalSpent + (consumption.eur_spent || 0),
          };
        },
        { totalDrinks: 0, totalLiters: 0, totalCalories: 0, totalSpent: 0 }
      );

      return stats;
    },
};
