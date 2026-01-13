## Relevant Files

- `tasks/prd-projects-screen.md` - Requirements reference for the Projects screen scope and behavior.
- `src/api/dashboard.ts` - Existing `project.all` fetch helper and project types to reuse or extend.
- `src/api/projects.ts` - New API wrapper for projects in the style of `src/api/auth.ts`.
- `src/lib/pat-storage.ts` - Source of base URL and PAT to attach to requests.
- `src/lib/http.ts` - HTTP helper used by API modules.
- `app/(app)/(tabs)/index.tsx` - Replace with the Projects screen UI.
- `src/components/ui/input.tsx` - Search input styling and behavior.
- `src/components/ui/button.tsx` - Primary action button (Create Project).
- `src/components/ui/card.tsx` - Project list item container.
- `src/components/ui/icon.tsx` - Icons for actions and list items.

### Notes

- Unit tests should typically be placed alongside the code files they are testing (e.g., `MyComponent.tsx` and `MyComponent.test.tsx` in the same directory).
- Use `npx jest [optional/path/to/test/file]` to run tests. Running without a path executes all tests found by the Jest configuration.

## Instructions for Completing Tasks

As you complete each task, check it off by changing `- [ ]` to `- [x]`. Update this file after completing each sub-task.

## Tasks

- [ ] 0.0 Create feature branch
  - [ ] 0.1 Create and checkout a new branch for this feature (e.g., `git checkout -b feature/projects-screen`)
- [ ] 1.0 Review requirements and data model
  - [ ] 1.1 Review `tasks/prd-projects-screen.md` for scope and open questions
  - [ ] 1.2 Inspect existing project response shape in `src/api/dashboard.ts`
  - [ ] 1.3 Identify fields needed for list rendering (name, created date, service count, status)
- [ ] 2.0 Build Projects API integration
  - [ ] 2.1 Create `src/api/projects.ts` following the `src/api/auth.ts` style
  - [ ] 2.2 Add a `fetchProjects` wrapper or re-export using `project.all` endpoint
  - [ ] 2.3 Ensure base URL and PAT are passed via request config
- [ ] 3.0 Implement Projects screen UI
  - [ ] 3.1 Replace `app/(app)/(tabs)/index.tsx` content with Projects screen layout
  - [ ] 3.2 Add header, subtitle, and primary Create Project action
  - [ ] 3.3 Build list item card layout matching Vercel base theme
- [ ] 4.0 Add search, status filter, and list interactions
  - [ ] 4.1 Implement search input filtering by project name
  - [ ] 4.2 Add status filter control and filtering logic
  - [ ] 4.3 Add per-project actions (edit/delete) UI affordances
- [ ] 5.0 Add loading/error/empty states and polish
  - [ ] 5.1 Add loading skeleton or placeholder for list fetch
  - [ ] 5.2 Add error state with retry affordance
  - [ ] 5.3 Add empty state for no results
  - [ ] 5.4 Verify visual spacing and typography for mobile responsiveness
