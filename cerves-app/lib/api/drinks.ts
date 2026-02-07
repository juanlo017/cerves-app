import { supabase } from '@/lib/supabase';

export interface Drink {
  id: string;
  name: string;
  category: string;
  liters_per_unit: number;
  kcal_per_unit: number;
  eur_per_unit: number;
  is_active: boolean;
  created_at: string;
}

export const drinksApi = {
  /**
   * Get all active drinks
   */
  async getActive(): Promise<Drink[]> {
    const { data, error } = await supabase
      .from('drinks')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) {
      console.error('Error fetching drinks:', error);
      return [];
    }

    return data || [];
  },

  /**
   * Get all drinks (including inactive)
   */
  async getAll(): Promise<Drink[]> {
    const { data, error } = await supabase
      .from('drinks')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching all drinks:', error);
      return [];
    }

    return data || [];
  },

  /**
   * Get drinks by category
   */
  async getByCategory(category: string): Promise<Drink[]> {
    const { data, error } = await supabase
      .from('drinks')
      .select('*')
      .eq('category', category)
      .eq('is_active', true)
      .order('name');

    if (error) {
      console.error('Error fetching drinks by category:', error);
      return [];
    }

    return data || [];
  },

  /**
   * Get drink by ID
   */
  async getById(drinkId: string): Promise<Drink | null> {
    const { data, error } = await supabase
      .from('drinks')
      .select('*')
      .eq('id', drinkId)
      .single();

    if (error) {
      console.error('Error fetching drink:', error);
      return null;
    }

    return data;
  },

  /**
   * Create a new drink
   */
  async create(drink: Omit<Drink, 'id' | 'created_at'>): Promise<Drink> {
    const { data, error } = await supabase
      .from('drinks')
      .insert(drink)
      .select()
      .single();

    if (error) {
      console.error('Error creating drink:', error);
      throw new Error('Failed to create drink');
    }

    return data;
  },

  /**
   * Update a drink
   */
  async update(
    drinkId: string, 
    updates: Partial<Omit<Drink, 'id' | 'created_at'>>
  ): Promise<Drink> {
    const { data, error } = await supabase
      .from('drinks')
      .update(updates)
      .eq('id', drinkId)
      .select()
      .single();

    if (error) {
      console.error('Error updating drink:', error);
      throw new Error('Failed to update drink');
    }

    return data;
  },

  /**
   * Deactivate a drink (soft delete)
   */
  async deactivate(drinkId: string): Promise<void> {
    const { error } = await supabase
      .from('drinks')
      .update({ is_active: false })
      .eq('id', drinkId);

    if (error) {
      console.error('Error deactivating drink:', error);
      throw new Error('Failed to deactivate drink');
    }
  },

  /**
   * Delete a drink permanently
   */
  async delete(drinkId: string): Promise<void> {
    const { error } = await supabase
      .from('drinks')
      .delete()
      .eq('id', drinkId);

    if (error) {
      console.error('Error deleting drink:', error);
      throw new Error('Failed to delete drink');
    }
  },
};