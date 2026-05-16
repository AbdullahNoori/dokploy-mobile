import { Pressable, View } from 'react-native';

import { Building2Icon, ChevronRightIcon } from 'lucide-react-native';

import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';

import { SettingsSectionLabel } from './settings-section-label';

type OrganizationsSectionProps = {
  activeOrganizationName?: string;
  organizationCount: number;
  onPress: () => void;
};

export function OrganizationsSection({
  activeOrganizationName,
  organizationCount,
  onPress,
}: OrganizationsSectionProps) {
  return (
    <View className="gap-2">
      <SettingsSectionLabel label="Organizations" />
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        className="bg-card border-border/80 flex-row items-center justify-between rounded-lg border px-4 py-3">
        <View className="min-w-0 flex-1 flex-row items-center gap-3 pr-4">
          <Icon as={Building2Icon} className="size-5" />
          <View className="min-w-0 flex-1">
            <Text className="font-semibold">
              {organizationCount} saved organization{organizationCount === 1 ? '' : 's'}
            </Text>
            {activeOrganizationName ? (
              <Text variant="muted" className="mt-0.5" numberOfLines={1}>
                Active: {activeOrganizationName}
              </Text>
            ) : null}
          </View>
        </View>
        <Icon as={ChevronRightIcon} className="text-muted-foreground size-5" />
      </Pressable>
    </View>
  );
}
