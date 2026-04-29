import useSWR from 'swr';

import { getRequest, postRequest } from '@/lib/http';
import { useActiveOrganizationSWRKey } from '@/lib/organization-swr-key';
import type {
  DomainByApplicationIdRequest,
  DomainByComposeIdRequest,
  DomainCreateRequest,
  DomainCreateResponse,
  DomainUpdateRequest,
  DomainUpdateResponse,
  DomainDeleteRequest,
  DomainDeleteResponse,
  DomainListResponse,
  DomainValidateRequest,
  DomainValidateResponse,
} from '@/types/domain';

export function useDomainsByApplicationId(
  applicationId: string | undefined,
  enabled: boolean = true
) {
  const key = useActiveOrganizationSWRKey(
    enabled && applicationId ? ['domain/byApplicationId', applicationId] : null
  );

  return useSWR<DomainListResponse>(key, () =>
    getRequest('domain/byApplicationId', {
      applicationId: applicationId!,
    } satisfies DomainByApplicationIdRequest)
  );
}

export function useDomainsByComposeId(composeId: string | undefined, enabled: boolean = true) {
  const key = useActiveOrganizationSWRKey(
    enabled && composeId ? ['domain/byComposeId', composeId] : null
  );

  return useSWR<DomainListResponse>(key, () =>
    getRequest('domain/byComposeId', {
      composeId: composeId!,
    } satisfies DomainByComposeIdRequest)
  );
}

export function domainCreate(payload: DomainCreateRequest) {
  return postRequest<DomainCreateResponse>('domain/create', payload);
}

export function domainUpdate(payload: DomainUpdateRequest) {
  return postRequest<DomainUpdateResponse>('domain/update', payload);
}

export function domainDelete(payload: DomainDeleteRequest) {
  return postRequest<DomainDeleteResponse>('domain/delete', payload);
}

export function domainValidate(payload: DomainValidateRequest) {
  return postRequest<DomainValidateResponse>('domain/validateDomain', payload);
}
