import { Text } from '@/components/ui/text';
import { View } from 'react-native';

type Props = {
  title: string;
  detail?: string;
};

export function NotificationsSectionHeader({ title, detail }: Props) {
  return (
    <View className="flex-row items-center justify-between gap-3">
      <Text variant="muted" className="text-xs font-semibold tracking-wide uppercase">
        {title}
      </Text>
      {detail ? (
        <Text variant="muted" className="text-xs">
          {detail}
        </Text>
      ) : null}
    </View>
  );
}
