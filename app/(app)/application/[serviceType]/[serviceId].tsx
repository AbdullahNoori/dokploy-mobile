import { Stack, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, View } from 'react-native';
import useSWR from 'swr';
import { io, type Socket } from 'socket.io-client';

import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  fetchApplication,
  fetchContainersByAppNameMatch,
  type ContainerInfo,
  type ServiceType,
} from '@/src/api/applications';
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
import { Input } from '@/src/components/ui/input';
import { Text } from '@/src/components/ui/text';
import { useAuthStore } from '@/src/store/auth.temp';
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

type LogParams = {
  tail: string;
  since: string;
  search: string;
  runType: string;
};

const LOGS_ENDPOINT_BASE = 'wss://deployment.fazel.dev';
const LOGS_ENDPOINT_PATH = '/docker-container-logs';
const DEFAULT_LOG_PARAMS: LogParams = {
  tail: '100',
  since: 'all',
  search: '',
  runType: 'native',
};

const parseTail = (value: string) => {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }
  return parsed;
};

const normalizeLogPayload = (payload: unknown): string[] => {
  if (typeof payload === 'string') {
    return [payload];
  }
  if (Array.isArray(payload)) {
    return payload.filter((item) => typeof item === 'string') as string[];
  }
  if (payload && typeof payload === 'object') {
    const record = payload as Record<string, unknown>;
    const candidate =
      record.message ?? record.log ?? record.data ?? record.line ?? record.stdout ?? record.stderr;
    if (typeof candidate === 'string') {
      return [candidate];
    }
  }
  return [];
};

const formatSocketError = (error: unknown) => {
  if (!error) return 'Failed to connect to log stream.';
  if (typeof error === 'string') return error;
  if (error instanceof Error) return error.message;
  return 'Failed to connect to log stream.';
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

const extractContainers = (payload: unknown): ContainerInfo[] => {
  if (Array.isArray(payload)) {
    return payload as ContainerInfo[];
  }
  if (!payload || typeof payload !== 'object') {
    return [];
  }
  const record = payload as Record<string, unknown>;
  if (Array.isArray(record.containers)) {
    return record.containers as ContainerInfo[];
  }
  if (Array.isArray(record.data)) {
    return record.data as ContainerInfo[];
  }
  return [];
};

const getContainerId = (containers: ContainerInfo[]) => {
  for (const container of containers) {
    const candidate = container.containerId ?? container.id;
    if (typeof candidate === 'string' && candidate.trim().length > 0) {
      return candidate;
    }
  }
  return null;
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
  const [logParamsDraft, setLogParamsDraft] = useState<LogParams>(DEFAULT_LOG_PARAMS);
  const [logParamsApplied, setLogParamsApplied] = useState<LogParams>(DEFAULT_LOG_PARAMS);
  const [logs, setLogs] = useState<string[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<
    'idle' | 'connecting' | 'connected' | 'disconnected' | 'error'
  >('idle');
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const scrollRef = useRef<ScrollView>(null);
  const pat = useAuthStore((state) => state.pat);

  const { data, error } = useSWR(
    normalizedServiceId && normalizedServiceType
      ? `service.one:${normalizedServiceType}:${normalizedServiceId}`
      : null,
    () => fetchApplication(normalizedServiceType as ServiceType, normalizedServiceId as string)
  );
  const appName = useMemo(() => {
    const record = data as { appName?: string; name?: string } | null;
    const candidate = record?.appName ?? record?.name;
    if (typeof candidate !== 'string') return null;
    const trimmed = candidate.trim();
    return trimmed.length > 0 ? trimmed : null;
  }, [data]);
  const { data: containerData, error: containerError } = useSWR(
    activeTab === 'Logs' && appName ? `docker.containers:${appName}` : null,
    () => fetchContainersByAppNameMatch(appName as string)
  );
  const deployments = useMemo(() => extractDeployments(data), [data]);
  const containers = useMemo(() => extractContainers(containerData), [containerData]);
  const containerId = useMemo(() => getContainerId(containers), [containers]);

  useEffect(() => {
    if (data) {
    }
    if (error) {
      console.warn('service detail error', error);
    }
  }, [data, error]);

  useEffect(() => {
    if (!containerError) return;
    setConnectionStatus('error');
    setConnectionError('Failed to load container details.');
  }, [containerError]);

  useEffect(() => {
    if (activeTab !== 'Logs') return;
    if (!data) return;
    if (!appName) {
      setConnectionStatus('error');
      setConnectionError('Application name is unavailable.');
      return;
    }
    if (!containerId) {
      setConnectionStatus('connecting');
      setConnectionError(null);
    }
  }, [activeTab, appName, containerId, data]);

  const disconnectSocket = useCallback(() => {
    const socket = socketRef.current;
    if (!socket) return;
    socket.removeAllListeners();
    socket.disconnect();
    socketRef.current = null;
    setConnectionStatus('disconnected');
  }, []);

  const connectSocket = useCallback(() => {
    if (!containerId) {
      setConnectionStatus('error');
      setConnectionError('Container not found for this application.');
      return;
    }
    if (!pat) {
      setConnectionStatus('error');
      setConnectionError('Missing personal access token.');
      return;
    }

    const tailValue = parseTail(logParamsApplied.tail) ?? 100;
    const query = {
      containerId,
      tail: tailValue.toString(),
      since: logParamsApplied.since || 'all',
      search: logParamsApplied.search ?? '',
      runType: logParamsApplied.runType || 'native',
    };

    disconnectSocket();
    setConnectionStatus('connecting');
    setConnectionError(null);

    const socket = io(LOGS_ENDPOINT_BASE, {
      path: LOGS_ENDPOINT_PATH,
      transports: ['websocket'],
      query,
      extraHeaders: {
        'x-api-key': pat,
      },
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setConnectionStatus('connected');
    });

    socket.on('disconnect', () => {
      setConnectionStatus('disconnected');
    });

    socket.on('connect_error', (err) => {
      setConnectionStatus('error');
      setConnectionError(formatSocketError(err));
    });

    socket.on('error', (err) => {
      setConnectionStatus('error');
      setConnectionError(formatSocketError(err));
    });

    const handlePayload = (payload: unknown) => {
      const lines = normalizeLogPayload(payload);
      if (lines.length === 0) return;
      setLogs((prev) => {
        const next = [...prev, ...lines];
        return next.slice(-1000);
      });
    };

    socket.on('message', handlePayload);
    socket.on('log', handlePayload);
    socket.on('data', handlePayload);
    socket.on('stdout', handlePayload);
    socket.on('stderr', handlePayload);
  }, [containerId, disconnectSocket, logParamsApplied, pat]);

  useEffect(() => {
    if (activeTab !== 'Logs') {
      disconnectSocket();
      return;
    }
    if (!containerId) return;
    connectSocket();
    return () => disconnectSocket();
  }, [activeTab, connectSocket, containerId, disconnectSocket]);

  useEffect(() => {
    if (logs.length === 0) return;
    scrollRef.current?.scrollToEnd({ animated: false });
  }, [logs.length]);

  const tailValidationError = useMemo(() => {
    if (logParamsDraft.tail.trim().length === 0) {
      return 'Tail is required.';
    }
    if (!parseTail(logParamsDraft.tail)) {
      return 'Tail must be a positive number.';
    }
    return null;
  }, [logParamsDraft.tail]);

  const applyLogParams = () => {
    if (tailValidationError) {
      setConnectionError(tailValidationError);
      return;
    }
    setLogs([]);
    setLogParamsApplied({ ...logParamsDraft });
  };

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
            ) : tab === 'Logs' ? (
              <Card className="border-dashed">
                <CardHeader>
                  <CardTitle>Logs</CardTitle>
                  <CardDescription>
                    {normalizedServiceId
                      ? `Streaming logs for ${normalizedServiceId}.`
                      : 'Select a service to view logs.'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="gap-4">
                  <View className="border-border rounded-md border px-3 py-2">
                    <Text className="text-muted-foreground text-xs">Connection</Text>
                    <Text className="text-foreground text-sm font-medium">
                      {connectionStatus === 'connecting'
                        ? 'Connecting'
                        : connectionStatus === 'connected'
                          ? 'Connected'
                          : connectionStatus === 'error'
                            ? 'Error'
                            : connectionStatus === 'disconnected'
                              ? 'Disconnected'
                              : 'Idle'}
                    </Text>
                    {connectionError ? (
                      <Text className="text-destructive text-xs">{connectionError}</Text>
                    ) : null}
                  </View>

                  <View className="gap-3">
                    <View className="flex-row flex-wrap gap-3">
                      <View className="min-w-[120px] flex-1">
                        <Text className="text-muted-foreground text-xs">Tail</Text>
                        <Input
                          value={logParamsDraft.tail}
                          onChangeText={(value) =>
                            setLogParamsDraft((prev) => ({ ...prev, tail: value }))
                          }
                          keyboardType="number-pad"
                          className="text-sm"
                          placeholder="100"
                        />
                      </View>
                      <View className="min-w-[120px] flex-1">
                        <Text className="text-muted-foreground text-xs">Since</Text>
                        <Input
                          value={logParamsDraft.since}
                          onChangeText={(value) =>
                            setLogParamsDraft((prev) => ({ ...prev, since: value }))
                          }
                          className="text-sm"
                          placeholder="all"
                        />
                      </View>
                    </View>
                    <View className="flex-row flex-wrap gap-3">
                      <View className="min-w-[160px] flex-1">
                        <Text className="text-muted-foreground text-xs">Search</Text>
                        <Input
                          value={logParamsDraft.search}
                          onChangeText={(value) =>
                            setLogParamsDraft((prev) => ({ ...prev, search: value }))
                          }
                          className="text-sm"
                          placeholder="Optional filter"
                        />
                      </View>
                      <View className="min-w-[120px] flex-1">
                        <Text className="text-muted-foreground text-xs">Run Type</Text>
                        <Input
                          value={logParamsDraft.runType}
                          onChangeText={(value) =>
                            setLogParamsDraft((prev) => ({ ...prev, runType: value }))
                          }
                          className="text-sm"
                          placeholder="native"
                        />
                      </View>
                    </View>
                    {tailValidationError ? (
                      <Text className="text-destructive text-xs">{tailValidationError}</Text>
                    ) : null}
                    <View className="flex-row flex-wrap gap-2">
                      <Button onPress={applyLogParams}>
                        <Text>Apply & Reconnect</Text>
                      </Button>
                      <Button
                        variant="outline"
                        onPress={() => {
                          disconnectSocket();
                          setConnectionStatus('disconnected');
                        }}>
                        <Text>Disconnect</Text>
                      </Button>
                      <Button
                        variant="ghost"
                        onPress={() => {
                          setLogs([]);
                        }}>
                        <Text>Clear Logs</Text>
                      </Button>
                    </View>
                  </View>

                  <View className="border-border bg-muted/30 min-h-60 rounded-md border">
                    {logs.length === 0 ? (
                      <View className="px-3 py-4">
                        <Text className="text-muted-foreground text-xs">
                          No log output yet.
                        </Text>
                      </View>
                    ) : (
                      <ScrollView
                        ref={scrollRef}
                        contentContainerStyle={{ padding: 12 }}
                        showsVerticalScrollIndicator>
                        {logs.map((line, index) => (
                          <Text
                            key={`${index}-${line}`}
                            className="text-foreground text-xs font-mono">
                            {line}
                          </Text>
                        ))}
                      </ScrollView>
                    )}
                  </View>
                </CardContent>
              </Card>
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
