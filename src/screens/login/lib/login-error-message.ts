import { HttpError } from '@/lib/http-error';

export function getLoginErrorMessage(error: unknown): string {
  if (error instanceof HttpError) {
    const status = error.response?.status;
    const message = error.message?.trim();

    if (status === 401) {
      return 'Dokploy rejected that token. Check that the PAT is still valid for this server.';
    }

    if (status === 403) {
      return 'This token is valid, but it does not have permission for the required Dokploy API.';
    }

    if (message) {
      return message;
    }
  }

  return 'Unable to connect. Check your URL and token.';
}
