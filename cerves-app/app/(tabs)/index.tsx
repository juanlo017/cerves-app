import { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { weeklyApi, type WeeklyStats } from '@/lib/api';
import { Card, ProgressBar, IconButton, GlassDay, StatItem, Typography } from '@/components/ui';
import { Theme } from '@/constants/Theme';

export default function HomeScreen() {
  const { player } = useAuth();
  const [weekOffset, setWeekOffset] = useState(0);
  const [weeklyData, setWeeklyData] = useState<WeeklyStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadWeeklyData();
  }, [weekOffset, player]);

  const loadWeeklyData = async () => {
    if (!player) return;
    
    try {
      setIsLoading(true);
      const data = await weeklyApi.getWeeklyStats(player.id, weekOffset);
      setWeeklyData(data);
    } catch (error) {
      console.error('Error loading weekly data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const goToPreviousWeek = () => setWeekOffset(weekOffset - 1);
  const goToNextWeek = () => {
    if (weekOffset < 0) {
      setWeekOffset(weekOffset + 1);
    }
  };
  const goToCurrentWeek = () => setWeekOffset(0);

  if (!player || isLoading || !weeklyData) {
    return (
      <View style={styles.loadingContainer}>
        <Typography variant="body">Cargando...</Typography>
      </View>
    );
  }

  const isCurrentWeek = weeklyApi.isCurrentWeek(weekOffset);
  const today = new Date().toISOString().split('T')[0];

  return (
    <ScrollView style={styles.container}>
      {/* Week Navigator */}
      <View style={styles.weekNavigator}>
        <IconButton onPress={goToPreviousWeek} icon="◀" />

        <View style={styles.weekRangeContainer}>
          <Typography variant="h3" align="center">
            {weeklyData.weekRange.display}
          </Typography>
          {!isCurrentWeek && (
            <TouchableOpacity onPress={goToCurrentWeek} style={styles.todayButton}>
              <Typography variant="caption" color={Theme.colors.background}>
                📍 HOY
              </Typography>
            </TouchableOpacity>
          )}
        </View>

        <IconButton 
          onPress={goToNextWeek} 
          icon="▶"
          disabled={weekOffset >= 0}
        />
      </View>

      {/* Weekly Goal */}
      <Card variant="highlight">
        <Typography variant="h2" align="center" color={Theme.colors.primary}>
          {player.display_name}
        </Typography>
        
        <Typography variant="h3" align="center" style={{ marginTop: Theme.spacing.sm }}>
          OBJETIVO SEMANAL
        </Typography>

        <View style={{ marginTop: Theme.spacing.md }}>
          <ProgressBar
            current={weeklyData.currentProgress}
            goal={weeklyData.weeklyGoal}
          />
        </View>
      </Card>

      {/* Weekly Glass Grid */}
      <Card>
        <Typography variant="h3" align="center">
          🍺 RACHA SEMANAL 🍺
        </Typography>

        <View style={styles.glassGrid}>
          {weeklyData.dailyConsumption.map((day) => (
            <GlassDay
              key={day.date}
              dayShort={day.dayShort}
              liters={day.liters}
              fillState={day.fillState}
              isToday={day.date === today}
            />
          ))}
        </View>
      </Card>

      {/* Quick Stats */}
      <Card>
        <View style={styles.statsGrid}>
          <StatItem 
            icon="🍺" 
            value={weeklyData.weekStats.totalDrinks}
            label="bebidas"
          />
          <StatItem 
            icon="💰" 
            value={`${weeklyData.weekStats.totalSpent.toFixed(2)}€`}
            label="gastado"
          />
          <StatItem 
            icon="🔥" 
            value={weeklyData.weekStats.totalCalories}
            label="kcal"
          />
        </View>
      </Card>

      {/* Streak */}
      <Card variant="dark" style={styles.streakCard}>
        <View style={styles.streakContent}>
          <Typography variant="h1">👍</Typography>
          <View style={{ marginLeft: Theme.spacing.md }}>
            <Typography variant="h2" color={Theme.colors.success}>
              {weeklyData.streak}
            </Typography>
            <Typography variant="body" color={Theme.colors.textSecondary}>
              días consecutivos
            </Typography>
          </View>
        </View>
      </Card>

      {/* Favorite Drink */}
      {weeklyData.weekStats.favoriteDrink && (
        <Card style={styles.favoriteCard}>
          <Typography variant="caption" align="center">
            Favorita esta semana:
          </Typography>
          <Typography 
            variant="h3" 
            align="center" 
            color={Theme.colors.secondary}
            style={{ marginTop: Theme.spacing.xs }}
          >
            {weeklyData.weekStats.favoriteDrink}
          </Typography>
        </Card>
      )}

      <View style={{ height: Theme.spacing.xl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Theme.colors.background,
  },
  
  // Week Navigator
  weekNavigator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Theme.spacing.md,
    backgroundColor: Theme.colors.backgroundLight,
    borderBottomWidth: 2,
    borderBottomColor: Theme.colors.border,
  },
  weekRangeContainer: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: Theme.spacing.md,
  },
  todayButton: {
    marginTop: Theme.spacing.xs,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.xs,
    backgroundColor: Theme.colors.secondary,
    borderRadius: Theme.borderRadius.lg,
  },

  // Glass Grid
  glassGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Theme.spacing.md,
  },

  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: Theme.spacing.sm,
  },

  // Streak Card
  streakCard: {
    backgroundColor: Theme.colors.success,
    borderColor: Theme.colors.success,
  },
  streakContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Favorite Card
  favoriteCard: {
    backgroundColor: Theme.colors.backgroundCard,
    borderColor: Theme.colors.secondary,
  },
});