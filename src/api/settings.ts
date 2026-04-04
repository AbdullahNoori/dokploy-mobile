import { getRequest } from '@/lib/http';
import type {
  SettingsRequestLogListPayload,
  SettingsRequestPage,
  SettingsRequestStatusFamily,
  SettingsRequestSort,
  SettingsStatsDateRange,
  SettingsStatsQueryInput,
  SettingsStatsResponse,
  TrpcSuccessResult,
} from '@/types/settings';

const DEFAULT_REQUESTS_SORT: SettingsRequestSort = {
  id: 'time',
  desc: true,
};

export const DEFAULT_REQUESTS_PAGE_SIZE = 25;
export const DEFAULT_REQUESTS_DATE_RANGE_DAYS = 3;

type ReadSettingsStatsOptions = Partial<{
  pageIndex: number;
  pageSize: number;
  search: string;
  status: SettingsRequestStatusFamily[];
  dateRange: SettingsStatsDateRange;
}>;

export function getDefaultSettingsStatsDateRange(days = DEFAULT_REQUESTS_DATE_RANGE_DAYS) {
  const end = new Date();
  const start = new Date(end);
  start.setDate(start.getDate() - days);

  return {
    start: start.toISOString(),
    end: end.toISOString(),
  };
}

function buildSettingsStatsInput(input: SettingsStatsQueryInput) {
  return {
    json: input,
  };
}

function normalizeSettingsStatsResponse(
  payload: SettingsRequestLogListPayload,
  query: SettingsStatsQueryInput
): SettingsStatsResponse {
  return {
    items: Array.isArray(payload.data) ? payload.data : [],
    totalCount: typeof payload.totalCount === 'number' ? payload.totalCount : 0,
    page: query.page,
    search: query.search,
    status: query.status,
    dateRange: query.dateRange,
    sort: query.sort,
  };
}

export async function readSettingsStats(
  options: ReadSettingsStatsOptions = {}
): Promise<SettingsStatsResponse> {
  const page: SettingsRequestPage = {
    pageIndex: options.pageIndex ?? 0,
    pageSize: options.pageSize ?? DEFAULT_REQUESTS_PAGE_SIZE,
  };

  const query: SettingsStatsQueryInput = {
    sort: DEFAULT_REQUESTS_SORT,
    page,
    search: options.search?.trim() ?? '',
    status: options.status ?? [],
    dateRange: options.dateRange ?? getDefaultSettingsStatsDateRange(),
  };

  const response = await getRequest<TrpcSuccessResult<SettingsRequestLogListPayload>>(
    'trpc/settings.readStatsLogs',
    {
      input: JSON.stringify(buildSettingsStatsInput(query)),
    }
  );

  return normalizeSettingsStatsResponse(response.result.data.json, query);
}
