import { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { weeklyApi, type MonthlyData } from '@/lib/api';
import { Card, Typography, MonthNavigator, CalendarDay, StatItem } from '@/components/ui';
import { Theme } from '@/constants/Theme';

const WEEKDAY_LABELS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

export default function CalendarScreen() {
  const { player } = useAuth();
  const [monthOffset, setMonthOffset] = useState(0);
  const [monthlyData, setMonthlyData] = useState<MonthlyData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadMonthlyData();
  }, [monthOffset, player]);

  const loadMonthlyData = async () => {
    if (!player) return;
    
    try {
      setIsLoading(true);
      const data = await weeklyApi.getMonthlyData(player.id, monthOffset);
      setMonthlyData(data);
    } catch (error) {
      console.error('Error loading monthly data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const goToPreviousMonth = () => setMonthOffset(monthOffset - 1);
  const goToNextMonth = () => {
    if (weeklyApi.canGoToNextMonth(monthOffset)) {
      setMonthOffset(monthOffset + 1);
    }
  };

  const isToday = (dateStr: string | null): boolean => {
    if (!dateStr) return false;
    const today = new Date().toISOString().split('T')[0];
    return dateStr === today;
  };

  if (!player || isLoading || !monthlyData) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loading}>
          <Typography variant="body">Cargando...</Typography>
        </View>
      </SafeAreaView>
    );
  }

  const canGoNext = weeklyApi.canGoToNextMonth(monthOffset);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView>
        <MonthNavigator
          month={monthlyData.monthRange.display}
          onPrevious={goToPreviousMonth}
          onNext={goToNextMonth}
          canGoNext={canGoNext}
        />

        <Card>
          <Typography variant="h3" align="center" style={{ marginBottom: Theme.spacing.md }}>
            📅 CALENDARIO
          </Typography>

          {/* Weekday headers */}
          <View style={styles.weekdayRow}>
            {WEEKDAY_LABELS.map((label) => (
              <View key={label} style={styles.weekdayCell}>
                <Typography variant="caption" color={Theme.colors.textSecondary}>
                  {label}
                </Typography>
              </View>
            ))}
          </View>

          {/* Calendar grid */}
          <View style={styles.calendarGrid}>
            {monthlyData.days.map((dayData, index) => (
              <CalendarDay
                key={index}
                day={dayData.day}
                liters={dayData.liters}
                fillState={dayData.fillState}
                isToday={isToday(dayData.date)}
              />
            ))}
          </View>
        </Card>

        {/* Month Stats */}
        <Card>
          <Typography variant="h3" align="center" style={{ marginBottom: Theme.spacing.md }}>
            RESUMEN DEL MES
          </Typography>

          <View style={styles.statsGrid}>
            <StatItem 
              icon="🍺" 
              value={monthlyData.monthStats.totalDrinks}
              label="bebidas"
            />
            <StatItem 
              icon="💧" 
              value={`${monthlyData.monthStats.totalLiters.toFixed(1)}L`}
              label="litros"
            />
          </View>

          <View style={styles.statsGrid}>
            <StatItem 
              icon="💰" 
              value={`${monthlyData.monthStats.totalSpent.toFixed(2)}€`}
              label="gastado"
            />
            <StatItem 
              icon="⚡" 
              value={monthlyData.monthStats.totalCalories}
              label="kcal"
            />
          </View>

          <View style={styles.statRow}>
            <Typography variant="caption" color={Theme.colors.textSecondary}>
              Días felices:
            </Typography>
            <Typography variant="caption" color={Theme.colors.primary}>
              {monthlyData.monthStats.daysActive} / {monthlyData.days.filter(d => d.day !== null).length}
            </Typography>
          </View>
        </Card>

        <View style={{ height: Theme.spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  weekdayRow: {
    flexDirection: 'row',
    marginBottom: Theme.spacing.xs,
    paddingHorizontal: Theme.spacing.xs,
  },
  weekdayCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Theme.spacing.xs,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: Theme.spacing.xs,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: Theme.spacing.xs,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Theme.spacing.sm,
    paddingTop: Theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border,
  },
});