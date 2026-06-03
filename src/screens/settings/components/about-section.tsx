import { useCallback } from 'react';
import { Linking, Pressable, View } from 'react-native';

import type { LucideIcon } from 'lucide-react-native';
import { ExternalLinkIcon, GithubIcon, LinkedinIcon } from 'lucide-react-native';
import { toast } from 'sonner-native';

import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { useHaptics } from '@/hooks/use-haptics';

import { SettingsSectionLabel } from './settings-section-label';

type SettingsSocialLinkProps = {
  icon: LucideIcon;
  label: string;
  url: string;
};

const PERSONAL_LINKS = [
  {
    icon: GithubIcon,
    label: 'Open Abdullah on GitHub',
    url: 'https://github.com/AbdullahNoori/',
  },
  {
    icon: LinkedinIcon,
    label: 'Open Abdullah on LinkedIn',
    url: 'https://www.linkedin.com/in/abdullah-noori-b8aa38354/',
  },
  {
    icon: ExternalLinkIcon,
    label: "Open Abdullah's website",
    url: 'https://abdullahnoori.vercel.app',
  },
] satisfies SettingsSocialLinkProps[];

function SettingsSocialLink({ icon, label, url }: SettingsSocialLinkProps) {
  const { impact, notifyError } = useHaptics();

  const openLink = useCallback(async () => {
    await impact();

    try {
      await Linking.openURL(url);
    } catch {
      await notifyError();
      toast.error('Unable to open that link right now.');
    }
  }, [impact, notifyError, url]);

  return (
    <Pressable
      onPress={openLink}
      accessibilityRole="link"
      accessibilityLabel={label}
      hitSlop={8}
      className="active:bg-accent size-11 items-center justify-center rounded-lg">
      <Icon as={icon} className="text-muted-foreground size-4" />
    </Pressable>
  );
}

export function AboutSection() {
  return (
    <View className="gap-2 pt-2">
      <SettingsSectionLabel label="About" />
      <View className="flex-row items-center justify-between gap-3 px-1 py-1">
        <View className="min-w-0 flex-1">
          <Text className="text-sm font-medium">Built by Abdullah Noori</Text>
          <Text variant="muted" className="mt-0.5">
            Dokploy Mobile
          </Text>
        </View>
        <View className="flex-row items-center gap-2">
          {PERSONAL_LINKS.map((link) => (
            <SettingsSocialLink
              key={link.label}
              icon={link.icon}
              label={link.label}
              url={link.url}
            />
          ))}
        </View>
      </View>
    </View>
  );
}
