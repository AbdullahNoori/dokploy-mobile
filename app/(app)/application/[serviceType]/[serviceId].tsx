import { Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';
import useSWR from 'swr';

import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { fetchApplication, type ServiceType } from '@/src/api/applications';
import { Button } from '@/src/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/src/components/ui/card';
import { Icon } from '@/src/components/ui/icon';
import { Text } from '@/src/components/ui/text';
import { Ban, RefreshCw, RocketIcon } from 'lucide-react-native';

type Deployment = {
  deploymentId?: string;
  title?: string;
  name?: string;
  status?: string;
  createdAt?: string;
  startedAt?: string;
  finishedAt?: string;
  [key: string]: unknown;
};

const getDeploymentTitle = (deployment: Deployment) => {
  const raw = deployment.title ?? deployment.name ?? '';
  const trimmed = raw.toString().trim();
  return trimmed.length > 0 ? trimmed : 'Deployment';
};

const formatDeploymentStatus = (status: unknown) => {
  if (typeof status !== 'string') return 'Unknown';
  const trimmed = status.trim();
  if (trimmed.length === 0) return 'Unknown';
  return trimmed
    .split(/[\s-_]+/)
    .filter(Boolean)
    .map((token) => token.charAt(0).toUpperCase() + token.slice(1))
    .join(' ');
};

const formatDateTime = (value: unknown) => {
  if (typeof value !== 'string') return 'Date unavailable';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return 'Date unavailable';
  return parsed.toLocaleString();
};

const formatDuration = (start: unknown, end: unknown) => {
  if (typeof start !== 'string' || typeof end !== 'string') return 'Duration unavailable';
  const startDate = new Date(start);
  const endDate = new Date(end);
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return 'Duration unavailable';
  }
  const diffMs = Math.max(0, endDate.getTime() - startDate.getTime());
  const totalSeconds = Math.round(diffMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }
  return `${seconds}s`;
};

const extractDeployments = (payload: unknown): Deployment[] => {
  if (!payload || typeof payload !== 'object') return [];
  const record = payload as Record<string, unknown>;

  if (Array.isArray(record.deployments)) {
    return record.deployments as Deployment[];
  }

  const arrays = Object.values(record).filter((value) => Array.isArray(value)) as unknown[][];
  for (const list of arrays) {
    const deployments = list.filter(
      (item) => item && typeof item === 'object' && 'deploymentId' in (item as object)
    );
    if (deployments.length > 0) {
      return deployments as Deployment[];
    }
  }

  return [];
};

export default function ApplicationDetailScreen() {
  const { serviceId, serviceType } = useLocalSearchParams<{
    serviceId?: string;
    serviceType?: ServiceType | ServiceType[];
  }>();
  const normalizedServiceId = Array.isArray(serviceId) ? serviceId[0] : serviceId;
  const normalizedServiceType = Array.isArray(serviceType) ? serviceType[0] : serviceType;
  const title = normalizedServiceType
    ? `${normalizedServiceType.charAt(0).toUpperCase()}${normalizedServiceType.slice(1)}`
    : 'Application';
  const tabs = useMemo(() => ['General', 'Logs', 'Monitoring', 'Deployments'] as const, []);
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>('General');
  const [autoDeployEnabled, setAutoDeployEnabled] = useState(false);

  const { data, error } = useSWR(
    normalizedServiceId && normalizedServiceType
      ? `service.one:${normalizedServiceType}:${normalizedServiceId}`
      : null,
    () => fetchApplication(normalizedServiceType as ServiceType, normalizedServiceId as string)
  );
  const deployments = useMemo(() => extractDeployments(data), [data]);

  useEffect(() => {
    if (data) {
      console.log('service detail response', data);
    }
    if (error) {
      console.warn('service detail error', error);
    }
  }, [data, error]);

  return (
    <View className="bg-background flex-1 px-5 pt-5">
      <Stack.Screen options={{ title, headerShown: true }} />

      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as (typeof tabs)[number])}>
        <TabsList className="mb-4 h-10 w-full flex-nowrap items-stretch">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab}
              value={tab}
              className={`h-full flex-1 ${tab === activeTab ? 'border-black bg-black' : ''}`}>
              <Text
                numberOfLines={1}
                ellipsizeMode="tail"
                className={
                  tab === activeTab ? 'text-[11px] text-white' : 'text-muted-foreground text-[11px]'
                }>
                {tab}
              </Text>
            </TabsTrigger>
          ))}
        </TabsList>
        {tabs.map((tab) => (
          <TabsContent key={tab} value={tab}>
            {tab === 'General' ? (
              <View className="gap-4">
                <View className="flex-row flex-wrap gap-3">
                  <Button>
                    <View className="flex-row items-center gap-2">
                      <Icon as={RocketIcon} className="text-primary-foreground size-4" />
                      <Text>Deploy</Text>
                    </View>
                  </Button>
                  <Button variant="outline">
                    <View className="flex-row items-center gap-2">
                      <Icon as={RefreshCw} className="text-foreground size-4" />
                      <Text>Reload</Text>
                    </View>
                  </Button>
                  <Button variant="destructive">
                    <View className="flex-row items-center gap-2">
                      <Icon as={Ban} className="text-foreground size-4" />
                      <Text>Stop</Text>
                    </View>
                  </Button>
                </View>
                <View className="border-border flex-row items-center justify-between rounded-lg border px-4 py-3">
                  <Text className="text-foreground text-sm font-medium">Auto Deploy</Text>
                  <Switch checked={autoDeployEnabled} onCheckedChange={setAutoDeployEnabled} />
                </View>
              </View>
            ) : (
              <Card className="border-dashed">
                <CardHeader>
                  <CardTitle>{tab}</CardTitle>
                  <CardDescription>
                    {normalizedServiceId
                      ? `${title} ${normalizedServiceId} details are coming soon.`
                      : `${title} details are coming soon.`}
                  </CardDescription>
                </CardHeader>
                {tab === 'Deployments' ? (
                  <CardContent className="gap-3">
                    {deployments.length === 0 ? (
                      <Text className="text-muted-foreground text-sm leading-5">
                        No deployments found yet.
                      </Text>
                    ) : (
                      deployments.map((deployment) => (
                        <View
                          key={deployment.deploymentId ?? getDeploymentTitle(deployment)}
                          className="border-border rounded-lg border p-3">
                          <View className="flex-row items-center justify-between">
                            <Text className="text-foreground text-sm font-semibold">
                              {getDeploymentTitle(deployment)}
                            </Text>
                            <Text className="text-muted-foreground text-xs">
                              {formatDeploymentStatus(deployment.status)}
                            </Text>
                          </View>
                          <Text className="text-muted-foreground text-xs">
                            Created: {formatDateTime(deployment.createdAt)}
                          </Text>
                          <Text className="text-muted-foreground text-xs">
                            Duration: {formatDuration(deployment.startedAt, deployment.finishedAt)}
                          </Text>
                        </View>
                      ))
                    )}
                  </CardContent>
                ) : (
                  <>
                    <CardContent className="gap-2">
                      <Text className="text-muted-foreground text-sm leading-5">
                        This section is a placeholder for the {tab.toLowerCase()} view.
                      </Text>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline">
                        <Text>Coming soon</Text>
                      </Button>
                    </CardFooter>
                  </>
                )}
              </Card>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </View>
  );
}
