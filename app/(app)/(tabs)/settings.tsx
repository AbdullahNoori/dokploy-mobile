import { View } from 'react-native';

import { Text } from '@/src/components/ui/text';

export default function SettingsScreen() {
  return (
    <View className="bg-background flex-1 items-center justify-center gap-2">
      <Text className="text-foreground text-lg font-semibold">Settings</Text>
      <Text className="text-muted-foreground text-sm">Coming soon.</Text>
    </View>
  );
}
