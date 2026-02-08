import { Stack } from 'expo-router';

export default function DrinksLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="[category]/index" options={{ headerShown: false }} />
      <Stack.Screen name="[category]/[drinkId]" options={{ headerShown: false }} />
    </Stack>
  );
}