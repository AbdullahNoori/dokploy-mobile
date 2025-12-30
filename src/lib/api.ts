import axios, { AxiosError, AxiosHeaders } from 'axios';

import { PAT_STORAGE_KEY, getServerUrl, normalizeServerUrl, patStorage } from './pat-storage';

const API_KEY = process.env.EXPO_PUBLIC_DOKPLOY_API;

export const api = axios.create({
  baseURL: normalizeServerUrl(getServerUrl()) ?? undefined,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const baseURL = normalizeServerUrl(config.baseURL ?? getServerUrl());

  if (!baseURL) {
    return Promise.reject(new AxiosError('Dokploy server URL is not configured.'));
  }

  config.baseURL = baseURL;

  const headers =
    config.headers instanceof AxiosHeaders
      ? config.headers
      : new AxiosHeaders(config.headers ?? {});
  const storedPat = patStorage.getString(PAT_STORAGE_KEY);
  const existingApiKey =
    headers.get('x-api-key') ?? headers.get('X-API-KEY') ?? headers.get('X-Api-Key');
  const apiKey = existingApiKey ?? storedPat ?? API_KEY;

  if (apiKey) {
    headers.set('x-api-key', apiKey);
  }

  headers.delete('Authorization');
  headers.delete('authorization');

  config.headers = headers;

  return config;
});
