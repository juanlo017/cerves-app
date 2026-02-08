import { supabase } from '@/lib/supabase';

export type RankingPeriod = 'week' | 'month' | 'season' | 'alltime';
export type TrendPeriod = 'daily' | 'weekly';

export interface RankingConfig {
  rankingPeriod: RankingPeriod;
  trendPeriod: TrendPeriod;
  customDays?: number; // For custom periods
}

export interface LeaderboardPlayer {
  player_id: string;
  player_name: string;
  avatar: string;
  total_liters: number;
  rank: number;
  trend: 'up' | 'down' | 'same';
  trend_change?: number; // How many positions changed
}

export const rankingsApi = {
  /**
   * Get leaderboard with configurable period and trends
   */
    async getLeaderboard(config: RankingConfig, monthOffset: number = 0): Promise<LeaderboardPlayer[]> {
    const currentPeriod = getPeriodDates(config.rankingPeriod, monthOffset, config.customDays);
    const trendPeriod = getTrendPeriodDates(config.trendPeriod, monthOffset);

    // Fetch current period consumptions
    const { data: currentData, error: currentError } = await supabase
      .from('consumptions')
      .select(`
        player_id,
        qty,
        drinks (
          liters_per_unit
        ),
        players (
          display_name,
          avatar_key
        )
      `)
      .gte('day', currentPeriod.start)
      .lte('day', currentPeriod.end)
      .is('group_id', null);

    if (currentError) {
      console.error('Error fetching current period data:', currentError);
      return [];
    }

    // Fetch trend comparison period
    const { data: trendData, error: trendError } = await supabase
      .from('consumptions')
      .select(`
        player_id,
        qty,
        drinks (
          liters_per_unit
        )
      `)
      .gte('day', trendPeriod.start)
      .lte('day', trendPeriod.end)
      .is('group_id', null);

    if (trendError) {
      console.error('Error fetching trend data:', trendError);
    }

    // Calculate current period totals
    const currentMap = new Map<string, { name: string; avatar: string; liters: number }>();
    
    currentData?.forEach((c: any) => {
      const drink = c.drinks;
      const player = c.players;
      const liters = c.qty * drink.liters_per_unit;
      
      const current = currentMap.get(c.player_id) || {
        name: player?.display_name || 'Unknown',
        avatar: player?.avatar_key || '🍺',
        liters: 0,
      };
      
      currentMap.set(c.player_id, {
        name: current.name,
        avatar: current.avatar,
        liters: current.liters + liters,
      });
    });

    // Calculate trend period totals
    const trendMap = new Map<string, number>();
    
    trendData?.forEach((c: any) => {
      const drink = c.drinks;
      const liters = c.qty * drink.liters_per_unit;
      trendMap.set(c.player_id, (trendMap.get(c.player_id) || 0) + liters);
    });

    // Build current leaderboard
    const currentLeaderboard: LeaderboardPlayer[] = [];
    
    currentMap.forEach((data, playerId) => {
      currentLeaderboard.push({
        player_id: playerId,
        player_name: data.name,
        avatar: data.avatar,
        total_liters: data.liters,
        rank: 0, // Will be set after sorting
        trend: 'same',
      });
    });

    // Sort and assign ranks
    currentLeaderboard.sort((a, b) => b.total_liters - a.total_liters);
    currentLeaderboard.forEach((player, index) => {
      player.rank = index + 1;
    });

    // Build trend leaderboard for comparison
    const trendLeaderboard = Array.from(trendMap.entries())
      .sort((a, b) => b[1] - a[1])
      .reduce((acc, [playerId], index) => {
        acc.set(playerId, index + 1);
        return acc;
      }, new Map<string, number>());

    // Calculate trends
    currentLeaderboard.forEach((player) => {
      const previousRank = trendLeaderboard.get(player.player_id);
      
      if (!previousRank) {
        // New player in this period
        player.trend = 'same';
        player.trend_change = 0;
      } else {
        const change = previousRank - player.rank; // Positive = improved
        player.trend_change = change;
        
        if (change > 0) {
          player.trend = 'up';
        } else if (change < 0) {
          player.trend = 'down';
        } else {
          player.trend = 'same';
        }
      }
    });

    return currentLeaderboard;
  },

  /**
     * Get period display name
     */
getPeriodName(period: RankingPeriod, monthOffset: number = 0, customDays?: number): string {
    const now = new Date();
    const targetDate = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);

    const monthNames = ['ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO',
                        'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'];

    switch (period) {
        case 'week':
        return 'ESTA SEMANA';
        case 'month':
        return `${monthNames[targetDate.getMonth()]} ${targetDate.getFullYear()}`;
        case 'season':
        return `TEMPORADA ${monthNames[targetDate.getMonth()]}`;
        case 'alltime':
        return 'HISTÓRICO';
        default:
        return customDays ? `ÚLTIMOS ${customDays} DÍAS` : 'RANKING';
    }
},

  /**
   * Get trend display text
   */
  getTrendText(trendPeriod: TrendPeriod): string {
    switch (trendPeriod) {
      case 'daily':
        return 'vs ayer';
      case 'weekly':
        return 'vs semana pasada';
      default:
        return '';
    }
  },
  /**
     * Check if can navigate to next month
     */
  canGoToNextMonth(monthOffset: number): boolean {
    return monthOffset < 0;
  },
};

    /**
     * Helper: Get start/end dates for ranking period
     */
function getPeriodDates(period: RankingPeriod, offset: number = 0, customDays?: number) {
    const now = new Date();
    let start: Date;
    let end: Date;

    switch (period) {
        case 'week':
        start = getWeekStart(now, offset);
        end = getWeekEnd(start);
        break;
        
        case 'month':
        case 'season':
        start = new Date(now.getFullYear(), now.getMonth() + offset, 1);
        end = new Date(now.getFullYear(), now.getMonth() + offset + 1, 0);
        break;
        
        case 'alltime':
        start = new Date(2020, 0, 1);
        end = now;
        break;
        
        default:
        if (customDays) {
            end = now;
            start = new Date(now);
            start.setDate(start.getDate() - customDays);
        } else {
            start = now;
            end = now;
        }
    }

    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    return {
        start: formatDate(start),
        end: formatDate(end),
    };
}

    /**
     * Helper: Get comparison period for trends
     */
function getTrendPeriodDates(trendPeriod: TrendPeriod, monthOffset: number = 0) {
    const now = new Date();
    // Adjust base date by month offset
    const baseDate = new Date(now.getFullYear(), now.getMonth() + monthOffset, now.getDate());
    
    let start: Date;
    let end: Date;

    switch (trendPeriod) {
        case 'daily':
        // Previous day in that month
        start = new Date(baseDate);
        start.setDate(start.getDate() - 1);
        start.setHours(0, 0, 0, 0);
        
        end = new Date(baseDate);
        end.setDate(end.getDate() - 1);
        end.setHours(23, 59, 59, 999);
        break;
        
        case 'weekly':
        // Previous week
        start = getWeekStart(baseDate, -1);
        end = getWeekEnd(start);
        break;
        
        default:
        start = baseDate;
        end = baseDate;
    }

    return {
        start: formatDate(start),
        end: formatDate(end),
    };
}

// Helper functions
function getWeekStart(date: Date, weekOffset: number): Date {
  const result = new Date(date);
  const day = result.getDay();
  const diff = result.getDate() - day + (day === 0 ? -6 : 1);
  result.setDate(diff);
  result.setDate(result.getDate() + (weekOffset * 7));
  result.setHours(0, 0, 0, 0);
  return result;
}

function getWeekEnd(weekStart: Date): Date {
  const result = new Date(weekStart);
  result.setDate(result.getDate() + 6);
  result.setHours(23, 59, 59, 999);
  return result;
}

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}