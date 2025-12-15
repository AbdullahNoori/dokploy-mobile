import { HttpStatusCode } from 'axios';

import { HttpError } from '@/lib/http-error';
import { getServerUrl, normalizeServerUrl, persistServerUrl } from '@/lib/pat-storage';
import { fetchProjects } from './dashboard';

const validatePatAndServer = async (pat: string, serverUrl: string) => {
  try {
    await fetchProjects({
      baseURL: serverUrl,
      headers: { 'x-api-key': pat },
    });
  } catch (error: any) {
    const normalizedError = error instanceof HttpError ? error : new HttpError(error);
    const status = normalizedError.response?.status;

    if (status === HttpStatusCode.Unauthorized) {
      throw new HttpError('Invalid personal access token.');
    }

    if (status === HttpStatusCode.NotFound) {
      throw new HttpError('Invalid Dokploy server URL. The endpoint was not found.');
    }

    if (!normalizedError.response) {
      throw new HttpError('Unable to connect to server.');
    }

    throw normalizedError;
  }
};

export async function authenticateWithPat(rawPat: string, serverUrl?: string | null): Promise<any> {
  const pat = rawPat.trim();
  const normalizedServer = normalizeServerUrl(serverUrl ?? getServerUrl()) ?? null;

  if (!pat) {
    throw new Error('Personal access token is required.');
  }

  if (!normalizedServer) {
    throw new Error('Dokploy server URL is not configured.');
  }

  await validatePatAndServer(pat, normalizedServer);
  persistServerUrl(normalizedServer);

  return { token: pat };
}
