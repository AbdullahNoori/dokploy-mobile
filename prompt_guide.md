Here’s a compact recipe that reliably “steers” Codex (no hacks, just clarity and priority):

Structure to use

Goal first: 1–2 lines stating the exact outcome and success criteria.
Constraints next: list the rule files to follow (priority order) and any tech limits (deps, patterns to avoid).
Context: key files involved, relevant snippets, current errors.
Tasks: numbered list of what you want done; be explicit about what to change vs. leave untouched.
Outputs: what you expect back (e.g., summary + file paths, tests to run, open questions).
Guardrails: testing expectations, formatting, verbosity level.
Wording that works well

“Follow, in priority order: nav_agent.md > ui-agent.md > protected-route.md.”
“Do X; do not change Y.”
“Use file-based routing only; never add manual stacks.”
“Return: (1) brief explanation of changes, (2) file paths touched, (3) commands to verify.”
“If unsure, ask before coding.”
“Keep responses concise.”
Codex prompt skeleton (paste + fill blanks)

Task: [clear goal + acceptance criteria]

Follow rules (priority order):
1) nav_agent.md
2) ui-agent.md
3) protected-route.md
[add any others]

Context:
- Code areas/files: [list]
- Current state/errors: [summarize]

Do:
1) ...
2) ...
3) ...

Do NOT:
- ...
- ...

Expect in reply:
- Explanation of changes (brief)
- Files touched with paths
- Tests/commands to run
- Any questions/assumptions

Other notes:
- Keep output concise
- Ask before diverging from the above
Using this structure keeps instructions unambiguous and gives Codex maximal signal.