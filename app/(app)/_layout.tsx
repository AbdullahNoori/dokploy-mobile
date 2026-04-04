import { Stack } from 'expo-router';

export default function AppLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen
        name="notifications"
        options={{
          headerShown: true,
          headerTitle: 'Notifications',
          headerBackTitle: 'Settings',
        }}
      />
      <Stack.Screen
        name="requests"
        options={{
          headerShown: true,
          headerTitle: 'Requests',
          headerBackTitle: 'Settings',
        }}
      />
    </Stack>
  );
}
