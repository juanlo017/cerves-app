import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Theme } from '@/constants/Theme';
import { Typography } from '@/components/ui/Typography';
import { useAuth } from '@/contexts/AuthContext';

const AVATAR_MAP: Record<string, string> = {
  'avatar_beer': '🍺',
  'avatar_beers': '🍻',
  'avatar_wine': '🍷',
  'avatar_cocktail': '🍸',
  'avatar_tropical': '🍹',
  'avatar_champagne': '🥂',
  'avatar_bottle': '🍾',
  'avatar_juice': '🧃',
};

export default function ProfileScreen() {
  const { player, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    router.replace('/login');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <Typography variant="h1" style={styles.avatar}>
              {player?.avatar_key ? AVATAR_MAP[player.avatar_key] || '👤' : '👤'}
            </Typography>
          </View>

          <Typography variant="h2" style={styles.name}>
            {player?.display_name || 'Guest'}
          </Typography>
        </View>

        <View style={styles.section}>
          <Typography variant="h3" style={styles.sectionTitle}>
            INFORMACIÓN
          </Typography>

          <View style={styles.infoCard}>
            <Typography variant="body" style={styles.infoLabel}>
              ID de Usuario
            </Typography>
            <Typography variant="body" style={styles.infoValue}>
              {player?.id.slice(0, 8)}...
            </Typography>
          </View>
        </View>

        <Pressable
          style={styles.signOutButton}
          onPress={handleSignOut}
        >
          <Typography variant="body" style={styles.signOutText}>
            CERRAR SESIÓN
          </Typography>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  content: {
    padding: Theme.spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: Theme.spacing.xl,
    paddingVertical: Theme.spacing.xl,
  },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Theme.colors.backgroundCard,
    borderWidth: 4,
    borderColor: Theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
  },
  avatar: {
    fontSize: 64,
  },
  name: {
    textAlign: 'center',
  },
  section: {
    marginBottom: Theme.spacing.xl,
  },
  sectionTitle: {
    marginBottom: Theme.spacing.md,
    color: Theme.colors.primary,
  },
  infoCard: {
    backgroundColor: Theme.colors.backgroundCard,
    borderRadius: Theme.borderRadius.lg,
    borderWidth: 2,
    borderColor: Theme.colors.border,
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.sm,
  },
  infoLabel: {
    color: Theme.colors.textMuted,
    marginBottom: Theme.spacing.xs,
  },
  infoValue: {
    color: Theme.colors.text,
  },
  signOutButton: {
    backgroundColor: Theme.colors.error,
    borderRadius: Theme.borderRadius.lg,
    borderWidth: 2,
    borderColor: Theme.colors.border,
    padding: Theme.spacing.md,
    alignItems: 'center',
    marginTop: Theme.spacing.xl,
  },
  signOutText: {
    color: Theme.colors.text,
  },
});
