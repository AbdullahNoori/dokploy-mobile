# PRD: Logs Tab WebSocket Streaming (Socket.IO)

## 1. Introduction/Overview
The Logs tab in the application detail screen should stream container logs in real time using a Socket.IO WebSocket connection. This enables users to monitor live logs for a specific service container without relying on a static placeholder screen.

## 2. Goals
- Stream live logs for the selected service in the Logs tab.
- Allow the client to control log query parameters (`tail`, `since`, `search`, `runType`).
- Authenticate the WebSocket connection with a PAT token.
- Provide clear connection status and basic error handling.

## 3. User Stories
- As an operator, I want to open the Logs tab and see live logs as they are produced so I can diagnose issues in real time.
- As an operator, I want to filter logs by search keyword or adjust tail size so I can focus on relevant output.
- As an operator, I want to know when the log stream is connecting, connected, or disconnected so I can trust what I see.

## 4. Functional Requirements
1. The Logs tab must establish a Socket.IO connection when the tab is active and a `serviceId` is available.
2. The connection URL must use the `wss://deployment.fazel.dev/docker-container-logs` endpoint with query parameters: `containerId`, `tail`, `since`, `search`, and `runType`.
3. The client must send the PAT token for authentication when opening the Socket.IO connection.
4. The Logs tab must display streaming log lines as they arrive, in order, in a scrollable view.
5. The client must expose UI controls to set `tail`, `since`, `search`, and `runType` values before (re)connecting.
6. The client must show connection states: connecting, connected, disconnected, and error.
7. When leaving the Logs tab or screen, the client must close the Socket.IO connection and cleanup listeners.
8. The client must handle reconnection attempts and show a user-facing error if the connection fails.

## 5. Non-Goals (Out of Scope)
- Persisting logs to local storage.
- Historical log browsing beyond streaming session.
- Advanced log parsing or highlighting.
- Multi-container log aggregation.

## 6. Design Considerations (Optional)
- Use the existing Tabs layout in `app/(app)/application/[serviceType]/[serviceId].tsx`.
- Display a monospace log view with a simple status banner (Connected/Disconnected).
- Provide small inline controls (inputs/selects) for tail/since/search/runType.

## 7. Technical Considerations (Optional)
- Use Socket.IO client in React Native with WebSocket transport.
- PAT token should come from existing auth state (confirm where it is stored/accessed).
- Ensure proper cleanup of socket listeners on unmount or tab change.
- Consider throttling UI updates if logs are very frequent.

## 8. Success Metrics
- Logs stream appears within 2 seconds of opening the Logs tab on a healthy connection.
- Connection errors are visible to the user and do not crash the screen.
- At least 95% of tested sessions connect successfully with valid PAT token.

## 9. Open Questions
- Where is the PAT token stored in the app, and what is the best way to access it on this screen?
- What default values should we use for `tail`, `since`, `search`, and `runType`?
- Should the log view auto-scroll to the latest line or allow manual scroll lock?
