import { ActivityIndicator, View } from 'react-native';

import { Text } from '@/src/components/ui/text';

export function SplashScreen() {
  return (
    <View className="bg-background flex-1 items-center justify-center">
      <ActivityIndicator size="large" />
      <Text className="text-muted-foreground mt-4 text-sm">Loading your workspace...</Text>
    </View>
  );
}
