import { Stack } from 'expo-router';
import { Platform } from 'react-native';

export const unstable_settings = {
  initialRouteName: 'projects',
};

export default function ProjectsLayout() {
  return (
    <Stack
      screenOptions={{
        headerBackButtonDisplayMode: 'minimal',
        headerTransparent: Platform.OS === 'ios',
        headerShadowVisible: true,
        headerStyle: Platform.select({
          ios: { backgroundColor: 'transparent' },
          default: undefined,
        }),
      }}>
      <Stack.Screen name="projects" options={{ title: 'Projects' }} />
    </Stack>
  );
}
