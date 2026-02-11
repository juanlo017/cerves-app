import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { Theme } from '@/constants/Theme';
import { Typography } from '@/components/ui/Typography';

const AVATARS = [
  { key: 'avatar_beer', emoji: '🍺' },
  { key: 'avatar_beers', emoji: '🍻' },
  { key: 'avatar_wine', emoji: '🍷' },
  { key: 'avatar_cocktail', emoji: '🍸' },
  { key: 'avatar_tropical', emoji: '🍹' },
  { key: 'avatar_champagne', emoji: '🥂' },
  { key: 'avatar_bottle', emoji: '🍾' },
  { key: 'avatar_juice', emoji: '🧃' },
];

export default function Onboarding() {
  const { completeOnboarding } = useAuth();
  const [name, setName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleComplete = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }

    if (!selectedAvatar) {
      Alert.alert('Error', 'Please select an avatar');
      return;
    }

    try {
      setIsLoading(true);
      await completeOnboarding(name.trim(), selectedAvatar);
      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert('Error', 'Failed to complete onboarding. Please try again.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.content}>
        <Typography variant="h2" style={styles.title}>
          BIENVENIDO!
        </Typography>

        <Typography variant="caption" style={styles.subtitle}>
          CONFIGURA TU PERFIL
        </Typography>

        <View style={styles.section}>
          <Typography variant="body" style={styles.label}>
            ¿QUIÉN ERES?
          </Typography>
          <TextInput
            style={styles.input}
            placeholder="Escribe tu nombre aquí"
            placeholderTextColor={Theme.colors.textMuted}
            value={name}
            onChangeText={setName}
            maxLength={12}
            autoCapitalize="words"
            autoCorrect={false}
          />
        </View>

        <View style={styles.section}>
          <Typography variant="body" style={styles.label}>
            ELIGE TU AVATAR
          </Typography>
          <View style={styles.avatarGrid}>
            {AVATARS.map((avatar) => (
              <Pressable
                key={avatar.key}
                style={[
                  styles.avatarButton,
                  selectedAvatar === avatar.key && styles.avatarButtonSelected,
                ]}
                onPress={() => setSelectedAvatar(avatar.key)}
              >
                <Text style={styles.avatarEmoji}>{avatar.emoji}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <Pressable
          style={[
            styles.completeButton,
            (!name.trim() || !selectedAvatar || isLoading) && styles.completeButtonDisabled,
          ]}
          onPress={handleComplete}
          disabled={!name.trim() || !selectedAvatar || isLoading}
        >
          <Typography variant="body" style={styles.completeButtonText}>
            {isLoading ? 'CREATING PROFILE...' : 'GET STARTED'}
          </Typography>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: Theme.colors.background,
  },
  content: {
    flex: 1,
    padding: Theme.spacing.xl,
    justifyContent: 'center',
  },
  title: {
    textAlign: 'center',
    marginBottom: Theme.spacing.md,
    color: Theme.colors.primary,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: Theme.spacing.xxl,
    color: Theme.colors.textSecondary,
  },
  section: {
    marginBottom: Theme.spacing.xl,
  },
  label: {
    marginBottom: Theme.spacing.md,
    color: Theme.colors.primary,
  },
  input: {
    borderWidth: 2,
    borderColor: Theme.colors.border,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.md,
    fontSize: Theme.fontSize.base,
    backgroundColor: Theme.colors.backgroundCard,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.system,
  },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Theme.spacing.md,
  },
  avatarButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: Theme.colors.backgroundCard,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: Theme.colors.border,
  },
  avatarButtonSelected: {
    borderColor: Theme.colors.primary,
    backgroundColor: Theme.colors.backgroundLight,
  },
  avatarEmoji: {
    fontSize: 32,
  },
  completeButton: {
    backgroundColor: Theme.colors.primary,
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.lg,
    alignItems: 'center',
    marginTop: Theme.spacing.xl,
    borderWidth: 2,
    borderColor: Theme.colors.border,
  },
  completeButtonDisabled: {
    backgroundColor: Theme.colors.disabled,
    borderColor: Theme.colors.disabled,
  },
  completeButtonText: {
    color: Theme.colors.background,
  },
});