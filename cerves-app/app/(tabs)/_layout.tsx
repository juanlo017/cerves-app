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
          height: 70, // ← Altura aumentada (default es ~50)
          paddingBottom: 10, // ← Padding inferior
          paddingTop: 10, // ← Padding superior
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
          tabBarIcon: ({ color }) => <FontAwesome size={28} name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="scoreboard"
        options={{
          title: 'RANKING',
          tabBarIcon: ({ color }) => <FontAwesome size={28} name="trophy" color={color} />,
        }}
      />
    </Tabs>
  );
}