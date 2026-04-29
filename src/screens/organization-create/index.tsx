import { useCallback, useRef, useState } from 'react';
import { ScrollView, TextInput, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { toast } from 'sonner-native';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { Text } from '@/components/ui/text';
import { useHaptics } from '@/hooks/use-haptics';
import { useAuthStore } from '@/store/auth-store';

export default function OrganizationCreateScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const patInputRef = useRef<TextInput>(null);
  const addOrganization = useAuthStore((state) => state.addOrganization);
  const [name, setName] = useState('');
  const [pat, setPat] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { impact, notifyError, notifySuccess } = useHaptics();
  const canSubmit = name.trim().length > 0 && pat.trim().length > 0 && !isSubmitting;

  const handleSubmit = useCallback(async () => {
    if (isSubmitting) {
      return;
    }

    await impact();

    const trimmedName = name.trim();
    const trimmedPat = pat.trim();

    if (!trimmedName) {
      await notifyError();
      toast.error('Enter an organization name.');
      return;
    }

    if (!trimmedPat) {
      await notifyError();
      toast.error('Enter a personal access token.');
      return;
    }

    setIsSubmitting(true);

    try {
      await addOrganization({
        name: trimmedName,
        pat: trimmedPat,
      });
      await notifySuccess();
      toast.success('Organization added.');
      router.dismissTo('/(app)/organizations');
    } catch (error) {
      await notifyError();
      toast.error(error instanceof Error ? error.message : 'Unable to add that organization.');
    } finally {
      setIsSubmitting(false);
    }
  }, [addOrganization, impact, isSubmitting, name, notifyError, notifySuccess, pat, router]);

  return (
    <SafeAreaView className="bg-background flex-1" edges={['left', 'right']}>
      <Stack.Screen options={{ title: 'Add Organization' }} />
      <View className="flex-1">
        <ScrollView
          className="flex-1"
          contentInsetAdjustmentBehavior="automatic"
          automaticallyAdjustKeyboardInsets={true}
          keyboardDismissMode="interactive"
          contentContainerClassName="gap-6 px-4 pt-6"
          contentContainerStyle={{ paddingBottom: 76 + insets.bottom }}
          scrollIndicatorInsets={{ bottom: 96 + insets.bottom }}
          showsVerticalScrollIndicator={false}>
          <View className="gap-2">
            <Text className="text-sm font-semibold">Organization Name</Text>
            <Input
              className="h-12 rounded-lg"
              placeholder="Acme Production"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              returnKeyType="next"
              blurOnSubmit={false}
              onSubmitEditing={() => patInputRef.current?.focus()}
            />
          </View>

          <View className="gap-2">
            <Text className="text-sm font-semibold">Personal Access Token</Text>
            <Text variant="muted" className="text-xs">
              Use a token created for the organization you want to manage.
            </Text>
            <Input
              ref={patInputRef}
              className="h-12 rounded-lg"
              placeholder="Enter organization token"
              value={pat}
              onChangeText={setPat}
              autoCapitalize="none"
              autoCorrect={false}
              secureTextEntry
              textContentType="password"
              returnKeyType="done"
              onSubmitEditing={handleSubmit}
            />
          </View>
        </ScrollView>

        <View
          className="bg-background border-border/60 shrink-0 border-t px-4 pt-3"
          style={{ paddingBottom: Math.max(insets.bottom, 12) }}>
          <Button disabled={!canSubmit} onPress={handleSubmit} className="h-12 rounded-md">
            <Text>{isSubmitting ? 'Saving organization...' : 'Save Organization'}</Text>
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
}
