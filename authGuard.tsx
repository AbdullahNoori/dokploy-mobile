import { Redirect } from 'expo-router';
import { useAuthStore } from './src/store/auth';

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { token, hydrated } = useAuthStore();

  if (!hydrated) return null; // or splash

  if (!token) return <Redirect href="/(tabs)" />;

  return children;
}
