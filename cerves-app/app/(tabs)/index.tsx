import { StyleSheet, Text, View } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';

export default function HomeScreen() {
  const { player } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome, {player?.display_name}!</Text>
      <Text style={styles.subtitle}>{player?.avatar_key}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 48,
    marginTop: 16,
  },
});