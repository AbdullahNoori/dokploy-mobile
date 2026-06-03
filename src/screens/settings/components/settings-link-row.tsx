import { Pressable, View } from 'react-native';

import { Link } from 'expo-router';
import type { LucideIcon } from 'lucide-react-native';
import { ChevronRightIcon } from 'lucide-react-native';

import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { useHaptics } from '@/hooks/use-haptics';

type SettingsLinkRowProps = {
  href: '/(app)/notifications' | '/(app)/requests' | '/(app)/web-servers';
  icon: LucideIcon;
  label: string;
};

export function SettingsLinkRow({ href, icon, label }: SettingsLinkRowProps) {
  const { impact } = useHaptics();

  return (
    <Link href={href} asChild>
      <Pressable
        onPressOut={() => {
          void impact();
        }}
        className="bg-card border-border/80 flex-row items-center justify-between rounded-lg border px-4 py-3">
        <View className="flex-row items-center gap-3">
          <Icon as={icon} className="size-5" />
          <Text className="font-semibold">{label}</Text>
        </View>
        <Icon as={ChevronRightIcon} className="text-muted-foreground size-5" />
      </Pressable>
    </Link>
  );
}
