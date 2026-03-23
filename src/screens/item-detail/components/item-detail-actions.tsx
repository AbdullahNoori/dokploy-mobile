import { ActivityIndicator, View } from 'react-native';
import { Ban, HammerIcon, RefreshCwIcon, RocketIcon } from 'lucide-react-native';
import { useUniwind } from 'uniwind';

import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { THEME } from '@/lib/theme';
import { useItemDetailActions } from '@/hooks/use-item-detail-actions';

type Props = {
  isApplication: boolean;
  applicationId?: string;
  appName?: string;
  isDeploymentRunning?: boolean;
  onRefresh: () => void;
};

export function ItemDetailActions({
  isApplication,
  applicationId,
  appName,
  isDeploymentRunning,
  onRefresh,
}: Props) {
  const { theme } = useUniwind();
  const resolvedTheme = theme === 'dark' ? 'dark' : 'light';

  const {
    activeAction,
    isBusy,
    canDeploy,
    canReload,
    canStop,
    onDeploy,
    onReload,
    onStop,
  } = useItemDetailActions({
    isApplication,
    applicationId,
    appName,
    isDeploymentRunning,
    onRefresh,
  });

  const primarySpinner = THEME[resolvedTheme].primaryForeground;
  const secondarySpinner = THEME[resolvedTheme].secondaryForeground;

  return (
    <View className="bg-card border-border/80 mt-5 rounded-2xl border p-4">
      <Text className="text-base font-semibold">Deploy Settings</Text>
      <View className="mt-4 flex-row items-center gap-2">
        <Button
          size="sm"
          className="flex-1 gap-1.5 px-2.5"
          disabled={!canDeploy || isBusy}
          onPress={onDeploy}>
          {activeAction === 'deploy' ? (
            <View className="w-4 items-center">
              <ActivityIndicator size="small" color={primarySpinner} />
            </View>
          ) : (
            <View className="w-4 items-center">
              <Icon as={RocketIcon} className="text-primary-foreground size-3.5" />
            </View>
          )}
          <Text className="text-xs" numberOfLines={1}>
            Deploy
          </Text>
        </Button>
        <Button
          variant="secondary"
          size="sm"
          className="flex-1 gap-1.5 px-2.5"
          disabled={!canReload || isBusy}
          onPress={onReload}>
          {activeAction === 'reload' ? (
            <View className="w-4 items-center">
              <ActivityIndicator size="small" color={secondarySpinner} />
            </View>
          ) : (
            <View className="w-4 items-center">
              <Icon as={RefreshCwIcon} className="text-secondary-foreground size-3.5" />
            </View>
          )}
          <Text className="text-xs" numberOfLines={1}>
            Reload
          </Text>
        </Button>
        <Button
          variant="secondary"
          disabled
          size="sm"
          className="flex-1 gap-1.5 px-2.5">
          <View className="w-4 items-center">
            <Icon as={HammerIcon} className="text-secondary-foreground size-3.5" />
          </View>
          <Text className="text-xs" numberOfLines={1}>
            Rebuild
          </Text>
        </Button>
        <Button
          variant="destructive"
          size="sm"
          className="flex-1 gap-1.5 px-2.5"
          disabled={!canStop || isBusy}
          onPress={onStop}>
          {activeAction === 'stop' ? (
            <View className="w-4 items-center">
              <ActivityIndicator size="small" color="white" />
            </View>
          ) : (
            <View className="w-4 items-center">
              <Icon as={Ban} className="size-3.5 text-white" />
            </View>
          )}
          <Text className="text-xs" numberOfLines={1}>
            Stop
          </Text>
        </Button>
      </View>
    </View>
  );
}
