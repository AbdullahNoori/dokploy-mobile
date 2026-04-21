import axios, { AxiosError, AxiosHeaders } from 'axios';

import { getPat, getServerUrl } from './http-config';

export const api = axios.create({
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const baseURL = config.baseURL ?? getServerUrl();

  if (!baseURL) {
    throw new AxiosError('Dokploy server URL is not configured.');
  }

  config.baseURL = baseURL;

  const headers =
    config.headers instanceof AxiosHeaders
      ? config.headers
      : new AxiosHeaders(config.headers ?? {});

  const pat = getPat();
  if (pat) {
    headers.set('x-api-key', pat);
  }

  config.headers = headers;

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error?.response?.status;
    const skipUnauthorizedHandler = Boolean(error?.config?.skipUnauthorizedHandler);

    if ((status === 401 || status === 403) && !skipUnauthorizedHandler) {
      try {
        const { useAuthStore } = await import('@/store/auth-store');
        await useAuthStore.getState().handleUnauthorized();
      } catch {
        // No-op: preserve original network error if unauthorized handling fails.
      }
    }

    return Promise.reject(error);
  }
);
