import { Stack } from 'expo-router';

export const unstable_settings = {
  initialRouteName: 'index',
};

export default function ProjectsLayout() {
  return (
    <Stack
      screenOptions={{
        headerBackButtonDisplayMode: 'minimal',
        headerTransparent: true,
        headerTitle: 'Projects',
        headerShadowVisible: true,
        headerStyle: { backgroundColor: 'transparent' },
      }}>
      <Stack.Screen name="index" />
    </Stack>
  );
}
