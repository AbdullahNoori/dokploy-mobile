import { usePushNotificationsBootstrap } from '@/hooks/use-push-notifications-bootstrap';
import { sheetPresentationOptions } from '@/navigation/screen-options';
import { useAuthStore } from '@/store/auth-store';
import { Stack } from 'expo-router';

export default function AppLayout() {
  const hasRootAccess = useAuthStore((state) => state.hasRootAccess);

  usePushNotificationsBootstrap();

  return (
    <Stack screenOptions={{ headerShown: false, headerBackButtonDisplayMode: 'minimal' }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen
        name="modals"
        options={{
          ...sheetPresentationOptions,
          headerShown: false,
        }}
      />
      <Stack.Protected guard={hasRootAccess}>
        <Stack.Screen
          name="notifications"
          options={{
            headerShown: true,
            headerTitle: 'Notifications',
            headerBackTitle: 'Settings',
          }}
        />
      </Stack.Protected>
      <Stack.Screen
        name="requests"
        options={{
          headerShown: true,
          headerTitle: 'Requests',
          headerBackTitle: 'Settings',
        }}
      />
      <Stack.Protected guard={hasRootAccess}>
        <Stack.Screen
          name="web-servers"
          options={{
            headerShown: true,
            headerTitle: 'Web Servers',
            headerBackTitle: 'Settings',
          }}
        />
      </Stack.Protected>
    </Stack>
  );
}
