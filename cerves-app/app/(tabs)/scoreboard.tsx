import { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { weeklyApi, type LeaderboardPlayer } from '@/lib/api';
import { Typography, SegmentedControl, LeaderboardItem } from '@/components/ui';
import { Theme } from '@/constants/Theme';

export default function RankingScreen() {
  const [selectedTab, setSelectedTab] = useState(0);
  const [leaderboard, setLeaderboard] = useState<LeaderboardPlayer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState('');

  useEffect(() => {
    loadLeaderboard();
  }, [selectedTab]);

  useEffect(() => {
    const getUpdate = async () => {
      const date = await weeklyApi.getLastUpdateDate();
      setLastUpdate(date);
    };
    getUpdate();
  }, []);

  const loadLeaderboard = async () => {
    try {
      setIsLoading(true);
      
      if (selectedTab === 0) {
        // Global leaderboard
        const data = await weeklyApi.getGlobalLeaderboard();
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

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Typography variant="h1" align="center" color={Theme.colors.primary}>
          TOP
        </Typography>
        <Typography variant="h2" align="center">
          PERJUDICADOS
        </Typography>
        <Typography variant="caption" align="center" color={Theme.colors.textMuted} style={{paddingTop: '2%'}}>
          última actualización: {lastUpdate}
        </Typography>
      </View>

      <View style={styles.tabContainer}>
        <SegmentedControl
          options={['GLOBAL', 'EVENTOS']}
          selectedIndex={selectedTab}
          onSelect={setSelectedTab}
          disabled={[false, true]} // Events disabled for now
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
          renderItem={({ item, index }) => (
            <LeaderboardItem
              rank={index + 1}
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
                No hay datos disponibles
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
  header: {
    padding: Theme.spacing.xl,
    paddingBottom: Theme.spacing.md,
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