import { AxiosRequestConfig } from 'axios';

import { HttpError } from './http-error';
import { api } from './api-client';

export type DokployRequestConfig = AxiosRequestConfig<any> & {
  skipUnauthorizedHandler?: boolean;
};

/**
 * Create a http get request
 */
export async function getRequest<T = unknown>(
  endpoint: string,
  params?: object,
  config?: DokployRequestConfig
): Promise<T> {
  return requestWithDottedEndpointFallback(endpoint, async (requestEndpoint) => {
    const response = await api.get<T>(requestEndpoint, {
      params,
      ...(config ?? {}),
    });
    return response.data;
  });
}

/**
 * Create a http post request
 */
export async function postRequest<T = unknown>(
  endpoint: string,
  data?: object,
  config?: DokployRequestConfig
): Promise<T> {
  return requestWithDottedEndpointFallback(endpoint, async (requestEndpoint) => {
    const response = await api.post<T>(requestEndpoint, data, config);
    return response.data;
  });
}

/**
 * Create a http put request
 */
export async function putRequest<T = unknown>(
  endpoint: string,
  data?: object,
  config?: DokployRequestConfig
): Promise<T> {
  return requestWithDottedEndpointFallback(endpoint, async (requestEndpoint) => {
    const response = await api.put<T>(requestEndpoint, data, config);
    return response.data;
  });
}

/**
 * Create a http patch request
 */
export async function patchRequest<T = unknown>(
  endpoint: string,
  data?: object,
  config?: DokployRequestConfig
): Promise<T> {
  return requestWithDottedEndpointFallback(endpoint, async (requestEndpoint) => {
    const response = await api.patch<T>(requestEndpoint, data, config);
    return response.data;
  });
}

/**
 * Create a http delete request
 */
export async function deleteRequest<T = unknown>(
  endpoint: string,
  params?: object,
  config?: DokployRequestConfig
): Promise<T> {
  return requestWithDottedEndpointFallback(endpoint, async (requestEndpoint) => {
    const response = await api.delete<T>(requestEndpoint, {
      params,
      ...(config ?? {}),
    });
    return response.data;
  });
}

async function requestWithDottedEndpointFallback<T>(
  endpoint: string,
  request: (endpoint: string) => Promise<T>
): Promise<T> {
  try {
    return await request(endpoint);
  } catch (error: any) {
    const fallbackEndpoint = getDottedEndpointFallback(endpoint);

    if (fallbackEndpoint && isNotFoundResponse(error)) {
      try {
        return await request(fallbackEndpoint);
      } catch (fallbackError: any) {
        throw new HttpError(fallbackError);
      }
    }

    throw new HttpError(error);
  }
}

function getDottedEndpointFallback(endpoint: string): string | null {
  if (!endpoint.includes('/') || endpoint.startsWith('/') || isAbsoluteUrl(endpoint)) {
    return null;
  }

  return endpoint.replaceAll('/', '.');
}

function isAbsoluteUrl(endpoint: string): boolean {
  return /^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(endpoint);
}

function isNotFoundResponse(error: any): boolean {
  return error?.response?.status === 404;
}
