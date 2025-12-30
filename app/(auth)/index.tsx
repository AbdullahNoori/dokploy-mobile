import { authenticateWithPat } from '@/api/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { HttpError } from '@/lib/http-error';
import { getServerUrl, normalizeServerUrl } from '@/lib/pat-storage';
import { useAuthStore } from '@/store/auth';
import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  LayoutAnimation,
  Modal,
  Platform,
  ScrollView,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useUniwind } from 'uniwind';

const LOGO = {
  light: require('@/assets/images/react-native-reusables-light.png'),
  dark: require('@/assets/images/react-native-reusables-dark.png'),
};

const AnimatedView = Animated.createAnimatedComponent(View);
const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

export default function LoginScreen() {
  const { theme } = useUniwind();
  const setAuthFromResponse = useAuthStore((state) => state.setAuthFromResponse);

  const [serverUrl, setServerUrl] = useState(() => getServerUrl() ?? '');
  const [pat, setPat] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const canSubmit = useMemo(
    () => !!normalizeServerUrl(serverUrl) && !!pat.trim(),
    [pat, serverUrl]
  );

  const handleServerChange = useCallback(
    (value: string) => {
      setServerUrl(value);
      if (error) setError(null);
    },
    [error]
  );

  const handlePatChange = useCallback(
    (value: string) => {
      setPat(value);
      if (error) setError(null);
    },
    [error]
  );

  const handleSubmit = useCallback(async () => {
    const token = pat.trim();
    const normalizedServer = normalizeServerUrl(serverUrl);

    if (!normalizedServer) {
      setError('Enter the Dokploy server URL to continue.');
      return;
    }

    if (!token) {
      setError('Enter your personal access token to continue.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      setServerUrl(normalizedServer);
      const response = await authenticateWithPat(token, normalizedServer);
      await setAuthFromResponse(response);
    } catch (err: any) {
      const message = err instanceof HttpError ? err.message : (err?.message ?? null);
      setError(message ?? 'We could not verify that token. Double-check it and try again.');
    } finally {
      setSubmitting(false);
    }
  }, [pat, serverUrl, setAuthFromResponse]);

  const handleNext = () => {
    Keyboard.dismiss();
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View className="bg-background flex-1">
        <KeyboardAvoidingView
          behavior={Platform.select({ ios: 'padding', android: undefined })}
          className="flex-1">
          <AnimatedScrollView
            entering={FadeInUp.duration(400)}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ flexGrow: 1 }}>
            <AnimatedView className="flex-1 items-center justify-center px-5 py-8">
              <Animated.View
                entering={FadeInDown.delay(140).duration(450)}
                className="w-full max-w-xl items-center gap-6">
                <View className="w-full items-center gap-3">
                  <View className="bg-card border-border h-20 w-20 items-center justify-center rounded-full border shadow-lg shadow-black/10">
                    <Image
                      source={LOGO[theme ?? 'light']}
                      className="h-[72%] w-[72%]"
                      resizeMode="contain"
                    />
                  </View>
                  <Text className="text-foreground text-center text-2xl font-extrabold">
                    Welcome to Dokploy
                  </Text>
                  <Text className="text-muted-foreground max-w-md text-center text-base leading-6">
                    Connect to your Dokploy workspace with your server URL and a personal access
                    token.
                  </Text>
                </View>

                <Card className="w-full max-w-xl border shadow-xl shadow-black/10">
                  <CardContent className="flex flex-col gap-6">
                    <View className="gap-2">
                      <Text className="text-foreground text-sm font-semibold">
                        Dokploy server URL
                      </Text>
                      <Input
                        value={serverUrl}
                        onChangeText={handleServerChange}
                        placeholder="https://cloud.dokploy.com"
                        autoCapitalize="none"
                        autoCorrect={false}
                        keyboardType="url"
                        textContentType="URL"
                        className="h-12 text-base font-semibold"
                        returnKeyType="next"
                        onSubmitEditing={handleNext}
                      />
                      <Text className="text-muted-foreground text-xs leading-5">
                        Use your self-hosted Dokploy base URL or the Dokploy Cloud address.
                      </Text>
                    </View>

                    <View className="gap-2">
                      <Text className="text-foreground text-sm font-semibold">
                        Personal access token
                      </Text>
                      <Input
                        value={pat}
                        onChangeText={handlePatChange}
                        placeholder="dpk_live_xxxx"
                        autoCapitalize="none"
                        autoCorrect={false}
                        textContentType="password"
                        className="h-24 text-base font-semibold"
                        multiline
                      />
                      <Text className="text-muted-foreground text-xs leading-5">
                        Generate a Personal Access Token (PAT) in your Dokploy account settings and
                        paste it here.
                      </Text>
                    </View>

                    <TouchableOpacity
                      className="mt-1"
                      onPress={() => setShowHelp(true)}
                      accessibilityRole="button">
                      <Text className="text-primary text-sm font-semibold underline">
                        How to generate a PAT
                      </Text>
                    </TouchableOpacity>

                    {error ? (
                      <Text className="text-destructive text-sm font-semibold">{error}</Text>
                    ) : null}

                    <Button
                      variant="default"
                      size="lg"
                      onPress={handleSubmit}
                      disabled={!canSubmit || submitting}
                      className="shadow-primary/25 h-12 rounded-lg shadow-lg disabled:opacity-70">
                      {submitting ? (
                        <View className="flex-row items-center gap-2">
                          <ActivityIndicator color="#ffffff" />
                          <Text className="text-primary-foreground text-base font-semibold">
                            Signing you in…
                          </Text>
                        </View>
                      ) : (
                        <Text className="text-primary-foreground text-base font-semibold">
                          Continue
                        </Text>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </Animated.View>
            </AnimatedView>
          </AnimatedScrollView>
        </KeyboardAvoidingView>

        <Modal
          transparent
          animationType="fade"
          visible={showHelp}
          onRequestClose={() => setShowHelp(false)}>
          <View className="flex-1 items-center justify-center bg-black/50 px-5">
            <View className="bg-card border-border w-full gap-3 rounded-2xl border p-6 shadow-xl shadow-black/15">
              <Text className="text-foreground text-xl font-extrabold">How to generate a PAT</Text>
              <Text className="text-muted-foreground text-base leading-6">
                Follow these quick steps to create a new personal access token in Dokploy.
              </Text>
              <View className="gap-2">
                <Text className="text-foreground text-base leading-6">
                  1. Sign in to Dokploy and open Settings.
                </Text>
                <Text className="text-foreground text-base leading-6">
                  2. Select Personal Access Tokens.
                </Text>
                <Text className="text-foreground text-base leading-6">
                  3. Create a token, set the scopes you need, and copy it.
                </Text>
                <Text className="text-foreground text-base leading-6">
                  4. Paste the token here and continue.
                </Text>
              </View>
              <Button
                onPress={() => setShowHelp(false)}
                className="bg-primary shadow-primary/20 h-11 rounded-lg shadow-md"
                variant="default">
                <Text className="text-primary-foreground text-base font-semibold">Close</Text>
              </Button>
            </View>
          </View>
        </Modal>
      </View>
    </TouchableWithoutFeedback>
  );
}
