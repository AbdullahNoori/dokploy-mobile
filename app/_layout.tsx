import '@/global.css';
import { NAV_THEME } from '@/src/lib/theme';

import { ThemeProvider } from '@react-navigation/native';
import { PortalHost } from '@rn-primitives/portal';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { useUniwind } from 'uniwind';

import { AuthProvider } from '@/src/auth/AuthProvider';
import { useAuth } from '@/src/auth/useAuth';
import { SplashScreen } from '@/src/components/splash-screen';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export default function RootLayout() {
  const { theme } = useUniwind();
  const router = useRouter();
  const segments = useSegments();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inAppGroup = segments[0] === '(app)';

    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/(auth)');
      return;
    }

    if (isAuthenticated && !inAppGroup) {
      router.replace('/(app)');
    }
  }, [isAuthenticated, isLoading, router, segments]);

  return (
    <AuthProvider>
      <ThemeProvider value={NAV_THEME[theme ?? 'light']}>
        <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
        {isLoading ? <SplashScreen /> : <Stack screenOptions={{ headerShown: false }} />}
        <PortalHost />
      </ThemeProvider>
    </AuthProvider>
  );
}
