import { View } from 'react-native';

import { GlobeIcon, ShieldIcon } from 'lucide-react-native';

import { SettingsLinkRow } from './settings-link-row';
import { SettingsSectionLabel } from './settings-section-label';

type OperationsSectionProps = {
  hasOwnerAccess: boolean;
};

export function OperationsSection({ hasOwnerAccess }: OperationsSectionProps) {
  return (
    <View className="gap-2">
      <SettingsSectionLabel label="Operations" />
      {hasOwnerAccess ? (
        <SettingsLinkRow href="/(app)/web-servers" icon={GlobeIcon} label="Web Servers" />
      ) : null}
      <SettingsLinkRow href="/(app)/requests" icon={ShieldIcon} label="Requests" />
    </View>
  );
}
