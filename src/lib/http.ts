import { AxiosError, AxiosRequestConfig } from "axios";

import { api } from "@/src/lib/api";
import { HttpError } from "./http-error";
import { getServerUrl } from "./pat-storage";

const withBaseURL = (
  config?: AxiosRequestConfig<any>
): AxiosRequestConfig<any> => {
  const baseURL = getServerUrl();

  if (!baseURL) {
    throw new AxiosError("Dokploy server URL is not configured.");
  }

  return { ...(config ?? {}), baseURL };
};

/**
 * Create a http get request
 */
export async function getRequest<T = unknown>(
  endpoint: string,
  params?: object,
  config?: AxiosRequestConfig<any>
): Promise<T> {
  try {
    const response = await api.get<T>(endpoint, {
      params,
      ...withBaseURL(config),
    });
    return response.data;
  } catch (error: any) {
    throw new HttpError(error);
  }
}

/**
 * Create a http post request
 */
export async function postRequest<T = unknown>(
  endpoint: string,
  data?: object,
  config?: AxiosRequestConfig<any>
): Promise<T> {
  try {
    const response = await api.post<T>(endpoint, data, withBaseURL(config));
    return response.data;
  } catch (error: any) {
    throw new HttpError(error);
  }
}

/**
 * Create a http put request
 */
export async function putRequest<T = unknown>(
  endpoint: string,
  data?: object,
  config?: AxiosRequestConfig<any>
): Promise<T> {
  try {
    const response = await api.put<T>(endpoint, data, withBaseURL(config));
    return response.data;
  } catch (error: any) {
    throw new HttpError(error);
  }
}

/**
 * Create a http patch request
 */
export async function patchRequest<T = unknown>(
  endpoint: string,
  data?: object,
  config?: AxiosRequestConfig<any>
): Promise<T> {
  try {
    const response = await api.patch<T>(endpoint, data, withBaseURL(config));
    return response.data;
  } catch (error: any) {
    throw new HttpError(error);
  }
}

/**
 * Create a http delete request
 */
export async function deleteRequest<T = unknown>(
  endpoint: string,
  params?: object,
  config?: AxiosRequestConfig<any>
): Promise<T> {
  try {
    const response = await api.delete<T>(endpoint, {
      params,
      ...withBaseURL(config),
    });
    return response.data;
  } catch (error: any) {
    throw new HttpError(error);
  }
}
