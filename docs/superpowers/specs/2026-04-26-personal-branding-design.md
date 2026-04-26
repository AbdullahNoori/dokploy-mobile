# Personal Branding Design

## Context

Dokploy mobile is an operational app with a narrow, task-focused flow: users sign in with a server URL and personal access token, land in Projects, inspect project items, view logs, manage requests/web servers/notifications, and adjust preferences in Settings. Branding should not interrupt deployment, log-reading, filtering, auth, or destructive flows.

## Selected Direction

Use minimal attribution in Settings only.

The selected pattern is a quiet `About` section near the bottom of Settings, placed after `Preferences` and before `Account`. It introduces Abdullah as the builder in one short line and exposes social links as icon-only buttons.

This keeps the primary app experience focused on Dokploy operations while still adding a human trust signal in the place users naturally expect app information.

## Recommended Placements

1. Settings/About section
   - Highest fit and lowest disruption.
   - Users expect app version, support, links, and creator information in Settings.
   - Proposed copy: `Built by Abdullah` with supporting text `Dokploy mobile app`.

2. Login footer, later only if needed
   - A very small footer can work, but launch should avoid adding extra visual weight to sign-in.
   - Proposed copy if added later: `Built by Abdullah`.

3. Empty states, only for support context
   - Avoid generic self-branding in empty states.
   - Use Abdullah identity only if the empty state needs a support or feedback link.

4. About modal, future enhancement
   - Useful if the app later needs version, privacy, feedback, GitHub, and acknowledgements.
   - Not needed for the launch update because a Settings row is enough.

## Avoided Placements

- Project cards, deployment logs, request lists, and item detail actions.
- Auth error messages or PAT help instructions.
- Tab labels or primary navigation.
- Repeated footers across every screen.

These locations compete with user tasks and can make the app feel self-promotional.

## Design Strategies Considered

### A. Minimal Attribution, Selected

Adds a single Settings/About row with `Built by Abdullah` and social icon buttons for GitHub, LinkedIn, and website.

Impact: medium  
Subtlety: high  
Risk: low

### B. Branded About Card

Adds a richer Settings card with initials/avatar, name, role, and social actions.

Impact: higher  
Subtlety: medium  
Risk: medium because it can visually dominate Settings.

### C. Signature Style

Adds a recurring small signature across login, empty states, and Settings.

Impact: high  
Subtlety: lower  
Risk: higher for a launch update because it may feel decorative rather than useful.

## High-Fidelity Textual Preview

```text
Settings

OPERATIONS
[ globe ] Web Servers                                      [ chevron ]
[ shield ] Requests                                        [ chevron ]

PREFERENCES
[ moon ] Dark Mode                                         [ switch ]
[ bell ] Notifications                                     [ chevron ]

ABOUT
[ code/user icon ] Built by Abdullah
                 Dokploy mobile app              [ GitHub ] [ LinkedIn ] [ Website ]

ACCOUNT
[ logout ] Logout                                          [ chevron ]
```

## Interaction Details

- Social actions are icon-only buttons with accessibility labels:
  - `Open Abdullah on GitHub`
  - `Open Abdullah on LinkedIn`
  - `Open Abdullah's website`
- Use existing haptic behavior for press interactions.
- Open links externally with the platform browser.
- Keep the row visually aligned with existing Settings rows: bordered card, rounded corners, compact vertical padding, muted supporting text.
- Do not add a new dependency for brand icons. Use available lucide icons if needed, or a small local icon mapping if the project already has one.

## Microcopy

Recommended:
- `Built by Abdullah`
- `Dokploy mobile app`

Acceptable alternatives:
- `Crafted by Abdullah`
- `Maintained by Abdullah`

Avoid:
- `Follow me`
- `Made with love by Abdullah`
- `Check out my socials`

## UX Principles

- Non-disruptive: appears only in Settings.
- Clean and minimal: one row, one primary line, compact social actions.
- Trust-building: communicates accountability and authorship without marketing language.
- Operationally respectful: avoids placement inside high-focus management screens.

## Open Inputs Before Implementation

- Final GitHub URL.
- Final LinkedIn URL.
- Optional website/portfolio URL.
