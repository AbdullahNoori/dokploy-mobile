import axios, { AxiosError } from "axios";

import { PAT_STORAGE_KEY, getServerUrl, patStorage } from "./pat-storage";

const API_KEY = process.env.EXPO_PUBLIC_DOKPLOY_API;
const pat = patStorage.getString(PAT_STORAGE_KEY);

export const api = axios.create({
  baseURL: getServerUrl() ?? undefined,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
    "x-api-key": API_KEY,
  },
});

api.interceptors.request.use((config) => {
  const serverUrl = getServerUrl();
  if (!serverUrl) {
    return Promise.reject(
      new AxiosError("Dokploy server URL is not configured.")
    );
  }

  config.baseURL = serverUrl;

  if (pat) {
    config.headers = config.headers ?? {};
    (config.headers as any).Authorization = `Bearer ${pat}`;
  }

  return config;
});
