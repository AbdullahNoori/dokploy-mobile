import { View } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { CalendarClockIcon } from 'lucide-react-native';

type Props = {
  compact?: boolean;
};

export function ProjectsEmptyState({ compact = false }: Props) {
  return (
    <View className={cn('items-center gap-2 px-6', compact ? 'pt-24' : 'flex-1 justify-center')}>
      <Icon as={CalendarClockIcon} className="text-muted-foreground size-6" />
      <Text variant="h4">No projects found</Text>
      <Text variant="muted" className="text-center">
        Try changing your filters or create a new project.
      </Text>
    </View>
  );
}
