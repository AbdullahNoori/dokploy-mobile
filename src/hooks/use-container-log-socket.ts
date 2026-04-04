import { useCallback, useEffect, useMemo, useState } from 'react';

import { appendLine, buildContainerLogWsUrl, getDeploymentLogMessageText } from '@/lib/utils';

import {
  useWebSocketConnection,
  type UseWebSocketConnectionState,
} from './use-websocket-connection';

type ContainerLogMessage = {
  type?: string;
  content?: string;
  line?: string;
  message?: string;
  log?: string;
  timestamp?: string;
};

export type UseContainerLogSocketOptions = {
  containerId?: string;
  enabled?: boolean;
  maxLines?: number;
};

export type UseContainerLogSocketState = UseWebSocketConnectionState & {
  lines: string[];
  hasContainerId: boolean;
  isEmpty: boolean;
};

const DEFAULT_MAX_LINES = 400;

function getContainerLogMessageText(payload: ContainerLogMessage, raw: string) {
  if (typeof payload.message === 'string' && payload.message.length > 0) {
    return payload.message;
  }

  if (typeof payload.log === 'string' && payload.log.length > 0) {
    return payload.log;
  }

  return getDeploymentLogMessageText(payload, raw);
}

export function useContainerLogSocket({
  containerId,
  enabled = true,
  maxLines = DEFAULT_MAX_LINES,
}: UseContainerLogSocketOptions): UseContainerLogSocketState {
  const [lines, setLines] = useState<string[]>([]);
  const hasContainerId = Boolean(containerId);

  const url = useMemo(() => {
    if (!containerId) {
      return undefined;
    }

    return buildContainerLogWsUrl(containerId) ?? undefined;
  }, [containerId]);

  useEffect(() => {
    setLines([]);
  }, [containerId]);

  const handleMessage = useCallback(
    (event: { data: unknown }) => {
      const raw = event.data;

      if (typeof raw !== 'string') {
        return;
      }

      try {
        const payload = JSON.parse(raw) as ContainerLogMessage;
        const nextLine = getContainerLogMessageText(payload, raw);
        setLines((prev) => appendLine(prev, nextLine, maxLines));
      } catch {
        setLines((prev) => appendLine(prev, raw, maxLines));
      }
    },
    [maxLines]
  );

  const connection = useWebSocketConnection({
    url,
    enabled: enabled && !!url,
    onMessage: handleMessage,
    reconnect: true,
  });

  return {
    lines,
    hasContainerId,
    isEmpty: lines.length === 0,
    isConnecting: connection.isConnecting,
    isConnected: connection.isConnected,
    readyState: connection.readyState,
    error: connection.error,
    reconnect: connection.reconnect,
  };
}
