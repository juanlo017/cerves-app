import { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Alert,
} from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { Theme } from '@/constants/Theme';
import { Typography } from '@/components/ui/Typography';

export default function Login() {
  const { signInWithGoogle } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      await signInWithGoogle();
    } catch (error) {
      Alert.alert('Error', 'Failed to sign in with Google. Please try again.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.emoji}>🍻</Text>

        <View style={styles.titleContainer}>
          <Typography variant="h1" style={styles.title}>
            CERVES{' '}
          </Typography>
          <Typography variant="h1" style={styles.subtitle}>
            APP
          </Typography>
        </View>

        <Typography variant="body" style={styles.subtitle}>
          Bebe y compite con amigos
        </Typography>

        <Pressable
          style={[styles.googleButton, isLoading && styles.googleButtonDisabled]}
          onPress={handleGoogleSignIn}
          disabled={isLoading}
        >
          <Typography variant="caption" style={styles.googleButtonText}>
            {isLoading ? 'SIGNING IN...' : 'INICIA CON GOOGLE'}
          </Typography>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  content: {
    flex: 1,
    padding: Theme.spacing.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 100,
    marginBottom: Theme.spacing.xl,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: Theme.spacing.md,
  },
  title: {
    textAlign: 'center',
    color: Theme.colors.primary,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: Theme.spacing.xxl,
    color: Theme.colors.textSecondary,
  },
  googleButton: {
    backgroundColor: Theme.colors.primary,
    paddingVertical: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.xl,
    borderRadius: Theme.borderRadius.lg,
    alignItems: 'center',
    minWidth: 280,
    borderWidth: 2,
    borderColor: Theme.colors.border,
  },
  googleButtonDisabled: {
    backgroundColor: Theme.colors.disabled,
    borderColor: Theme.colors.disabled,
  },
  googleButtonText: {
    color: Theme.colors.background,
  },
});
