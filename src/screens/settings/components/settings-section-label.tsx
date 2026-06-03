import { Text } from '@/components/ui/text';

type SettingsSectionLabelProps = {
  label: string;
};

export function SettingsSectionLabel({ label }: SettingsSectionLabelProps) {
  return (
    <Text variant="muted" className="px-1 text-xs font-medium">
      {label}
    </Text>
  );
}
