## Relevant Files

- `app/(app)/application/[serviceType]/[serviceId].tsx` - Logs tab UI and lifecycle wiring for streaming logs.
- `src/api/applications.ts` - Existing API patterns and potential place to align with log endpoint usage.
- `src/lib/socket.ts` - Shared Socket.IO client setup (create if missing).
- `src/lib/socket.test.ts` - Unit tests for Socket.IO wrapper (if applicable).

### Notes

- Unit tests should typically be placed alongside the code files they are testing (e.g., `MyComponent.tsx` and `MyComponent.test.tsx` in the same directory).
- Use `npx jest [optional/path/to/test/file]` to run tests. Running without a path executes all tests found by the Jest configuration.

## Instructions for Completing Tasks

**IMPORTANT:** As you complete each task, you must check it off in this markdown file by changing `- [ ]` to `- [x]`. This helps track progress and ensures you don't skip any steps.

## Tasks

- [x] 0.0 Create feature branch (skipped per request)
  - [x] 0.1 Create and checkout a new branch for this feature (skipped per request)
- [x] 1.0 Review PRD and current Logs tab implementation
  - [x] 1.1 Read `tasks/prd-logs-websocket.md` to confirm requirements and open questions
  - [x] 1.2 Inspect `app/(app)/application/[serviceType]/[serviceId].tsx` to understand current Logs tab placeholders
- [x] 2.0 Design Socket.IO connection and auth flow for logs
  - [x] 2.1 Confirm where the PAT token is stored and how to access it in the app
  - [x] 2.2 Define default values and validation rules for `tail`, `since`, `search`, and `runType`
  - [x] 2.3 Decide on Socket.IO client setup and transport options for React Native
- [x] 3.0 Build Logs tab UI for streaming output and controls
  - [x] 3.1 Add UI controls for `tail`, `since`, `search`, and `runType`
  - [x] 3.2 Create a scrollable, monospace log viewer for streaming lines
  - [x] 3.3 Add connection status banner (connecting/connected/disconnected/error)
- [x] 4.0 Implement log streaming lifecycle and cleanup
  - [x] 4.1 Build Socket.IO connection using the logs endpoint and query params
  - [x] 4.2 Authenticate socket with PAT token when connecting
  - [x] 4.3 Connect on Logs tab focus and disconnect on tab change/unmount
  - [x] 4.4 Wire message events to append log lines in order
- [x] 5.0 Add error handling, status UI, and validation
  - [x] 5.1 Handle connect/disconnect/reconnect events and update UI state
  - [x] 5.2 Surface user-friendly errors on connection failure
  - [x] 5.3 Validate inputs and disable connect if invalid
- [ ] 6.0 Testing and verification
  - [ ] 6.1 Add unit tests for socket wrapper if created
  - [ ] 6.2 Manually verify live logs on device/emulator with a valid PAT token
