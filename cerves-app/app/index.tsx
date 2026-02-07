import { useEffect } from "react";
import { router } from "expo-router";
import { View, ActivityIndicator, StyleSheet, Text } from "react-native";
import { useAuth, getDeviceId } from "@/contexts/AuthContext";

export default function Index() {
  const { isLoading, hasCompletedOnboarding, signIn } = useAuth();

  useEffect(() => {
    console.log('📱 Index screen mounted');
    
    const initAuth = async () => {
      try {
        console.log('🔍 Getting device ID...');
        const deviceId = await getDeviceId();
        console.log('✅ Device ID:', deviceId);
        
        console.log('🔍 Calling signIn...');
        await signIn(deviceId);
        console.log('✅ signIn complete');
      } catch (error) {
        console.error('❌ Error in initAuth:', error);
      }
    };

    initAuth();
  }, []);

  useEffect(() => {
    console.log('🔄 Auth state changed:', { isLoading, hasCompletedOnboarding });
    
    if (!isLoading) {
      if (hasCompletedOnboarding) {
        console.log('✅ Navigating to tabs');
        router.replace("/(tabs)");
      } else {
        console.log('✅ Navigating to onboarding');
        router.replace("/onboarding");
      }
    }
  }, [isLoading, hasCompletedOnboarding]);

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