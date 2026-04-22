import { Stack } from 'expo-router';

import { sheetPresentationOptions } from '@/navigation/screen-options';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, headerBackButtonDisplayMode: 'minimal' }}>
      <Stack.Screen name="login" />
      <Stack.Screen
        name="modals"
        options={{
          ...sheetPresentationOptions,
          headerShown: false,
        }}
      />
    </Stack>
  );
}
