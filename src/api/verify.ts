import useSWR from 'swr';

import { ProjectAllResponse } from '@/types/projects';
import { getRequest } from '../lib/http';

export type VerifyCredentialsPayload = {
  baseURL: string;
  apiKey: string;
};

export function useVerifyCredentials(payload?: VerifyCredentialsPayload) {
  const fetcher = () =>
    getRequest<ProjectAllResponse>('project.all', undefined, {
      baseURL: payload?.baseURL,
      headers: {
        'x-api-key': payload?.apiKey ?? '',
      },
    });

  return useSWR<ProjectAllResponse>('project.all', fetcher, {
    shouldRetryOnError: false,
  });
}
