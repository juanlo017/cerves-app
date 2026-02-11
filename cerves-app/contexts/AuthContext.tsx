import React, { createContext, useContext, useState, useEffect } from 'react';
import { Linking, Platform } from 'react-native';
import { supabase } from '@/lib/supabase';
import { playersApi, type Player } from '@/lib/api';
import type { Session } from '@supabase/supabase-js';

interface AuthContextType {
  session: Session | null;
  player: Player | null;
  isLoading: boolean;
  hasCompletedOnboarding: boolean;
  signInWithGoogle: () => Promise<void>;
  completeOnboarding: (name: string, avatar: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [player, setPlayer] = useState<Player | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  useEffect(() => {
    let noAuthTimeout: ReturnType<typeof setTimeout> | null = null;
    let isMounted = true;

    // Define loadPlayer inside the effect so it's available when needed
    const loadPlayer = async (userId: string) => {
      try {
        console.log('🔍 Loading player for user:', userId);
        const playerData = await playersApi.getByUserId(userId);

        if (playerData) {
          console.log('✅ Player found:', playerData);
          setPlayer(playerData);
          setHasCompletedOnboarding(true);
        } else {
          console.log('⚠️ No player profile found - needs onboarding');
          setPlayer(null);
          setHasCompletedOnboarding(false);
        }
      } catch (error) {
        console.error('❌ Error loading player:', error);
        setPlayer(null);
        setHasCompletedOnboarding(false);
      } finally {
        setIsLoading(false);
      }
    };

    // Listen for auth changes first
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return;

      console.log('🔍 Auth state changed:', _event, session?.user?.id);

      setSession(session);

      if (session) {
        // Clear the timeout - we have a session
        if (noAuthTimeout) {
          clearTimeout(noAuthTimeout);
          noAuthTimeout = null;
        }
        loadPlayer(session.user.id);
      } else {
        setPlayer(null);
        setHasCompletedOnboarding(false);

        // Only set isLoading = false if this is a definitive "no session" state
        // For INITIAL_SESSION with no session, let the timeout handle it (OAuth might be in progress)
        // For other events (SIGNED_OUT, etc), stop loading immediately
        if (_event !== 'INITIAL_SESSION') {
          if (noAuthTimeout) {
            clearTimeout(noAuthTimeout);
            noAuthTimeout = null;
          }
          setIsLoading(false);
        } else {
          // For INITIAL_SESSION with no session, set a timeout
          noAuthTimeout = setTimeout(() => {
            if (isMounted) {
              console.log('⏱️ No auth activity - stopping loading');
              setIsLoading(false);
            }
          }, 2000);
        }
      }
    });

    // Trigger initial session check - onAuthStateChange will handle it
    supabase.auth.getSession();

    // Handle deep links for OAuth callback (mobile only)
    let linkingSubscription: ReturnType<typeof Linking.addEventListener> | null = null;
    if (Platform.OS !== 'web') {
      const handleDeepLink = async (url: string) => {
        console.log('🔗 Deep link received:', url);
        if (url.startsWith('cervesapp://')) {
          try {
            // Extract the code from the URL
            const parsedUrl = new URL(url);
            const code = parsedUrl.searchParams.get('code');
            
            if (code) {
              console.log('📝 Exchanging code for session...');
              const { data, error } = await supabase.auth.exchangeCodeForSession(code);
              
              if (error) {
                console.error('❌ Error exchanging code for session:', error);
              } else if (data.session) {
                console.log('✅ Session created from deep link');
                // No need to setSession here - onAuthStateChange will handle it
              }
            } else {
              console.log('⚠️ No code found in deep link URL');
            }
          } catch (e) {
            console.error('❌ Error parsing deep link:', e);
          }
        }
      };

      // Listen for URL events (app opened via deep link)
      linkingSubscription = Linking.addEventListener('url', (event) => {
        handleDeepLink(event.url);
      });

      // Check if app was opened with a URL
      Linking.getInitialURL().then((url) => {
        if (url) {
          handleDeepLink(url);
        }
      });
    }

    return () => {
      isMounted = false;
      subscription.unsubscribe();
      if (linkingSubscription) {
        linkingSubscription.remove();
      }
      if (noAuthTimeout) {
        clearTimeout(noAuthTimeout);
      }
    };
  }, []);

  const signInWithGoogle = async () => {
    try {
      console.log('🔍 Starting Google sign-in...', 'Platform:', Platform.OS);

      // Use window.location.origin for web/PWA
      const redirectTo = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:8081';

      console.log('🔍 Redirect URL:', redirectTo);

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          skipBrowserRedirect: false, // Let Supabase handle the redirect
        },
      });

      if (error) throw error;
      console.log('✅ Google sign-in initiated', data);
    } catch (error) {
      console.error('❌ Error signing in with Google:', error);
      throw error;
    }
  };

  const completeOnboarding = async (name: string, avatar: string) => {
    try {
      if (!session?.user) {
        throw new Error('No authenticated user');
      }

      console.log('🔍 Completing onboarding:', { name, avatar, userId: session.user.id });

      const newPlayer = await playersApi.create(session.user.id, name, avatar);
      console.log('✅ New player created:', newPlayer);

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
      await supabase.auth.signOut();
      setSession(null);
      setPlayer(null);
      setHasCompletedOnboarding(false);
    } catch (error) {
      console.error('❌ Error signing out:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        player,
        isLoading,
        hasCompletedOnboarding,
        signInWithGoogle,
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