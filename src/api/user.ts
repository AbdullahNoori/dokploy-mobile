import { getRequest } from '@/lib/http';
import { HttpError } from '@/lib/http-error';
import { DokployRequestConfig } from '@/lib/http';

type RootAccessErrorResponse = {
  code?: string;
  error?: string;
  message?: string;
};

const ROOT_ACCESS_DENIED_TERMS = [
  'unauthorized',
  'forbidden',
  'not allowed',
  'access',
  'permission',
];

function includesPermissionDenial(value: string | undefined): boolean {
  const normalized = value?.toLowerCase() ?? '';

  return ROOT_ACCESS_DENIED_TERMS.some((term) => normalized.includes(term));
}

function isErrorResponse(value: unknown): value is RootAccessErrorResponse {
  return Boolean(value && typeof value === 'object' && ('message' in value || 'error' in value));
}

function isRootAccessDeniedResponse(response: RootAccessErrorResponse): boolean {
  return (
    includesPermissionDenial(response.message) ||
    includesPermissionDenial(response.error) ||
    includesPermissionDenial(response.code)
  );
}

function isRootAccessDenied(error: unknown): boolean {
  if (error instanceof HttpError) {
    const status = error.response?.status;
    return (
      status === 401 ||
      status === 403 ||
      isRootAccessDeniedResponse({ code: error.code, message: error.message })
    );
  }

  return isErrorResponse(error) && isRootAccessDeniedResponse(error);
}

export async function readHaveRootAccess(): Promise<boolean> {
  try {
    const response = await getRequest<unknown>('user/haveRootAccess', undefined, {
      skipUnauthorizedHandler: true,
    });

    if (isErrorResponse(response)) {
      if (isRootAccessDenied(response)) {
        return false;
      }

      throw new Error(response.message ?? response.error ?? 'Unable to verify root access.');
    }

    return true;
  } catch (error) {
    if (isRootAccessDenied(error)) {
      return false;
    }

    throw error;
  }
}

type VerifyApiKeyAccessPayload = {
  baseURL: string;
  apiKey: string;
};

export async function verifyApiKeyAccess(
  payload: VerifyApiKeyAccessPayload
): Promise<{ hasRootAccess: boolean }> {
  try {
    const response = await getRequest<unknown>('user/haveRootAccess', undefined, {
      ...buildApiKeyConfig(payload),
      skipUnauthorizedHandler: true,
    });

    if (isErrorResponse(response)) {
      if (isRootAccessDenied(response)) {
        return { hasRootAccess: false };
      }

      throw new Error(response.message ?? response.error ?? 'Unable to verify access.');
    }

    return { hasRootAccess: true };
  } catch (error) {
    if (isRootAccessDenied(error)) {
      return { hasRootAccess: false };
    }

    throw error;
  }
}

function buildApiKeyConfig(payload: VerifyApiKeyAccessPayload): DokployRequestConfig {
  return {
    baseURL: payload.baseURL,
    headers: {
      'x-api-key': payload.apiKey,
    },
  };
}
