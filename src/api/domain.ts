import { postRequest } from '@/lib/http';
import type {
  DomainCreateRequest,
  DomainCreateResponse,
  DomainUpdateRequest,
  DomainUpdateResponse,
  DomainDeleteRequest,
  DomainDeleteResponse,
  DomainValidateRequest,
  DomainValidateResponse,
} from '@/types/domain';

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
