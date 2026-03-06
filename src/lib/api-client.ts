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
