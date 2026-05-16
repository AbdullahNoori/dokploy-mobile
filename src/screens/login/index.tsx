import { useCallback, useState } from 'react';
import { Stack } from 'expo-router';
import { toast } from 'sonner-native';

import { SafeAreaView } from '@/components/ui/safe-area-view';
import { useHaptics } from '@/hooks/use-haptics';
import { normalizeServerUrl } from '@/lib/http-config';
import { useAuthStore } from '@/store/auth-store';

import LoginForm from './components/login-form';
import { getLoginErrorMessage } from './lib/login-error-message';

export default function LoginScreen() {
  const [serverUrl, setServerUrlInput] = useState('');
  const [pat, setPatInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const login = useAuthStore((state) => state.login);
  const { impact, notifyError, notifySuccess } = useHaptics();

  const handleSubmit = useCallback(async () => {
    if (isSubmitting) {
      return;
    }

    await impact();

    const normalizedUrl = normalizeServerUrl(serverUrl);
    const trimmedPat = pat.trim();

    if (!normalizedUrl) {
      await notifyError();
      toast.error('Enter a valid server URL.');
      return;
    }

    if (!trimmedPat) {
      await notifyError();
      toast.error('Enter a personal access token.');
      return;
    }

    setIsSubmitting(true);

    try {
      await login({ serverUrl: normalizedUrl, pat: trimmedPat });
      await notifySuccess();
      toast.success('Connected to Dokploy.');
    } catch (error) {
      await notifyError();
      toast.error(getLoginErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }, [impact, isSubmitting, login, notifyError, notifySuccess, pat, serverUrl]);

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
