import { Text } from '@/components/ui/text';

type Props = {
  title: string;
};

export function NotificationsSectionHeader({ title }: Props) {
  return (
    <Text variant="muted" className="text-xs font-semibold uppercase tracking-wide">
      {title}
    </Text>
  );
}
