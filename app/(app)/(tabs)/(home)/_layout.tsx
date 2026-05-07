import { Stack } from 'expo-router';
import { Platform } from 'react-native';

export default function HomeLayout() {
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
      <Stack.Screen name="index" options={{ title: 'Home' }} />
    </Stack>
  );
}
