import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Device from 'expo-device';
import { playersApi, type Player } from '@/lib/api';

interface AuthContextType {
  player: Player | null;
  isLoading: boolean;
  hasCompletedOnboarding: boolean;
  signIn: (deviceId: string) => Promise<void>;
  completeOnboarding: (name: string, avatar: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [player, setPlayer] = useState<Player | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      console.log('🔍 Starting checkAuth...');
      setIsLoading(true);
      
      const onboardingComplete = await AsyncStorage.getItem('onboarding_complete');
      console.log('✅ Onboarding complete:', onboardingComplete);
      
      if (onboardingComplete === 'true') {
        const playerId = await AsyncStorage.getItem('player_id');
        console.log('✅ Player ID from storage:', playerId);
        
        if (playerId) {
          console.log('🔍 Fetching player from Supabase...');
          const playerData = await playersApi.getById(playerId);
          console.log('✅ Player data from Supabase:', playerData);

          if (playerData) {
            setPlayer(playerData);
            setHasCompletedOnboarding(true);
            console.log('✅ Player loaded successfully');
          } else {
            console.log('⚠️ Player not found in DB, resetting onboarding');
            // Player was deleted from DB, reset onboarding
            await AsyncStorage.removeItem('onboarding_complete');
            await AsyncStorage.removeItem('player_id');
            setHasCompletedOnboarding(false);
          }
        } else {
          console.log('⚠️ No player ID in storage');
          setHasCompletedOnboarding(false);
        }
      } else {
        console.log('✅ New user - needs onboarding');
        setHasCompletedOnboarding(false);
      }
    } catch (error) {
      console.error('❌ Error in checkAuth:', error);
      setHasCompletedOnboarding(false);
    } finally {
      console.log('✅ checkAuth complete, setting isLoading to false');
      setIsLoading(false);
    }
  };

  const signIn = async (deviceId: string) => {
    try {
      console.log('🔍 Signing in with device ID:', deviceId);
      
      const existingPlayer = await playersApi.getByUserId(deviceId);
      console.log('✅ Existing player check:', existingPlayer);

      if (existingPlayer) {
        console.log('✅ Player found, marking as completed onboarding');
        setPlayer(existingPlayer);
        setHasCompletedOnboarding(true);
        await AsyncStorage.setItem('onboarding_complete', 'true');
        await AsyncStorage.setItem('player_id', existingPlayer.id);
      } else {
        console.log('✅ New user detected, needs onboarding');
        setHasCompletedOnboarding(false);
      }
    } catch (error) {
      console.error('❌ Error signing in:', error);
      setHasCompletedOnboarding(false);
    }
  };

  const completeOnboarding = async (name: string, avatar: string) => {
    try {
      console.log('🔍 Completing onboarding:', { name, avatar });
      
      const deviceId = await getDeviceId();
      console.log('✅ Device ID for new player:', deviceId);

      const newPlayer = await playersApi.create(deviceId, name, avatar);
      console.log('✅ New player created:', newPlayer);

      await AsyncStorage.setItem('onboarding_complete', 'true');
      await AsyncStorage.setItem('player_id', newPlayer.id);
      
      setPlayer(newPlayer);
      setHasCompletedOnboarding(true);
      
      console.log('✅ Onboarding completed successfully');
    } catch (error) {
      console.error('❌ Error completing onboarding:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await AsyncStorage.removeItem('onboarding_complete');
      await AsyncStorage.removeItem('player_id');
      setPlayer(null);
      setHasCompletedOnboarding(false);
    } catch (error) {
      console.error('❌ Error signing out:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        player,
        isLoading,
        hasCompletedOnboarding,
        signIn,
        completeOnboarding,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

async function getDeviceId(): Promise<string> {
  try {
    let deviceId = await AsyncStorage.getItem('device_id');
    
    if (deviceId) {
      console.log('✅ Using existing device ID:', deviceId);
      return deviceId;
    }
    
    const newDeviceId = 
      Device.osInternalBuildId ?? 
      Device.modelId ?? 
      Device.deviceName ?? 
      generateUUID();
    
    console.log('✅ Generated new device ID:', newDeviceId);
    await AsyncStorage.setItem('device_id', newDeviceId);
    
    return newDeviceId;
  } catch (error) {
    console.error('❌ Error getting device ID:', error);
    return generateUUID();
  }
}

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export { getDeviceId };