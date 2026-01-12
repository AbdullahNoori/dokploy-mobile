## Relevant Files

- `app/_layout.tsx` - Root layout where async auth resolution and routing decisions are centralized.
- `app/index.tsx` - Entry point redirect that routes users to auth or app flows.
- `app/(auth)/_layout.tsx` - Auth layout that redirects authenticated users to the app flow.
- `app/(auth)/sign-in.tsx` - Unauthenticated sign-in screen entry point.
- `app/(app)/_layout.tsx` - Authenticated app layout boundary (stack + auth guard).
- `app/(app)/index.tsx` - Redirect entry point to the tab navigator.
- `app/(app)/(tabs)/_layout.tsx` - Tab configuration for the main authenticated area.
- `app/(app)/(tabs)/index.tsx` - Default tab screen (e.g., Home).
- `app/(app)/(tabs)/settings.tsx` - Placeholder secondary tab to validate tab navigation.
- `src/components/splash-screen.tsx` - Full-screen splash/loading UI while auth resolves.
- `src/auth/useAuth.ts` - Auth state hook for loading/authenticated status.
- `src/auth/AuthProvider.tsx` - Auth initializer wrapper for async auth resolution.

### Notes

- Unit tests should typically be placed alongside the code files they are testing (e.g., `MyComponent.tsx` and `MyComponent.test.tsx` in the same directory).
- Use `npx jest [optional/path/to/test/file]` to run tests. Running without a path executes all tests found by the Jest configuration.

## Instructions for Completing Tasks

**IMPORTANT:** As you complete each task, you must check it off in this markdown file by changing `- [ ]` to `- [x]`. This helps track progress and ensures you don't skip any steps.

Example:
- `- [ ] 1.1 Read file` → `- [x] 1.1 Read file` (after completing)

Update the file after completing each sub-task, not just after completing an entire parent task.

## Tasks

- [x] 0.0 Create feature branch
  - [x] 0.1 Create and checkout a new branch for this feature (e.g., `git checkout -b feature/navigation-structure`)
- [x] 1.0 Define route groups and file-based structure for auth vs. app flows
  - [x] 1.1 Review current `app/` routing layout and note existing routes
  - [x] 1.2 Add `(auth)` and `(app)` route groups in `app/` if missing
  - [x] 1.3 Add `(tabs)` layout under `(app)` for tab-based navigation
  - [x] 1.4 Ensure route group naming matches Expo Router conventions
- [x] 2.0 Implement async auth resolution and splash gating in the root layout
  - [x] 2.1 Add or update auth provider/hook to expose `isLoading` and `isAuthenticated`
  - [x] 2.2 Create a full-screen `SplashScreen` component
  - [x] 2.3 Update `app/_layout.tsx` to show splash while auth resolves
  - [x] 2.4 Route users to `(auth)` or `(app)` after auth check completes
- [ ] 3.0 Build unauthenticated sign-in entry and guard access
  - [x] 3.1 Add `app/(auth)/sign-in.tsx` screen (placeholder UI is fine)
  - [x] 3.2 Add an auth guard to prevent unauth access to `(app)` routes
  - [ ] 3.3 Verify unauth users always land on sign-in
- [ ] 4.0 Build authenticated tab layout and base screens
  - [x] 4.1 Add `app/(app)/_layout.tsx` to define the authenticated stack boundary
  - [x] 4.2 Add `app/(app)/(tabs)/_layout.tsx` with tab configuration
  - [x] 4.3 Add `app/(app)/(tabs)/index.tsx` as the default tab screen
  - [ ] 4.4 Confirm tabs render only when authenticated
- [ ] 5.0 Validate navigation flow and document structure
  - [ ] 5.1 Manually test cold start: splash → auth/unauth routing
  - [ ] 5.2 Verify unauth users cannot reach authenticated tabs
  - [ ] 5.3 Add/update brief README notes on navigation structure if needed
