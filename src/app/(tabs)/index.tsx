import {
  AlertCircleIcon,
  Book02Icon,
  Folder01Icon,
  MoreHorizontalIcon,
  Refresh01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { useCallback, useMemo } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  View,
} from "react-native";
import useSWR from "swr";

import { fetchProjects, Project, ProjectsResponse } from "@/src/api/dashboard";
import { Button } from "@/src/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/src/components/ui/Card";
import { Skeleton } from "@/src/components/ui/Skeleton";
import { Heading, Text, Title } from "@/src/components/ui/Text";
import { StyleSheet } from "@/src/styles/unistyles";
import { useUnistyles } from "react-native-unistyles";

const normalizeProjects = (
  payload: ProjectsResponse | undefined
): Project[] => {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.projects)) return payload.projects;
  return [];
};

const getProjectDescription = (project: Project) => {
  const description = (project as Record<string, unknown>).description;
  if (typeof description === "string") {
    const trimmed = description.trim();
    if (trimmed.length > 0) {
      return trimmed;
    }
  }

  return "";
};

const formatProjectId = (id: string) =>
  id.length > 16 ? `${id.slice(0, 8)}...${id.slice(-4)}` : id;

const formatCreatedLabel = (project: Project) => {
  const createdAt =
    (project as Record<string, unknown>).createdAt ??
    (project as Record<string, unknown>).created_at ??
    (project as Record<string, unknown>).created;

  if (typeof createdAt !== "string") {
    return "Created date unknown";
  }

  const createdDate = new Date(createdAt);
  const now = Date.now();
  const isValid = !Number.isNaN(createdDate.getTime());

  if (!isValid) {
    return "Created date unknown";
  }

  const diffMs = Math.max(0, now - createdDate.getTime());
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Created today";
  if (diffDays === 1) return "Created 1 day ago";

  return `Created ${diffDays} days ago`;
};

const getServicesCount = (project: Project) => {
  const environments = (project as Record<string, unknown>).environments;

  if (!Array.isArray(environments)) return 0;

  const toLength = (value: unknown) =>
    Array.isArray(value) ? value.length : 0;

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

type ProjectsStateProps = {
  variant: "error" | "empty";
  message: string;
  onAction: () => void;
};

const ProjectsState = ({ variant, message, onAction }: ProjectsStateProps) => {
  const { theme } = useUnistyles();

  const isError = variant === "error";
  const iconColor = isError ? theme.colors.destructive : theme.colors.primary;

  return (
    <View
      style={[styles.stateCard, isError ? styles.errorCard : styles.emptyCard]}
    >
      <View style={[styles.stateIcon, isError && styles.stateIconError]}>
        <HugeiconsIcon
          icon={isError ? AlertCircleIcon : Folder01Icon}
          size={theme.size[28]}
          color={iconColor}
        />
      </View>
      <Heading variant="h3" style={styles.stateTitle}>
        {isError ? "Unable to load projects" : "No projects found"}
      </Heading>
      <Text style={[styles.stateMessage, isError && styles.errorText]}>
        {message}
      </Text>
      <Button
        variant={isError ? "destructive" : "outline"}
        size="default"
        onPress={onAction}
        label={isError ? "Try again" : "Reload"}
      />
    </View>
  );
};

const ProjectsSkeleton = ({ count = 3 }: { count?: number }) => {
  const { theme } = useUnistyles();

  return (
    <View style={styles.skeletonStack}>
      {Array.from({ length: count }).map((_, index) => (
        <Card key={`project-skeleton-${index}`} style={styles.projectCard}>
          <CardHeader style={styles.cardHeader}>
            <View style={styles.projectHeader}>
              <Skeleton
                width={theme.size[40]}
                height={theme.size[40]}
                radius={theme.radius.full}
              />
              <View style={styles.projectText}>
                <Skeleton width="70%" height={theme.size[16]} />
                <Skeleton width="45%" height={theme.size[12]} />
              </View>
            </View>
            <Skeleton width={theme.size[80]} height={theme.size[24]} />
          </CardHeader>
          <CardContent style={styles.cardContent}>
            <Skeleton width="100%" height={theme.size[12]} />
            <Skeleton width="80%" height={theme.size[12]} />
          </CardContent>
        </Card>
      ))}
    </View>
  );
};

export default function ProjectsScreen() {
  const { theme } = useUnistyles();
  const { data, error, isLoading, isValidating, mutate } = useSWR(
    "project.all",
    fetchProjects
  );

  const projects = useMemo(() => normalizeProjects(data), [data]);
  const projectCount = projects.length;
  const isInitialLoading = isLoading && !data;
  const refreshing = isValidating && !isInitialLoading;
  const iconSize = 18;
  const iconColor = theme.colors.primary;

  const handleRefresh = useCallback(() => {
    mutate();
  }, [mutate]);

  const renderProject = useCallback(
    (item: Project, index: number) => {
      const name = item.name?.toString() || "Untitled project";
      const projectId = item.id?.toString() || `project-${index}`;
      const description = getProjectDescription(item);
      const createdLabel = formatCreatedLabel(item);
      const servicesLabel = `Services: ${getServicesCount(item)}`;

      return (
        <Card key={projectId} style={styles.projectCard}>
          <CardHeader style={styles.cardHeader}>
            <View style={styles.projectHeader}>
              <View style={styles.iconBadge}>
                <HugeiconsIcon
                  icon={Book02Icon}
                  size={iconSize}
                  color={iconColor}
                />
              </View>
              <View style={styles.projectText}>
                <Title variant="lg" numberOfLines={1}>
                  {name}
                </Title>
                {description ? (
                  <Text
                    variant="body2"
                    numberOfLines={2}
                    style={styles.mutedText}
                  >
                    {description}
                  </Text>
                ) : null}
              </View>
            </View>
            <View style={styles.menuIcon}>
              <HugeiconsIcon
                icon={MoreHorizontalIcon}
                size={theme.size[20]}
                color={theme.colors.text}
              />
            </View>
          </CardHeader>
          <CardContent style={styles.cardContent}>
            <Text numberOfLines={1} style={styles.projectCopy}>
              {createdLabel}
            </Text>
            <View style={styles.pill}>
              <Text variant="body2" numberOfLines={1} style={styles.pillText}>
                {servicesLabel}
              </Text>
            </View>
          </CardContent>
        </Card>
      );
    },
    [iconColor, iconSize]
  );

  const errorMessage =
    (error as Error | undefined)?.message ??
    "Check your Dokploy server URL or PAT, then retry.";

  const headerActionLabel = refreshing ? "Refreshing..." : "Refresh";

  return (
    <View style={styles.safeArea}>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
            progressBackgroundColor={theme.colors.surface}
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Heading variant="h2">Projects</Heading>
            <Text style={[styles.mutedText, styles.subtitle]} variant="body1">
              Keep your Dokploy projects in sync and ready for deployments.
            </Text>
            <View style={styles.headerMeta}>
              <View style={styles.countBadge}>
                <Text style={styles.countLabel}>Total</Text>
                <Text style={styles.countValue}>{projectCount}</Text>
              </View>
              <View style={styles.refreshHint}>
                <HugeiconsIcon
                  icon={Refresh01Icon}
                  size={theme.size[16]}
                  color={theme.colors.muted}
                />
                <Text style={styles.mutedText}>Pull to refresh anytime</Text>
              </View>
            </View>
          </View>
          <View style={styles.loaderSlot}>
            {isValidating ? (
              <ActivityIndicator
                size="small"
                color={theme.colors.primary}
                accessibilityLabel={headerActionLabel}
              />
            ) : (
              <View style={styles.loaderPlaceholder} />
            )}
          </View>
        </View>

        {error ? (
          projects.length > 0 ? (
            <View style={styles.alertCard}>
              <View style={styles.alertContent}>
                <View style={[styles.stateIcon, styles.alertIcon]}>
                  <HugeiconsIcon
                    icon={AlertCircleIcon}
                    size={theme.size[20]}
                    color={theme.colors.destructive}
                  />
                </View>
                <View style={styles.alertText}>
                  <Title variant="sm">Unable to refresh</Title>
                  <Text style={[styles.mutedText, styles.errorText]}>
                    {errorMessage}
                  </Text>
                </View>
              </View>
            </View>
          ) : (
            <ProjectsState
              variant="error"
              message={errorMessage}
              onAction={handleRefresh}
            />
          )
        ) : null}

        {isInitialLoading ? (
          <ProjectsSkeleton />
        ) : projects.length === 0 ? (
          <ProjectsState
            variant="empty"
            message="Your Dokploy workspace does not have projects yet."
            onAction={handleRefresh}
          />
        ) : (
          <View style={styles.projectsList}>{projects.map(renderProject)}</View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: theme.size[16],
    paddingTop: theme.size[16],
    paddingBottom: theme.size[20],
    gap: theme.size[16],
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: theme.size[12],
  },
  headerText: {
    flex: 1,
    gap: theme.size[6],
  },
  subtitle: {
    lineHeight: theme.font.base * 1.4,
  },
  headerMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.size[12],
    marginTop: theme.size[4],
  },
  countBadge: {
    paddingHorizontal: theme.size[10],
    paddingVertical: theme.size[8],
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.mutedSurface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    flexDirection: "row",
    alignItems: "center",
    gap: theme.size[6],
  },
  countLabel: {
    color: theme.colors.muted,
    fontSize: theme.font.sm,
    fontFamily: theme.families.inter,
  },
  countValue: {
    color: theme.colors.text,
    fontSize: theme.font.sm,
    fontWeight: theme.font.semiBold,
    fontFamily: theme.families.inter,
    textAlign: "center",
  },
  refreshHint: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.size[6],
  },
  loaderSlot: {
    width: theme.size[40],
    height: theme.size[40],
    alignItems: "center",
    justifyContent: "center",
  },
  loaderPlaceholder: {
    width: theme.size[20],
    height: theme.size[20],
  },
  mutedText: {
    color: theme.colors.muted,
    fontSize: theme.font.sm,
    fontFamily: theme.families.inter,
  },
  projectsList: {
    gap: theme.size[12],
  },
  projectCard: {
    gap: theme.size[8],
  },
  cardHeader: {
    alignItems: "center",
    marginBottom: 0,
  },
  projectHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.size["2"],
    flex: 1,
  },
  iconBadge: {
    width: theme.size[40],
    height: theme.size[40],
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.mutedSurface,
  },
  projectText: {
    flex: 1,
    gap: theme.size[2],
    justifyContent: "flex-end",
  },
  pill: {
    paddingHorizontal: theme.size[12],
    paddingVertical: theme.size[6],
    alignSelf: "flex-end",
  },
  pillText: {
    color: theme.colors.text,
    fontSize: theme.font.sm,
    fontWeight: theme.font.medium,
    fontFamily: theme.families.inter,
  },
  cardContent: {
    gap: theme.size[6],
    marginTop: theme.size["6"],
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  menuIcon: {
    width: theme.size[32],
    height: theme.size[32],
    borderRadius: theme.radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  projectCopy: {
    color: theme.colors.muted,
    fontSize: theme.font.sm,
    lineHeight: theme.font.base * 1.4,
    fontFamily: theme.families.inter,
    flex: 1,
  },
  skeletonStack: {
    flex: 1,
    gap: theme.size[12],
  },
  stateCard: {
    alignItems: "center",
    justifyContent: "center",
    gap: theme.size[12],
    paddingHorizontal: theme.size[16],
    paddingVertical: theme.size[24],
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl2,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  emptyCard: {},
  errorCard: {
    borderColor: theme.colors.destructive,
  },
  stateIcon: {
    width: theme.size[56],
    height: theme.size[56],
    borderRadius: theme.radius.full,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.mutedSurface,
  },
  stateIconError: {
    borderColor: theme.colors.destructive,
  },
  stateTitle: {
    textAlign: "center",
  },
  stateMessage: {
    textAlign: "center",
    fontSize: theme.font.base,
    lineHeight: theme.font.base * 1.4,
    color: theme.colors.muted,
    fontFamily: theme.families.inter,
  },
  errorText: {
    color: theme.colors.destructive,
  },
  alertCard: {
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.colors.destructive,
    backgroundColor: theme.colors.mutedSurface,
    padding: theme.size[12],
  },
  alertContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.size[10],
  },
  alertIcon: {
    width: theme.size[32],
    height: theme.size[32],
    borderRadius: theme.radius.full,
    borderWidth: 1,
    borderColor: theme.colors.destructive,
    backgroundColor: theme.colors.background,
  },
  alertText: {
    flex: 1,
    gap: theme.size[2],
  },
}));
