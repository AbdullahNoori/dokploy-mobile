# PRD: Scalable Navigation Structure (Auth/Unauth + Async Splash)

## Introduction/Overview
We need a scalable navigation structure for a React Native app using Expo Router. The navigation must cleanly separate authenticated and unauthenticated flows, and handle async auth state with a full-screen splash while the auth status is resolved. The goal is to make navigation easy to grow as the app adds modules and screens without entangling auth logic in every screen.

## Goals
- Provide a clear, maintainable routing structure that separates auth vs. unauth flows.
- Support async auth state with a full-screen splash/loading state on app start.
- Enable easy addition of new sections/modules without refactoring core navigation.
- Use Expo Router conventions so file-based routing remains predictable.

## User Stories
- As a user who is not signed in, I see only the sign-in flow and cannot access authenticated screens.
- As a signed-in user, I see the main app (tab-based) and can navigate between core sections.
- As a returning user, I see a splash screen while the app checks my auth status, then I am routed to the correct flow.
- As a developer, I can add a new authenticated screen by placing it in a well-defined folder without touching auth checks in multiple places.

## Functional Requirements
1. The system must use Expo Router file-based routing as the primary navigation mechanism.
2. The system must define a dedicated unauthenticated route group that contains the sign-in screen.
3. The system must define a dedicated authenticated route group that contains the main tab navigator.
4. The system must display a full-screen splash/loading screen while auth status is being resolved asynchronously.
5. The system must route unauthenticated users to the sign-in flow after the auth check completes.
6. The system must route authenticated users to the main tab-based app after the auth check completes.
7. The system must prevent unauthenticated users from accessing authenticated routes (guard at navigation boundary).
8. The system must provide a single, centralized place to manage auth state resolution and routing decisions.
9. The system must allow adding new authenticated tabs or stacks without changing the unauthenticated flow.

## Non-Goals (Out of Scope)
- Implementing the actual authentication API or backend.
- Implementing onboarding or sign-up screens beyond the single sign-in screen.
- Designing visual UI details for the splash screen beyond a functional placeholder.
- Deep linking, push notification routing, or advanced navigation analytics.

## Design Considerations (Optional)
- The splash/loading screen should be full-screen, minimal, and displayed immediately on app start.
- The sign-in screen should be accessible without any app chrome from the authenticated area.
- The main app should use a tab navigator as the primary authenticated layout.

## Technical Considerations (Optional)
- Use Expo Router route groups (e.g., `(auth)` and `(app)`) to separate flows.
- Place the async auth resolution in the root layout (e.g., `app/_layout.tsx`) to centralize routing.
- Consider an auth guard component/hook to keep route access logic consistent.
- Keep auth state in a shared store or context that can resolve from async storage or API.

## Success Metrics
- New authenticated screens can be added by placing files in the authenticated route group with no changes to auth logic.
- App consistently shows splash on cold start until auth status is resolved.
- No unauthenticated access to authenticated screens during manual testing.
- Developers can describe the navigation flow by pointing to a small number of files.

## Open Questions
- Should the sign-in screen support alternative login methods (SSO, magic links) in the initial scope?
- Will there be a future onboarding flow that needs its own route group?
- Do we need to support deep linking into authenticated screens once logged in?
