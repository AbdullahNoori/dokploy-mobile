import {
  Book,
  Ellipsis,
  PencilIcon,
  SearchIcon,
  ServerIcon,
  Trash2Icon,
} from 'lucide-react-native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  RefreshControl,
  View,
  type ListRenderItem,
} from 'react-native';
import { useRouter } from 'expo-router';
import { fetchProjects, type Project, type ProjectsResponse } from 'src/api/projects';
import { Button } from 'src/components/ui/button';
import { Card, CardContent } from 'src/components/ui/card';
import { Icon } from 'src/components/ui/icon';
import { Input } from 'src/components/ui/input';
import { Text } from 'src/components/ui/text';
import useSWR from 'swr';

type ProjectActionKey = 'environment' | 'update' | 'delete';

type ActionItem = {
  key: ProjectActionKey;
  label: string;
  icon: typeof ServerIcon;
};

const actionItems: ActionItem[] = [
  { key: 'environment', label: 'Project Environment', icon: ServerIcon },
  { key: 'update', label: 'Update', icon: PencilIcon },
  { key: 'delete', label: 'Delete', icon: Trash2Icon },
];

const normalizeProjects = (payload: ProjectsResponse | undefined): Project[] => {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.projects)) return payload.projects;
  return [];
};

const getProjectDescription = (project: Project) => {
  const description = (project as Record<string, unknown>).description;
  if (typeof description === 'string') {
    const trimmed = description.trim();
    if (trimmed.length > 0) {
      return trimmed;
    }
  }
  return '';
};

const formatProjectId = (id: string) =>
  id?.length > 16 ? `${id.slice(0, 8)}...${id.slice(-4)}` : id;

const getProjectId = (project: Project) => project.projectId ?? project.id ?? '';

const formatCreatedLabel = (project: Project) => {
  const createdAt =
    (project as Record<string, unknown>).createdAt ??
    (project as Record<string, unknown>).created_at ??
    (project as Record<string, unknown>).created;

  if (typeof createdAt !== 'string') {
    return 'Created date unknown';
  }

  const createdDate = new Date(createdAt);
  const now = Date.now();
  const isValid = !Number.isNaN(createdDate.getTime());

  if (!isValid) {
    return 'Created date unknown';
  }

  const diffMs = Math.max(0, now - createdDate.getTime());
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Created today';
  if (diffDays === 1) return 'Created 1 day ago';

  return `Created ${diffDays} days ago`;
};

const getProjectStatus = (project: Project) => {
  const record = project as Record<string, unknown>;
  const statusValue = record.status ?? record.state ?? record.projectStatus ?? record.health;

  if (typeof statusValue === 'string') {
    const trimmed = statusValue.trim();
    return trimmed.length > 0 ? trimmed.toLowerCase() : 'unknown';
  }

  if (typeof statusValue === 'boolean') {
    return statusValue ? 'active' : 'inactive';
  }

  return 'unknown';
};

const formatStatusLabel = (status: string) => {
  if (!status || status === 'unknown') return 'Unknown';
  return status
    .split(/[\s-_]+/)
    .filter(Boolean)
    .map((token) => token.charAt(0).toUpperCase() + token.slice(1))
    .join(' ');
};

const getStatusTone = (status: string) => {
  const normalized = status.toLowerCase();
  const healthy = ['active', 'running', 'healthy', 'online', 'ready'];
  const unhealthy = ['failed', 'error', 'down', 'stopped', 'inactive'];

  if (healthy.includes(normalized)) {
    return {
      containerClass: 'bg-emerald-500/10 border-emerald-500/20',
      textClass: 'text-emerald-500',
    };
  }

  if (unhealthy.includes(normalized)) {
    return {
      containerClass: 'bg-red-500/10 border-red-500/20',
      textClass: 'text-red-500',
    };
  }

  return {
    containerClass: 'bg-muted/70 border-border',
    textClass: 'text-foreground',
  };
};

const getServicesCount = (project: Project) => {
  const environments = (project as Record<string, unknown>).environments;

  if (!Array.isArray(environments)) return 0;

  const toLength = (value: unknown) => (Array.isArray(value) ? value.length : 0);

  return environments
    .map((env) => {
      const record = env as Record<string, unknown>;

      return (
        toLength(record.mariadb) +
        toLength(record.mongo) +
        toLength(record.mysql) +
        toLength(record.postgres) +
        toLength(record.redis) +
        toLength(record.applications) +
        toLength(record.compose)
      );
    })
    .reduce((acc, curr) => acc + curr, 0);
};

function ProjectsSkeleton({ count = 3 }: { count?: number }) {
  return (
    <View className="gap-3">
      {Array.from({ length: count }).map((_, index) => (
        <Card key={`project-skeleton-${index}`} className="bg-muted/30 animate-pulse">
          <CardContent className="gap-4">
            <View className="flex-row items-center gap-3">
              <View className="bg-muted size-10 rounded-full" />
              <View className="flex-1 gap-2">
                <View className="bg-muted h-4 w-3/5 rounded-md" />
                <View className="bg-muted h-3 w-2/5 rounded-md" />
              </View>
              <View className="bg-muted h-6 w-20 rounded-full" />
            </View>
            <View className="bg-muted h-3 w-full rounded-md" />
            <View className="bg-muted h-3 w-4/5 rounded-md" />
          </CardContent>
        </Card>
      ))}
    </View>
  );
}

type ProjectsStateProps = {
  variant: 'error' | 'empty';
  message: string;
  onAction: () => void;
};

function ProjectsState({ variant, message, onAction }: ProjectsStateProps) {
  const isError = variant === 'error';
  return (
    <Card className="items-center gap-3 border-dashed">
      <CardContent className="items-center gap-3">
        <View
          className="bg-muted flex-row items-center justify-center rounded-full p-3"
          accessibilityRole="image">
          <Icon
            as={isError ? Trash2Icon : ServerIcon}
            className={isError ? 'text-destructive size-6' : 'text-primary size-6'}
          />
        </View>
        <Text className="text-center text-lg font-semibold">
          {isError ? 'Unable to load projects' : 'No projects found'}
        </Text>
        <Text className="text-muted-foreground text-center text-sm leading-5">{message}</Text>
        <Button variant={isError ? 'destructive' : 'outline'} onPress={onAction}>
          <Text>{isError ? 'Try again' : 'Reload'}</Text>
        </Button>
      </CardContent>
    </Card>
  );
}

function ProjectsHeader({
  projectCount,
  filteredCount,
  onRefresh,
  hasError,
  errorMessage,
  searchValue,
  onSearchChange,
  statusOptions,
  selectedStatus,
  onStatusChange,
  onCreateProject,
}: {
  projectCount: number;
  filteredCount: number;
  onRefresh: () => void;
  hasError: boolean;
  errorMessage: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  statusOptions: string[];
  selectedStatus: string;
  onStatusChange: (value: string) => void;
  onCreateProject: () => void;
}) {
  return (
    <View className="gap-3 pb-4">
      <View className="bg-input flex-row items-center gap-2 rounded-xl border px-3 py-2">
        <Icon as={SearchIcon} className="text-muted-foreground size-4" />
        <Input
          value={searchValue}
          onChangeText={onSearchChange}
          placeholder="Filter projects..."
          className="text-foreground bg-input flex-1 border-0 px-0 py-0 shadow-none"
        />
      </View>

      {hasError ? (
        <Card className="border-destructive/60 bg-destructive/5">
          <CardContent className="flex-row items-start gap-3">
            <View className="bg-destructive/10 border-destructive items-center justify-center rounded-full border p-2">
              <Icon as={Trash2Icon} className="text-destructive size-4" />
            </View>
            <View className="flex-1 gap-1">
              <Text className="text-foreground text-sm font-semibold">Unable to refresh</Text>
              <Text className="text-destructive text-sm leading-5">{errorMessage}</Text>
            </View>
          </CardContent>
        </Card>
      ) : null}
    </View>
  );
}

function ProjectCard({
  project,
  onActionsOpen,
  onPress,
}: {
  project: Project;
  onActionsOpen: (project: Project) => void;
  onPress: (project: Project) => void;
}) {
  const name = project.name?.toString() || 'Untitled project';
  const description = getProjectDescription(project);
  const createdLabel = formatCreatedLabel(project);
  const servicesLabel = `Services: ${getServicesCount(project)}`;
  const status = getProjectStatus(project);
  const statusLabel = formatStatusLabel(status);
  const statusTone = getStatusTone(status);

  return (
    <Pressable
      onPress={() => onPress(project)}
      accessibilityRole="button"
      accessibilityLabel={`Open ${name}`}>
      <Card className="bg-background">
        <CardContent className="gap-4">
          <View className="flex-row items-start gap-3">
            <View className="bg-background items-center justify-center rounded-full p-2">
              <Icon as={Book} className="text-primary size-5" />
            </View>
            <View className="flex-1 gap-1">
              <Text className="text-foreground text-base font-semibold" numberOfLines={1}>
                {name}
              </Text>
              {description ? (
                <Text className="text-muted-foreground text-sm leading-5" numberOfLines={2}>
                  {description}
                </Text>
              ) : null}
              <Text className="text-muted-foreground text-xs">
                {formatProjectId(getProjectId(project))}
              </Text>
            </View>
            <Pressable
              onPress={() => onActionsOpen(project)}
              accessibilityRole="button"
              accessibilityLabel={`Open actions for ${name}`}
              className="bg-background flex-row items-center gap-2 rounded-full border px-3 py-2">
              <Icon as={Ellipsis} className="text-foreground size-4" />
            </Pressable>
          </View>

          <View className="flex-row items-center justify-between">
            <Text className="text-muted-foreground text-sm">{createdLabel}</Text>
            <View className="flex-row items-center gap-2">
              {/* <View className={`border ${statusTone.containerClass} rounded-full px-3 py-1`}>
                <Text className={`text-xs font-semibold ${statusTone.textClass}`}>{statusLabel}</Text>
              </View> */}
              <View className="bg-muted/70 rounded-md px-3 py-1">
                <Text className="text-foreground text-xs font-semibold">{servicesLabel}</Text>
              </View>
            </View>
          </View>
        </CardContent>
      </Card>
    </Pressable>
  );
}

function ActionsModal({
  visible,
  onClose,
  selectedProjectName,
  onActionPress,
}: {
  visible: boolean;
  onClose: () => void;
  selectedProjectName: string;
  onActionPress: (actionKey: ProjectActionKey) => void;
}) {
  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <View className="flex-1 items-center justify-center bg-black/50 px-5">
        <Card className="w-full max-w-md gap-4 rounded-2xl border shadow-xl shadow-black/20">
          <CardContent className="gap-4">
            <View className="gap-1">
              <Text className="text-foreground text-lg font-bold">Actions</Text>
              <Text className="text-muted-foreground text-sm leading-5">
                {selectedProjectName
                  ? `Choose what to do with ${selectedProjectName}.`
                  : 'Pick an action for this project.'}
              </Text>
            </View>

            <View className="gap-3">
              {actionItems.map((action) => (
                <Pressable
                  key={action.key}
                  onPress={() => onActionPress(action.key)}
                  accessibilityRole="button"
                  accessibilityLabel={`${action.label} action`}
                  className="bg-accent/70 border-border flex-row items-center gap-3 rounded-xl border px-4 py-3">
                  <View className="bg-primary/10 items-center justify-center rounded-full p-2">
                    <Icon as={action.icon} className="text-primary size-5" />
                  </View>
                  <Text className="text-foreground text-base font-medium">{action.label}</Text>
                </Pressable>
              ))}
            </View>

            <Button variant="ghost" onPress={onClose} className="self-end">
              <Text className="text-primary text-sm font-semibold">Close</Text>
            </Button>
          </CardContent>
        </Card>
      </View>
    </Modal>
  );
}

export default function ProjectsScreen() {
  const router = useRouter();
  const { data, error, isLoading, isValidating, mutate } = useSWR<ProjectsResponse>(
    'project.all',
    fetchProjects
  );
  const [actionsOpen, setActionsOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [searchValue, setSearchValue] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const projects = useMemo(() => normalizeProjects(data), [data]);
  const projectCount = projects.length;
  const statusOptions = useMemo(() => {
    const options = new Set<string>();

    projects.forEach((project) => {
      const status = getProjectStatus(project);
      if (status) {
        options.add(status);
      }
    });

    return ['all', ...Array.from(options).sort()];
  }, [projects]);
  const filteredProjects = useMemo(() => {
    const normalizedSearch = searchValue.trim().toLowerCase();

    return projects.filter((project) => {
      const name = project.name?.toString().toLowerCase() ?? '';
      const matchesSearch = normalizedSearch.length === 0 || name.includes(normalizedSearch);
      const status = getProjectStatus(project);
      const matchesStatus = selectedStatus === 'all' || status === selectedStatus;

      return matchesSearch && matchesStatus;
    });
  }, [projects, searchValue, selectedStatus]);
  const filteredCount = filteredProjects.length;
  const isInitialLoading = isLoading && !data;
  const refreshing = isValidating && !isInitialLoading;

  useEffect(() => {
    if (!actionsOpen) {
      setSelectedProject(null);
    }
  }, [actionsOpen]);

  useEffect(() => {
    if (!statusOptions.includes(selectedStatus)) {
      setSelectedStatus('all');
    }
  }, [selectedStatus, statusOptions]);

  const handleRefresh = useCallback(() => {
    mutate();
  }, [mutate]);

  const handleCreateProject = useCallback(() => {
    console.info('Create project pressed');
  }, []);

  const handleOpenActions = useCallback((project: Project) => {
    setSelectedProject(project);
    setActionsOpen(true);
  }, []);

  const handleProjectPress = useCallback(
    (project: Project) => {
      const projectId = getProjectId(project).toString();

      if (!projectId) {
        console.warn('Project ID is missing, skipping project.one request.');
        return;
      }

      router.push({ pathname: '/project/[projectId]', params: { projectId } });
    },
    [router]
  );

  const handleActionPress = useCallback((actionKey: ProjectActionKey) => {
    // Future: wire navigation or mutations per actionKey.
    setActionsOpen(false);
  }, []);

  const selectedProjectName = useMemo(() => {
    if (!selectedProject?.name) return '';
    const parsed = selectedProject.name.toString().trim();
    return parsed.length > 0 ? parsed : '';
  }, [selectedProject]);

  const errorMessage =
    (error as Error | undefined)?.message ?? 'Check your Dokploy server URL or PAT, then retry.';

  const renderProjectItem = useCallback<ListRenderItem<Project>>(
    ({ item }) => (
      <ProjectCard project={item} onActionsOpen={handleOpenActions} onPress={handleProjectPress} />
    ),
    [handleOpenActions, handleProjectPress]
  );

  const keyExtractor = useCallback((item: Project, index: number) => {
    const projectId = getProjectId(item);
    return projectId.length > 0 ? projectId : `project-${index}`;
  }, []);

  const renderListEmpty = useCallback(() => {
    if (isInitialLoading) {
      return <ProjectsSkeleton />;
    }

    if (error) {
      return <ProjectsState variant="error" message={errorMessage} onAction={handleRefresh} />;
    }

    if (projects.length > 0) {
      return (
        <ProjectsState
          variant="empty"
          message="No projects match the current search or status filters."
          onAction={handleRefresh}
        />
      );
    }

    return (
      <ProjectsState
        variant="empty"
        message="Your Dokploy workspace does not have projects yet."
        onAction={handleRefresh}
      />
    );
  }, [error, errorMessage, handleRefresh, isInitialLoading, projects.length]);

  return (
    <View className="bg-background flex-1">
      <FlatList
        data={filteredProjects}
        renderItem={renderProjectItem}
        keyExtractor={keyExtractor}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        ListHeaderComponent={
          <ProjectsHeader
            projectCount={projectCount}
            filteredCount={filteredCount}
            onRefresh={handleRefresh}
            hasError={!!error && projects.length > 0}
            errorMessage={errorMessage}
            searchValue={searchValue}
            onSearchChange={setSearchValue}
            statusOptions={statusOptions}
            selectedStatus={selectedStatus}
            onStatusChange={setSelectedStatus}
            onCreateProject={handleCreateProject}
          />
        }
        ListEmptyComponent={renderListEmpty}
        ItemSeparatorComponent={() => <View className="h-3" />}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      />

      <ActionsModal
        visible={actionsOpen}
        onClose={() => setActionsOpen(false)}
        selectedProjectName={selectedProjectName}
        onActionPress={handleActionPress}
      />
    </View>
  );
}
