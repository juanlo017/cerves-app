import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

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
        <Text style={styles.title}>Welcome to Cerves! 🍻</Text>
        <Text style={styles.subtitle}>Let's set up your profile</Text>

        <View style={styles.section}>
          <Text style={styles.label}>What's your name?</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your display name"
            value={name}
            onChangeText={setName}
            maxLength={30}
            autoCapitalize="words"
            autoCorrect={false}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Choose your avatar</Text>
          <View style={styles.avatarGrid}>
            {AVATARS.map((avatar) => (
              <TouchableOpacity
                key={avatar.key}
                style={[
                  styles.avatarButton,
                  selectedAvatar === avatar.key && styles.avatarButtonSelected,
                ]}
                onPress={() => setSelectedAvatar(avatar.key)}
              >
                <Text style={styles.avatarEmoji}>{avatar.emoji}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.completeButton,
            (!name.trim() || !selectedAvatar || isLoading) && styles.completeButtonDisabled,
          ]}
          onPress={handleComplete}
          disabled={!name.trim() || !selectedAvatar || isLoading}
        >
          <Text style={styles.completeButtonText}>
            {isLoading ? 'Creating Profile...' : 'Get Started'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 48,
  },
  section: {
    marginBottom: 32,
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  avatarButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'transparent',
  },
  avatarButtonSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#E3F2FF',
  },
  avatarEmoji: {
    fontSize: 32,
  },
  completeButton: {
    backgroundColor: '#007AFF',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
  },
  completeButtonDisabled: {
    backgroundColor: '#ccc',
  },
  completeButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});