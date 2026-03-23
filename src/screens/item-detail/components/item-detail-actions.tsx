import { View } from 'react-native';
import { RefreshCwIcon, RocketIcon, SquareStopIcon, WrenchIcon } from 'lucide-react-native';

import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';

export function ItemDetailActions() {
  return (
    <View className="bg-card border-border/80 mt-5 rounded-2xl border p-4">
      <Text className="text-base font-semibold">Deploy Settings</Text>
      <View className="mt-4 flex-row flex-wrap gap-2">
        <Button disabled size="sm" className="gap-1.5 px-2.5">
          <Icon as={RocketIcon} className="size-3.5 text-primary-foreground" />
          <Text className="text-xs">Deploy</Text>
        </Button>
        <Button variant="secondary" disabled size="sm" className="gap-1.5 px-2.5">
          <Icon as={RefreshCwIcon} className="size-3.5 text-secondary-foreground" />
          <Text className="text-xs">Reload</Text>
        </Button>
        <Button variant="secondary" disabled size="sm" className="gap-1.5 px-2.5">
          <Icon as={WrenchIcon} className="size-3.5 text-secondary-foreground" />
          <Text className="text-xs">Rebuild</Text>
        </Button>
        <Button variant="destructive" disabled size="sm" className="gap-1.5 px-2.5">
          <Icon as={SquareStopIcon} className="size-3.5 text-white" />
          <Text className="text-xs">Stop</Text>
        </Button>
      </View>
    </View>
  );
}
