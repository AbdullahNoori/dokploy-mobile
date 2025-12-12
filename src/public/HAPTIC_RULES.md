# Codex React Native Haptics Standards

This document defines all rules and guidelines for using haptic feedback in Codex React Native applications, ensuring consistent UX, maintainable code, and proper integration with the `expo-haptics` library.  
These rules also serve as instructions for AI agents (e.g., ChatGPT) when refactoring or adding tactile feedback to user interactions.

---

## 1. Haptic Feedback Types and Usage Rules

### 1.1 Impact Feedback

**Use When:**

- The user performs a _physical_ interaction (taps, drags, or presses).
- You want to simulate a tactile response to a button or movement.
- The action is quick and localized — not a full process.

**Examples:**

- Button presses
- Card taps
- Drag and drop gestures

**Implementation:**

```tsx
import * as Haptics from "expo-haptics";

Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
Rule of Thumb:
Use Light for subtle UI taps, Medium for draggable or heavier UI elements, and Heavy for strong confirmations or physical actions.

1.2 Notification Feedback

Use When:

You need to communicate the result of an action (success, warning, or error).

The haptic should emphasize the outcome rather than the interaction itself.

Examples:

Successful form submission

Validation errors

Warnings or destructive actions

Implementation:
import * as Haptics from "expo-haptics";

Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
Rule of Thumb:
Use Success for positive outcomes, Warning for alerts or confirmations, and Error for failed actions or invalid states.

1.3 Selection Feedback

Use When:

The user is selecting between discrete options.

The feedback should indicate that a selection changed, not that an action completed.

Examples:

Picker or dropdown selections

Tab or filter changes

Steppers or sliders

Implementation:
import * as Haptics from "expo-haptics";

Haptics.selectionAsync();
Rule of Thumb:
Use for continuous or step-based UI elements where tactile response improves precision or feel.

2. Implementation Guidelines

Always use expo-haptics — no custom vibration logic outside this library.

Trigger once per interaction — never stack multiple haptics for a single gesture.

Keep feedback subtle and intentional — avoid using haptics just for decoration.

Pair with visual or auditory feedback — haptics should reinforce meaning, not replace it.

Respect accessibility — plan for a user preference toggle (enableHaptics) in future updates.

Do not trigger during animations unless the animation represents a distinct interaction (e.g., card snap or modal completion).

3. AI Agent Instructions (ChatGPT / Codex)

When refactoring or formatting screens:

Detect all user interaction points (onPress, onLongPress, drag/drop, etc.).

Determine the appropriate haptic type based on interaction intent:

Impact → taps, presses, drags

Notification → success, warning, error outcomes

Selection → tab or picker changes

Insert the appropriate expo-haptics call or use the shared useHaptics() hook.

Do not add haptics to passive interactions (scrolling, auto-loads, transitions).

Maintain consistent intensity across similar interactions.

Wrap complex logic in a useHaptics() utility for maintainability.

4. Recommended Hook Implementation
import { useCallback } from "react";
import * as Haptics from "expo-haptics";

export function useHaptics() {
  const impact = useCallback(
    async (style = Haptics.ImpactFeedbackStyle.Light) => {
      await Haptics.impactAsync(style);
    },
    []
  );

  const notification = useCallback(
    async (type = Haptics.NotificationFeedbackType.Success) => {
      await Haptics.notificationAsync(type);
    },
    []
  );

  const selection = useCallback(async () => {
    await Haptics.selectionAsync();
  }, []);

  return { impact, notification, selection };
}
Usage Example:
const { impact, notification } = useHaptics();

<Button onPress={() => impact()} />
<Form onSubmit={() => notification(Haptics.NotificationFeedbackType.Success)} />
5. UX Rules of Thumb
Interaction Type	Haptic Type	Style / Intensity	UX Purpose
Button / Tap	Impact	Light	Subtle tactile confirmation
Card / Drag / Drop	Impact	Medium	Simulate physical movement
Confirm / Save Action	Notification	Success	Reinforce successful completion
Error / Validation Fail	Notification	Error	Alert user to incorrect input
Warning / Risk Action	Notification	Warning	Caution before proceeding
Tab / Option Change	Selection	—	Reinforce selection changes
```
