import { useState, useEffect } from 'react';
import { StyleSheet, View, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { rankingsApi, type RankingConfig } from '@/lib/api';
import type { LeaderboardPlayer } from '@/lib/api/rankings';
import { Typography, SegmentedControl, LeaderboardItem, IconButton } from '@/components/ui';
import { Theme } from '@/constants/Theme';

export default function RankingScreen() {
  const [selectedTab, setSelectedTab] = useState(0);
  const [monthOffset, setMonthOffset] = useState(0); // 0 = current month
  const [leaderboard, setLeaderboard] = useState<LeaderboardPlayer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Configure ranking period - EASY TO CHANGE!
  const config: RankingConfig = {
    rankingPeriod: 'month',  // 'week' | 'month' | 'season' | 'alltime'
    trendPeriod: 'daily',    // 'daily' | 'weekly'
  };

  useEffect(() => {
    loadLeaderboard();
  }, [selectedTab, monthOffset]);

  const loadLeaderboard = async () => {
    try {
      setIsLoading(true);
      
      if (selectedTab === 0) {
        // Global leaderboard
        const data = await rankingsApi.getLeaderboard(config, monthOffset);
        setLeaderboard(data);
      } else {
        // Events leaderboard (disabled for now)
        setLeaderboard([]);
      }
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const goToPreviousMonth = () => setMonthOffset(monthOffset - 1);
  const goToNextMonth = () => {
    if (rankingsApi.canGoToNextMonth(monthOffset)) {
      setMonthOffset(monthOffset + 1);
    }
  };
  const goToCurrentMonth = () => setMonthOffset(0);

  const periodName = rankingsApi.getPeriodName(config.rankingPeriod, monthOffset, config.customDays);
  const trendText = rankingsApi.getTrendText(config.trendPeriod);
  const isCurrentMonth = monthOffset === 0;
  const canGoNext = rankingsApi.canGoToNextMonth(monthOffset);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Month Navigator */}
      <View style={styles.monthNavigator}>
        <IconButton icon="◀" onPress={goToPreviousMonth} />
        
        <View style={styles.monthRangeContainer}>
          <Typography variant="h2" align="center">
            {periodName}
          </Typography>
          {!isCurrentMonth && (
            <TouchableOpacity onPress={goToCurrentMonth} style={styles.currentButton}>
              <Typography 
                variant="caption" 
                color={Theme.colors.background}
                style={{ fontFamily: Theme.fonts.pixel, fontSize: 10 }}
              >
                Mes actual
              </Typography>
            </TouchableOpacity>
          )}
        </View>
        
        <IconButton icon="▶" onPress={goToNextMonth} disabled={!canGoNext} />
      </View>

      <View style={styles.header}>
        <Typography variant="h1" align="center" color={Theme.colors.primary}>
          TOP
        </Typography>
        <Typography variant="h2" align="center">
          PERJUDICADOS
        </Typography>
      </View>

      <View style={styles.tabContainer}>
        <SegmentedControl
          options={['GLOBAL', 'EVENTOS']}
          selectedIndex={selectedTab}
          onSelect={setSelectedTab}
          disabled={[false, true]}
        />
      </View>

      {isLoading ? (
        <View style={styles.loading}>
          <Typography variant="body">Cargando...</Typography>
        </View>
      ) : (
        <FlatList
          data={leaderboard}
          keyExtractor={(item) => item.player_id}
          renderItem={({ item }) => (
            <LeaderboardItem
              rank={item.rank}
              playerName={item.player_name}
              avatar={item.avatar}
              liters={item.total_liters}
              trend={item.trend}
            />
          )}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Typography variant="body" color={Theme.colors.textSecondary}>
                No hay datos para este mes
              </Typography>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  monthNavigator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Theme.spacing.md,
    backgroundColor: Theme.colors.backgroundLight,
    borderBottomWidth: 2,
    borderBottomColor: Theme.colors.border,
  },
  monthRangeContainer: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: Theme.spacing.md,
  },
  currentButton: {
    marginTop: Theme.spacing.xs,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.xs,
    backgroundColor: Theme.colors.secondary,
    borderRadius: Theme.borderRadius.lg,
  },
  header: {
    padding: Theme.spacing.lg,
    paddingBottom: Theme.spacing.sm,
  },
  tabContainer: {
    paddingVertical: Theme.spacing.md,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingVertical: Theme.spacing.sm,
  },
  empty: {
    padding: Theme.spacing.xl,
    alignItems: 'center',
  },
});