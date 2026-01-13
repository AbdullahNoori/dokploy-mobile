# PRD: Projects Screen

## Introduction/Overview
Create a Projects screen that serves as the primary landing tab in the app, enabling users to create, view, and manage their Dokploy projects. The screen replaces the current `(tabs)/index.tsx` content and provides search, status filtering, and key project metadata so users can quickly find and act on projects.

## Goals
- Provide a full management view for projects (list, create, edit, delete).
- Make it easy to find a project via search and status filter.
- Display core project details (name, created date, service count) in a scan-friendly list.
- Align UI with Vercel base theme for a clean, minimal feel.

## User Stories
- As a user, I want to see all my projects in one place so I can manage them quickly.
- As a user, I want to search by project name so I can find a project fast.
- As a user, I want to filter projects by status so I can focus on active or problematic projects.
- As a user, I want to create a new project from this screen so I can start deployments quickly.
- As a user, I want to edit or delete a project from this screen so I can keep my list up to date.

## Functional Requirements
1. The screen must replace the content of `app/(app)/(tabs)/index.tsx`.
2. The screen must fetch projects from the `project.all` endpoint using the API key header (`x-api-key`).
3. The screen must render a list of projects with: name, created date (human-readable), and service count.
4. The screen must include a search input that filters projects by name (case-insensitive).
5. The screen must include a status filter control to filter projects by status.
6. The screen must provide a primary action to create a new project.
7. Each project item must provide actions for edit and delete.
8. The screen must show loading and error states for the projects list fetch.
9. The screen must handle empty states when no projects match search/filter criteria.

## Non-Goals (Out of Scope)
- Implementing the actual server-side project creation, editing, or deletion.
- Deep project details pages or deployment logs.
- Advanced filtering beyond status (e.g., tags, owner).

## Design Considerations
- Visual style should follow Vercel base theme: high-contrast, minimal, and crisp typography.
- Use card/list layout similar to the provided mock image, with clear hierarchy and subtle separators.
- Search and filter controls should be prominent near the top of the list.
- Empty state should be friendly and minimal.

## Technical Considerations
- Reuse existing HTTP helpers (`src/lib/http.ts`) and follow `src/api/auth.ts` style conventions.
- There is already a `fetchProjects` helper in `src/api/dashboard.ts` that hits `project.all`. If a new API file is created for Projects, it should match the pattern in `src/api/auth.ts`.
- PAT is stored via existing auth flow; requests should include `x-api-key` header and base URL from existing PAT storage.
- Ensure the data model accounts for different response shapes (`Project[]` or `{ projects: Project[] }`) as already defined.

## Success Metrics
- Users can load and see a list of projects without errors.
- Search and status filter reduce the visible list correctly.
- Users can initiate create/edit/delete actions from the screen.
- The Projects screen is the default tab view.

## Open Questions
- What exact project statuses are possible and how should they be labeled?
- What is the target UX for create/edit/delete (modal, separate screen, or bottom sheet)?
- How should service count be derived if the API omits it?
