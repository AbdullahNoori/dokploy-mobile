import {
  DEFAULT_REQUESTS_DATE_PRESET,
  REQUESTS_DATE_PRESETS,
  REQUESTS_STATUS_OPTIONS,
  type RequestsDatePreset,
} from '@/lib/utils';
import type { SettingsRequestStatusFamily } from '@/types/settings';

type RequestsFilters = {
  datePreset: RequestsDatePreset;
  statuses: SettingsRequestStatusFamily[];
};

type RequestsFilterRouteParams = {
  datePreset?: string;
  statuses?: string;
};

let pendingRequestsFilters: RequestsFilters | null = null;

const REQUESTS_STATUS_VALUES = new Set(
  REQUESTS_STATUS_OPTIONS.map((option) => option.value satisfies SettingsRequestStatusFamily)
);
const REQUESTS_DATE_VALUES = new Set(
  REQUESTS_DATE_PRESETS.map((preset) => preset.value satisfies RequestsDatePreset)
);

function normalizeDatePreset(value: string | undefined): RequestsDatePreset {
  if (value && REQUESTS_DATE_VALUES.has(value as RequestsDatePreset)) {
    return value as RequestsDatePreset;
  }

  return DEFAULT_REQUESTS_DATE_PRESET;
}

function normalizeStatuses(value: string | undefined): SettingsRequestStatusFamily[] {
  if (!value) {
    return [];
  }

  const unique = new Set<SettingsRequestStatusFamily>();

  for (const item of value.split(',')) {
    const trimmed = item.trim();
    if (REQUESTS_STATUS_VALUES.has(trimmed as SettingsRequestStatusFamily)) {
      unique.add(trimmed as SettingsRequestStatusFamily);
    }
  }

  return Array.from(unique);
}

export function parseRequestsFilterRouteParams(params: RequestsFilterRouteParams): RequestsFilters {
  return {
    datePreset: normalizeDatePreset(params.datePreset),
    statuses: normalizeStatuses(params.statuses),
  };
}

export function buildRequestsFilterRouteParams(filters: RequestsFilters) {
  return {
    datePreset: filters.datePreset,
    statuses: filters.statuses.join(','),
  };
}

export function setPendingRequestsFilters(filters: RequestsFilters) {
  pendingRequestsFilters = {
    datePreset: filters.datePreset,
    statuses: [...filters.statuses],
  };
}

export function consumePendingRequestsFilters() {
  const next = pendingRequestsFilters;
  pendingRequestsFilters = null;
  return next;
}

export type { RequestsFilters, RequestsFilterRouteParams };
