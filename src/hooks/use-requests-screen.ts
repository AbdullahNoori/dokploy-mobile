import { startTransition, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';

import { DEFAULT_REQUESTS_PAGE_SIZE, readSettingsStats } from '@/api/settings';
import { HttpError } from '@/lib/http-error';
import { consumePendingRequestsFilters, type RequestsFilters } from '@/lib/requests-filter-route';
import {
  DEFAULT_REQUESTS_DATE_PRESET,
  type RequestsDatePreset,
  getRequestsDateRange,
} from '@/lib/utils';
import type { SettingsRequestLogEntry, SettingsRequestStatusFamily } from '@/types/settings';
import { toast } from 'sonner-native';
import { useDebouncedValue } from './use-debounced-value';

const resolveErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof HttpError) {
    return error.message ?? fallback;
  }

  if (error && typeof error === 'object' && 'message' in error) {
    const message = (error as { message?: string }).message;
    if (message) {
      return message;
    }
  }

  return fallback;
};

type LoadPageOptions = {
  append: boolean;
  refresh?: boolean;
};

type RequestsListStatus = 'initial-loading' | 'ready' | 'empty' | 'error';

type UseRequestsScreenResult = {
  search: {
    query: string;
    setQuery: (value: string) => void;
  };
  filters: {
    value: RequestsFilters;
    hasAny: boolean;
    count: number;
    apply: (next: RequestsFilters) => void;
    clearDatePreset: () => void;
    removeStatus: (status: SettingsRequestStatusFamily) => void;
  };
  list: {
    items: SettingsRequestLogEntry[];
    totalCount: number;
    status: RequestsListStatus;
    error: string | null;
    isRefreshing: boolean;
    isLoadingMore: boolean;
    refresh: () => Promise<void>;
    retry: () => Promise<void>;
    loadMore: () => Promise<void>;
  };
};

export function useRequestsScreen(): UseRequestsScreenResult {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebouncedValue(query, 300);
  const [filters, setFilters] = useState<RequestsFilters>({
    datePreset: DEFAULT_REQUESTS_DATE_PRESET,
    statuses: [],
  });
  const [items, setItems] = useState<SettingsRequestLogEntry[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [pageIndex, setPageIndex] = useState(0);
  const [isLoadingInitial, setIsLoadingInitial] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const activeRequestIdRef = useRef(0);
  const hasLoadedOnceRef = useRef(false);

  const loadPage = useCallback(
    async (nextPageIndex: number, options: LoadPageOptions) => {
      const requestId = ++activeRequestIdRef.current;
      const trimmedQuery = debouncedQuery.trim();
      const isFirstLoad = !hasLoadedOnceRef.current;

      if (options.refresh) {
        setIsRefreshing(true);
      } else if (options.append) {
        setIsLoadingMore(true);
      } else if (isFirstLoad) {
        setIsLoadingInitial(true);
      }

      if (!options.append) {
        setError(null);
      }

      try {
        const response = await readSettingsStats({
          pageIndex: nextPageIndex,
          pageSize: DEFAULT_REQUESTS_PAGE_SIZE,
          search: trimmedQuery,
          status: filters.statuses,
          dateRange: getRequestsDateRange(filters.datePreset),
        });

        if (requestId !== activeRequestIdRef.current) {
          return;
        }

        setItems((prev) => (options.append ? [...prev, ...response.items] : response.items));
        setTotalCount(response.totalCount);
        setPageIndex(nextPageIndex);
        setError(null);
        hasLoadedOnceRef.current = true;
      } catch (loadError) {
        if (requestId !== activeRequestIdRef.current) {
          return;
        }

        const message = resolveErrorMessage(loadError, 'Unable to load requests.');
        setError(message);
        if (!options.append && !hasLoadedOnceRef.current) {
          setItems([]);
          setTotalCount(0);
          setPageIndex(0);
        } else {
          toast.error(message);
        }
      } finally {
        if (requestId !== activeRequestIdRef.current) {
          return;
        }

        if (isFirstLoad) {
          setIsLoadingInitial(false);
        }
        setIsLoadingMore(false);
        setIsRefreshing(false);
      }
    },
    [debouncedQuery, filters.datePreset, filters.statuses]
  );

  useEffect(() => {
    void loadPage(0, { append: false });
  }, [loadPage]);

  useFocusEffect(
    useCallback(() => {
      const pendingFilters = consumePendingRequestsFilters();
      if (pendingFilters) {
        startTransition(() => {
          setFilters(pendingFilters);
        });
      }
    }, [])
  );

  const applyFilters = useCallback((nextFilters: RequestsFilters) => {
    startTransition(() => {
      setFilters(nextFilters);
    });
  }, []);

  const removeStatusFilter = useCallback((status: SettingsRequestStatusFamily) => {
    startTransition(() => {
      setFilters((prev) => ({
        ...prev,
        statuses: prev.statuses.filter((current) => current !== status),
      }));
    });
  }, []);

  const clearDatePreset = useCallback(() => {
    startTransition(() => {
      setFilters((prev) => ({
        ...prev,
        datePreset: DEFAULT_REQUESTS_DATE_PRESET,
      }));
    });
  }, []);

  const refresh = useCallback(async () => {
    await loadPage(0, { append: false, refresh: true });
  }, [loadPage]);

  const loadMore = useCallback(async () => {
    if (isLoadingInitial || isLoadingMore || isRefreshing || items.length >= totalCount) {
      return;
    }

    await loadPage(pageIndex + 1, { append: true });
  }, [
    isLoadingInitial,
    isLoadingMore,
    isRefreshing,
    items.length,
    loadPage,
    pageIndex,
    totalCount,
  ]);

  const retry = useCallback(async () => {
    await loadPage(0, { append: false });
  }, [loadPage]);

  const hasActiveFilters = useMemo(() => {
    return filters.statuses.length > 0 || filters.datePreset !== DEFAULT_REQUESTS_DATE_PRESET;
  }, [filters.datePreset, filters.statuses.length]);

  const activeFilterCount = useMemo(() => {
    let count = filters.statuses.length;
    if (filters.datePreset !== DEFAULT_REQUESTS_DATE_PRESET) {
      count += 1;
    }
    return count;
  }, [filters.datePreset, filters.statuses.length]);

  const listStatus: RequestsListStatus = useMemo(() => {
    if (isLoadingInitial) {
      return 'initial-loading';
    }

    if (error && items.length === 0) {
      return 'error';
    }

    if (items.length === 0) {
      return 'empty';
    }

    return 'ready';
  }, [error, isLoadingInitial, items.length]);

  const search = useMemo(
    () => ({
      query,
      setQuery,
    }),
    [query]
  );

  const filtersApi = useMemo(
    () => ({
      value: filters,
      hasAny: hasActiveFilters,
      count: activeFilterCount,
      apply: applyFilters,
      clearDatePreset,
      removeStatus: removeStatusFilter,
    }),
    [
      activeFilterCount,
      applyFilters,
      clearDatePreset,
      filters,
      hasActiveFilters,
      removeStatusFilter,
    ]
  );

  const list = useMemo(
    () => ({
      items,
      totalCount,
      status: listStatus,
      error,
      isRefreshing,
      isLoadingMore,
      refresh,
      retry,
      loadMore,
    }),
    [error, isLoadingMore, isRefreshing, items, listStatus, loadMore, refresh, retry, totalCount]
  );

  return {
    search,
    filters: filtersApi,
    list,
  };
}

export type { RequestsDatePreset, RequestsFilters, RequestsListStatus, UseRequestsScreenResult };
