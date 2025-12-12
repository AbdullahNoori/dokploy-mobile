## Tabs Animations

**Animations**

By default, switching between tabs has no animation.  
You can enable or customize transition behavior using the **`animation`** option.

### Supported Animation Types

- **fade**  
  Cross-fade transition where the new screen fades in while the old screen fades out.

- **shift**  
  A subtle horizontal shifting transition where screens slide slightly left or right.

- **none** _(default)_  
  No transition animation.

## Stack Animations

**Animations**

Controls how the screen should animate when it is pushed or popped in the navigation stack.

**Supported values:**

- `default`
- `fade`
- `fade_from_bottom`
- `flip`
- `simple_push`
- `slide_from_bottom`
- `slide_from_right`
- `slide_from_left`
- `none`

---

### `animationDuration`

Changes the duration (in milliseconds) of slide_from_bottom, fade_from_bottom, fade and simple_push transitions on iOS. Defaults to 350.

The duration of default and flip transitions isn't customizable.
