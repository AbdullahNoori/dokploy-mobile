import { usePushNotificationsBootstrap } from '@/hooks/use-push-notifications-bootstrap';
import { Stack } from 'expo-router';

export default function AppLayout() {
  usePushNotificationsBootstrap();

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
        name="notification-create"
        options={{
          presentation: 'formSheet',
          sheetAllowedDetents: [0.9, 0.98],
          sheetInitialDetentIndex: 0,
          sheetGrabberVisible: true,
          sheetCornerRadius: 24,
          sheetLargestUndimmedDetentIndex: 0,
          headerShown: true,
          headerTransparent: true,
          headerShadowVisible: false,
          headerTitle: 'Add Notification',
          headerBackTitle: 'Notifications',
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
      <Stack.Screen
        name="requests-filters"
        options={{
          presentation: 'formSheet',
          sheetAllowedDetents: [0.9, 0.98],
          sheetInitialDetentIndex: 0,
          sheetGrabberVisible: true,
          sheetCornerRadius: 24,
          sheetLargestUndimmedDetentIndex: 0,
          headerShown: true,
          headerTransparent: true,
          headerShadowVisible: false,
          headerTitle: 'Filters',
          headerBackTitle: 'Requests',
        }}
      />
      <Stack.Screen
        name="web-servers"
        options={{
          headerShown: true,
          headerTitle: 'Web Servers',
          headerBackTitle: 'Settings',
        }}
      />
      <Stack.Screen
        name="web-server-backup-edit"
        options={{
          presentation: 'formSheet',
          sheetAllowedDetents: [0.9, 0.98],
          sheetInitialDetentIndex: 0,
          sheetGrabberVisible: true,
          sheetCornerRadius: 24,
          sheetLargestUndimmedDetentIndex: 0,
          headerShown: true,
          headerTransparent: true,
          headerShadowVisible: false,
          headerTitle: 'Edit Backup',
          headerBackTitle: 'Web Servers',
        }}
      />
    </Stack>
  );
}
