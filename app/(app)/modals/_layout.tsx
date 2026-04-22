import { formSheetScreenOptions } from '@/navigation/screen-options';
import { useAuthStore } from '@/store/auth-store';
import { Stack } from 'expo-router';

export default function ModalsLayout() {
  const hasRootAccess = useAuthStore((state) => state.hasRootAccess);

  return (
    <Stack screenOptions={formSheetScreenOptions}>
      <Stack.Protected guard={hasRootAccess}>
        <Stack.Screen
          name="notification-new"
          options={{
            headerTitle: 'Add Notification',
            headerBackTitle: 'Notifications',
          }}
        />
        <Stack.Screen
          name="web-server-backup-edit"
          options={{
            headerTitle: 'Edit Backup',
            headerBackTitle: 'Web Servers',
          }}
        />
      </Stack.Protected>
      <Stack.Screen
        name="requests-filters"
        options={{
          headerTitle: 'Filters',
          headerBackTitle: 'Requests',
        }}
      />
      <Stack.Screen
        name="project-domain-new"
        options={{
          headerTitle: 'Add Domain',
          headerRight: () => null,
        }}
      />
      <Stack.Screen
        name="deployment-detail"
        options={{
          headerRight: () => null,
        }}
      />
    </Stack>
  );
}
