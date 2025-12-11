import axios from "axios";
import { PAT_STORAGE_KEY, patStorage } from "./pat-storage";

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

api.interceptors.request.use((config) => {
  const pat = patStorage.getString(PAT_STORAGE_KEY);

  if (pat) {
    config.headers = config.headers ?? {};
    (config.headers as any).Authorization = `Bearer ${pat}`;
  }

  return config;
});
