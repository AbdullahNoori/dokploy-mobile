import { View } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useHeaderHeight } from '@react-navigation/elements';

import { SafeAreaView } from '@/components/ui/safe-area-view';
import { Text } from '@/components/ui/text';
import { useDeploymentLogSocket } from '@/hooks/use-deployment-log-socket';

import { DeploymentLogViewer } from './components/deployment-log-viewer';

const getParamValue = (value: string | string[] | undefined) => {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
};

const toNullable = (value: string | string[] | undefined) => getParamValue(value) || null;

export default function DeploymentDetailScreen() {
  const params = useLocalSearchParams<{
    deploymentId?: string;
    title?: string;
    logPath?: string;
  }>();

  const deploymentId = getParamValue(params.deploymentId);
  const title = getParamValue(params.title) ?? 'Deployment';
  const logPath = toNullable(params.logPath);
  const headerHeight = useHeaderHeight();

  const { lines, hasLogPath, isEmpty, isConnecting, isConnected, error, reconnect } =
    useDeploymentLogSocket({
      logPath: logPath ?? undefined,
      enabled: Boolean(deploymentId && logPath),
      maxLines: 600,
    });

  if (!deploymentId) {
    return (
      <SafeAreaView className="bg-background flex-1 px-4" edges={['left', 'right']}>
        <Stack.Screen options={{ title: 'Deployment' }} />
        <View className="flex-1 items-center justify-center">
          <Text variant="h4">Missing deployment information</Text>
          <Text variant="muted" className="mt-2 text-center">
            Reopen the deployment sheet from the deployments tab to load its details.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="bg-background flex-1" edges={['left', 'right']}>
      <Stack.Screen options={{ title: title || 'Deployment' }} />
      <View className="flex-1 px-4 pb-4" style={{ paddingTop: headerHeight + 12 }}>
        <DeploymentLogViewer
          title={title}
          lines={lines}
          hasLogPath={hasLogPath}
          isEmpty={isEmpty}
          isConnecting={isConnecting}
          isConnected={isConnected}
          error={error}
          onReconnect={reconnect}
        />
      </View>
    </SafeAreaView>
  );
}
