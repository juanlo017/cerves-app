import { useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { CategoryCard, Typography } from '@/components/ui';
import { Theme } from '@/constants/Theme';

const CATEGORIES = [
  { id: 'cerveza', name: 'CERVEZA', icon: '🍺' },
  { id: 'vino', name: 'VINO', icon: '🍷' },
  { id: 'elixires', name: 'ELIXIRES', icon: '🍸' },
];

export default function AddDrinkScreen() {
  const { player } = useAuth();

  const handleCategoryPress = (categoryId: string) => {
    router.push(`/drinks/${categoryId}`);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView>
        <View style={styles.header}>
          <Typography variant="h1" align="center" color={Theme.colors.primary}>
            AÑADIR
          </Typography>
          <Typography variant="h1" align="center">
            BEBIDA
          </Typography>
        </View>

        <View style={styles.content}>
          {CATEGORIES.map((category) => (
            <CategoryCard
              key={category.id}
              title={category.name}
              icon={category.icon}
              onPress={() => handleCategoryPress(category.id)}
            />
          ))}
        </View>
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
    padding: Theme.spacing.xl,
  },
  content: {
    paddingVertical: Theme.spacing.md,
  },
});