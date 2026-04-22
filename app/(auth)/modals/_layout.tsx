import { Stack } from 'expo-router';

import { formSheetScreenOptions } from '@/navigation/screen-options';

export default function AuthModalsLayout() {
  return (
    <Stack screenOptions={formSheetScreenOptions}>
      <Stack.Screen
        name="pat-help"
        options={{
          headerTitle: 'Personal access token',
          headerBackTitle: 'Sign in',
        }}
      />
    </Stack>
  );
}
