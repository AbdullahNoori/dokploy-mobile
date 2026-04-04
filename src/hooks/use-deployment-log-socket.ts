import { useCallback, useEffect, useMemo, useState } from 'react';

import { appendLine, buildDeploymentLogWsUrl, getDeploymentLogMessageText } from '@/lib/utils';

import {
  useWebSocketConnection,
  type UseWebSocketConnectionState,
} from './use-websocket-connection';

type DeploymentLogMessage = {
  type?: string;
  content?: string;
  line?: string;
  timestamp?: string;
};

export type UseDeploymentLogSocketOptions = {
  logPath?: string;
  enabled?: boolean;
  maxLines?: number;
};

export type UseDeploymentLogSocketState = UseWebSocketConnectionState & {
  lines: string[];
  hasLogPath: boolean;
  isEmpty: boolean;
};

const DEFAULT_MAX_LINES = 400;

export function useDeploymentLogSocket({
  logPath,
  enabled = true,
  maxLines = DEFAULT_MAX_LINES,
}: UseDeploymentLogSocketOptions): UseDeploymentLogSocketState {
  const [lines, setLines] = useState<string[]>([]);
  const hasLogPath = Boolean(logPath);

  const url = useMemo(() => {
    if (!logPath) {
      return undefined;
    }

    return buildDeploymentLogWsUrl(logPath) ?? undefined;
  }, [logPath]);

  useEffect(() => {
    setLines([]);
  }, [logPath]);

  const handleMessage = useCallback(
    (event: { data: unknown }) => {
      if (typeof event.data !== 'string') {
        return;
      }

      try {
        const payload = JSON.parse(event.data) as DeploymentLogMessage;
        const nextLine = getDeploymentLogMessageText(payload, event.data);
        setLines((prev) => appendLine(prev, nextLine, maxLines));
      } catch {
        const fallbackLine = event.data;
        setLines((prev) => appendLine(prev, fallbackLine, maxLines));
      }
    },
    [maxLines]
  );

  const connection = useWebSocketConnection({
    url,
    enabled: enabled && !!url,
    onMessage: handleMessage,
  });

  return {
    lines,
    hasLogPath,
    isEmpty: lines.length === 0,
    isConnecting: connection.isConnecting,
    isConnected: connection.isConnected,
    readyState: connection.readyState,
    error: connection.error,
    reconnect: connection.reconnect,
  };
}
