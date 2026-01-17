import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo } from 'react';
import { FlatList, Pressable, RefreshControl, View } from 'react-native';
import useSWR from 'swr';

import { fetchProject, type ProjectDetail, type ProjectEnvironment } from 'src/api/projects';
import { Button } from 'src/components/ui/button';
import { Card, CardContent } from 'src/components/ui/card';
import { Text } from 'src/components/ui/text';

type ServiceItem = {
  key: string;
  name: string;
  type: string;
  environmentName: string;
  status: string;
  serviceType: ServiceType;
  serviceId?: string;
};

type ServiceType = 'postgres' | 'mysql' | 'mariadb' | 'mongo' | 'redis' | 'compose';

const serviceSources: Array<{ key: ServiceType; label: string }> = [
  { key: 'postgres', label: 'Postgres' },
  { key: 'mysql', label: 'MySQL' },
  { key: 'mariadb', label: 'MariaDB' },
  { key: 'mongo', label: 'MongoDB' },
  { key: 'redis', label: 'Redis' },
  { key: 'compose', label: 'Compose' },
];

const getProjectName = (project: ProjectDetail | undefined) => {
  const raw = project?.name?.toString() ?? '';
  const trimmed = raw.trim();
  return trimmed.length > 0 ? trimmed : 'Project';
};

const getEnvironmentName = (environment: ProjectEnvironment) => {
  const raw = environment.name?.toString() ?? '';
  const trimmed = raw.trim();
  return trimmed.length > 0 ? trimmed : 'Environment';
};

const getServiceName = (service: unknown, fallback: string) => {
  if (service && typeof service === 'object') {
    const record = service as Record<string, unknown>;
    const name = typeof record.name === 'string' ? record.name.trim() : '';
    if (name.length > 0) return name;
    const id = typeof record.id === 'string' ? record.id.trim() : '';
    if (id.length > 0) return id;
  }
  return fallback;
};

const getServiceStatus = (service: unknown) => {
  if (service && typeof service === 'object') {
    const record = service as Record<string, unknown>;
    if (typeof record.composeStatus === 'string') {
      return record.composeStatus.toLowerCase();
    }
    if (typeof record.applicationStatus === 'string') {
      return record.applicationStatus.toLowerCase();
    }
    if (typeof record.status === 'string') {
      return record.status.toLowerCase();
    }
    if (typeof record.state === 'string') {
      return record.state.toLowerCase();
    }
  }
  return '';
};

const buildServices = (environments: ProjectEnvironment[] | undefined): ServiceItem[] => {
  if (!environments || environments.length === 0) return [];

  const services: ServiceItem[] = [];

  environments.forEach((environment) => {
    const environmentName = getEnvironmentName(environment);
    const environmentId =
      typeof environment.environmentId === 'string' ? environment.environmentId : environmentName;

    serviceSources.forEach((source) => {
      const list = (environment as Record<string, unknown>)[source.key];
      if (!Array.isArray(list)) return;

      list.forEach((service, index) => {
        const fallback = `${source.label} ${index + 1}`;
        const name = getServiceName(service, fallback);
        const record = service as Record<string, unknown>;
        const serviceIdKey = `${source.key}Id`;
        const serviceId =
          typeof record[serviceIdKey] === 'string'
            ? (record[serviceIdKey] as string)
            : undefined;
        const status = getServiceStatus(service);

        services.push({
          key: `${environmentId}-${source.key}-${serviceId}`,
          name,
          type: source.label,
          environmentName,
          status,
          serviceType: source.key,
          serviceId,
        });
      });
    });
  });

  return services;
};

export default function ProjectServicesScreen() {
  const { projectId } = useLocalSearchParams<{ projectId?: string }>();
  const normalizedProjectId = Array.isArray(projectId) ? projectId[0] : projectId;
  const router = useRouter();

  const { data, error, isLoading, isValidating, mutate } = useSWR<ProjectDetail>(
    normalizedProjectId ? `project.one:${normalizedProjectId}` : null,
    () => fetchProject(normalizedProjectId as string)
  );

  const projectName = useMemo(() => getProjectName(data), [data]);
  const services = useMemo(() => buildServices(data?.environments), [data]);
  const refreshing = isValidating && !isLoading;
  const errorMessage = (error as Error | undefined)?.message ?? 'Unable to load project services.';

  const handleApplicationPress = (item: ServiceItem) => {
    if (!item.serviceId) {
      console.warn('Service ID is missing, skipping application view.');
      return;
    }

    router.push({
      pathname: '/application/[serviceType]/[serviceId]',
      params: { serviceType: item.serviceType, serviceId: item.serviceId },
    });
  };

  return (
    <View className="bg-background flex-1">
      <Stack.Screen options={{ title: projectName, headerShown: true }} />

      <FlatList
        data={services}
        keyExtractor={(item) => item.key}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={mutate} />}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24, paddingTop: 18 }}
        ItemSeparatorComponent={() => <View className="h-3" />}
        ListEmptyComponent={
          <Card className="border-dashed">
            <CardContent className="gap-3">
              <Text className="text-foreground text-base font-semibold">
                {isLoading ? 'Loading services…' : 'No services yet'}
              </Text>
              <Text className="text-muted-foreground text-sm leading-5">
                {error ? errorMessage : 'This project does not have any services configured.'}
              </Text>
              {error ? (
                <Button variant="outline" onPress={() => mutate()}>
                  <Text>Try again</Text>
                </Button>
              ) : null}
            </CardContent>
          </Card>
        }
        renderItem={({ item }) => {
          const card = (
            <Card className="bg-card relative">
              {item.status === 'done' ? (
                <View className="border-background absolute -top-1 -right-1 size-3 rounded-full border-2 bg-emerald-500" />
              ) : null}
              <CardContent className="gap-2">
                <View className="flex-row items-center justify-between">
                  <Text className="text-foreground text-base font-semibold">{item.name}</Text>
                  <Text className="text-muted-foreground text-xs">{item.type}</Text>
                </View>
                <Text className="text-muted-foreground text-sm">
                  Environment: {item.environmentName}
                </Text>
              </CardContent>
            </Card>
          );

          return (
            <Pressable
              onPress={() => handleApplicationPress(item)}
              accessibilityRole="button"
              accessibilityLabel={`Open ${item.name}`}>
              {card}
            </Pressable>
          );
        }}
      />
    </View>
  );
}
