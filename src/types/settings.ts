export type SettingsStatsDateRange = {
  start: string;
  end: string;
};

export type SettingsRequestPage = {
  pageIndex: number;
  pageSize: number;
};

export type SettingsRequestStatusFamily = 'info' | 'success' | 'redirect' | 'client' | 'server';

export type SettingsRequestSort = {
  id: 'time';
  desc: boolean;
};

export type SettingsRequestLogEntry = {
  ClientAddr?: string;
  ClientHost?: string;
  ClientPort?: string;
  ClientUsername?: string;
  DownstreamContentSize?: number;
  DownstreamStatus?: number;
  Duration?: number;
  OriginContentSize?: number;
  OriginDuration?: number;
  OriginStatus?: number;
  Overhead?: number;
  RequestAddr?: string;
  RequestContentSize?: number;
  RequestCount?: number;
  RequestHost?: string;
  RequestMethod?: string;
  RequestPath?: string;
  RequestPort?: string;
  RequestProtocol?: string;
  RequestScheme?: string;
  RetryAttempts?: number;
  RouterName?: string;
  ServiceAddr?: string;
  ServiceName?: string;
  ServiceURL?: {
    Scheme?: string;
    Opaque?: string;
    User?: string | null;
    Host?: string;
    Path?: string;
    RawPath?: string;
    ForceQuery?: boolean;
    RawQuery?: string;
    Fragment?: string;
    RawFragment?: string;
  } | null;
  StartLocal?: string;
  StartUTC?: string;
  downstream_Content_Type?: string;
  entryPointName?: string;
  level?: string;
  msg?: string;
  origin_Content_Type?: string;
  request_Content_Type?: string;
  request_User_Agent?: string;
  time?: string;
  [key: string]: unknown;
};

export type SettingsRequestLogListPayload = {
  data: SettingsRequestLogEntry[];
  totalCount: number;
};

export type SettingsStatsQueryInput = {
  sort: SettingsRequestSort;
  page: SettingsRequestPage;
  search: string;
  status: SettingsRequestStatusFamily[];
  dateRange: SettingsStatsDateRange;
};

export type SettingsStatsResponse = {
  items: SettingsRequestLogEntry[];
  totalCount: number;
  page: SettingsRequestPage;
  search: string;
  status: SettingsRequestStatusFamily[];
  dateRange: SettingsStatsDateRange;
  sort: SettingsRequestSort;
};

export type TrpcJsonEnvelope<T> = {
  json: T;
  meta?: Record<string, unknown>;
};

export type TrpcSuccessResult<T> = {
  result: {
    data: TrpcJsonEnvelope<T>;
  };
};
