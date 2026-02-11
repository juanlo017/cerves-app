import { useEffect } from "react";
import { router } from "expo-router";
import { View, ActivityIndicator, StyleSheet, Text } from "react-native";
import { useAuth } from "@/contexts/AuthContext";

export default function Index() {
  const { isLoading, hasCompletedOnboarding, session } = useAuth();

  useEffect(() => {
    console.log('🔄 Auth state changed:', { isLoading, hasCompletedOnboarding, hasSession: !!session });

    if (!isLoading) {
      if (!session) {
        // No session → go to login
        console.log('✅ Navigating to login');
        router.replace("/login");
      } else if (session && !hasCompletedOnboarding) {
        // Has session but no profile → go to onboarding
        console.log('✅ Navigating to onboarding');
        router.replace("/onboarding");
      } else if (session && hasCompletedOnboarding) {
        // Has session and profile → go to main app
        console.log('✅ Navigating to tabs');
        router.replace("/(tabs)");
      }
    }
  }, [isLoading, hasCompletedOnboarding, session]);

  console.log('🎨 Rendering loading screen');

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#007AFF" />
      <Text style={styles.text}>Loading...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  text: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
});