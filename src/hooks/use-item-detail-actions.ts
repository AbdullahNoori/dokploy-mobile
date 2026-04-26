import { useCallback, useState } from 'react';
import { toast } from 'sonner-native';

import { applicationRedeploy, applicationReload, applicationStop } from '@/api/application';
import { composeRedeploy, composeStart, composeStop } from '@/api/compose';
import { mariadbDeploy, mariadbRebuild, mariadbReload, mariadbStop } from '@/api/mariadb';
import { mongoDeploy, mongoRebuild, mongoReload, mongoStop } from '@/api/mongo';
import { mysqlDeploy, mysqlRebuild, mysqlReload, mysqlStop } from '@/api/mysql';
import { postgresDeploy, postgresRebuild, postgresReload, postgresStop } from '@/api/postgres';
import { redisDeploy, redisRebuild, redisReload, redisStop } from '@/api/redis';
import { useHaptics } from '@/hooks/use-haptics';
import { HttpError } from '@/lib/http-error';
import { isErrorResponse } from '@/lib/utils';
import type { ProjectItemType } from '@/types/projects';

type ActionKey = 'deploy' | 'reload' | 'rebuild' | 'stop';

type Params = {
  itemType: ProjectItemType;
  itemId?: string;
  appName?: string;
  isDeploymentRunning?: boolean;
  onRefresh?: () => void;
};

type ItemDetailActionsState = {
  activeAction: ActionKey | null;
  isBusy: boolean;
  canDeploy: boolean;
  canReload: boolean;
  canRebuild: boolean;
  canStop: boolean;
  secondaryActionLabel: string;
  onDeploy: () => Promise<void>;
  onReload: () => Promise<void>;
  onRebuild: () => Promise<void>;
  onStop: () => Promise<void>;
};

const resolveErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof HttpError) {
    return error.message ?? fallback;
  }
  if (error && typeof error === 'object' && 'message' in error) {
    const message = (error as { message?: string }).message;
    if (message) return message;
  }
  return fallback;
};

export function useItemDetailActions({
  itemType,
  itemId,
  appName,
  isDeploymentRunning = false,
  onRefresh,
}: Params): ItemDetailActionsState {
  const [activeAction, setActiveAction] = useState<ActionKey | null>(null);
  const { impact, notifyError, notifySuccess } = useHaptics();

  const isApplication = itemType === 'application';
  const isCompose = itemType === 'compose';
  const isDatabase = !isApplication && !isCompose;
  const hasItemId = Boolean(itemId);
  const canDeploy = hasItemId && (!isApplication || !isDeploymentRunning);
  const canStop = hasItemId;
  const canReload = hasItemId && (isCompose || Boolean(appName)) && !isDeploymentRunning;
  const canRebuild = hasItemId && isDatabase;
  const secondaryActionLabel = 'Reload';
  const isBusy = activeAction !== null;

  const handleResult = useCallback(
    async (result: unknown, successMessage: string, errorMessage: string) => {
      if (isErrorResponse(result)) {
        await notifyError();
        toast.error(result.message ?? result.error ?? errorMessage);
        return;
      }
      await notifySuccess();
      toast.success(successMessage);
      onRefresh?.();
    },
    [notifyError, notifySuccess, onRefresh]
  );

  const runAction = useCallback(
    async (
      action: ActionKey,
      runner: () => Promise<unknown>,
      successMessage: string,
      errorMessage: string
    ) => {
      if (activeAction) return;
      await impact();
      setActiveAction(action);
      try {
        const result = await runner();
        await handleResult(result, successMessage, errorMessage);
      } catch (error) {
        await notifyError();
        toast.error(resolveErrorMessage(error, errorMessage));
      } finally {
        setActiveAction(null);
      }
    },
    [activeAction, handleResult, impact, notifyError]
  );

  const onDeploy = useCallback(async () => {
    if (!canDeploy || activeAction) return;
    const runner = () => {
      switch (itemType) {
        case 'application':
          return applicationRedeploy({ applicationId: itemId! });
        case 'compose':
          return composeRedeploy({ composeId: itemId! });
        case 'redis':
          return redisDeploy({ redisId: itemId! });
        case 'postgres':
          return postgresDeploy({ postgresId: itemId! });
        case 'mysql':
          return mysqlDeploy({ mysqlId: itemId! });
        case 'mongo':
          return mongoDeploy({ mongoId: itemId! });
        case 'mariadb':
          return mariadbDeploy({ mariadbId: itemId! });
      }
    };
    await runAction('deploy', runner, 'Deployment started.', 'Unable to deploy.');
  }, [activeAction, canDeploy, itemId, itemType, runAction]);

  const onReload = useCallback(async () => {
    if (!canReload || activeAction) return;
    const runner = () => {
      switch (itemType) {
        case 'application':
          return applicationReload({ applicationId: itemId!, appName: appName! });
        case 'compose':
          return composeStart({ composeId: itemId! });
        case 'redis':
          return redisReload({ redisId: itemId!, appName: appName! });
        case 'postgres':
          return postgresReload({ postgresId: itemId!, appName: appName! });
        case 'mysql':
          return mysqlReload({ mysqlId: itemId!, appName: appName! });
        case 'mongo':
          return mongoReload({ mongoId: itemId!, appName: appName! });
        case 'mariadb':
          return mariadbReload({ mariadbId: itemId!, appName: appName! });
      }
    };
    await runAction(
      'reload',
      runner,
      isCompose ? 'Start requested.' : 'Reload started.',
      isCompose ? 'Unable to start.' : 'Unable to reload.'
    );
  }, [activeAction, appName, canReload, isCompose, itemId, itemType, runAction]);

  const onRebuild = useCallback(async () => {
    if (!canRebuild || activeAction) return;
    const runner = () => {
      switch (itemType) {
        case 'redis':
          return redisRebuild({ redisId: itemId! });
        case 'postgres':
          return postgresRebuild({ postgresId: itemId! });
        case 'mysql':
          return mysqlRebuild({ mysqlId: itemId! });
        case 'mongo':
          return mongoRebuild({ mongoId: itemId! });
        case 'mariadb':
          return mariadbRebuild({ mariadbId: itemId! });
        default:
          return Promise.resolve(undefined);
      }
    };
    await runAction('rebuild', runner, 'Rebuild started.', 'Unable to rebuild.');
  }, [activeAction, canRebuild, itemId, itemType, runAction]);

  const onStop = useCallback(async () => {
    if (!canStop || activeAction) return;
    const runner = () => {
      switch (itemType) {
        case 'application':
          return applicationStop({ applicationId: itemId! });
        case 'compose':
          return composeStop({ composeId: itemId! });
        case 'redis':
          return redisStop({ redisId: itemId! });
        case 'postgres':
          return postgresStop({ postgresId: itemId! });
        case 'mysql':
          return mysqlStop({ mysqlId: itemId! });
        case 'mongo':
          return mongoStop({ mongoId: itemId! });
        case 'mariadb':
          return mariadbStop({ mariadbId: itemId! });
      }
    };
    await runAction('stop', runner, 'Stop requested.', 'Unable to stop.');
  }, [activeAction, canStop, itemId, itemType, runAction]);

  return {
    activeAction,
    isBusy,
    canDeploy,
    canReload,
    canRebuild,
    canStop,
    secondaryActionLabel,
    onDeploy,
    onReload,
    onRebuild,
    onStop,
  };
}
