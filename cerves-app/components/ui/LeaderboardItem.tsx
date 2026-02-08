import { View, StyleSheet } from 'react-native';
import { Theme } from '@/constants/Theme';
import { Typography } from './Typography';
import { Ionicons } from '@expo/vector-icons';

type Trend = 'up' | 'down' | 'same';

interface LeaderboardItemProps {
  rank: number;
  playerName: string;
  avatar: string;
  liters: number;
  trend: Trend;
}

export function LeaderboardItem({ rank, playerName, avatar, liters, trend }: LeaderboardItemProps) {
  const getRankStyle = () => {
    if (rank === 1) return styles.rankGold;
    if (rank === 2) return styles.rankSilver;
    if (rank === 3) return styles.rankBronze;
    return styles.rankDefault;
  };

    const getTrendIcon = () => {
    if (trend === 'up') return 'trending-up';
    if (trend === 'down') return 'trending-down';
    if (trend === 'same') return 'remove-outline';
    return 'remove';
    };

    const getTrendColor = () => {
    if (trend === 'up') return Theme.colors.success;
    if (trend === 'down') return Theme.colors.error;
    return Theme.colors.textMuted;
    };

  return (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        <View style={[styles.rankBadge, getRankStyle()]}>
          <Typography variant="h3" style={styles.rankText}>
            {rank}
          </Typography>
        </View>
        
        <Ionicons name={getTrendIcon() as any} size={20} color={getTrendColor()}/>
        
{/*         <Typography variant="body" style={styles.avatar}>
          {avatar}
        </Typography> */}
        
        <Typography variant="body" style={styles.playerName} numberOfLines={1}>
          {playerName}
        </Typography>
      </View>

      <Typography variant="body" color={Theme.colors.primary}>
        {liters.toFixed(2)}L
      </Typography>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Theme.colors.backgroundCard,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.md,
    marginVertical: Theme.spacing.sm,
    marginHorizontal: Theme.spacing.md,
    borderWidth: 2,
    borderColor: Theme.colors.border,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: Theme.spacing.sm,
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  rankGold: {
    backgroundColor: '#FFD700',
    borderColor: '#FFA500',
  },
  rankSilver: {
    backgroundColor: '#C0C0C0',
    borderColor: '#A8A8A8',
  },
  rankBronze: {
    backgroundColor: '#CD7F32',
    borderColor: '#B8722C',
  },
  rankDefault: {
    backgroundColor: Theme.colors.backgroundLight,
    borderColor: Theme.colors.border,
  },
  rankText: {
    fontSize: Theme.fontSize.sm,
  },
  trendIcon: {
    fontSize: Theme.fontSize.md,
  },
  avatar: {
    fontSize: 24,
  },
  playerName: {
    flex: 1,
  },
});