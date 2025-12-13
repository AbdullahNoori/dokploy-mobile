# dokploy-mobile API Agent

Authoritative prompt for generating, maintaining, and updating the API layer of **dokploy-mobile** (Expo + React Native) that talks to **Dokploy** using **Personal Access Token (PAT)** authentication. Follow every rule below; this agent is responsible only for the API layer, not UI or navigation.

## Mission & Scope

- Build one module per Dokploy resource under `src/api`.
- Enforce PAT-only auth, strict Zod validation, and HttpError normalization.
- Use the existing Axios + helper stack; do not introduce fetch or alternative clients.
- Never add default exports, enums, or refresh-token logic.

## Core Files & Stack (do not rewrite)

- `src/lib/pat-storage.ts`: MMKV storage, helpers `normalizeServerUrl`, `getServerUrl`, `PAT_STORAGE_KEY` (`@dokploy/pat`). Always rely on these to resolve the backend URL.
- `src/lib/api.ts`: Axios instance. Request interceptor injects `Authorization: Bearer <PAT>` from MMKV and keeps `x-api-key`. Do not bypass or duplicate this logic.
- `src/lib/http.ts`: Thin wrappers `getRequest`, `postRequest`, `putRequest`, `patchRequest`, `deleteRequest`. All network I/O must flow through these helpers so base URL resolution and error wrapping stay centralized.
- `src/lib/http-error.ts`: Unified HttpError wrapper. Every thrown error must be an HttpError. Network failures become `new HttpError("Network request failed")`. Zod validation failures must throw `new HttpError({ code: "validation", message: "Response validation failed", status: 0, details: parsed.error })`.
- Option A folder layout (one file per resource):
  ```
  src/api/
    api.ts
    http.ts
    http-error.ts
    auth.ts
    apps.ts
    deployments.ts
    services.ts
    logs.ts
    databases.ts
    domains.ts
    projects.ts
  ```

## Authentication & Base URL Rules

- Dokploy uses **only PAT authentication**.
- Always attach `Authorization: Bearer <PAT>`; the request interceptor handles this—do not manually pass tokens to request functions.
- PAT is stored in MMKV under `PAT_STORAGE_KEY`. No refresh tokens, no token parsing, no access_token/refresh_token objects.
- Always resolve the backend URL with the pat-storage helpers (`normalizeServerUrl` + `getServerUrl`). Never hardcode hosts or protocols.

## TypeScript & Zod Rules

- Use **interface** for domain types. Derive from Zod schemas with `z.infer`.
- Every response must be validated with Zod before returning data.
- If validation fails: throw `HttpError` with code `"validation"` and include the Zod issues in `details`.
- No enums; use string literal unions or `as const` maps.
- Only named exports; file-level default exports are forbidden.

## SWR Rules (GET only)

- Provide an SWR hook for every GET endpoint.
- Hook names: `use<ResourcePlural>` or `use<Resource>ById`.
- SWR keys must mirror endpoint paths (include params tuple when needed).
- Only GET endpoints receive hooks; POST/PUT/PATCH/DELETE should not.

## Error Handling Rules

- Normalize all errors to `HttpError`.
- Axios network errors → `throw new HttpError("Network request failed")`.
- Do not navigate or handle 401 in the API layer; just throw.
- Validation errors must surface Zod issues via `details`.

## Implementation Checklist (per endpoint)

1. Define the Zod schema for the response (and request payload when useful).
2. Derive TypeScript interfaces from schemas.
3. Implement CRUD functions using `getRequest/postRequest/putRequest/patchRequest/deleteRequest`.
4. Validate every response with `safeParse`; throw `HttpError` on failure.
5. Add SWR hooks for GET endpoints with keys matching the path.
6. Export everything as named exports; keep functions small and composable.

## Patterns & Examples

### Axios Usage Pattern

```ts
import { getRequest } from "@/src/lib/http";
import { HttpError } from "@/src/lib/http-error";
import { z } from "zod";

const MetricSchema = z.object({
  id: z.string(),
  name: z.string(),
  value: z.number(),
});
export interface Metric extends z.infer<typeof MetricSchema> {}

export async function fetchMetrics() {
  const response = await getRequest<unknown>("/metrics");
  const parsed = MetricSchema.array().safeParse(response);
  if (!parsed.success) {
    throw new HttpError({
      code: "validation",
      message: "Metrics response validation failed",
      status: 0,
      details: parsed.error,
    });
  }
  return parsed.data;
}
```

### Zod Validation Pattern

```ts
const Schema = z.object({ id: z.string() });
type SchemaType = z.infer<typeof Schema>;

const parsed = Schema.safeParse(response.data);
if (!parsed.success) {
  throw new HttpError({
    code: "validation",
    message: "Response validation failed",
    status: 0,
    details: parsed.error,
  });
}
return parsed.data satisfies SchemaType;
```

### SWR Hook Pattern (GET only)

```ts
import useSWR from "swr";

export function useMetrics() {
  return useSWR("/metrics", getRequest<Metric[]>);
}

export function useMetricById(id: string | undefined) {
  return useSWR(id ? [`/metrics/${id}`] : null, ([path]) =>
    getRequest<Metric>(path)
  );
}
```

### Full Resource Module Example (`deployments.ts`)

```ts
import useSWR from "swr";
import { z } from "zod";
import {
  deleteRequest,
  getRequest,
  patchRequest,
  postRequest,
} from "@/src/lib/http";
import { HttpError } from "@/src/lib/http-error";

export const DeploymentSchema = z.object({
  id: z.string(),
  name: z.string(),
  status: z.string(),
  projectId: z.string(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});
export interface Deployment extends z.infer<typeof DeploymentSchema> {}

export const DeploymentListSchema = DeploymentSchema.array();

const parse = <T>(result: z.SafeParseReturnType<T, T>) => {
  if (!result.success) {
    throw new HttpError({
      code: "validation",
      message: "Response validation failed",
      status: 0,
      details: result.error,
    });
  }
  return result.data;
};

export async function fetchDeployments(params?: { projectId?: string }) {
  const data = await getRequest<unknown>("/deployments", params);
  return parse(DeploymentListSchema.safeParse(data));
}

export async function fetchDeploymentById(id: string) {
  const data = await getRequest<unknown>(`/deployments/${id}`);
  return parse(DeploymentSchema.safeParse(data));
}

export async function createDeployment(payload: {
  name: string;
  projectId: string;
  template?: string;
}) {
  const data = await postRequest<unknown>("/deployments", payload);
  return parse(DeploymentSchema.safeParse(data));
}

export async function updateDeployment(
  id: string,
  payload: Partial<Deployment>
) {
  const data = await patchRequest<unknown>(`/deployments/${id}`, payload);
  return parse(DeploymentSchema.safeParse(data));
}

export async function removeDeployment(id: string) {
  const data = await deleteRequest<unknown>(`/deployments/${id}`);
  return parse(DeploymentSchema.safeParse(data));
}

export function useDeployments(params?: { projectId?: string }) {
  return useSWR(
    params ? ["/deployments", params] : "/deployments",
    ([path, query]) => getRequest<Deployment[]>(path, query)
  );
}

export function useDeploymentById(id: string | undefined) {
  return useSWR(id ? [`/deployments/${id}`] : null, ([path]) =>
    getRequest<Deployment>(path)
  );
}
```

## Final Behavior Rules

- Enforce strict structure and validation on every endpoint.
- Keep code consistent and reusable; do not skip schemas or hooks.
- Stay aligned with PAT authentication; never add login/refresh flows.
- Never bypass Zod validation or HttpError normalization.
- Keep all exports named; maintain the folder structure and helper usage described above.

## Coordination with Haptics & Loaders (UI contracts)

- **References:** Follow `src/public/HAPTIC_RULES.md` and `src/public/LOADER_RULES.md`. API stays presentation-agnostic but must expose clear states for the UI to apply these rules.
- **Haptics contract:** Never import or call `expo-haptics` in the API layer. Propagate actionable outcomes (success/warning/error/selection changes) via returned data or `HttpError` so UI can trigger the proper haptic type. Do not swallow errors or remap statuses in a way that hides intent.
- **Loader contract:** Do not render loaders in API code. SWR hooks must surface `isLoading`, `error`, and `data` so the UI can select the correct loader (Skeleton, Spinner, Screen Loader, Inline Placeholder) per `LOADER_RULES.md`. Avoid artificial delays or retry loops that would mask loading states.
- **Error fidelity:** Preserve HTTP status, validation details, and message in `HttpError` to let UI pair notification haptics with the right loader fallback or error surface. Avoid broad `catch` that converts distinct failures into generic ones unless normalizing to `"Network request failed"`.
