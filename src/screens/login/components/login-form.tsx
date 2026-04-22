import { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { useUniwind } from 'uniwind';

import DokployLogoDark from '@/assets/logo/dokploy-dark.svg';
import DokployLogo from '@/assets/logo/dokploy.svg';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { useHaptics } from '@/hooks/use-haptics';
import { THEME } from '@/lib/theme';

import PatHelpSheet from './pat-help-sheet';

type LoginFormProps = {
  serverUrl: string;
  pat: string;
  isSubmitting: boolean;
  onChangeServerUrl: (value: string) => void;
  onChangePat: (value: string) => void;
  onSubmit: () => void;
};

export default function LoginForm({
  serverUrl,
  pat,
  isSubmitting,
  onChangeServerUrl,
  onChangePat,
  onSubmit,
}: LoginFormProps) {
  const [isPatHelpOpen, setIsPatHelpOpen] = useState(false);
  const { theme } = useUniwind();
  const { selection } = useHaptics();
  const resolvedTheme = theme === 'dark' ? 'dark' : 'light';
  const Logo = resolvedTheme === 'dark' ? DokployLogoDark : DokployLogo;

  const openPatHelp = () => {
    void selection();
    setIsPatHelpOpen(true);
  };

  const handlePatHelpOpenChange = (open: boolean) => {
    void selection();
    setIsPatHelpOpen(open);
  };

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.select({ ios: 'padding', android: undefined })}>
      <ScrollView
        contentContainerClassName="flex-grow justify-center p-4"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <View className="mx-auto w-full max-w-md gap-6">
          <View className="items-center gap-3">
            <View className="flex-row items-center gap-3">
              <Logo width={40} height={40} />
              <Text variant="h3" className="text-center">
                Sign in
              </Text>
            </View>
            <Text variant="muted" className="text-center">
              Enter your server URL and personal access token to sign in
            </Text>
          </View>

          <View className="gap-4">
            <View className="gap-2">
              <Text className="font-medium">Server URL</Text>
              <Input
                className="bg-input h-12 rounded-lg px-3"
                placeholder="https://your-dokploy.example.com"
                value={serverUrl}
                onChangeText={onChangeServerUrl}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
                textContentType="URL"
                returnKeyType="next"
              />
            </View>

            <View className="gap-2">
              <Text className="font-medium">Personal Access Token</Text>
              <View className="relative">
                <Input
                  className="bg-input h-12 rounded-lg px-3"
                  placeholder="Enter your token"
                  value={pat}
                  onChangeText={onChangePat}
                  autoCapitalize="none"
                  autoCorrect={false}
                  secureTextEntry
                  textContentType="password"
                  returnKeyType="done"
                  onSubmitEditing={onSubmit}
                />
              </View>
              <Button variant="link" className="h-11 self-start px-0 py-0" onPress={openPatHelp}>
                <Text>Need a personal access token?</Text>
              </Button>
            </View>
          </View>

          <View className="gap-2">
            <Button
              onPress={onSubmit}
              disabled={isSubmitting}
              className="h-12 rounded-lg"
              variant={'default'}>
              {isSubmitting ? (
                <ActivityIndicator size="small" color={THEME[resolvedTheme].primaryForeground} />
              ) : (
                <Text>Login</Text>
              )}
            </Button>
          </View>
        </View>
      </ScrollView>
      <PatHelpSheet open={isPatHelpOpen} onOpenChange={handlePatHelpOpenChange} />
    </KeyboardAvoidingView>
  );
}
