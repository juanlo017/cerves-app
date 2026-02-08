import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';
import { useColorScheme } from '@/components/useColorScheme';
import { Theme } from '@/constants/Theme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Theme.colors.primary,
        tabBarInactiveTintColor: Theme.colors.textMuted,
        tabBarStyle: {
          backgroundColor: Theme.colors.backgroundLight,
          borderTopColor: Theme.colors.border,
          borderTopWidth: 2,
          height: 70,
          paddingBottom: 10,
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontSize: Theme.fontSize.sm,
          fontFamily: Theme.fonts.pixel,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'SEMANAL',
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          title: 'AÑADIR',
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: 'CALENDARIO',
        }}
      />
      <Tabs.Screen
        name="scoreboard"
        options={{
          title: 'RANKING',
        }}
      />
    </Tabs>
  );
}