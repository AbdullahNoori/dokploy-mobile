import { View } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { CalendarClockIcon } from 'lucide-react-native';

export function ProjectsEmptyState() {
  return (
    <View className="flex-1 items-center justify-center gap-2 px-6">
      <Icon as={CalendarClockIcon} className="text-muted-foreground size-6" />
      <Text variant="h4">No projects found</Text>
      <Text variant="muted" className="text-center">
        Try changing your filters or create a new project.
      </Text>
    </View>
  );
}
