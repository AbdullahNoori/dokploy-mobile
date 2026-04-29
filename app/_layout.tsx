import '../global.css';
import '@/lib/reactotron.ts';

import { NAV_THEME } from '@/lib/theme';
import { ThemeProvider } from '@react-navigation/native';
import { PortalHost } from '@rn-primitives/portal';
import { SplashScreen, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SWRConfig } from 'swr';
import { Toaster } from 'sonner-native';
import { useUniwind } from 'uniwind';

import { getOrganizationSWRCache } from '@/lib/swr-cache';
import { useAuthStore } from '@/store/auth-store';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

void SplashScreen.preventAutoHideAsync().catch(() => {
  // No-op: splash may already be prevented.
});

export default function RootLayout() {
  const { theme } = useUniwind();
  const status = useAuthStore((state) => state.status);
  const activeOrganizationId = useAuthStore((state) => state.activeOrganizationId);
  const bootstrap = useAuthStore((state) => state.bootstrap);

  const resolvedTheme = theme === 'dark' ? 'dark' : 'light';
  const swrConfig = useMemo(() => ({ provider: getOrganizationSWRCache }), [activeOrganizationId]);

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  useEffect(() => {
    if (status !== 'booting') {
      void SplashScreen.hideAsync();
    }
  }, [status]);

  if (status === 'booting') {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={NAV_THEME[resolvedTheme]}>
        <StatusBar style={resolvedTheme === 'dark' ? 'light' : 'dark'} />
        <SWRConfig value={swrConfig}>
          <Stack screenOptions={{ headerShown: false, headerBackButtonDisplayMode: 'minimal' }}>
            <Stack.Protected guard={status === 'signedIn'}>
              <Stack.Screen name="(app)" options={{ headerShown: false }} />
            </Stack.Protected>

            <Stack.Protected guard={status === 'signedOut'}>
              <Stack.Screen name="(auth)" />
            </Stack.Protected>

            <Stack.Screen name="+not-found" />
          </Stack>
        </SWRConfig>
        <PortalHost />
        <Toaster richColors />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
