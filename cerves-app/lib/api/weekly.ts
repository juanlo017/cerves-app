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