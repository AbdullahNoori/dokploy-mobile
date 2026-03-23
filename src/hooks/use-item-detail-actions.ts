import { useCallback, useState } from 'react';
import { toast } from 'sonner-native';

import { applicationRedeploy, applicationReload, applicationStop } from '@/api/application';
import { HttpError } from '@/lib/http-error';
import { isErrorResponse } from '@/lib/utils';

type ActionKey = 'deploy' | 'reload' | 'stop';

type Params = {
  isApplication: boolean;
  applicationId?: string;
  appName?: string;
  isDeploymentRunning?: boolean;
  onRefresh?: () => void;
};

type ItemDetailActionsState = {
  activeAction: ActionKey | null;
  isBusy: boolean;
  canDeploy: boolean;
  canReload: boolean;
  canStop: boolean;
  onDeploy: () => Promise<void>;
  onReload: () => Promise<void>;
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
  isApplication,
  applicationId,
  appName,
  isDeploymentRunning = false,
  onRefresh,
}: Params): ItemDetailActionsState {
  const [activeAction, setActiveAction] = useState<ActionKey | null>(null);

  const canDeploy = isApplication && Boolean(applicationId) && !isDeploymentRunning;
  const canStop = isApplication && Boolean(applicationId);
  const canReload =
    isApplication && Boolean(applicationId && appName) && !isDeploymentRunning;
  const isBusy = activeAction !== null;

  const handleResult = useCallback(
    (result: unknown, successMessage: string, errorMessage: string) => {
      if (isErrorResponse(result)) {
        toast.error(result.message ?? result.error ?? errorMessage);
        return;
      }
      toast.success(successMessage);
      onRefresh?.();
    },
    [onRefresh]
  );

  const runAction = useCallback(
    async (
      action: ActionKey,
      runner: () => Promise<unknown>,
      successMessage: string,
      errorMessage: string
    ) => {
      if (activeAction) return;
      setActiveAction(action);
      try {
        const result = await runner();
        handleResult(result, successMessage, errorMessage);
      } catch (error) {
        toast.error(resolveErrorMessage(error, errorMessage));
      } finally {
        setActiveAction(null);
      }
    },
    [activeAction, handleResult]
  );

  const onDeploy = useCallback(async () => {
    if (!canDeploy || activeAction) return;
    await runAction(
      'deploy',
      () => applicationRedeploy({ applicationId: applicationId! }),
      'Deployment started.',
      'Unable to deploy.'
    );
  }, [activeAction, applicationId, canDeploy, runAction]);

  const onReload = useCallback(async () => {
    if (!canReload || activeAction) return;
    await runAction(
      'reload',
      () => applicationReload({ applicationId: applicationId!, appName: appName! }),
      'Reload started.',
      'Unable to reload.'
    );
  }, [activeAction, appName, applicationId, canReload, runAction]);

  const onStop = useCallback(async () => {
    if (!canStop || activeAction) return;
    await runAction(
      'stop',
      () => applicationStop({ applicationId: applicationId! }),
      'Stop requested.',
      'Unable to stop.'
    );
  }, [activeAction, applicationId, canStop, runAction]);

  return {
    activeAction,
    isBusy,
    canDeploy,
    canReload,
    canStop,
    onDeploy,
    onReload,
    onStop,
  };
}
