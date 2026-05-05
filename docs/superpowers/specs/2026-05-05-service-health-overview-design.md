# Service Health Overview Design

Date: 2026-05-05
Status: Approved direction from visual preview

## Context

Phase 2 roadmap item 3 calls for a focused home dashboard that answers: "What needs my attention right now?" The current app already has strong detail surfaces for projects, item detail, deployments, request logs, notifications, and web-server backups. The home screen should become a mobile triage entry point rather than a decorative landing page.

The approved direction is the attention-first dashboard from the visual preview. It prioritizes abnormal states before healthy background information.

## Goals

- Show a fast operational summary on app open.
- Make failed deployments, active deployments, 5xx spikes, stopped services, and backup failures easy to spot.
- Preserve the app's calm, technical, developer-first style.
- Use existing design tokens, shared UI components, native navigation, pull-to-refresh, status dots, compact cards, and concise rows.
- Route every actionable row to the most useful existing detail surface.

## Non-Goals

- Do not add broad analytics, decorative charts, or a marketing-style hero.
- Do not introduce new UI libraries or new theme colors.
- Do not add background polling in the first version.
- Do not expose owner-only backup health to users who cannot access web-server tools.

## UI Direction

The home screen uses a single vertical scroll with compact operational sections:

1. Status summary row
   - Four compact count cells: Running, Failed, Deploying, Stopped.
   - Failed and deploying counts stay visually legible but do not dominate the whole screen.

2. Needs attention
   - Highest-priority section after the summary.
   - Rows include service or job name, short context, relative time or duration, and status badge.
   - Suggested row types: failed deployment, high 5xx request health, failed or stale backup, unhealthy or stopped watched service.

3. Active deployments
   - Shows currently running deployments with elapsed duration and current phase when available.
   - Empty healthy state should be quiet, not celebratory.

4. Recent request health
   - Compact 2xx/4xx/5xx summary.
   - A small segmented bar is acceptable only if implemented with tokens and improves scanability.
   - Tapping opens Requests with relevant filters.

5. Backup health
   - Owner-only section.
   - Shows last successful backup and failed backup count.
   - Tapping opens Web Servers or the relevant backup section.

6. Watched services
   - Lower-priority section for normal monitoring.
   - Emphasizes user-selected services without making the dashboard noisy.

## Component Shape

The screen should remain composed and testable:

- `src/screens/home/index.tsx`
  - Owns screen layout, refresh state, and section composition.
- `src/screens/home/components/home-status-summary.tsx`
  - Renders count cells.
- `src/screens/home/components/home-section-header.tsx`
  - Shared compact section title row.
- `src/screens/home/components/home-attention-row.tsx`
  - Reusable tappable row for abnormal operational items.
- `src/screens/home/components/home-deployment-row.tsx`
  - Running deployment row with status and elapsed time.
- `src/screens/home/components/home-request-health.tsx`
  - Compact request status summary.
- `src/screens/home/components/home-backup-health.tsx`
  - Owner-only backup summary.
- `src/screens/home/components/home-empty-state.tsx`
  - Quiet healthy/empty state.
- `src/hooks/use-home-health-overview.ts`
  - Normalizes existing data sources into dashboard sections.

Names can be adjusted to match final implementation, but the boundaries should stay: data normalization in the hook, presentational sections in components, and routing/actions at the screen edge.

## Data Flow

The first version should build from existing app data sources where possible:

- Projects and services provide service counts and watched service candidates.
- Deployments provide failed and running deployment rows.
- Request logs provide recent 2xx/4xx/5xx summary if available.
- Web-server backup APIs provide backup health only for owner users.

`use-home-health-overview` should return a normalized view model:

- `status`: `loading`, `ready`, `error`, or `partial`
- `summaryCounts`
- `attentionItems`
- `activeDeployments`
- `requestHealth`
- `backupHealth`
- `watchedServices`
- `refresh`

Partial failures should not blank the whole dashboard. For example, if backup health fails but projects and deployments load, show the rest of the dashboard and render an inline backup error state.

## Navigation

Rows should route users into context:

- Failed deployment opens deployment detail.
- Active deployment opens deployment detail or item deployments tab.
- Service health row opens item detail, preferably logs when the issue is runtime-related.
- Request health opens Requests with status/date filters.
- Backup health opens Web Servers backup section.

If required IDs are missing, the row should be disabled or route to the safest broader screen, such as Projects or Requests.

## Error Handling

- Full-screen error only when core home data cannot load at all.
- Inline section errors for optional sources such as backup or request health.
- Pull-to-refresh retries all dashboard sources and uses existing haptic feedback patterns.
- Stale or unavailable targets should be treated as normal operational reality, with a clear fallback route.

## Loading and Empty States

- Use skeletons that match the final compact row layout.
- If everything is healthy, show the summary counts plus a quiet "No items need attention" row.
- Do not hide normal navigation paths just because there are no incidents.

## Testing

Recommended coverage:

- Hook normalization for failed, running, healthy, empty, and partial-error states.
- Permission behavior for owner-only backup health.
- Row routing target construction for deployments, requests, services, and backups.
- Snapshot or component tests for empty, loading, error, and populated sections if the project has a matching pattern.
- Manual verification on light and dark mode, small mobile width, pull-to-refresh, and long service names.

## Approved Preview

The approved preview direction was "Attention-first dashboard":

- Top summary counts.
- Needs attention immediately below counts.
- Active deployments next.
- Recent request health as a compact summary.
- Backup health as owner-only operational context.

This design should feel like a calm triage board: dense, readable, and useful under pressure.
