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

  export interface LeaderboardPlayer {
    player_id: string;
    player_name: string;
    avatar: string;
    total_liters: number;
    trend: 'up' | 'down' | 'same';
  }

export const weeklyApi = {
  /**
   * Get weekly stats for a player
   * @param playerId - Player UUID
   * @param weekOffset - 0 = current week, -1 = last week, 1 = next week
   */
  async getWeeklyStats(playerId: string, weekOffset: number = 0): Promise<WeeklyStats> {
    // TODO: Replace with real Supabase queries
    
    // For now, return dummy data
    const today = new Date();
    const weekStart = getWeekStart(today, weekOffset);
    const weekEnd = getWeekEnd(weekStart);
    
    return {
      weekRange: {
        start: formatDate(weekStart),
        end: formatDate(weekEnd),
        display: formatWeekRange(weekStart, weekEnd),
      },
      weeklyGoal: 8.0,
      currentProgress: 7.0,
      percentageComplete: 21,
      
      dailyConsumption: [
        {
          day: 'Monday',
          dayShort: 'LUN',
          date: '2024-02-05',
          liters: 0.5,
          drinks: 2,
          fillState: 'half',
        },
        {
          day: 'Tuesday',
          dayShort: 'MAR',
          date: '2024-02-06',
          liters: 1.2,
          drinks: 4,
          fillState: 'overflow',
        },
        {
          day: 'Wednesday',
          dayShort: 'MIE',
          date: '2024-02-07',
          liters: 0,
          drinks: 0,
          fillState: 'quarter',
        },
        {
          day: 'Thursday',
          dayShort: 'JUE',
          date: '2024-02-08',
          liters: 0,
          drinks: 0,
          fillState: 'empty',
        },
        {
          day: 'Friday',
          dayShort: 'VIE',
          date: '2024-02-09',
          liters: 0,
          drinks: 0,
          fillState: 'empty',
        },
        {
          day: 'Saturday',
          dayShort: 'SAB',
          date: '2024-02-10',
          liters: 0,
          drinks: 0,
          fillState: 'empty',
        },
        {
          day: 'Sunday',
          dayShort: 'DOM',
          date: '2024-02-11',
          liters: 0,
          drinks: 0,
          fillState: 'empty',
        },
      ],
      
      weekStats: {
        totalDrinks: 6,
        totalSpent: 12.50,
        totalCalories: 850,
        favoriteDrink: 'Cerveza Estrella Galicia',
      },
      
      streak: 21,
    };
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
    // TODO: Replace with real Supabase queries
    
    const today = new Date();
    const targetMonth = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);
    const year = targetMonth.getFullYear();
    const month = targetMonth.getMonth();
    
    // Get first day of month and how many days
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay(); // 0 = Sunday
    
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
    
    // Actual days with dummy data
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      
      // Random dummy consumption data
      const liters = Math.random() > 0.3 ? Math.random() * 2 : 0;
      const fillState = getGlassState(liters);
      
      days.push({
        day,
        date: dateStr,
        liters,
        fillState,
      });
    }
    
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
        totalDrinks: 45,
        totalLiters: 24.5,
        totalSpent: 123.50,
        totalCalories: 3500,
        daysActive: 18,
      },
    };
  },

  /**
   * Check if can navigate to next month (can't go beyond current month)
   */
  canGoToNextMonth(monthOffset: number): boolean {
    return monthOffset < 0;
  },

  /**
   * Get global leaderboard
   */
  async getGlobalLeaderboard(): Promise<LeaderboardPlayer[]> {
    // TODO: Replace with real Supabase queries
    // 1. Get all players with their total consumption
    // 2. Get previous week consumption for trend calculation
    // 3. Sort by total_liters descending
    
    // Dummy data
    return [
      { 
        player_id: '1', 
        player_name: 'JuanloPruebas', 
        avatar: '🍺',
        total_liters: 15.5,
        trend: 'up'
      },
      { 
        player_id: '2', 
        player_name: 'Paula', 
        avatar: '🍷',
        total_liters: 12.3,
        trend: 'down'
      },
      { 
        player_id: '3', 
        player_name: 'Carlos', 
        avatar: '🍸',
        total_liters: 10.8,
        trend: 'same'
      },
      { 
        player_id: '4', 
        player_name: 'Ana', 
        avatar: '🍹',
        total_liters: 9.2,
        trend: 'up'
      },
      { 
        player_id: '5', 
        player_name: 'Miguel', 
        avatar: '🍻',
        total_liters: 8.5,
        trend: 'down'
      },
      { 
        player_id: '6', 
        player_name: 'Laura', 
        avatar: '🥂',
        total_liters: 7.1,
        trend: 'up'
      },
      { 
        player_id: '7', 
        player_name: 'Alicia', 
        avatar: '🥂',
        total_liters: 6.1,
        trend: 'down'
      },
      { 
        player_id: '8', 
        player_name: 'Juanmi', 
        avatar: '🥂',
        total_liters: 4.1,
        trend: 'down'
      },
    ];
  },

  /**
   * Get event/group leaderboard
   */
  async getEventLeaderboard(groupId: string): Promise<LeaderboardPlayer[]> {
    // TODO: Implement when events are ready
    return [];
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
  if (liters <= 0.25) return 'quarter';
  if (liters <= 0.5) return 'half';
  if (liters <= 1) return 'full';
  return 'overflow';
}

