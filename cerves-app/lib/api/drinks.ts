import { supabase } from '@/lib/supabase';

export interface Drink {
  id: string;
  name: string;
  category: string;
  liters_per_unit: number;
  kcal_per_unit: number;
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

  async getByCategory(category: string): Promise<Drink[]> {
    // TODO: Replace with real Supabase query
    // const { data, error } = await supabase
    //   .from('drinks')
    //   .select('*')
    //   .eq('category', category)
    //   .eq('is_active', true)
    //   .order('name');
    
    // Dummy data for now
    const allDrinks = {
      cerveza: [
        { id: '1', name: 'Estrella Galicia', category: 'cerveza', liters_per_unit: 0.33, kcal_per_unit: 142, is_active: true, created_at: '' },
        { id: '2', name: 'Mahou', category: 'cerveza', liters_per_unit: 0.33, kcal_per_unit: 139, is_active: true, created_at: '' },
        { id: '3', name: 'Cruzcampo', category: 'cerveza', liters_per_unit: 0.33, kcal_per_unit: 140, is_active: true, created_at: '' },
      ],
      vino: [
        { id: '4', name: 'Tinto Copa', category: 'vino', liters_per_unit: 0.15, kcal_per_unit: 125, is_active: true, created_at: '' },
        { id: '5', name: 'Blanco Copa', category: 'vino', liters_per_unit: 0.15, kcal_per_unit: 121, is_active: true, created_at: '' },
        { id: '6', name: 'Rosado Copa', category: 'vino', liters_per_unit: 0.15, kcal_per_unit: 120, is_active: true, created_at: '' },
      ],
      alta_graduación: [
        { id: '7', name: 'Gin Tonic', category: 'alta_graduación', liters_per_unit: 0.25, kcal_per_unit: 200, is_active: true, created_at: '' },
        { id: '8', name: 'Mojito', category: 'alta_graduación', liters_per_unit: 0.30, kcal_per_unit: 217, is_active: true, created_at: '' },
        { id: '9', name: 'Margarita', category: 'alta_graduación', liters_per_unit: 0.20, kcal_per_unit: 168, is_active: true, created_at: '' },
      ],
    };
    
    return allDrinks[category.toLowerCase() as keyof typeof allDrinks] || [];
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