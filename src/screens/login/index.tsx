import { SafeAreaView } from '@/components/ui/safe-area-view';
import { normalizeServerUrl } from '@/lib/http-config';
import { useAuthStore } from '@/store/auth-store';
import { Stack } from 'expo-router';
import { useCallback, useState } from 'react';
import { toast } from 'sonner-native';
import LoginForm from './components/login-form';

export default function LoginScreen() {
  const [serverUrl, setServerUrlInput] = useState('');
  const [pat, setPatInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const login = useAuthStore((state) => state.login);

  const handleSubmit = useCallback(async () => {
    if (isSubmitting) {
      return;
    }

    const normalizedUrl = normalizeServerUrl(serverUrl);
    const trimmedPat = pat.trim();

    if (!normalizedUrl) {
      toast.error('Enter a valid server URL.');
      return;
    }

    if (!trimmedPat) {
      toast.error('Enter a personal access token.');
      return;
    }

    setIsSubmitting(true);

    try {
      await login({ serverUrl: normalizedUrl, pat: trimmedPat });
      toast.success('Connected to Dokploy.');
    } catch {
      toast.error('Unable to connect. Check your URL and token.');
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting, login, pat, serverUrl]);

  return (
    <SafeAreaView className="bg-background flex-1" edges={['top', 'right', 'left']}>
      <Stack.Screen options={{ title: 'Login', headerShown: false }} />
      <LoginForm
        serverUrl={serverUrl}
        pat={pat}
        isSubmitting={isSubmitting}
        onChangeServerUrl={setServerUrlInput}
        onChangePat={setPatInput}
        onSubmit={handleSubmit}
      />
    </SafeAreaView>
  );
}
