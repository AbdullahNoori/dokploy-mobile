import { Linking, Pressable, View } from 'react-native';
import { CopyrightIcon } from 'lucide-react-native';
import { toast } from 'sonner-native';

import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { useHaptics } from '@/hooks/use-haptics';

const GITHUB_URL = 'https://github.com/AbdullahNoori/';

export function LoginAttributionFooter() {
  const { impact, notifyError } = useHaptics();

  async function openGithub() {
    await impact();

    try {
      await Linking.openURL(GITHUB_URL);
    } catch {
      await notifyError();
      toast.error('Unable to open GitHub right now.');
    }
  }

  return (
    <View className="items-center pt-2">
      <View className="flex-row flex-wrap items-center justify-center">
        <Text variant="muted" className="text-center text-xs">
          Dokploy mobile app by
        </Text>
        <Pressable
          onPress={openGithub}
          accessibilityRole="link"
          accessibilityLabel="Open Abdullah Noori on GitHub"
          hitSlop={8}
          className="h-11 justify-center px-1">
          <Text className="text-sm font-semibold">Abdullah Noori</Text>
        </Pressable>
        <Icon as={CopyrightIcon} className="text-muted-foreground ml-0.5 size-3.5" />
      </View>
    </View>
  );
}
