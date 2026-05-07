import { Text } from '@/components/ui/text';

type Props = {
  label: string;
};

export function HomeSectionLabel({ label }: Props) {
  return (
    <Text variant="muted" className="px-1 text-xs font-medium">
      {label}
    </Text>
  );
}
