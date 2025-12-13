import axios, { AxiosError } from "axios";

import {
  PAT_STORAGE_KEY,
  getServerUrl,
  normalizeServerUrl,
  patStorage,
} from "./pat-storage";

const API_KEY = process.env.EXPO_PUBLIC_DOKPLOY_API;

export const api = axios.create({
  baseURL: normalizeServerUrl(getServerUrl()) ?? undefined,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
    "x-api-key": API_KEY,
  },
});

api.interceptors.request.use((config) => {
  const baseURL = normalizeServerUrl(config.baseURL ?? getServerUrl());

  if (!baseURL) {
    return Promise.reject(
      new AxiosError("Dokploy server URL is not configured.")
    );
  }

  config.baseURL = baseURL;

  const pat = patStorage.getString(PAT_STORAGE_KEY);
  if (pat && !(config.headers as any)?.Authorization) {
    config.headers = config.headers ?? {};
    (config.headers as any).Authorization = `Bearer ${pat}`;
  }

  return config;
});
