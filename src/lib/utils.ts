import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { getPat, getWebSocketBaseUrl } from './http-config';
import type { models } from '@/types/error';
import type { ProjectAllEnvironment } from '@/types/projects';
import type { SettingsRequestLogEntry, SettingsRequestStatusFamily } from '@/types/settings';

export type RequestsDatePreset = '24h' | '3d' | '7d' | '30d';

export const DEFAULT_REQUESTS_DATE_PRESET: RequestsDatePreset = '3d';

export const REQUESTS_DATE_PRESETS: Array<{
  label: string;
  value: RequestsDatePreset;
  days: number;
}> = [
  { label: '24h', value: '24h', days: 1 },
  { label: '3d', value: '3d', days: 3 },
  { label: '7d', value: '7d', days: 7 },
  { label: '30d', value: '30d', days: 30 },
];

export const REQUESTS_STATUS_OPTIONS: Array<{
  label: string;
  value: SettingsRequestStatusFamily;
  badgeClassName: string;
  badgeTextClassName: string;
  activeChipClassName: string;
  activeChipTextClassName: string;
}> = [
  {
    label: '1xx',
    value: 'info',
    badgeClassName: 'border border-sky-400/35 bg-sky-500/15',
    badgeTextClassName: 'text-sky-100',
    activeChipClassName: 'border-sky-400/55 bg-sky-500/85',
    activeChipTextClassName: 'text-sky-950',
  },
  {
    label: '2xx',
    value: 'success',
    badgeClassName: 'border border-zinc-200/70 bg-zinc-50',
    badgeTextClassName: 'text-zinc-950',
    activeChipClassName: 'border-zinc-200/80 bg-zinc-50',
    activeChipTextClassName: 'text-zinc-950',
  },
  {
    label: '3xx',
    value: 'redirect',
    badgeClassName: 'border border-amber-400/35 bg-amber-500/15',
    badgeTextClassName: 'text-amber-100',
    activeChipClassName: 'border-amber-400/55 bg-amber-500/85',
    activeChipTextClassName: 'text-amber-950',
  },
  {
    label: '4xx',
    value: 'client',
    badgeClassName: 'border border-rose-400/40 bg-rose-500',
    badgeTextClassName: 'text-white',
    activeChipClassName: 'border-rose-400/55 bg-rose-500',
    activeChipTextClassName: 'text-white',
  },
  {
    label: '5xx',
    value: 'server',
    badgeClassName: 'border border-red-400/40 bg-red-500',
    badgeTextClassName: 'text-white',
    activeChipClassName: 'border-red-400/55 bg-red-500',
    activeChipTextClassName: 'text-white',
  },
];

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

export function formatCompactRelativeTime(value: string | undefined) {
  if (!value) {
    return 'Unknown';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'Unknown';
  }

  const diffSeconds = Math.round((Date.now() - date.getTime()) / 1000);
  const absSeconds = Math.abs(diffSeconds);

  const divisions: Array<[string, number]> = [
    ['day', 60 * 60 * 24],
    ['hour', 60 * 60],
    ['minute', 60],
    ['second', 1],
  ];

  for (const [unit, secondsInUnit] of divisions) {
    if (absSeconds >= secondsInUnit || unit === 'second') {
      const valueForUnit = Math.round(absSeconds / secondsInUnit);
      const suffix = valueForUnit === 1 ? unit : `${unit}s`;

      if (diffSeconds >= 0) {
        if (valueForUnit === 0) {
          return 'Just now';
        }
        return `${valueForUnit} ${suffix} ago`;
      }

      return `In ${valueForUnit} ${suffix}`;
    }
  }

  return 'Unknown';
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

export function formatRequestDuration(durationNs: number | undefined) {
  if (typeof durationNs !== 'number' || Number.isNaN(durationNs) || durationNs < 0) {
    return 'Unknown';
  }

  const ms = durationNs / 1_000_000;
  if (ms < 1) {
    return `${(durationNs / 1_000).toFixed(2)} µs`;
  }

  if (ms < 1000) {
    return `${ms.toFixed(2)} ms`;
  }

  return `${(ms / 1000).toFixed(2)} s`;
}

export function formatRequestStatus(status: number | undefined) {
  if (typeof status !== 'number' || status <= 0) {
    return 'N/A';
  }

  return String(status);
}

export function formatRequestTimestamp(value: string | undefined) {
  if (!value) {
    return 'Unknown';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'Unknown';
  }

  const month = MONTH_LABELS[date.getMonth()] ?? 'Unknown';
  const day = pad2(date.getDate());
  const year = date.getFullYear();
  const hours = pad2(date.getHours());
  const minutes = pad2(date.getMinutes());
  const seconds = pad2(date.getSeconds());

  return `${month} ${day}, ${year} ${hours}:${minutes}:${seconds}`;
}

export function getRequestsDateRange(preset: RequestsDatePreset) {
  const match =
    REQUESTS_DATE_PRESETS.find((item) => item.value === preset) ?? REQUESTS_DATE_PRESETS[1];
  const end = new Date();
  const start = new Date(end);
  start.setDate(start.getDate() - match.days);

  return {
    start: start.toISOString(),
    end: end.toISOString(),
  };
}

export function getRequestStatusFamily(
  status: number | undefined
): SettingsRequestStatusFamily | null {
  if (typeof status !== 'number') {
    return null;
  }

  if (status >= 100 && status <= 199) return 'info';
  if (status >= 200 && status <= 299) return 'success';
  if (status >= 300 && status <= 399) return 'redirect';
  if (status >= 400 && status <= 499) return 'client';
  if (status >= 500 && status <= 599) return 'server';

  return null;
}

export function getRequestLogKey(item: SettingsRequestLogEntry, index: number) {
  const parts = [
    item.time,
    item.StartUTC,
    item.RequestMethod,
    item.RequestPath,
    item.ClientAddr,
    item.RequestCount,
    index,
  ];

  return parts.filter(Boolean).join(':');
}

export function getRequestHost(item: SettingsRequestLogEntry) {
  return item.RequestAddr || item.RequestHost || 'Unknown host';
}

export function getRequestPath(item: SettingsRequestLogEntry) {
  return item.RequestPath || '/';
}

export function getRequestMethod(item: SettingsRequestLogEntry) {
  return item.RequestMethod || 'REQUEST';
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

const MONTH_LABELS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

function pad2(value: number) {
  return String(value).padStart(2, '0');
}
