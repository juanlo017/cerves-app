import { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { DrinkItem, Typography, IconButton } from '@/components/ui';
import { Theme } from '@/constants/Theme';
import { drinksApi } from '@/lib/api';


export default function CategoryDrinksScreen() {
  const { category } = useLocalSearchParams<{ category: string }>();
  const { player } = useAuth();
  const [drinks, setDrinks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  console.log('📍 CategoryDrinksScreen mounted');
  console.log('📦 Category param:', category);
  console.log('👤 Player:', player);

  useEffect(() => {
    loadDrinks();
  }, [category]);

    const loadDrinks = async () => {
      try {
        setIsLoading(true);
        const data = await drinksApi.getByCategory(category);
        setDrinks(data);
      } catch (error) {
        console.error('Error loading drinks:', error);
      } finally {
        setIsLoading(false);
      }
    };

  const handleDrinkPress = (drinkId: string) => {
    try {
      console.log('🔵 Drink pressed:', drinkId);
      console.log('🔵 Navigating to:', `/drinks/${category}/${drinkId}`);
      router.push(`/drinks/${category}/${drinkId}`);
      console.log('🔵 Navigation called');
    } catch (error) {
      console.error('❌ Navigation error:', error);
    }
  };

  const getCategoryIcon = () => {
    const icons = { cerveza: '🍺', vino: '🍷', alta_graduación: '🍸' };
    return icons[category as keyof typeof icons] || '🍺';
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <IconButton icon="◀" onPress={() => router.back()} />
        <View style={styles.headerTitle}>
          <Typography variant="h2" align="center">
            {getCategoryIcon()} {category.toUpperCase()}
          </Typography>
        </View>
        <View style={{ width: 48 }} />
      </View>

      <ScrollView>
        {isLoading ? (
          <View style={styles.loading}>
            <Typography variant="body">Cargando...</Typography>
          </View>
        ) : (
          drinks.map((drink) => (
            <DrinkItem
              key={drink.id}
              name={drink.name}
              liters={drink.liters_per_unit}
              calories={drink.kcal_per_unit}
              onPress={() => handleDrinkPress(drink.id)}
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Theme.spacing.md,
    backgroundColor: Theme.colors.backgroundLight,
    borderBottomWidth: 2,
    borderBottomColor: Theme.colors.border,
  },
  headerTitle: {
    flex: 1,
    marginHorizontal: Theme.spacing.md,
  },
  loading: {
    padding: Theme.spacing.xl,
    alignItems: 'center',
  },
});