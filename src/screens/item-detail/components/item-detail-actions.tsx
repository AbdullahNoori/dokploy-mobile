import { View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';

export function ItemDetailActions() {
  return (
    <View className="bg-card border-border/80 mt-5 rounded-2xl border p-4">
      <Text className="text-base font-semibold">Deploy Settings</Text>
      <View className="mt-4 flex-row flex-wrap gap-3">
        <Button disabled>
          <Text>Deploy</Text>
        </Button>
        <Button variant="secondary" disabled>
          <Text>Reload</Text>
        </Button>
        <Button variant="secondary" disabled>
          <Text>Rebuild</Text>
        </Button>
        <Button variant="destructive" disabled>
          <Text>Stop</Text>
        </Button>
      </View>
    </View>
  );
}
