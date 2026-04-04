import { ThemeToggle } from '@/components/theme-toggle';
import { Stack } from 'expo-router';

export const unstable_settings = {
  initialRouteName: 'index',
};

export default function ProjectsLayout() {
  return (
    <Stack
      screenOptions={{
        headerTransparent: true,
        headerTitle: 'Projects',
        headerShadowVisible: true,
        headerStyle: { backgroundColor: 'transparent' },
        headerRight: () => <ThemeToggle />,
      }}>
      <Stack.Screen name="index" />
      <Stack.Screen
        name="item/[itemId]/domain/create"
        options={{
          presentation: 'formSheet',
          sheetAllowedDetents: [0.9, 0.98],
          sheetInitialDetentIndex: 0,
          sheetGrabberVisible: true,
          sheetCornerRadius: 24,
          sheetLargestUndimmedDetentIndex: 0,
          headerTransparent: true,
          headerTitle: 'Add Domain',
          headerShadowVisible: false,
          headerRight: () => null,
        }}
      />
      <Stack.Screen
        name="item/[itemId]/deployment/[deploymentId]"
        options={{
          presentation: 'formSheet',
          sheetAllowedDetents: [0.9, 0.98],
          sheetInitialDetentIndex: 0,
          sheetGrabberVisible: true,
          sheetCornerRadius: 24,
          sheetLargestUndimmedDetentIndex: 0,
          headerTransparent: true,
          headerTitle: 'Deployment',
          headerShadowVisible: false,
          headerRight: () => null,
        }}
      />
    </Stack>
  );
}
