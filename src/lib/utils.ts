import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { getPat, getWebSocketBaseUrl } from './http-config';
import type { models } from '@/types/error';
import type { ProjectAllEnvironment } from '@/types/projects';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isErrorResponse(value: unknown): value is models.ErrorT {
  return Boolean(value && typeof value === 'object' && 'error' in value);
}

export function getServiceCount(environments: ProjectAllEnvironment[]) {
  return environments.reduce((total, env) => {
    return (
      total +
      (env.applications?.length ?? 0) +
      (env.compose?.length ?? 0) +
      (env.mariadb?.length ?? 0) +
      (env.mongo?.length ?? 0) +
      (env.mysql?.length ?? 0) +
      (env.postgres?.length ?? 0) +
      (env.redis?.length ?? 0)
    );
  }, 0);
}

export function formatRelativeTime(isoDate: string) {
  const date = new Date(isoDate);
  const diffSeconds = Math.round((Date.now() - date.getTime()) / 1000);
  const absSeconds = Math.abs(diffSeconds);

  const divisions: Array<[string, number]> = [
    ['year', 60 * 60 * 24 * 365],
    ['month', 60 * 60 * 24 * 30],
    ['week', 60 * 60 * 24 * 7],
    ['day', 60 * 60 * 24],
    ['hour', 60 * 60],
    ['minute', 60],
    ['second', 1],
  ];

  for (const [unit, secondsInUnit] of divisions) {
    if (absSeconds >= secondsInUnit || unit === 'second') {
      const value = Math.round(absSeconds / secondsInUnit);
      const label = value === 1 ? unit : `${unit}s`;
      return diffSeconds >= 0 ? `Created ${value} ${label} ago` : `Created in ${value} ${label}`;
    }
  }

  return 'Created just now';
}

export function formatStatusLabel(status: string | null) {
  if (!status) return 'Unknown';
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export function formatDuration(startedAt: string | null, finishedAt: string | null) {
  if (!startedAt || !finishedAt) return null;
  const start = new Date(startedAt).getTime();
  const end = new Date(finishedAt).getTime();
  if (Number.isNaN(start) || Number.isNaN(end) || end <= start) return null;
  const totalSeconds = Math.round((end - start) / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}

export function normalizeHeaders(headers: Record<string, string> | undefined) {
  if (!headers) {
    return undefined;
  }

  const normalized = Object.entries(headers).reduce<Record<string, string>>((acc, [key, value]) => {
    if (typeof value === 'string' && value.length > 0) {
      acc[key] = value;
    }
    return acc;
  }, {});

  return Object.keys(normalized).length > 0 ? normalized : undefined;
}

export function buildWebSocketHandshakeHeaders(headers: Record<string, string> | undefined) {
  const pat = getPat();
  const authHeaders = pat ? { 'x-api-key': pat } : undefined;

  return normalizeHeaders({
    ...(authHeaders ?? {}),
    ...(headers ?? {}),
  });
}

export function getWebSocketReconnectDelayMs(
  attempt: number,
  baseReconnectDelayMs: number,
  maxReconnectDelayMs: number
) {
  return Math.min(baseReconnectDelayMs * 2 ** Math.max(0, attempt - 1), maxReconnectDelayMs);
}

export function formatWebSocketCloseError(code: number, reason: string) {
  const detail = reason.trim();

  if (code === 1000) {
    return detail ? `Connection closed: ${detail}` : 'Connection closed.';
  }

  if (code === 1006) {
    return 'Connection lost unexpectedly.';
  }

  if (detail) {
    return `Connection closed (${code}): ${detail}`;
  }

  return `Connection closed (${code}).`;
}

export function capLines(lines: string[], maxLines: number) {
  if (lines.length <= maxLines) {
    return lines;
  }

  return lines.slice(lines.length - maxLines);
}

export function appendLine(prev: string[], nextLine: string, maxLines: number) {
  return capLines([...prev, nextLine], maxLines);
}

export function getDeploymentLogMessageText(
  payload: { content?: string; line?: string },
  raw: string
) {
  if (typeof payload.content === 'string' && payload.content.length > 0) {
    return payload.content;
  }

  if (typeof payload.line === 'string' && payload.line.length > 0) {
    return payload.line;
  }

  return raw;
}

export function buildDeploymentLogWsUrl(logPath: string) {
  return buildWebSocketUrl('/listen-deployment', { logPath });
}

export function buildContainerLogWsUrl(containerId: string) {
  return buildWebSocketUrl('/docker-container-logs', {
    containerId,
    tail: 100,
    since: 'all',
    search: '',
    runType: 'native',
  });
}

export function buildWebSocketUrl(
  path: string,
  params?: Record<string, string | number | boolean | undefined>
) {
  const baseUrl = getWebSocketBaseUrl();

  if (!baseUrl) {
    return null;
  }

  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const definedParams = Object.entries(params ?? {}).reduce<Record<string, string>>(
    (acc, [key, value]) => {
      if (value !== undefined) {
        acc[key] = String(value);
      }
      return acc;
    },
    {}
  );

  const query = new URLSearchParams(definedParams);
  const queryString = query.toString();

  return queryString ? `${baseUrl}${normalizedPath}?${queryString}` : `${baseUrl}${normalizedPath}`;
}
