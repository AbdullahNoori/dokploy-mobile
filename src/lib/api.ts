import AsyncStorage from "@react-native-async-storage/async-storage";
import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";
import { reactotronLoggers } from "./ReactotronConfig";

const TOKENS_KEY = "@dokploy/tokens";

export type AuthInterceptorOptions = {
  getAccessToken?: () => string | null;
  onUnauthorized?: () => Promise<void> | void;
};

const API_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_URL;
const API_KEY = process.env.EXPO_PUBLIC_DOKPLOY_API;

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
    "x-api-key": API_KEY,
  },
});

let getAccessToken: (() => string | null) | null = null;
let unauthorizedHandler: (() => Promise<void> | void) | null = null;

export const configureHttpClient = (options: AuthInterceptorOptions) => {
  getAccessToken = options.getAccessToken ?? null;
  unauthorizedHandler = options.onUnauthorized ?? null;
};

const parseStoredToken = (raw: string | null): string | null => {
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw);

    if (typeof parsed === "string") {
      return parsed;
    }

    if (
      parsed &&
      typeof parsed === "object" &&
      "access_token" in parsed &&
      typeof parsed.access_token === "string"
    ) {
      return parsed.access_token;
    }
  } catch {
    // fall through and return the raw value below
  }

  return raw;
};

const readStoredToken = async (): Promise<string | null> => {
  try {
    const raw = await AsyncStorage.getItem(TOKENS_KEY);
    return parseStoredToken(raw);
  } catch {
    return null;
  }
};

type RetriableRequest = AxiosRequestConfig & {
  _retry?: boolean;
};

const resolveUrl = (config?: AxiosRequestConfig) => {
  if (!config) return api.defaults.baseURL ?? "";
  const url = config.url ?? "";
  if (/^https?:\/\//i.test(url)) {
    return url;
  }

  const base = config.baseURL ?? api.defaults.baseURL ?? "";
  const joiner = base.endsWith("/") || url.startsWith("/") || !base ? "" : "/";
  return `${base}${joiner}${url}`.replace(/([^:]\/)\/+/g, "$1");
};

const setAuthHeader = (request: AxiosRequestConfig, token: string | null) => {
  if (!token) return;
  request.headers = request.headers ?? {};
  (request.headers as any).Authorization = `Bearer ${token}`;
};

api.interceptors.request.use(async (config) => {
  config.headers = config.headers ?? {};

  let token = getAccessToken?.() ?? null;

  if (!token) {
    token = await readStoredToken();
  }

  if (token) {
    setAuthHeader(config, token);
  }

  // Mirror every axios request inside Reactotron's timeline.
  reactotronLoggers.apiRequest({
    method: config.method,
    url: resolveUrl(config),
    headers: config.headers,
    data: config.data,
  });

  return config;
});

api.interceptors.response.use(
  (response: AxiosResponse) => {
    // Successful responses stream back into Reactotron for quick inspection.
    reactotronLoggers.apiResponse({
      url: resolveUrl(response.config),
      status: response.status,
      data: response.data,
    });
    return response;
  },
  async (error: AxiosError) => {
    const status = error.response?.status;
    const requestUrl = resolveUrl(error.config as RetriableRequest | undefined);

    reactotronLoggers.apiError({
      url: requestUrl,
      status,
      message: error.message,
      data: error.response?.data,
    });

    if (status === 401 && unauthorizedHandler) {
      await unauthorizedHandler();
    }

    return Promise.reject(error);
  }
);
