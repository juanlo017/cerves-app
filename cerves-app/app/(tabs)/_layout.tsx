import { useState, useEffect, useCallback } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { Text, View, StyleSheet } from 'react-native';
import { useColorScheme } from '@/components/useColorScheme';
import { Theme } from '@/constants/Theme';
import { useAuth } from '@/contexts/AuthContext';
import { invitationsApi } from '@/lib/api';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { player, session } = useAuth();
  const [invitationCount, setInvitationCount] = useState(0);

  useEffect(() => {
    if (session?.user?.id) {
      loadInvitationCount();
      // Refresh every 30 seconds
      const interval = setInterval(loadInvitationCount, 30000);
      return () => clearInterval(interval);
    }
  }, [session?.user?.id]);

  const loadInvitationCount = async () => {
    if (!session?.user?.id) return;
    try {
      const count = await invitationsApi.getPendingCount(session.user.id);
      setInvitationCount(count);
    } catch (error) {
      // Silently fail for badge count
    }
  };

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
        tabBarShowLabel: false
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'SEMANAL',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          title: 'AÑADIR',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="add-circle" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'PERFIL',
          tabBarIcon: ({ color, size }) => (
            <View>
              <Ionicons name="body" size={size} color={color} />
              {invitationCount > 0 && (
                <View style={badgeStyles.badge}>
                  <Text style={badgeStyles.badgeText}>{invitationCount}</Text>
                </View>
              )}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: 'CALENDARIO',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="scoreboard"
        options={{
          title: 'RANKING',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="trophy" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const badgeStyles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: Theme.colors.error,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: Theme.colors.text,
    fontSize: 9,
    fontWeight: 'bold',
    fontFamily: Theme.fonts.pixel,
  },
});