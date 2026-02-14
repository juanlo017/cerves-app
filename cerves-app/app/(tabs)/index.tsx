import { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { weeklyApi, type WeeklyStats } from '@/lib/api';
import { Card, ProgressBar, IconButton, GlassDay, StatItem, Typography, DayDetailsModal } from '@/components/ui';
import { Theme } from '@/constants/Theme';

export default function HomeScreen() {
  const { player } = useAuth();
  const [weekOffset, setWeekOffset] = useState(0);
  const [weeklyData, setWeeklyData] = useState<WeeklyStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

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

  const handleDayPress = (date: string) => {
    setSelectedDate(date);
    setModalVisible(true);
  };

  if (!player || isLoading || !weeklyData) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <Typography variant="body">Cargando...</Typography>
        </View>
      </SafeAreaView>
    );
  }

  const isCurrentWeek = weeklyApi.isCurrentWeek(weekOffset);
  const today = new Date().toISOString().split('T')[0];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView>
        {/* Week Navigator */}
        <View style={styles.weekNavigator}>
          <IconButton onPress={goToPreviousWeek} icon="◀" />

          <View style={styles.weekRangeContainer}>
            <Typography variant="h3" align="center">
              {weeklyData.weekRange.display}
            </Typography>
            {!isCurrentWeek && (
              <TouchableOpacity onPress={goToCurrentWeek} style={styles.todayButton}>
                <Typography 
                  variant="caption" 
                  color={Theme.colors.background}
                  style={styles.todayButtonText}
                >
                  Semana actual
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
            RACHA SEMANAL
          </Typography>

          <View style={styles.glassGrid}>
            {weeklyData.dailyConsumption.map((day) => (
              <GlassDay
                key={day.date}
                dayShort={day.dayShort}
                liters={day.liters}
                fillState={day.fillState}
                isToday={day.date === today}
                onPress={() => handleDayPress(day.date)}
              />
            ))}
          </View>
        </Card>

        {/* Streak */}
          <Card 
            variant="dark" 
            style={{
              backgroundColor: weeklyData.streak > 0 ? Theme.colors.streakBackgroundCard : Theme.colors.backgroundCard,
              borderColor: weeklyData.streak > 0 ? Theme.colors.streakBorder : Theme.colors.primary,
              borderWidth: 3,
            }}
          >
          <View style={styles.streakContent}>
            <Typography variant="h1">
              {weeklyData.streak > 0 ? '🔥' : '🧊'}
            </Typography>
            <View style={{ marginLeft: Theme.spacing.md }}>
              <Typography 
                variant="h2" 
                color={weeklyData.streak > 0 ? Theme.colors.text : Theme.colors.info}
              >
                {weeklyData.streak} días
              </Typography>
            </View>
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
              icon="⚡" 
              value={weeklyData.weekStats.totalCalories}
              label="kcal"
            />
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

      {/* Day Details Modal */}
      <DayDetailsModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        date={selectedDate}
        playerId={player.id}
      />
    </SafeAreaView>
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
    marginTop: Theme.spacing.sm,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    backgroundColor: Theme.colors.secondary,
    borderRadius: Theme.borderRadius.lg,
  },
  todayButtonText: {
    fontFamily: Theme.fonts.pixel,
    fontSize: 10,
  },

  // Glass Grid
  glassGrid: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Theme.spacing.lg,
    marginTop: Theme.spacing.sm,
  },

  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: Theme.spacing.sm,
  },

  // Streak Card
  streakCard: {
    backgroundColor: Theme.colors.streakBackgroundCard, // Mismo que otros cards
  },
  streakContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  streakContentTitle: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Favorite Card
  favoriteCard: {
    backgroundColor: Theme.colors.backgroundCard,
    borderColor: Theme.colors.secondary,
  },
});