import { usePushNotificationsBootstrap } from '@/hooks/use-push-notifications-bootstrap';
import { sheetPresentationOptions } from '@/navigation/screen-options';
import { useAuthStore } from '@/store/auth-store';
import { Stack } from 'expo-router';

export default function AppLayout() {
  const hasOwnerAccess = useAuthStore((state) => state.hasOwnerAccess);

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
      <Stack.Protected guard={hasOwnerAccess}>
        <Stack.Screen
          name="notifications/index"
          options={{
            headerShown: true,
            headerTitle: 'Notifications',
            headerBackTitle: 'Settings',
          }}
        />
      </Stack.Protected>
      <Stack.Screen
        name="requests/index"
        options={{
          headerShown: true,
          headerTitle: 'Requests',
          headerBackTitle: 'Settings',
        }}
      />
      <Stack.Screen
        name="organizations/index"
        options={{
          headerShown: true,
          headerTitle: 'Organizations',
          headerBackTitle: 'Settings',
        }}
      />
      <Stack.Protected guard={hasOwnerAccess}>
        <Stack.Screen
          name="web-servers/index"
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
