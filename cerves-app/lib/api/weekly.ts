import { supabase } from '@/lib/supabase';

export interface DailyConsumption {
  day: string; // "Monday", "Tuesday", etc.
  dayShort: string; // "LUN", "MAR", etc.
  date: string; // "2024-02-05"
  liters: number; // 0.5
  drinks: number; // 2
  fillState: 'empty' | 'quarter' | 'half' | 'full' | 'overflow';
}


  export interface WeeklyStats {
    weekRange: {
      start: string; // "2024-02-05"
      end: string; // "2024-02-11"
      display: string; // "5 - 11 FEB"
    };
    weeklyGoal: number; // 8.0 (liters)
    currentProgress: number; // 1.7 (liters)
    percentageComplete: number; // 21
    
    dailyConsumption: DailyConsumption[];
    
    weekStats: {
      totalDrinks: number;
      totalSpent: number;
      totalCalories: number;
      favoriteDrink: string | null;
    };
    
    streak: number; // consecutive days logging

  }

  export interface MonthlyData {
    monthRange: {
      month: number; // 0-11
      year: number;
      display: string; // "FEBRERO 2024"
    };
    days: {
      day: number | null; // null for empty cells
      date: string | null; // "2024-02-15" or null
      liters: number;
      fillState: 'empty' | 'quarter' | 'half' | 'full' | 'overflow';
    }[];
    monthStats: {
      totalDrinks: number;
      totalLiters: number;
      totalSpent: number;
      totalCalories: number;
      daysActive: number;
    };
  }


export const weeklyApi = {
  /**
   * Get weekly stats for a player
   * @param playerId - Player UUID
   * @param weekOffset - 0 = current week, -1 = last week, 1 = next week
   */
  async getWeeklyStats(playerId: string, weekOffset: number = 0): Promise<WeeklyStats> {
    const weekStart = getWeekStart(new Date(), weekOffset);
    const weekEnd = getWeekEnd(weekStart);
    
    // Fetch consumptions for the week
    const { data: consumptions, error } = await supabase
      .from('consumptions')
      .select(`
        *,
        drinks (
          liters_per_unit,
          kcal_per_unit,
          name
        )
      `)
      .eq('player_id', playerId)
      .gte('day', formatDate(weekStart))
      .lte('day', formatDate(weekEnd))
      .is('group_id', null); // Only personal consumptions

    if (error) {
      console.error('Error fetching weekly stats:', error);
    }

    // Group by day and calculate stats
    const dailyMap = new Map<string, { liters: number; drinks: number }>();
    let totalDrinks = 0;
    let totalLiters = 0;
    let totalSpent = 0;
    let totalCalories = 0;
    const drinkCounts = new Map<string, number>();

    consumptions?.forEach((c: any) => {
      const drink = c.drinks;
      const liters = c.qty * drink.liters_per_unit;
      const calories = c.qty * drink.kcal_per_unit;
      
      // Daily totals
      const current = dailyMap.get(c.day) || { liters: 0, drinks: 0 };
      dailyMap.set(c.day, {
        liters: current.liters + liters,
        drinks: current.drinks + c.qty,
      });
      
      // Week totals
      totalDrinks += c.qty;
      totalLiters += liters;
      totalSpent += c.eur_spent || 0;
      totalCalories += calories;
      
      // Favorite drink tracking
      drinkCounts.set(drink.name, (drinkCounts.get(drink.name) || 0) + c.qty);
    });

    // Find favorite drink
    let favoriteDrink = null;
    let maxCount = 0;
    drinkCounts.forEach((count, name) => {
      if (count > maxCount) {
        maxCount = count;
        favoriteDrink = name;
      }
    });

    // Build daily consumption array
    const dailyConsumption: DailyConsumption[] = [];
    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const dayShorts = ['LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB', 'DOM'];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(date.getDate() + i);
      const dateStr = formatDate(date);
      const dayData = dailyMap.get(dateStr) || { liters: 0, drinks: 0 };
      
      dailyConsumption.push({
        day: dayNames[i],
        dayShort: dayShorts[i],
        date: dateStr,
        liters: dayData.liters,
        drinks: dayData.drinks,
        fillState: getGlassState(dayData.liters),
      });
    }

    const weeklyGoal = 8.0;
    const percentageComplete = Math.min(Math.round((totalLiters / weeklyGoal) * 100), 100);

    return {
      weekRange: {
        start: formatDate(weekStart),
        end: formatDate(weekEnd),
        display: formatWeekRange(weekStart, weekEnd),
      },
      weeklyGoal,
      currentProgress: totalLiters,
      percentageComplete,
      dailyConsumption,
      weekStats: {
        totalDrinks,
        totalSpent,
        totalCalories: Math.round(totalCalories),
        favoriteDrink,
      },
      streak: await this.calculateStreak(playerId),
    };
  },

  /**
  * Calculate consecutive days streak
  */
  async calculateStreak(playerId: string): Promise<number> {
    // Get all consumption days ordered by date descending
    const { data, error } = await supabase
      .from('consumptions')
      .select('day')
      .eq('player_id', playerId)
      .is('group_id', null)
      .order('day', { ascending: false });

    if (error || !data || data.length === 0) {
      return 0;
    }

    // Get unique days
    const uniqueDays = [...new Set(data.map(c => c.day))].sort().reverse();
    
    // Check for consecutive days starting from today
    const today = new Date().toISOString().split('T')[0];
    let streak = 0;
    let checkDate = new Date(today);
    
    for (const day of uniqueDays) {
      const dayStr = formatDate(checkDate);
      
      if (day === dayStr) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  },

  /**
   * Get current week offset (0 = this week, -1 = last week, etc.)
   */
  isCurrentWeek(weekOffset: number): boolean {
    return weekOffset === 0;
  },

  /**
  * Get monthly calendar data
  * @param playerId - Player UUID
  * @param monthOffset - 0 = current month, -1 = last month, etc.
  */
  async getMonthlyData(playerId: string, monthOffset: number = 0): Promise<MonthlyData> {
    const today = new Date();
    const targetMonth = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);
    const year = targetMonth.getFullYear();
    const month = targetMonth.getMonth();
    
    // Get first and last day of month
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();
    
    // Fetch consumptions for the entire month
    const monthStart = formatDate(firstDay);
    const monthEnd = formatDate(lastDay);
    
    const { data: consumptions, error } = await supabase
      .from('consumptions')
      .select(`
        day,
        qty,
        eur_spent,
        drinks (
          liters_per_unit,
          kcal_per_unit
        )
      `)
      .eq('player_id', playerId)
      .gte('day', monthStart)
      .lte('day', monthEnd)
      .is('group_id', null);

    if (error) {
      console.error('Error fetching monthly data:', error);
    }

    // Group by day
    const dailyMap = new Map<string, { liters: number; drinks: number; spent: number; calories: number }>();
    
    consumptions?.forEach((c: any) => {
      const drink = c.drinks;
      const liters = c.qty * drink.liters_per_unit;
      const calories = c.qty * drink.kcal_per_unit;
      
      const current = dailyMap.get(c.day) || { liters: 0, drinks: 0, spent: 0, calories: 0 };
      dailyMap.set(c.day, {
        liters: current.liters + liters,
        drinks: current.drinks + c.qty,
        spent: current.spent + (c.eur_spent || 0),
        calories: current.calories + calories,
      });
    });

    // Create calendar grid (starting on Monday)
    const adjustedStartDay = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;
    const days = [];
    
    // Empty cells before month starts
    for (let i = 0; i < adjustedStartDay; i++) {
      days.push({
        day: null,
        date: null,
        liters: 0,
        fillState: 'empty' as const,
      });
    }
    
    // Actual days with real data
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayData = dailyMap.get(dateStr) || { liters: 0, drinks: 0, spent: 0, calories: 0 };
      
      days.push({
        day,
        date: dateStr,
        liters: dayData.liters,
        fillState: getGlassState(dayData.liters),
      });
    }

    // Calculate month stats
    let totalDrinks = 0;
    let totalLiters = 0;
    let totalSpent = 0;
    let totalCalories = 0;
    let daysActive = 0;

    dailyMap.forEach((data) => {
      totalDrinks += data.drinks;
      totalLiters += data.liters;
      totalSpent += data.spent;
      totalCalories += data.calories;
      if (data.drinks > 0) daysActive++;
    });

    const monthNames = [
      'ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO',
      'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'
    ];

    return {
      monthRange: {
        month,
        year,
        display: `${monthNames[month]} ${year}`,
      },
      days,
      monthStats: {
        totalDrinks,
        totalLiters,
        totalSpent,
        totalCalories: Math.round(totalCalories),
        daysActive,
      },
    };
  },

  /**
   * Check if can navigate to next month (can't go beyond current month)
   */
  canGoToNextMonth(monthOffset: number): boolean {
    return monthOffset < 0;
  },
  

  //Actualizamos los dashboards y leaderboards todos los LUNES
  async getLastUpdateDate(): Promise<string> {
  // Get the most recent Monday
    const today = new Date();
    const dayOfWeek = today.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Monday = 1
    const lastMonday = new Date(today);
    lastMonday.setDate(today.getDate() + diff);
    
    return lastMonday.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  }

};

// Helper functions
function getWeekStart(date: Date, weekOffset: number): Date {
  const result = new Date(date);
  const day = result.getDay();
  const diff = result.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  result.setDate(diff);
  result.setDate(result.getDate() + (weekOffset * 7));
  return result;
}

function getWeekEnd(weekStart: Date): Date {
  const result = new Date(weekStart);
  result.setDate(result.getDate() + 6);
  return result;
}

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

function formatWeekRange(start: Date, end: Date): string {
  const startDay = start.getDate();
  const endDay = end.getDate();
  const month = start.toLocaleString('es-ES', { month: 'short' }).toUpperCase();
  
  return `${startDay} - ${endDay} ${month}`;
}

/**
 * Calculate fill state based on liters consumed
 */
export function getGlassState(liters: number): DailyConsumption['fillState'] {
  if (liters === 0) return 'empty';
  if (liters <= 1) return 'quarter';
  if (liters <= 1.5) return 'half';
  if (liters <= 2) return 'full';
  return 'overflow';
}

