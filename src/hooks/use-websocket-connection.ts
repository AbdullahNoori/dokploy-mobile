import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  buildWebSocketHandshakeHeaders,
  formatWebSocketCloseError,
  getWebSocketReconnectDelayMs,
} from '@/lib/utils';

type WebSocketHeaders = Record<string, string>;

type WebSocketMessageLike = {
  data: unknown;
};

type ReactNativeWebSocketCtor = {
  new (
    url: string,
    protocols?: string | string[],
    options?: {
      headers?: WebSocketHeaders;
    }
  ): WebSocket;
};

export type UseWebSocketConnectionOptions = {
  url?: string;
  enabled?: boolean;
  onMessage?: (event: WebSocketMessageLike) => void;
  reconnect?: boolean;
  baseReconnectDelayMs?: number;
  maxReconnectDelayMs?: number;
  maxReconnectAttempts?: number | null;
  headers?: WebSocketHeaders;
};

export type UseWebSocketConnectionState = {
  isConnecting: boolean;
  isConnected: boolean;
  readyState: number;
  error: string | null;
  reconnect: () => void;
};

const WebSocketWithOptions = WebSocket as unknown as ReactNativeWebSocketCtor;

export function useWebSocketConnection({
  url,
  enabled = true,
  onMessage,
  reconnect = false,
  baseReconnectDelayMs = 1000,
  maxReconnectDelayMs = 10000,
  maxReconnectAttempts = null,
  headers,
}: UseWebSocketConnectionOptions): UseWebSocketConnectionState {
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectAttemptRef = useRef(0);
  const onMessageRef = useRef(onMessage);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [readyState, setReadyState] = useState<number>(WebSocket.CLOSED);
  const [error, setError] = useState<string | null>(null);
  const [connectVersion, setConnectVersion] = useState(0);
  const headersSignature = JSON.stringify(headers ?? {});
  const normalizedHeaders = useMemo(
    () => buildWebSocketHandshakeHeaders(headers),
    [headersSignature]
  );

  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  const clearReconnectTimer = useCallback(() => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
  }, []);

  const closeSocket = useCallback(() => {
    const socket = socketRef.current;
    socketRef.current = null;

    if (!socket) {
      return;
    }

    socket.onopen = null;
    socket.onmessage = null;
    socket.onerror = null;
    socket.onclose = null;
    socket.close();
  }, []);

  const triggerReconnect = useCallback(() => {
    clearReconnectTimer();
    reconnectAttemptRef.current = 0;
    setConnectVersion((prev) => prev + 1);
  }, [clearReconnectTimer]);

  useEffect(() => {
    if (!enabled || !url) {
      clearReconnectTimer();
      reconnectAttemptRef.current = 0;
      closeSocket();
      setIsConnecting(false);
      setIsConnected(false);
      setReadyState(WebSocket.CLOSED);
      return;
    }

    let cancelled = false;

    if (!normalizedHeaders?.['x-api-key']) {
      clearReconnectTimer();
      reconnectAttemptRef.current = 0;
      closeSocket();
      setIsConnecting(false);
      setIsConnected(false);
      setReadyState(WebSocket.CLOSED);
      setError('A personal access token is required to open a WebSocket connection.');
      return;
    }

    setError(null);
    setIsConnecting(true);
    setIsConnected(false);
    setReadyState(WebSocket.CONNECTING);

    const socket = normalizedHeaders
      ? new WebSocketWithOptions(url, undefined, { headers: normalizedHeaders })
      : new WebSocket(url);

    socketRef.current = socket;

    socket.onopen = () => {
      if (cancelled) {
        return;
      }

      reconnectAttemptRef.current = 0;
      setError(null);
      setIsConnecting(false);
      setIsConnected(true);
      setReadyState(WebSocket.OPEN);
    };

    socket.onmessage = (event) => {
      if (cancelled) {
        return;
      }

      onMessageRef.current?.(event as WebSocketMessageLike);
    };

    socket.onerror = () => {
      if (cancelled) {
        return;
      }

      setError((current) => current ?? 'Unable to establish a WebSocket connection.');
    };

    socket.onclose = (event) => {
      if (cancelled) {
        return;
      }

      setIsConnecting(false);
      setIsConnected(false);
      setReadyState(WebSocket.CLOSED);

      if (event.code !== 1000) {
        setError(formatWebSocketCloseError(event.code, event.reason));
      }

      if (!reconnect || !enabled) {
        return;
      }

      const nextAttempt = reconnectAttemptRef.current + 1;
      const reachedMax = maxReconnectAttempts !== null && nextAttempt > maxReconnectAttempts;

      if (reachedMax) {
        setError((current) => current ?? 'Connection lost and retry limit reached.');
        return;
      }

      reconnectAttemptRef.current = nextAttempt;
      const delayMs = getWebSocketReconnectDelayMs(
        nextAttempt,
        baseReconnectDelayMs,
        maxReconnectDelayMs
      );

      reconnectTimerRef.current = setTimeout(() => {
        if (cancelled || !enabled) {
          return;
        }

        setConnectVersion((prev) => prev + 1);
      }, delayMs);
    };

    return () => {
      cancelled = true;
      clearReconnectTimer();
      closeSocket();
    };
  }, [
    baseReconnectDelayMs,
    clearReconnectTimer,
    closeSocket,
    connectVersion,
    enabled,
    headersSignature,
    maxReconnectAttempts,
    maxReconnectDelayMs,
    normalizedHeaders,
    reconnect,
    url,
  ]);

  return {
    isConnecting,
    isConnected,
    readyState,
    error,
    reconnect: triggerReconnect,
  };
}
