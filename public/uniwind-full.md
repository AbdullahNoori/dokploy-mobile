# CSS Parser

Source: https://docs.uniwind.dev/api/css

Write custom CSS classes alongside Tailwind in your React Native app

## Overview

Uniwind includes a built-in CSS parser that allows you to use traditional CSS alongside Tailwind utilities. While our primary focus is on Tailwind syntax, you can write custom CSS classes and use them directly in your React Native components.

<Info>
  We're actively seeking feedback to identify missing features and limitations. Your input helps us improve CSS support in Uniwind!
</Info>

## Why Use Custom CSS?

While Tailwind provides utility classes for most styling needs, custom CSS can be useful for:

- Complex, reusable component styles that would be verbose with utilities
- Migrating existing web codebases to React Native
- Defining design system components with consistent styling
- Advanced animations and transitions

## Basic Usage

Define custom CSS classes in your `global.css` file and use them with the `className` prop:

### CSS Definition

```css global.css theme={null}
.container {
  flex: 1;
  background-color: red;
  width: 50px;
  height: 50px;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1);
}
```

### Using in Components

```tsx theme={null}
import { View } from 'react-native';

export const MyComponent = () => <View className="container" />;
```

## Combining CSS Classes with Tailwind

You can seamlessly mix custom CSS classes with Tailwind utilities:

### CSS Definition

```css global.css theme={null}
.card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.card-header {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}
```

### Usage with Tailwind

```tsx theme={null}
import { View, Text } from 'react-native';

export const Card = ({ title, children }) => (
  <View className="card m-2 p-4">
    <Text className="card-header mb-2">{title}</Text>
    <View className="flex-1">{children}</View>
  </View>
);
```

### Using light-dark() Function

Uniwind supports the CSS [`light-dark()`](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/light-dark) function, which provides a convenient way to define different values for light and dark themes:

```css theme={null}
.adaptive-card {
  background-color: light-dark(#ffffff, #1f2937);
  color: light-dark(#111827, #f9fafb);
  border-color: light-dark(#e5e7eb, #374151);
}
```

The first value is used in light mode, and the second value is used in dark mode. This automatically adapts when the theme changes.

```tsx theme={null}
<View className="adaptive-card p-4">
  {/* Colors automatically switch between light and dark themes */}
</View>
```

<Tip>
  The `light-dark()` function is particularly useful for maintaining color consistency across themes without needing separate CSS variables for each theme.
</Tip>

## Best Practices

<Tip>
  **Prefer Tailwind utilities for simple styles.** Use custom CSS classes for complex, reusable component patterns that would be verbose or repetitive with utility classes.
</Tip>

<Warning>
  **Avoid deeply nested selectors.** React Native's styling model is simpler than web CSS. Keep your selectors flat and component-scoped for best results.
</Warning>

### Recommended Pattern

```css theme={null}
/* ✅ Good: Component-scoped classes */
.product-card {
  background-color: white;
  border-radius: 12px;
  padding: 16px;
}

.product-card-image {
  width: 100%;
  aspect-ratio: 16/9;
  border-radius: 8px;
}

.product-card-title {
  font-size: 18px;
  font-weight: bold;
  margin-top: 12px;
}
```

```css theme={null}
/* ❌ Avoid: Complex nested selectors */
.product-card .image-container .image .overlay .title {
  /* This is too complex for React Native */
}
```

## Performance Considerations

- **Compile-time parsing**: CSS is parsed at build time, not runtime, for optimal performance
- **No runtime overhead**: Custom CSS classes are converted to React Native styles during compilation

## Feedback & Feature Requests

<Info>
  The CSS parser is continuously evolving. We're actively looking for feedback to help identify missing features and limitations.
</Info>

<Card title="Share Your Feedback" icon="message" href="https://github.com/uni-stack/uniwind/discussions">
  Let us know what CSS features you need or issues you've encountered!
</Card>

## Related

<CardGroup>
  <Card title="Tailwind Basics" icon="wind" href="/tailwind-basics">
    Learn how to use Tailwind utilities in Uniwind
  </Card>

  <Card title="Theming" icon="palette" href="/theming/basics">
    Discover theming and CSS variables in Uniwind
  </Card>
</CardGroup>

# CSS Functions

Source: https://docs.uniwind.dev/api/css-functions

Use CSS functions to create dynamic styles

## Overview

Uniwind provides device-specific CSS functions that automatically adapt to platform characteristics. These functions help you create responsive styles that work seamlessly across different devices and screen densities.

<Info>
  CSS functions must be defined as utilities in your `global.css` file before use. You cannot use them directly in className props with arbitrary values.
</Info>

## Available Functions

### hairlineWidth()

Returns the thinnest line width that can be displayed on the device. Perfect for creating subtle borders and dividers.

**Define in global.css**

```css theme={null}
@layer utilities {
  .h-hairline {
    height: hairlineWidth();
  }
  .w-hairline {
    width: calc(hairlineWidth() * 10); /* 10 * device hairline width */
  }
}
```

**Usage Example**

```tsx theme={null}
import { View } from 'react-native';

<View className="w-hairline border-gray-300" />;
```

### fontScale()

Multiplies a base font size by the device's font scale setting (accessibility setting). This ensures your text respects user preferences for larger or smaller text.

**Define in global.css**

```css theme={null}
@layer utilities {
  .text-sm-scaled {
    font-size: calc(fontScale() * 0.9);
  }
  .text-base-scaled {
    font-size: fontScale();
  }
}
```

**Usage Example**

```tsx theme={null}
import { Text } from 'react-native'

// Multiple text sizes
<Text className="text-sm-scaled text-gray-600">Small text</Text>
<Text className="text-base-scaled">Regular text</Text>
```

### pixelRatio()

Multiplies a value by the device's pixel ratio. Useful for creating pixel-perfect designs that scale appropriately across different screen densities.

**Define in global.css**

```css theme={null}
@layer utilities {
  .w-icon {
    width: pixelRatio();
  }
  .w-avatar {
    width: calc(pixelRatio() * 2);
  }
}
```

**Usage Example**

```tsx theme={null}
import { View, Image } from 'react-native';

<Image source={{ uri: 'avatar.png' }} className="w-avatar rounded-full" />;
```

### light-dark()

Returns different values based on the current theme mode (light or dark). This function automatically adapts when the theme changes, making it perfect for creating theme-aware styles without manual theme switching logic.

**Define in global.css**

```css theme={null}
@layer utilities {
  .bg-adaptive {
    background-color: light-dark(#ffffff, #1f2937);
  }
  .text-adaptive {
    color: light-dark(#111827, #f9fafb);
  }
  .border-adaptive {
    border-color: light-dark(#e5e7eb, #374151);
  }
}
```

**Usage Example**

```tsx theme={null}
import { View, Text } from 'react-native';

<View className="bg-adaptive border-adaptive rounded-lg border p-4">
  <Text className="text-adaptive">
    This text and background automatically adapt to light/dark theme
  </Text>
</View>;
```

<Tip>
  The `light-dark()` function is particularly useful for maintaining color consistency across themes without needing separate CSS variables for each theme.
</Tip>

## Related

<CardGroup>
  <Card title="CSS Parser" icon="css" href="/api/css">
    Learn about CSS variable support and custom CSS classes
  </Card>

  <Card title="Theming" icon="palette" href="/theming/basics">
    Combine with themes for powerful styling
  </Card>
</CardGroup>

# metro.config.js

Source: https://docs.uniwind.dev/api/metro-config

Configure Uniwind in your Metro bundler for React Native

## Overview

The `withUniwindConfig` function configures Uniwind in your Metro bundler. This is required to enable CSS processing, type generation, and theme support in your React Native application.

<Info>
  All Metro configuration changes require a Metro bundler restart to take effect. Clear the cache with `npx expo start --clear` if you encounter issues.
</Info>

## Basic Usage

Import and wrap your Metro config with `withUniwindConfig`:

```js metro.config.js theme={null}
const { getDefaultConfig } = require('expo/metro-config');
const { withUniwindConfig } = require('uniwind/metro');

const config = getDefaultConfig(__dirname);

module.exports = withUniwindConfig(config, {
  cssEntryFile: './src/global.css',
});
```

## Configuration Options

### cssEntryFile

<ParamField type="string">
  The relative path to your CSS entry file from the project root. This file should contain your Tailwind imports and custom CSS.
</ParamField>

<Warning>
  **Important:** The location of your CSS entry file determines the app root - Tailwind will automatically scan for classNames starting from this directory. Files outside this directory require the `@source` directive in your CSS file.
</Warning>

**Example:**

```js metro.config.js theme={null}
module.exports = withUniwindConfig(config, {
  cssEntryFile: './src/global.css',
});
```

Your CSS entry file should follow this structure:

```css global.css theme={null}
@import 'tailwindcss';
@import 'uniwind';

/* Your custom CSS and themes */
```

<Tip>
  Keep your CSS entry file in the root of your application folder (e.g., `src`, `app`). If you have components outside this folder, use `@source` to include them. See the [monorepo guide](/monorepos) for details.
</Tip>

### extraThemes

<ParamField type="Array<string>">
  An array of custom theme names beyond the default `light` and `dark` themes. Each theme must be defined in your CSS using the `@variant` directive.
</ParamField>

**Example:**

```js metro.config.js theme={null}
module.exports = withUniwindConfig(config, {
  cssEntryFile: './src/global.css',
  extraThemes: ['ocean', 'sunset', 'premium'],
});
```

Define these themes in your CSS:

```css global.css theme={null}
@layer theme {
  :root {
    @variant ocean {
      --color-background: #0c4a6e;
      --color-foreground: #e0f2fe;
    }

    @variant sunset {
      --color-background: #7c2d12;
      --color-foreground: #fed7aa;
    }

    @variant premium {
      --color-background: #1e1b4b;
      --color-foreground: #fef3c7;
    }
  }
}
```

<Warning>
  After adding new themes, restart your Metro bundler for changes to take effect.
</Warning>

<Card title="Custom Themes" icon="swatchbook" href="/theming/custom-themes">
  Learn more about creating and managing custom themes
</Card>

### dtsFile

<ParamField type="string">
  The path where Uniwind will auto-generate TypeScript type definitions for your CSS classes and themes. Defaults to `./uniwind-types.d.ts` in your project root.
</ParamField>

**Example:**

```js metro.config.js theme={null}
module.exports = withUniwindConfig(config, {
  cssEntryFile: './src/global.css',
  dtsFile: './src/uniwind-types.d.ts',
});
```

<Info>
  Place the `.d.ts` file in your `src` or `app` directory for automatic TypeScript inclusion. For custom paths outside these directories, add the file to your `tsconfig.json`.
</Info>

**TypeScript configuration:**

```json tsconfig.json theme={null}
{
  "compilerOptions": {
    // ...
  },
  "include": [
    // ...
    "./uniwind-types.d.ts" // If placed in project root
  ]
}
```

### polyfills

<ParamField type="Polyfills">
  Configuration for CSS unit polyfills and adjustments to ensure cross-platform consistency.
</ParamField>

#### polyfills.rem

<ParamField type="number">
  The base font size (in pixels) used for rem unit calculations. Defaults to `16`, which is the standard browser default.
</ParamField>

**Example:**

```js metro.config.js theme={null}
module.exports = withUniwindConfig(config, {
  cssEntryFile: './src/global.css',
  polyfills: {
    rem: 14, // Change rem base to 14px
  },
});
```

**Use case:**

Adjusting the rem base is useful when:

- Your design system uses a different base font size
- You need to scale your entire UI proportionally
- You're migrating from a web app with a custom rem base
- You're migrating from Nativewind

### debug

<ParamField type="boolean">
  Enable debug mode to identify unsupported CSS properties and classNames. When enabled, Uniwind will log errors for web-specific CSS that doesn't work in React Native.
</ParamField>

**Example:**

```js metro.config.js theme={null}
module.exports = withUniwindConfig(config, {
  cssEntryFile: './src/global.css',
  debug: true,
});
```

**Debug output example:**

```
Uniwind Error [CSS Processor] - Unsupported value type - "filters" for className headerBlur
```

<Tip>
  Enable debug mode during development if you're experiencing styling issues or migrating from web. It helps catch web-specific CSS properties that aren't supported in React Native.
</Tip>

<Warning>
  Disable it in production builds.
</Warning>

## Complete Configuration Example

Here's a full example with all options configured:

```js metro.config.js theme={null}
const { getDefaultConfig } = require('expo/metro-config');
const { withUniwindConfig } = require('uniwind/metro');

const config = getDefaultConfig(__dirname);

// Your custom Metro modifications
// ...

module.exports = withUniwindConfig(config, {
  // Required: Path to your CSS entry file
  cssEntryFile: './src/global.css',

  // Optional: Custom themes beyond light/dark
  extraThemes: ['ocean', 'sunset', 'premium', 'high-contrast'],

  // Optional: TypeScript definitions path
  dtsFile: './src/uniwind-types.d.ts',

  // Optional: CSS polyfills
  polyfills: {
    rem: 14, // Custom rem base size
  },

  // Optional: Enable debug mode for troubleshooting
  debug: true,
});
```

## Bare React Native

For bare React Native projects (non-Expo), use the `@react-native/metro-config` package:

```js metro.config.js theme={null}
const { getDefaultConfig } = require('@react-native/metro-config');
const { withUniwindConfig } = require('uniwind/metro');

const config = getDefaultConfig(__dirname);

module.exports = withUniwindConfig(config, {
  cssEntryFile: './src/global.css',
  dtsFile: './src/uniwind-types.d.ts',
});
```

## Related

<CardGroup>
  <Card title="Quickstart" icon="laptop" href="/quickstart">
    Get started with Uniwind in 3 minutes
  </Card>

  <Card title="Monorepos & @source" icon="folder-tree" href="/monorepos">
    Learn how to include components from multiple directories
  </Card>

  <Card title="Custom Themes" icon="swatchbook" href="/theming/custom-themes">
    Create and manage custom themes beyond light and dark
  </Card>

  <Card title="Global CSS" icon="css" href="/theming/global-css">
    Configure global styles and CSS variables
  </Card>

  <Card title="Theming Basics" icon="palette" href="/theming/basics">
    Learn the fundamentals of theming in Uniwind
  </Card>
</CardGroup>

# Platform Selectors

Source: https://docs.uniwind.dev/api/platform-select

Apply platform-specific styles with built-in selectors for iOS, Android, and Web

## Overview

Uniwind provides built-in platform selectors that allow you to apply styles conditionally based on the platform your app is running on. This is essential for creating platform-specific user experiences in React Native.

<Info>
  Platform selectors are resolved at runtime and automatically apply the correct styles for the current platform.
</Info>

## Basic Usage

Use platform selectors directly in your `className` prop with the syntax `platform:utility`:

```tsx theme={null}
import { View, Text } from 'react-native';

export const PlatformExample = () => (
  <View className="ios:bg-red-500 android:bg-blue-500 web:bg-green-500">
    <Text className="ios:text-white android:text-white web:text-black">
      This component has different styles on each platform
    </Text>
  </View>
);
```

## Why Use Platform Selectors?

Platform selectors are superior to React Native's `Platform.select()` API for several reasons:

### ❌ Not Recommended: Platform.select()

```tsx theme={null}
import { Platform } from 'react-native';
import { View } from 'react-native';

<View
  className={Platform.select({
    ios: 'bg-red-500',
    android: 'bg-blue-500',
  })}
/>;
```

**Downsides:**

- Requires importing `Platform` API
- More verbose syntax
- Cannot combine with other utilities easily
- Less readable when multiple platform conditions are needed

### ✅ Recommended: Platform Selectors

```tsx theme={null}
import { View } from 'react-native';

<View className="ios:bg-red-500 android:bg-blue-500" />;
```

**Benefits:**

- Clean, declarative syntax
- No extra imports needed
- Easy to combine with other Tailwind utilities
- Better readability and maintainability
- Works seamlessly with theme variants

## Supported Platforms

<ParamField type="selector">
  Targets iOS devices (iPhone, iPad). Styles are applied only when running on iOS.
</ParamField>

<ParamField type="selector">
  Targets Android devices. Styles are applied only when running on Android.
</ParamField>

<ParamField type="selector">
  Targets web browsers. Styles are applied only when running in a web environment (e.g., React Native Web).
</ParamField>

<ParamField type="selector">
  Targets both iOS and Android platforms. Styles are applied on mobile platforms but not on web. This is a convenient shorthand when you want to apply the same styles to both iOS and Android.
</ParamField>

## Native Selector

The `native:` selector is a convenient shorthand for targeting both iOS and Android platforms simultaneously. Instead of writing duplicate styles for both platforms, you can use `native:` to apply styles to all mobile platforms at once.

### ❌ Verbose: Duplicate platform styles

```tsx theme={null}
import { View, Text } from 'react-native';

<View className="ios:bg-blue-500 android:bg-blue-500 web:bg-gray-500">
  <Text className="ios:text-white android:text-white web:text-black">Mobile vs Web styling</Text>
</View>;
```

### ✅ Concise: Using native: selector

```tsx theme={null}
import { View, Text } from 'react-native';

<View className="native:bg-blue-500 web:bg-gray-500">
  <Text className="native:text-white web:text-black">Mobile vs Web styling</Text>
</View>;
```

<Tip>
  Use `native:` when your iOS and Android styles are identical, and only web differs. This reduces duplication and improves maintainability.
</Tip>

## Examples

### Platform-Specific Colors

```tsx theme={null}
import { View, Text } from 'react-native';

export const PlatformColors = () => (
  <View className="ios:bg-blue-500 android:bg-green-500 web:bg-purple-500 p-4">
    <Text className="ios:text-white android:text-white web:text-white">
      Different background color on each platform
    </Text>
  </View>
);
```

### Platform-Specific Spacing

```tsx theme={null}
import { View, Text } from 'react-native';

export const PlatformSpacing = () => (
  <View className="ios:pt-12 android:pt-6 web:pt-4">
    <Text>Platform-specific top padding</Text>
  </View>
);
```

## Platform Media Queries in @theme

While platform selectors like `ios:`, `android:`, `native:`, and `web:` are great for component-level styling, Uniwind also supports platform-specific media queries within the `@theme` directive. This allows you to define platform-specific design tokens and CSS variables that affect your entire theme.

<Info>
  Platform media queries in `@theme` are processed at build time and define global theme values, while platform selectors are resolved at runtime for component-specific styles.
</Info>

### Theme Configuration

Use `@media` queries inside `@theme` to define platform-specific CSS variables in your `global.css`:

```css theme={null}
@import 'tailwindcss';
@import 'uniwind';

@layer theme {
  :root {
    /* Base configuration applies to all platforms */
    --font-sans: 'Inter';
    --spacing-4: 16px;

    /* iOS-specific overrides */
    @media ios {
      --font-sans: 'system-ui';
      --spacing-4: 20px;
    }

    /* Android-specific overrides */
    @media android {
      --font-sans: 'sans-serif';
      --spacing-4: 18px;
    }

    /* Web-specific overrides */
    @media web {
      --font-sans: 'Inter';
      --spacing-4: 16px;
    }
  }
}
```

### When to Use Each Approach

Understanding when to use platform selectors vs platform media queries helps you build better cross-platform apps:

<AccordionGroup>
  <Accordion title="Platform Selectors (ios:, android:, native:, web:)" icon="code">
    **Use for component-specific styling**

    ```tsx theme={null}
    <View className="ios:pt-12 android:pt-6 web:pt-4" />
    <View className="native:pt-10 web:pt-4" />
    ```

    * High flexibility - mix and match on any component
    * Best for: Different padding, colors, or layouts for specific UI elements
    * Use `native:` for shared mobile styles

  </Accordion>

  <Accordion title="Platform Media Queries in @theme" icon="palette">
    **Use for global theme configuration**

    ```css theme={null}
    @layer theme {
        :root {
            --font-sans: "Inter";

            @media ios {
                --font-sans: "system-ui";
            }
        }
    }
    ```

    * Affects entire design system
    * Best for: Platform-specific fonts, spacing scales, or brand colors

  </Accordion>
</AccordionGroup>

### Platform-Specific Typography

One of the most common use cases is defining platform-appropriate font families:

```css theme={null}
@layer theme {
  :root {
    --font-sans: 'Inter';
    --text-base: 16px;

    @media ios {
      --font-sans: '-apple-system', 'SF Pro Text';
      --text-base: 17px; /* iOS prefers slightly larger text */
    }

    @media android {
      --font-sans: 'Roboto';
      --text-base: 14px; /* Material Design standard */
    }

    @media web {
      --font-sans: 'Inter', 'system-ui', sans-serif;
      --text-base: 16px;
    }
  }
}
```

Then use the font variables in your components:

```tsx theme={null}
import { Text } from 'react-native';

export const PlatformText = () => (
  <Text className="font-sans text-base">
    This text automatically uses the platform-appropriate font
  </Text>
);
```

### Platform-Specific Spacing

Adjust spacing scales to match platform design guidelines:

```css theme={null}
@layer theme {
  :root {
    @media ios {
      /* iOS prefers more generous spacing */
      --spacing-4: 20px;
      --spacing-6: 28px;
    }

    @media android {
      /* Material Design spacing */
      --spacing-4: 16px;
      --spacing-6: 24px;
    }
  }
}
```

### Combining with Theme Variants

Platform media queries work seamlessly with theme variants like `dark`:

```css theme={null}
@layer theme {
  :root {
    --font-sans: 'Inter';

    @variant dark {
      --color-background: #000000;
      --color-foreground: #ffffff;
    }

    @variant light {
      --color-background: #ffffff;
      --color-foreground: #000000;
    }

    @media ios {
      --font-sans: 'SF Pro Text';
    }

    @media android {
      --font-sans: 'Roboto';
    }
  }
}
```

```tsx theme={null}
import { View, Text } from 'react-native';

export const ThemedText = () => (
  <View className="bg-background">
    <Text className="text-foreground font-sans">Platform and theme-aware text</Text>
  </View>
);
```

<Warning>
  Platform media queries can only be used inside the `@theme` directive in your `global.css` file. They define global theme values, not component-specific styles.
</Warning>

## Related

<CardGroup>
  <Card title="Supported Class Names" icon="table" href="/class-names">
    Learn about all supported Tailwind classes in Uniwind
  </Card>

  <Card title="Theming" icon="palette" href="/theming/basics">
    Combine platform selectors with theme variants
  </Card>
</CardGroup>

# useCSSVariable

Source: https://docs.uniwind.dev/api/use-css-variable

Access CSS variable values in JavaScript with automatic theme updates

<Badge>Available in Uniwind 1.0.5+</Badge>

## Overview

The `useCSSVariable` hook allows you to retrieve one or more CSS variable values directly in JavaScript. It's particularly useful when you need to access theme colors, spacing values, or other design tokens programmatically for calculations, animations, or third-party library configurations.

<Warning>
  This hook should be used sparingly. For most styling use cases, prefer using the `className` prop with Tailwind utilities.
</Warning>

## When to Use This Hook

Use `useCSSVariable` when you need to:

- Access theme colors for third-party libraries (e.g., chart libraries, map markers)
- Perform calculations with design tokens (e.g., dynamic positioning based on spacing values)
- Configure native modules that require color/size values
- Pass theme values to JavaScript animation libraries
- Access design tokens for runtime logic

<Tip>
  **Prefer these alternatives when possible:**

- For styling components: Use the `className` prop directly
- For multiple style properties: Use [`useResolveClassNames`](/api/use-resolve-class-names)
- For third-party components: Wrap them with [`withUniwind`](/api/with-uniwind)
  </Tip>

## Usage

### Basic Example

```tsx theme={null}
import { useCSSVariable } from 'uniwind';
import { View, Text } from 'react-native';

export const MyComponent = () => {
  const primaryColor = useCSSVariable('--color-primary');
  const spacing = useCSSVariable('--spacing-4');

  return (
    <View className="p-4">
      <Text>Primary color: {primaryColor}</Text>
      <Text>Spacing: {spacing}</Text>
    </View>
  );
};
```

### Multiple Variables at Once

You can also retrieve multiple CSS variables at once by passing an array:

```tsx theme={null}
import { useCSSVariable } from 'uniwind';
import { View, Text } from 'react-native';

export const MyComponent = () => {
  const [primaryColor, spacing, backgroundColor] = useCSSVariable([
    '--color-primary',
    '--spacing-4',
    '--color-background',
  ]);

  return (
    <View className="p-4" style={{ backgroundColor }}>
      <Text style={{ color: primaryColor }}>Primary color: {primaryColor}</Text>
      <Text>Spacing: {spacing}</Text>
    </View>
  );
};
```

<Tip>
  Using the array syntax is more efficient than calling `useCSSVariable` multiple times, as it only subscribes to theme changes once.
</Tip>

### With Chart Libraries

```tsx theme={null}
import { useCSSVariable } from 'uniwind';
import { LineChart } from 'react-native-chart-kit';

export const ThemedChart = () => {
  const [primaryColor, backgroundColor, textColor] = useCSSVariable([
    '--color-primary',
    '--color-background',
    '--color-foreground',
  ]);

  return (
    <LineChart
      data={chartData}
      width={300}
      height={200}
      chartConfig={{
        backgroundColor: backgroundColor,
        backgroundGradientFrom: backgroundColor,
        backgroundGradientTo: backgroundColor,
        color: () => primaryColor,
        labelColor: () => textColor,
      }}
    />
  );
};
```

### Accessing Custom Theme Variables

```tsx theme={null}
import { useCSSVariable } from 'uniwind';
import MapView, { Marker } from 'react-native-maps';

export const ThemedMap = () => {
  const markerColor = useCSSVariable('--color-accent');

  return (
    <MapView>
      <Marker coordinate={{ latitude: 37.78, longitude: -122.4 }} pinColor={markerColor} />
    </MapView>
  );
};
```

## Making Variables Available

For the hook to resolve a CSS variable, the variable must be either:

### Option 1: Used in a className (Recommended)

Use the variable at least once anywhere in your app's `className` props:

```tsx theme={null}
// Somewhere in your app
<View className="bg-primary" />
```

This makes `--color-primary` available to `useCSSVariable`:

```tsx theme={null}
const primaryColor = useCSSVariable('--color-primary'); // ✅ Works
```

### Option 2: Define in Static Theme

If you have CSS variables that are never used in classNames but need to be accessed in JavaScript, define them in a static theme block in your `global.css`:

```css global.css theme={null}
@import 'tailwindcss';
@import 'uniwind';

@theme static {
  --color-al-teal-10: #eaeeee;
  --color-al-teal-25: #cad4d5;
  --color-al-teal-75: #607d81;
  --color-al-teal-100: #2b5257;

  --color-custom-teal-10: #eaeeee;
  --color-custom-teal-25: #cad4d5;
  --color-custom-teal-75: #607d81;
  --color-custom-teal-100: #2b5257;

  --chart-line-width: 2;
  --chart-dot-radius: 4;
}
```

Then access them anywhere:

```tsx theme={null}
const tealColor = useCSSVariable('--color-al-teal-75'); // ✅ Works
const lineWidth = useCSSVariable('--chart-line-width'); // ✅ Works
```

<Info>
  Variables defined in `@theme static` are always available, even if they're never used in any `className`.
</Info>

## Development Warnings

In development mode, Uniwind will warn you if you try to access a variable that hasn't been made available:

```tsx theme={null}
const unknownColor = useCSSVariable('--color-unknown');
// Console warning:
// "We couldn't find your variable --color-unknown. Make sure it's used
// at least once in your className, or define it in a static theme as
// described in the docs."
```

<Tip>
  If you see this warning, either use the variable in a `className` somewhere or add it to `@theme static` in your `global.css`.
</Tip>

## API Reference

### Arguments

<ParamField type="string | string[]">
  The name of the CSS variable(s) to retrieve, including the `--` prefix.

- **Single variable**: Pass a string (e.g., `'--color-primary'`)
- **Multiple variables**: Pass an array of strings (e.g., `['--color-primary', '--spacing-4']`)
  </ParamField>

### Return Value

The return type depends on the input:

<ParamField type="string | number | undefined">
  When passing a **single string**, returns the resolved value of the CSS variable:

- **Web**: Always returns a `string` (e.g., `"16px"`, `"#ff0000"`)
- **Native**: Returns `string` or `number` depending on the value type (e.g., `16`, `"#ff0000"`)
- **Undefined**: If the variable cannot be found
  </ParamField>

<ParamField type="Array<string | number | undefined>">
  When passing an **array of strings**, returns an array of resolved values in the same order:

```tsx theme={null}
const [color, spacing, radius] = useCSSVariable([
  '--color-primary', // Returns: "#3b82f6"
  '--spacing-4', // Returns: 16 (on native) or "16px" (on web)
  '--radius-lg', // Returns: 12 (on native) or "12px" (on web)
]);
```

</ParamField>

## Platform Differences

<Accordion title="Web Platform" icon="globe">
  On web, `useCSSVariable` uses `getComputedStyle()` to retrieve values from the DOM. All values are returned as strings:

```tsx theme={null}
// Single variable
const color = useCSSVariable('--color-primary');
// Web: "#3b82f6" (string)

// Multiple variables
const [color, spacing] = useCSSVariable(['--color-primary', '--spacing-4']);
// Web: ["#3b82f6", "16px"] (strings)
```

</Accordion>

<Accordion title="Native Platform" icon="mobile">
  On React Native, `useCSSVariable` accesses the internal variable store. Numeric values are returned as numbers:

```tsx theme={null}
// Single variable
const spacing = useCSSVariable('--spacing-4');
// Native: 16 (number)

const color = useCSSVariable('--color-primary');
// Native: "#3b82f6" (string)

// Multiple variables
const [color, spacing] = useCSSVariable(['--color-primary', '--spacing-4']);
// Native: ["#3b82f6", 16] (mixed types)
```

</Accordion>

## Performance Considerations

<Info>
  The `useCSSVariable` hook is reactive and will automatically update when the theme changes, ensuring your values stay in sync with the active theme.
</Info>

Keep in mind:

- The hook subscribes to theme changes, so components will re-render when themes switch
- **Use array syntax for multiple variables**: When you need multiple CSS variables, pass an array instead of calling the hook multiple times. This creates only one subscription instead of multiple.
- For static values that don't need theme reactivity, consider storing them outside the component

**Example of efficient usage:**

```tsx theme={null}
// ✅ Good: Single subscription
const [color, spacing, radius] = useCSSVariable(['--color-primary', '--spacing-4', '--radius-lg']);

// ❌ Less efficient: Multiple subscriptions
const color = useCSSVariable('--color-primary');
const spacing = useCSSVariable('--spacing-4');
const radius = useCSSVariable('--radius-lg');
```

## Related

<CardGroup>
  <Card title="useResolveClassNames" icon="code" href="/api/use-resolve-class-names">
    Convert full className strings to style objects
  </Card>

  <Card title="Global CSS" icon="css" href="/theming/global-css">
    Learn how to define CSS variables in your theme
  </Card>

  <Card title="Theming Basics" icon="palette" href="/theming/basics">
    Understand how themes work in Uniwind
  </Card>

  <Card title="withUniwind" icon="layer-group" href="/api/with-uniwind">
    Wrap third-party components to add className support
  </Card>
</CardGroup>

# useResolveClassNames

Source: https://docs.uniwind.dev/api/use-resolve-class-names

Convert Tailwind class names to React Native style objects at runtime

## Overview

The `useResolveClassNames` hook converts Tailwind class names into valid React Native `style` objects. This is useful when working with components or libraries that don't support the `className` prop directly, such as `react-navigation` theme configuration or third-party components that can't be wrapped in `withUniwind`.

<Warning>
  This hook should be used rarely. For most use cases, prefer using the `className` prop on Uniwind-wrapped components.
</Warning>

## When to Use This Hook

Use `useResolveClassNames` when you need to:

- Configure libraries that accept style objects (e.g., `react-navigation` themes)
- Pass styles to third-party components that only accept `style` props (and can't be wrapped in `withUniwind`)
- Generate style objects dynamically for special use cases
- Work with legacy code that requires style objects

<Tip>
  **Prefer these alternatives when possible:**

- For React Native components: Use the `className` prop directly. See [Components](/components/activity-indicator).
- For third-party components: Wrap them with [`withUniwind`](/api/with-uniwind) to add `className` support.
  </Tip>

## Usage

### Basic Example

```tsx theme={null}
import { useResolveClassNames } from 'uniwind';
import { View } from 'react-native';

export const MyComponent = () => {
  const styles = useResolveClassNames('bg-red-500 p-4 rounded-lg');

  return <View style={styles}>Content</View>;
};
```

### With react-navigation

```tsx theme={null}
import { useResolveClassNames } from 'uniwind';
import { NavigationContainer } from '@react-navigation/native';

export const App = () => {
  const headerStyle = useResolveClassNames('bg-blue-500');
  const cardStyle = useResolveClassNames('bg-white dark:bg-gray-900');

  const theme = {
    colors: {
      background: 'transparent',
    },
    // Use resolved styles for navigation theme
    dark: false,
  };

  return (
    <NavigationContainer theme={theme}>
      <Stack.Navigator
        screenOptions={{
          headerStyle: headerStyle,
          cardStyle: cardStyle,
        }}>
        {/* Your screens */}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
```

### Dynamic Class Names

```tsx theme={null}
import { useResolveClassNames } from 'uniwind';

export const DynamicCard = ({ variant }: { variant: 'primary' | 'secondary' }) => {
  const cardClasses = variant === 'primary' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black';

  const styles = useResolveClassNames(cardClasses);

  return <View style={styles}>Card content</View>;
};
```

### Combining Multiple Style Objects

```tsx theme={null}
import { useResolveClassNames } from 'uniwind';
import { View, StyleSheet } from 'react-native';

export const CombinedStyles = () => {
  const tailwindStyles = useResolveClassNames('p-4 rounded-lg');

  const customStyles = StyleSheet.create({
    shadow: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
  });

  return <View style={[tailwindStyles, customStyles.shadow]}>Content</View>;
};
```

## API Reference

### Arguments

<ParamField type="string">
  A string containing Tailwind class names to be resolved at runtime. Supports all standard Tailwind utilities and theme-based variants (e.g., `dark:bg-gray-900`).
</ParamField>

### Return Value

<ParamField type="object">
  A valid React Native `style` object containing the resolved styles. This object can be passed directly to any component's `style` prop or combined with other style objects.
</ParamField>

## Performance Considerations

<Info>
  The `useResolveClassNames` hook is reactive and will automatically update when the theme changes, ensuring your styles stay in sync with the active theme.
</Info>

While `useResolveClassNames` is optimized for performance, be aware that:

- It processes class names at runtime, which is slightly less performant than compile-time resolution
- For frequently re-rendered components, consider memoizing the result if the class names don't change
- Using the `className` prop directly is more performant when possible

## Related

<CardGroup>
  <Card title="withUniwind" icon="layer-group" href="/api/with-uniwind">
    Wrap third-party components to add className support
  </Card>

  <Card title="Components" icon="react" href="/components/activity-indicator">
    Learn about Uniwind-wrapped React Native components
  </Card>
</CardGroup>

<CardGroup>
  <Card title="useCSSVariable" icon="code" href="/api/use-css-variable">
    Access individual CSS variable values in JavaScript
  </Card>

  <Card title="Global CSS" icon="css" href="/theming/global-css">
    Define CSS variables in your theme
  </Card>
</CardGroup>

# useUniwind

Source: https://docs.uniwind.dev/api/use-uniwind

React hook for accessing the current theme and reacting to theme changes

## Overview

The `useUniwind` hook provides access to the current theme name and adaptive theme status. It automatically triggers a re-render when the theme changes or when adaptive themes are toggled. This is useful when you need to conditionally render components or apply logic based on the active theme.

## Usage

```tsx theme={null}
import { useUniwind } from 'uniwind';

export const MyComponent = () => {
  const { theme, hasAdaptiveThemes } = useUniwind();

  return (
    <View className="p-4">
      <Text>Current theme: {theme}</Text>
      <Text>Adaptive themes: {hasAdaptiveThemes ? 'enabled' : 'disabled'}</Text>
    </View>
  );
};
```

## When to Use This Hook

The `useUniwind` hook is ideal for scenarios where you need to:

- Display the current theme name in your UI
- Check if adaptive themes (system theme) are enabled
- Conditionally render different components based on the active theme
- Execute side effects when the theme changes
- Access theme information for logging or analytics

<Tip>
  For most styling use cases, you don't need this hook. Use theme-based className variants instead (e.g., `dark:bg-gray-900`).
</Tip>

## Return Values

<ParamField type="string">
  The name of the currently active theme (e.g., `"light"`, `"dark"`, `"system"`, or any custom theme name you've defined).
</ParamField>

<ParamField type="boolean">
  Indicates whether adaptive themes are currently enabled. When `true`, the app automatically follows the device's system color scheme. When `false`, the app uses a fixed theme.
</ParamField>

## Examples

### Conditional Rendering Based on Theme

```tsx theme={null}
import { useUniwind } from 'uniwind';
import { View, Text } from 'react-native';

export const ThemedIcon = () => {
  const { theme } = useUniwind();

  return (
    <View className="p-4">
      {theme === 'dark' ? (
        <MoonIcon className="text-white" />
      ) : (
        <SunIcon className="text-yellow-500" />
      )}
    </View>
  );
};
```

### Using Theme in Side Effects

```tsx theme={null}
import { useUniwind } from 'uniwind';
import { useEffect } from 'react';

export const ThemeLogger = () => {
  const { theme } = useUniwind();

  useEffect(() => {
    console.log('Theme changed to:', theme);
    // You could also:
    // - Update analytics
    // - Store preference in MMKV storage
    // - Trigger additional theme-related logic
  }, [theme]);

  return null;
};
```

### Displaying Current Theme

```tsx theme={null}
import { useUniwind } from 'uniwind';
import { View, Text } from 'react-native';

export const ThemeIndicator = () => {
  const { theme, hasAdaptiveThemes } = useUniwind();

  return (
    <View className="rounded bg-gray-100 p-2 dark:bg-gray-800">
      <Text className="text-sm text-gray-600 dark:text-gray-300">Active theme: {theme}</Text>
      <Text className="mt-1 text-xs text-gray-500 dark:text-gray-400">
        {hasAdaptiveThemes ? 'Following system theme' : 'Fixed theme'}
      </Text>
    </View>
  );
};
```

### Reacting to Adaptive Theme Changes

```tsx theme={null}
import { useUniwind } from 'uniwind';
import { useEffect } from 'react';

export const AdaptiveThemeMonitor = () => {
  const { theme, hasAdaptiveThemes } = useUniwind();

  useEffect(() => {
    if (hasAdaptiveThemes) {
      console.log('System theme changed to:', theme);
      // Handle system theme change
      // - Update status bar style
      // - Log analytics event
      // - Sync with backend preferences
    }
  }, [theme, hasAdaptiveThemes]);

  return null;
};
```

## Related

<CardGroup>
  <Card title="Theming Basics" icon="palette" href="/theming/basics">
    Learn how to set up and configure themes in Uniwind
  </Card>

  <Card title="Custom Themes" icon="swatchbook" href="/theming/custom-themes">
    Create and manage custom theme configurations
  </Card>
</CardGroup>

# withUniwind

Source: https://docs.uniwind.dev/api/with-uniwind

Add `className` support to any React Native component

## Overview

The `withUniwind` higher-order component (HOC) wraps any React Native component to add `className` prop support. This is essential for using third-party components with Uniwind's Tailwind-based styling system.

## Why Use withUniwind?

Many popular React Native libraries export components that don't natively support the `className` prop. Instead, they accept the traditional `style` prop. The `withUniwind` wrapper bridges this gap, allowing you to use Tailwind classes with any component.

<Tip>
  **Some third-party components work out of the box!** Libraries like React Native Reanimated that are built on top of React Native's core components (View, Text, etc.) automatically support `className` without wrapping. You only need `withUniwind` when the underlying implementation uses custom native components or doesn't forward the `style` prop properly.
</Tip>

### Problem

```tsx theme={null}
import { SafeAreaView } from 'react-native-safe-area-context';

// ❌ This won't work - SafeAreaView is a third-party component
<SafeAreaView className="bg-background flex-1">{/* content */}</SafeAreaView>;
```

### Solution

```tsx theme={null}
import { withUniwind } from 'uniwind';
import { SafeAreaView } from 'react-native-safe-area-context';

const StyledSafeAreaView = withUniwind(SafeAreaView);

// ✅ This works - we've wrapped the component with withUniwind
<StyledSafeAreaView className="bg-background flex-1">{/* content */}</StyledSafeAreaView>;
```

## Automatic Prop Mapping

`withUniwind` automatically maps props based on their names. Any prop containing `style` or `color` in its name is automatically mapped.

<Info>
  **No manual mapping needed!** The `style` prop is automatically mapped to `className`, and color-related props get their own `*ClassName` variants.
</Info>

### Automatic Mappings

Here are some examples of how props are automatically mapped:

| Original Prop     | Mapped ClassName Prop      | Example Usage                                              |
| ----------------- | -------------------------- | ---------------------------------------------------------- |
| `style`           | `className`                | `<Component className="p-4" />`                            |
| `color`           | `colorClassName`           | `<Component colorClassName="accent-red-500" />`            |
| `backgroundColor` | `backgroundColorClassName` | `<Component backgroundColorClassName="accent-blue-500" />` |
| `borderColor`     | `borderColorClassName`     | `<Component borderColorClassName="accent-gray-300" />`     |
| `tintColor`       | `tintColorClassName`       | `<Component tintColorClassName="accent-green-500" />`      |

### Example: Using Auto-Mapped Color Props

```tsx theme={null}
import { withUniwind } from 'uniwind'
import { ActivityIndicator } from 'react-native-activity-indicator'

const StyledActivityIndicator = withUniwind(ActivityIndicator)

// Use colorClassName instead of the color prop
<StyledActivityIndicator
  colorClassName="accent-blue-500 dark:accent-blue-300"
  size="large"
/>
```

## Custom Prop Mapping

For advanced use cases, you can define custom mappings to map className props to component props. This is useful for components with non-standard prop names like `width`, `size`, `fill`, or `stroke`.

### How Mapping Works

The mapping object structure is:

```tsx theme={null}
withUniwind(Component, {
  targetProp: {
    // The component's original prop name
    fromClassName: 'myClassName', // The className prop you'll use in JSX
    styleProperty: 'width', // (Optional) Which CSS property to extract
  },
});
```

<Info>
  **Understanding the structure:**

- **Object key** (`targetProp`) → The prop that the component actually receives
- **`fromClassName`** → The new className prop you'll write in your JSX
- **`styleProperty`** → Which CSS property value to extract and pass to the target prop
  </Info>

### Example: Mapping a Width Prop

Some components accept a `width` prop as a number or string, not a style object. Here's how to map it:

```tsx theme={null}
import { withUniwind } from 'uniwind'
import { ProgressBar } from 'some-library'

const StyledProgressBar = withUniwind(ProgressBar, {
  width: {
    fromClassName: 'widthClassName',
    styleProperty: 'width',
  },
})

// Usage: pass Tailwind width classes via widthClassName
<StyledProgressBar widthClassName="w-64" progress={0.5} />
// The component receives: width={256}
```

### Example: Mapping a Size Prop

```tsx theme={null}
import { withUniwind } from 'uniwind'
import { Avatar } from 'some-library'

const StyledAvatar = withUniwind(Avatar, {
  size: {
    fromClassName: 'sizeClassName',
    styleProperty: 'width',  // Extract width value for the size prop
  },
})

// Usage: use width classes to control size
<StyledAvatar sizeClassName="w-12" source={{ uri: '...' }} />
// The component receives: size={48}
```

### Example: SVG Stroke and Fill

SVG components often use `stroke` and `fill` props that accept color values:

```tsx theme={null}
import { withUniwind } from 'uniwind'
import { Path } from 'react-native-svg'

export const StyledPath = withUniwind(Path, {
  stroke: {
    fromClassName: 'strokeClassName',
    styleProperty: 'accentColor',
  },
  fill: {
    fromClassName: 'fillClassName',
    styleProperty: 'accentColor',
  },
})

// Usage: use accent-* classes to set colors
<StyledPath
  strokeClassName="accent-red-500 dark:accent-blue-100"
  fillClassName="accent-transparent"
  d="M10 10 H 90 V 90 H 10 Z"
/>
```

<Tip>
  Use `accent-*` classes when you need to extract a color value. The `accentColor` style property is specifically designed for this purpose in Uniwind.
</Tip>

### Mapping Entire Style Objects

If you omit `styleProperty`, the entire resolved style object is passed to the target prop:

```tsx theme={null}
import { withUniwind } from 'uniwind'
import { CustomComponent } from 'some-library'

export const StyledCustomComponent = withUniwind(CustomComponent, {
  containerStyle: {
    fromClassName: 'containerClassName',
    // No styleProperty - maps the entire style object
  },
})

// Usage: all styles are passed as an object to containerStyle
<StyledCustomComponent containerClassName="p-4 bg-red-500 rounded-lg" />
// The component receives: containerStyle={{ padding: 16, backgroundColor: '...', borderRadius: 8 }}
```

### Third-Party UI Components

```tsx theme={null}
import { withUniwind } from 'uniwind';
import { Button } from 'react-native-paper';

const StyledButton = withUniwind(Button);

export const MyButton = () => (
  <StyledButton className="m-4" backgroundColorClassName="accent-blue-500" mode="contained">
    Press me
  </StyledButton>
);
```

## API Reference

### Function Signature

```tsx theme={null}
withUniwind<T>(Component: T, mappings?: PropMappings): T
```

### Parameters

<ParamField type="React.ComponentType">
  The React component to wrap with className support.
</ParamField>

<ParamField type="PropMappings">
  Optional custom prop mappings. Each mapping defines how to convert a className prop to a component prop.

**Mapping structure:**

```tsx theme={null}
{
  [targetProp: string]: {
    fromClassName: string,      // The className prop name to create
    styleProperty?: string       // Optional CSS property to extract (omit to use entire style)
  }
}
```

</ParamField>

### Return Value

<ParamField type="React.ComponentType">
  A wrapped component that accepts `className` and auto-generated `*ClassName` props, in addition to all original component props.
</ParamField>

## Best Practices

<Tip>
  **Create reusable styled components:** Define your wrapped components in a separate file and export them for reuse throughout your app.
</Tip>

```tsx theme={null}
// components/styled.ts
import { withUniwind } from 'uniwind';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

export const StyledSafeAreaView = withUniwind(SafeAreaView);
export const StyledKeyboardAwareScrollView = withUniwind(KeyboardAwareScrollView);
```

<Warning>
  **Performance consideration:** Wrap components at the module level (outside your component functions) to avoid recreating the wrapper on every render.
</Warning>

## Related

<CardGroup>
  <Card title="useResolveClassNames" icon="code" href="/api/use-resolve-class-names">
    Convert classNames to style objects at runtime
  </Card>

  <Card title="Third-Party Components" icon="box" href="/components/other-components">
    Learn about styling third-party component libraries
  </Card>
</CardGroup>

# Responsive Breakpoints

Source: https://docs.uniwind.dev/breakpoints

Use Tailwind's responsive breakpoints to build adaptive layouts in React Native

## Overview

Uniwind supports Tailwind's responsive breakpoint system out of the box, allowing you to create adaptive layouts that respond to different screen sizes. Use breakpoint prefixes like `sm:`, `md:`, `lg:`, and `xl:` to apply styles conditionally based on screen width.

<Info>
  Uniwind uses the same breakpoint syntax as Tailwind CSS. If you're familiar with Tailwind on the web, you already know how to use breakpoints in React Native!
</Info>

## Default Breakpoints

Uniwind includes five default breakpoints based on common device sizes:

| Breakpoint | Minimum Width | CSS                          |
| ---------- | ------------- | ---------------------------- |
| `sm`       | 640px         | `@media (min-width: 640px)`  |
| `md`       | 768px         | `@media (min-width: 768px)`  |
| `lg`       | 1024px        | `@media (min-width: 1024px)` |
| `xl`       | 1280px        | `@media (min-width: 1280px)` |
| `2xl`      | 1536px        | `@media (min-width: 1536px)` |

<Tip>
  All breakpoints use a **mobile-first** approach. This means unprefixed utilities (like `p-4`) apply to all screen sizes, and prefixed utilities (like `md:p-8`) apply at the specified breakpoint and above.
</Tip>

## Basic Usage

Apply different styles at different breakpoints using the breakpoint prefix:

```tsx theme={null}
import { View, Text } from 'react-native';

export const ResponsiveCard = () => (
  <View className="rounded-lg bg-white p-4 sm:p-6 lg:p-8">
    <Text className="text-base font-bold sm:text-lg lg:text-xl">Responsive Typography</Text>
    <Text className="text-sm text-gray-600 sm:text-base lg:text-lg">
      This text size adapts to screen width
    </Text>
  </View>
);
```

**How it works:**

- On screens `< 640px`: Uses `p-4` and `text-base`
- On screens `≥ 640px`: Uses `p-6` and `text-lg`
- On screens `≥ 1024px`: Uses `p-8` and `text-xl`

## Mobile-First Design

Uniwind uses a mobile-first breakpoint system, meaning you style for mobile first, then add styles for larger screens:

### ❌ Don't style desktop-first

```tsx theme={null}
import { View } from 'react-native';

// Desktop-first approach (not recommended)
<View className="w-full sm:w-full md:w-3/4 lg:w-1/2">{/* Content */}</View>;
```

### ✅ Do style mobile-first

```tsx theme={null}
import { View } from 'react-native';

// Mobile-first approach (recommended)
<View className="w-full sm:w-3/4 md:w-1/2 lg:w-1/3">{/* Content */}</View>;
```

<Tip>
  Start with the mobile layout (no prefix), then use `sm:`, `md:`, `lg:` to progressively enhance for larger screens.
</Tip>

## Common Patterns

### Responsive Layouts

Create layouts that adapt to screen size:

```tsx theme={null}
import { View } from 'react-native';

export const ResponsiveGrid = () => (
  <View className="flex-row flex-wrap">
    {/* Mobile: 1 column, Tablet: 2 columns, Desktop: 3 columns */}
    <View className="w-full p-2 sm:w-1/2 lg:w-1/3">
      <View className="rounded bg-blue-500 p-4">
        <Text className="text-white">Item 1</Text>
      </View>
    </View>
    <View className="w-full p-2 sm:w-1/2 lg:w-1/3">
      <View className="rounded bg-blue-500 p-4">
        <Text className="text-white">Item 2</Text>
      </View>
    </View>
    <View className="w-full p-2 sm:w-1/2 lg:w-1/3">
      <View className="rounded bg-blue-500 p-4">
        <Text className="text-white">Item 3</Text>
      </View>
    </View>
  </View>
);
```

### Responsive Spacing

Adjust padding and margins based on screen size:

```tsx theme={null}
import { View, Text } from 'react-native';

export const ResponsiveContainer = () => (
  <View className="px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-12">
    <Text className="mb-4 text-2xl font-bold sm:mb-6 sm:text-3xl lg:mb-8 lg:text-4xl">
      Responsive Heading
    </Text>
    <Text className="text-base sm:text-lg">Content with responsive spacing</Text>
  </View>
);
```

### Responsive Visibility

Show or hide elements at different breakpoints:

```tsx theme={null}
import { View, Text } from 'react-native';

export const ResponsiveNav = () => (
  <View className="flex-row items-center justify-between p-4">
    {/* Always visible */}
    <Text className="text-xl font-bold">Logo</Text>

    {/* Hidden on mobile, visible on tablet and up */}
    <View className="hidden flex-row gap-4 sm:flex">
      <Text>Home</Text>
      <Text>About</Text>
      <Text>Contact</Text>
    </View>

    {/* Visible on mobile, hidden on tablet and up */}
    <View className="flex sm:hidden">
      <Text>☰</Text>
    </View>
  </View>
);
```

## Custom Breakpoints

You can customize breakpoints to match your specific design needs using the `@theme` directive in your `global.css`:

```css global.css theme={null}
@import 'tailwindcss';
@import 'uniwind';

@theme {
  /* Override default breakpoints */
  --breakpoint-sm: 576px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 992px;
  --breakpoint-xl: 1200px;
  --breakpoint-2xl: 1400px;
}
```

### Adding Custom Breakpoints

You can also add entirely new breakpoints:

```css global.css theme={null}
@theme {
  /* Keep default breakpoints */
  --breakpoint-sm: 640px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 1024px;
  --breakpoint-xl: 1280px;
  --breakpoint-2xl: 1536px;

  /* Add custom breakpoints */
  --breakpoint-xs: 480px; /* Extra small devices */
  --breakpoint-3xl: 1920px; /* Ultra-wide screens */
  --breakpoint-tablet: 820px; /* iPad-specific */
}
```

Usage:

```tsx theme={null}
import { View, Text } from 'react-native';

<View className="xs:p-4 tablet:p-6 3xl:p-12 p-2">
  <Text className="xs:text-base tablet:text-lg 3xl:text-2xl text-sm">
    Responsive with custom breakpoints
  </Text>
</View>;
```

## Best Practices

<Tip>
  **Design mobile-first:** Start with mobile styles and progressively enhance for larger screens. This ensures a solid foundation for all devices.
</Tip>

<Tip>
  **Use semantic breakpoint names:** When adding custom breakpoints, use meaningful names like `tablet`, `desktop`, or `ultrawide` instead of arbitrary values.
</Tip>

<Warning>
  **Avoid too many breakpoints:** Stick to 3-5 breakpoints maximum. Too many breakpoints make your code harder to maintain and can lead to inconsistent designs.
</Warning>

## Related

<CardGroup>
  <Card title="Tailwind Basics" icon="wind" href="/tailwind-basics">
    Learn the fundamentals of using Tailwind with Uniwind
  </Card>

  <Card title="Platform Selectors" icon="react" href="/api/platform-select">
    Combine breakpoints with platform-specific styles
  </Card>

  <Card title="Global CSS" icon="css" href="/theming/global-css">
    Customize breakpoints in your global.css file
  </Card>

  <Card title="Supported Class Names" icon="table" href="/class-names">
    See all supported Tailwind utilities
  </Card>
</CardGroup>

<Note>
  For more details on Tailwind's responsive design system, check the [official Tailwind documentation](https://tailwindcss.com/docs/responsive-design).
</Note>

# Supported classNames

Source: https://docs.uniwind.dev/class-names

Comprehensive guide to Tailwind class names supported in Uniwind

## Overview

<Warning>
  React Native uses the Yoga layout engine, not browser CSS. Key differences to be aware of:

- **No CSS cascade/inheritance**: Styles don't inherit from parent components
- **Flexbox by default**: All views use `flexbox` with `flexDirection: 'column'` by default
- **Limited CSS properties**: Only a subset of CSS is supported (no floats, grid, pseudo-elements, etc.)
- **Different units**: No `em`, `rem`, or percentage-based units for most properties
  </Warning>

Uniwind supports the vast majority of Tailwind CSS utility classes out of the box. This page documents special cases, platform-specific classes, and differences between the free and pro versions.

<Info>
  **Most Tailwind classes just work!** If a class name isn't listed below as unsupported or with special behavior, you can assume Uniwind fully supports it.
</Info>

<Tip>
  Found a class name that doesn't work as expected? Please [open an issue on GitHub](https://github.com/uni-stack/uniwind/issues) to help us improve this documentation.
</Tip>

## Standard Tailwind Classes

All standard Tailwind utility classes are supported, including:

- **Layout**: `container`, `flex`, `block`, `hidden`, etc.
- **Spacing**: `p-*`, `m-*`, `space-*`, `gap-*`
- **Sizing**: `w-*`, `h-*`, `min-w-*`, `max-w-*`, etc.
- **Typography**: `text-*`, `font-*`, `leading-*`, `tracking-*`, etc.
- **Colors**: `bg-*`, `text-*`, `border-*`, `shadow-*`, etc.
- **Borders**: `border-*`, `rounded-*`, `ring-*`
- **Effects**: `shadow-*`, `opacity-*`
- **Flexbox**: `justify-*`, `items-*`, `content-*`, etc.
- **Positioning**: `absolute`, `relative`, `top-*`, `left-*`, etc.
- **Transforms**: `translate-*`, `rotate-*`, `scale-*`, `skew-*`
- **Pseudo-elements**: `focus:`, `active:`, `disabled:`

## Platform-Specific Variants

Uniwind extends Tailwind with platform-specific variants for React Native:

```tsx theme={null}
// Style only on iOS
<View className="ios:bg-blue-500" />

// Style only on Android
<View className="android:bg-green-500" />

// Style only on Web
<View className="web:bg-red-500" />
```

Learn more about platform variants in the [Platform Selectors](/api/platform-select) documentation.

## Safe Area Classes

Safe area utilities are fully supported in Uniwind:

| Class                                                                                  | Description                                               |
| -------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| `p-safe`, `pt-safe`, `pb-safe`, `pl-safe`, `pr-safe`, `px-safe`, `py-safe`             | Padding based on safe area insets                         |
| `m-safe`, `mt-safe`, `mb-safe`, `ml-safe`, `mr-safe`, `mx-safe`, `my-safe`             | Margin based on safe area insets                          |
| `inset-safe`, `top-safe`, `bottom-safe`, `left-safe`, `right-safe`, `x-safe`, `y-safe` | Positioning based on safe area insets                     |
| `{property}-safe-or-{value}`                                                           | Uses `Math.max(inset, value)` - ensures minimum spacing   |
| `{property}-safe-offset-{value}`                                                       | Uses `inset + value` - adds extra spacing on top of inset |

<Tabs>
  <Tab title="Free Version">
    Requires `react-native-safe-area-context` with `SafeAreaListener` setup:

    ```tsx theme={null}
    import { SafeAreaListener } from 'react-native-safe-area-context'
    import { Uniwind } from 'uniwind'

    export const Root = () => (
      <SafeAreaListener
        onChange={({ insets }) => {
          Uniwind.updateInsets(insets)
        }}
      >
        {/* app content */}
      </SafeAreaListener>
    )
    ```

    Learn more in [FAQ](/faq#how-do-i-enable-safe-area-classnames).

  </Tab>

  <Tab title="Pro Version">
    Safe area insets are automatically injected from the native layer - no setup required.
  </Tab>
</Tabs>

## Work in Progress

The following classes are currently being worked on:

| Class     | Status | Notes                                                           |
| --------- | ------ | --------------------------------------------------------------- |
| `group-*` | 🚧 WIP | Group variants for parent-child styling                         |
| `data-*`  | 🚧 WIP | Data attribute variants                                         |
| `grid-*`  | 🚧 WIP | CSS Grid support is being added by the React Native / Expo team |

## Unsupported Classes

Some Tailwind classes are not applicable to React Native and will be ignored:

<Warning>
  The following web-specific classes have no React Native equivalent:
</Warning>

- **Pseudo-classes**: `hover:*`, `visited:*` (use Pressable states instead)
- **Pseudo-elements**: `before:*`, `after:*`, `placeholder:*`
- **Media queries**: `print:*`, `screen:*`
- **Float & Clear**: `float-*`, `clear-*`
- **Break**: `break-before-*`, `break-after-*`, `break-inside-*`
- **Columns**: `columns-*`, `break-*`
- **Aspect Ratio**: Some variants may have limited support

<Tip>
  For interactive states like hover and press, use the `Pressable` component's built-in state management and apply classes conditionally.
</Tip>

## Need More Information?

This page is continuously updated as we expand Uniwind's capabilities.

<Card title="Request Documentation Updates" icon="message" href="https://github.com/uni-stack/uniwind/issues">
  Help us improve this documentation by reporting missing or incorrect information.
</Card>

# ActivityIndicator

Source: https://docs.uniwind.dev/components/activity-indicator

Learn how to use ActivityIndicator with Uniwind className props

## Overview

The `ActivityIndicator` component displays a circular loading indicator. Uniwind provides className prop support for styling this component.

## Styling Convention

<Info>
  **For `style` props:** Use regular Tailwind classes directly (e.g., `className="p-4"`).

**For non-style props** (like `color`): Use the `accent-` prefix (e.g., `colorClassName="accent-blue-500"`).
</Info>

## Uniwind Bindings

<ParamField type="string">
  Maps to the `style` prop. Use any Tailwind utility classes.
</ParamField>

<ParamField type="string">
  Maps to the `color` prop. Requires `accent-` prefix for color values.
</ParamField>

## Usage Example

```tsx theme={null}
import { ActivityIndicator, View } from 'react-native';

<ActivityIndicator
  className="m-4"
  size="large"
  colorClassName="accent-blue-500 dark:accent-blue-400"
/>;
```

# Button

Source: https://docs.uniwind.dev/components/button

Learn how to use Button with Uniwind className props

## Overview

The `Button` component is a basic button with a simple platform-specific appearance. Uniwind provides className prop support for styling this component.

## Styling Convention

<Info>
  **For `style` props:** Use regular Tailwind classes directly (e.g., `className="p-4"`).

**For non-style props** (like `color`): Use the `accent-` prefix (e.g., `colorClassName="accent-blue-500"`).
</Info>

## Uniwind Bindings

<ParamField type="string">
  Maps to the `color` prop. Requires `accent-` prefix for color values.
</ParamField>

## Usage Example

```tsx theme={null}
import { Button } from 'react-native';

<Button
  title="Press me"
  colorClassName="accent-blue-500 dark:accent-blue-400"
  onPress={() => console.log('Pressed')}
/>;
```

# FlatList

Source: https://docs.uniwind.dev/components/flat-list

Learn how to use FlatList with Uniwind className props

## Overview

The `FlatList` component is a performant interface for rendering long lists. Uniwind provides className prop support for styling various parts of this component.

## Styling Convention

<Info>
  **For `style` props:** Use regular Tailwind classes directly (e.g., `className="p-4"`).

**For non-style props** (like `color`): Use the `accent-` prefix (e.g., `colorClassName="accent-blue-500"`).
</Info>

## Uniwind Bindings

<ParamField type="string">
  Maps to the `style` prop. Use any Tailwind utility classes.
</ParamField>

<ParamField type="string">
  Maps to the `columnWrapperStyle` prop. Use regular Tailwind classes (no `accent-` prefix needed).
</ParamField>

<ParamField type="string">
  Maps to the `contentContainerStyle` prop. Use regular Tailwind classes (no `accent-` prefix needed).
</ParamField>

<ParamField type="string">
  Maps to the `ListFooterComponentStyle` prop. Use regular Tailwind classes (no `accent-` prefix needed).
</ParamField>

<ParamField type="string">
  Maps to the `ListHeaderComponentStyle` prop. Use regular Tailwind classes (no `accent-` prefix needed).
</ParamField>

<ParamField type="string">
  Maps to the `endFillColor` prop. Requires `accent-` prefix for color values.
</ParamField>

## Usage Example

```tsx theme={null}
import { FlatList, Text } from 'react-native';

<FlatList
  data={items}
  renderItem={({ item }) => <Text>{item.name}</Text>}
  className="flex-1"
  contentContainerClassName="p-4 gap-2"
  endFillColorClassName="accent-gray-100 dark:accent-gray-900"
/>;
```

# Image

Source: https://docs.uniwind.dev/components/image

Learn how to use Image with Uniwind className props

## Overview

The `Image` component displays images from various sources. Uniwind provides className prop support for styling this component.

## Styling Convention

<Info>
  **For `style` props:** Use regular Tailwind classes directly (e.g., `className="p-4"`).

**For non-style props** (like `color`): Use the `accent-` prefix (e.g., `colorClassName="accent-blue-500"`).
</Info>

## Uniwind Bindings

<ParamField type="string">
  Maps to the `style` prop. Use any Tailwind utility classes.
</ParamField>

<ParamField type="string">
  Maps to the `color` prop (tint color for template images). Requires `accent-` prefix for color values.
</ParamField>

## Usage Example

```tsx theme={null}
import { Image } from 'react-native';

<Image
  source={{ uri: 'https://example.com/image.png' }}
  className="h-24 w-24 rounded-lg"
  colorClassName="accent-blue-500 dark:accent-blue-400"
/>;
```

# ImageBackground

Source: https://docs.uniwind.dev/components/image-background

Learn how to use ImageBackground with Uniwind className props

## Overview

The `ImageBackground` component displays an image as a background with children rendered on top. Uniwind provides className prop support for styling this component.

## Styling Convention

<Info>
  **For `style` props:** Use regular Tailwind classes directly (e.g., `className="p-4"`).

**For non-style props** (like `color`): Use the `accent-` prefix (e.g., `colorClassName="accent-blue-500"`).
</Info>

## Uniwind Bindings

<ParamField type="string">
  Maps to the `style` prop. Use any Tailwind utility classes.
</ParamField>

<ParamField type="string">
  Maps to the `imageStyle` prop. Use regular Tailwind classes (no `accent-` prefix needed).
</ParamField>

<ParamField type="string">
  Maps to the `tintColor` prop. Requires `accent-` prefix for color values.
</ParamField>

## Usage Example

```tsx theme={null}
import { ImageBackground, Text } from 'react-native';

<ImageBackground
  source={{ uri: 'https://example.com/bg.jpg' }}
  className="flex-1 items-center justify-center"
  imageClassName="opacity-50"
  tintColorClassName="accent-blue-500 dark:accent-blue-700">
  <Text className="text-2xl font-bold text-white">Content here</Text>
</ImageBackground>;
```

# InputAccessoryView

Source: https://docs.uniwind.dev/components/input-accessory-view

Learn how to use InputAccessoryView with Uniwind className props

## Overview

The `InputAccessoryView` component (iOS only) displays a custom view above the keyboard. Uniwind provides className prop support for styling this component.

## Styling Convention

<Info>
  **For `style` props:** Use regular Tailwind classes directly (e.g., `className="p-4"`).

**For non-style props** (like `color`): Use the `accent-` prefix (e.g., `colorClassName="accent-blue-500"`).
</Info>

## Uniwind Bindings

<ParamField type="string">
  Maps to the `style` prop. Use any Tailwind utility classes.
</ParamField>

<ParamField type="string">
  Maps to the `backgroundColor` prop. Requires `accent-` prefix for color values.
</ParamField>

## Usage Example

```tsx theme={null}
import { InputAccessoryView, Button } from 'react-native';

<InputAccessoryView
  nativeID="uniqueID"
  className="border-t border-gray-300 p-4"
  backgroundColorClassName="accent-white dark:accent-gray-800">
  <Button title="Done" onPress={() => {}} />
</InputAccessoryView>;
```

# KeyboardAvoidingView

Source: https://docs.uniwind.dev/components/keyboard-avoiding-view

Learn how to use KeyboardAvoidingView with Uniwind className props

## Overview

The `KeyboardAvoidingView` component automatically adjusts its height, position, or padding based on keyboard height to prevent content from being hidden. Uniwind provides className prop support for styling this component.

## Styling Convention

<Info>
  **For `style` props:** Use regular Tailwind classes directly (e.g., `className="p-4"`).

**For non-style props** (like `color`): Use the `accent-` prefix (e.g., `colorClassName="accent-blue-500"`).
</Info>

## Uniwind Bindings

<ParamField type="string">
  Maps to the `style` prop. Use any Tailwind utility classes.
</ParamField>

<ParamField type="string">
  Maps to the `contentContainerStyle` prop. Use regular Tailwind classes (no `accent-` prefix needed).
</ParamField>

## Usage Example

```tsx theme={null}
import { KeyboardAvoidingView, TextInput } from 'react-native';

<KeyboardAvoidingView
  behavior="padding"
  className="flex-1 bg-white"
  contentContainerClassName="p-4 justify-end">
  <TextInput placeholder="Type here..." className="rounded border border-gray-300 p-2" />
</KeyboardAvoidingView>;
```

# Modal

Source: https://docs.uniwind.dev/components/modal

Learn how to use Modal with Uniwind className props

## Overview

The `Modal` component presents content above the rest of your app. Uniwind provides className prop support for styling this component.

## Styling Convention

<Info>
  **For `style` props:** Use regular Tailwind classes directly (e.g., `className="p-4"`).

**For non-style props** (like `color`): Use the `accent-` prefix (e.g., `colorClassName="accent-blue-500"`).
</Info>

## Uniwind Bindings

<ParamField type="string">
  Maps to the `style` prop. Use any Tailwind utility classes.
</ParamField>

<ParamField type="string">
  Maps to the `backdropColor` prop. Requires `accent-` prefix for color values.
</ParamField>

## Usage Example

```tsx theme={null}
import { Modal, View, Text, Button } from 'react-native';

<Modal
  visible={isVisible}
  transparent
  animationType="slide"
  backdropColorClassName="accent-black/50">
  <View className="flex-1 items-center justify-center">
    <View className="w-4/5 rounded-lg bg-white p-6">
      <Text className="mb-4 text-xl font-bold">Modal Title</Text>
      <Button title="Close" onPress={() => setIsVisible(false)} />
    </View>
  </View>
</Modal>;
```

# Third-Party Components

Source: https://docs.uniwind.dev/components/other-components

Learn how to use Uniwind with third-party component libraries

## Overview

Uniwind provides two powerful tools for styling third-party components that don't natively support `className` props.

## Option 1: withUniwind (Recommended)

Wrap third-party components to add `className` support using `withUniwind`:

```tsx theme={null}
import { withUniwind } from 'uniwind'
import { SafeAreaView } from 'react-native-safe-area-context'

const StyledSafeAreaView = withUniwind(SafeAreaView)

// Usage
<StyledSafeAreaView className="flex-1 bg-background p-4">
  {/* Your content */}
</StyledSafeAreaView>
```

<Info>
  **Best for:** Components you use frequently throughout your app. Wrap them once, use them everywhere with `className` support.
</Info>

<Card title="withUniwind Documentation" icon="layer-group" href="/api/with-uniwind">
  Learn how to wrap components and map custom props
</Card>

## Option 2: useResolveClassNames

Convert className strings to style objects at runtime:

```tsx theme={null}
import { useResolveClassNames } from 'uniwind';
import { CustomComponent } from 'some-library';

export const MyComponent = () => {
  const styles = useResolveClassNames('bg-blue-500 p-4 rounded-lg');

  return <CustomComponent style={styles} />;
};
```

<Info>
  **Best for:** One-off usage or components with complex style requirements that can't be easily wrapped.
</Info>

<Card title="useResolveClassNames Documentation" icon="code" href="/api/use-resolve-class-names">
  Learn how to convert classNames to style objects
</Card>

## Quick Comparison

| Feature         | withUniwind         | useResolveClassNames |
| --------------- | ------------------- | -------------------- |
| **Setup**       | Once per component  | Per usage            |
| **Performance** | Optimized           | Slightly slower      |
| **Best for**    | Reusable components | One-off cases        |
| **Syntax**      | `className="..."`   | `style={...}`        |

## Example: react-native-paper

```tsx theme={null}
import { withUniwind } from 'uniwind'
import { Button } from 'react-native-paper'

// Wrap once
const StyledButton = withUniwind(Button)

// Use everywhere
<StyledButton
  className="m-4"
  mode="contained"
>
  Press me
</StyledButton>
```

## Example: react-navigation

```tsx theme={null}
import { useResolveClassNames } from 'uniwind';
import { NavigationContainer } from '@react-navigation/native';

export const App = () => {
  const cardStyle = useResolveClassNames('bg-white dark:bg-gray-900');

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ cardStyle }}>{/* Your screens */}</Stack.Navigator>
    </NavigationContainer>
  );
};
```

<Tip>
  For most third-party components, `withUniwind` is the recommended approach as it provides better performance and cleaner syntax.
</Tip>

# Pressable

Source: https://docs.uniwind.dev/components/pressable

Learn how to use Pressable with Uniwind className props

## Overview

The `Pressable` component detects press interactions on any child component. Uniwind provides className prop support for styling this component.

## Styling Convention

<Info>
  **For `style` props:** Use regular Tailwind classes directly (e.g., `className="p-4"`).

**For non-style props** (like `color`): Use the `accent-` prefix (e.g., `colorClassName="accent-blue-500"`).
</Info>

## Uniwind Bindings

<ParamField type="string">
  Maps to the `style` prop. Use any Tailwind utility classes.
</ParamField>

## Usage Example

```tsx theme={null}
import { Pressable, Text } from 'react-native';

<Pressable
  className="rounded-lg bg-blue-500 px-6 py-3 active:opacity-80"
  onPress={() => console.log('Pressed')}>
  <Text className="text-center font-semibold text-white">Press me</Text>
</Pressable>;
```

# RefreshControl

Source: https://docs.uniwind.dev/components/refresh-control

Learn how to use RefreshControl with Uniwind className props

## Overview

The `RefreshControl` component provides pull-to-refresh functionality for ScrollView and FlatList. Uniwind provides className prop support for styling this component.

## Styling Convention

<Info>
  **For `style` props:** Use regular Tailwind classes directly (e.g., `className="p-4"`).

**For non-style props** (like `color`): Use the `accent-` prefix (e.g., `colorClassName="accent-blue-500"`).
</Info>

## Uniwind Bindings

<ParamField type="string">
  Maps to the `style` prop. Use any Tailwind utility classes.
</ParamField>

<ParamField type="string">
  Maps to the `color` prop (Android only). Requires `accent-` prefix for color values.
</ParamField>

<ParamField type="string">
  Maps to the `tintColor` prop (iOS only). Requires `accent-` prefix for color values.
</ParamField>

<ParamField type="string">
  Maps to the `titleColor` prop (iOS only). Requires `accent-` prefix for color values.
</ParamField>

<ParamField type="string">
  Maps to the `progressBackgroundColor` prop (Android only). Requires `accent-` prefix for color values.
</ParamField>

## Usage Example

```tsx theme={null}
import { ScrollView, RefreshControl } from 'react-native';

<ScrollView
  refreshControl={
    <RefreshControl
      refreshing={refreshing}
      onRefresh={onRefresh}
      tintColorClassName="accent-blue-500"
      colorClassName="accent-blue-500"
      progressBackgroundColorClassName="accent-white dark:accent-gray-800"
    />
  }>
  {/* Content */}
</ScrollView>;
```

# SafeAreaView

Source: https://docs.uniwind.dev/components/safe-area-view

Learn how to use SafeAreaView with Uniwind className props

## Overview

The `SafeAreaView` component automatically applies padding to avoid device safe areas (notches, status bars, home indicators). Uniwind provides className prop support for styling this component.

## Styling Convention

<Info>
  **For `style` props:** Use regular Tailwind classes directly (e.g., `className="p-4"`).

**For non-style props** (like `color`): Use the `accent-` prefix (e.g., `colorClassName="accent-blue-500"`).
</Info>

## Uniwind Bindings

<ParamField type="string">
  Maps to the `style` prop. Use any Tailwind utility classes.
</ParamField>

# ScrollView

Source: https://docs.uniwind.dev/components/scroll-view

Learn how to use ScrollView with Uniwind className props

## Overview

The `ScrollView` component provides a scrollable container. Uniwind provides className prop support for styling this component.

## Styling Convention

<Info>
  **For `style` props:** Use regular Tailwind classes directly (e.g., `className="p-4"`).

**For non-style props** (like `endFillColor`): Use the `accent-` prefix (e.g., `endFillColorClassName="accent-blue-500"`).
</Info>

## Uniwind Bindings

<ParamField type="string">
  Maps to the `style` prop. Use any Tailwind utility classes.
</ParamField>

<ParamField type="string">
  Maps to the `contentContainerStyle` prop. Use any Tailwind utility classes.
</ParamField>

<ParamField type="string">
  Maps to the `endFillColor` prop. Requires `accent-` prefix for color values.
</ParamField>

## Usage Example

```tsx theme={null}
import { ScrollView, Text } from 'react-native';

<ScrollView
  className="bg-background flex-1"
  contentContainerClassName="p-4 gap-2"
  endFillColorClassName="accent-gray-100">
  <Text>Scrollable content</Text>
</ScrollView>;
```

# SectionList

Source: https://docs.uniwind.dev/components/section-list

Learn how to use SectionList with Uniwind className props

## Overview

The `SectionList` component is a performant interface for rendering sectioned lists. Uniwind provides className prop support for styling various parts of this component.

## Styling Convention

<Info>
  **For `style` props:** Use regular Tailwind classes directly (e.g., `className="p-4"`).

**For non-style props** (like `color`): Use the `accent-` prefix (e.g., `colorClassName="accent-blue-500"`).
</Info>

## Uniwind Bindings

<ParamField type="string">
  Maps to the `style` prop. Use any Tailwind utility classes.
</ParamField>

<ParamField type="string">
  Maps to the `contentContainerStyle` prop. Use regular Tailwind classes (no `accent-` prefix needed).
</ParamField>

<ParamField type="string">
  Maps to the `ListFooterComponentStyle` prop. Use regular Tailwind classes (no `accent-` prefix needed).
</ParamField>

<ParamField type="string">
  Maps to the `ListHeaderComponentStyle` prop. Use regular Tailwind classes (no `accent-` prefix needed).
</ParamField>

<ParamField type="string">
  Maps to the `endFillColor` prop. Requires `accent-` prefix for color values.
</ParamField>

## Usage Example

```tsx theme={null}
import { SectionList, Text } from 'react-native';

<SectionList
  sections={[
    { title: 'Section 1', data: ['Item 1', 'Item 2'] },
    { title: 'Section 2', data: ['Item 3', 'Item 4'] },
  ]}
  renderItem={({ item }) => <Text className="p-4">{item}</Text>}
  renderSectionHeader={({ section }) => (
    <Text className="bg-gray-100 p-2 font-bold">{section.title}</Text>
  )}
  className="flex-1"
  contentContainerClassName="p-4"
  endFillColorClassName="accent-gray-100 dark:accent-gray-900"
/>;
```

# Switch

Source: https://docs.uniwind.dev/components/switch

Learn how to use Switch with Uniwind className props

## Overview

The `Switch` component renders a boolean input toggle. Uniwind provides className prop support for styling this component.

## Styling Convention

<Info>
  **For `style` props:** Use regular Tailwind classes directly (e.g., `className="p-4"`).

**For non-style props** (like `color`): Use the `accent-` prefix (e.g., `colorClassName="accent-blue-500"`).
</Info>

## Uniwind Bindings

<ParamField type="string">
  Maps to the `style` prop. Use any Tailwind utility classes.
</ParamField>

<ParamField type="string">
  Maps to the `thumbColor` prop. Requires `accent-` prefix for color values.
</ParamField>

<ParamField type="string">
  Maps to the `trackColor.true` prop (when switch is on). Requires `accent-` prefix for color values.
</ParamField>

<ParamField type="string">
  Maps to the `trackColor.false` prop (when switch is off). Requires `accent-` prefix for color values.
</ParamField>

<ParamField type="string">
  Maps to the `ios_backgroundColor` prop. Requires `accent-` prefix for color values.
</ParamField>

## Usage Example

```tsx theme={null}
import { Switch, View } from 'react-native';

<View className="p-4">
  <Switch
    value={isEnabled}
    onValueChange={setIsEnabled}
    className="m-2"
    thumbColorClassName="accent-white"
    trackColorOnClassName="accent-blue-500 dark:accent-blue-400"
    trackColorOffClassName="accent-gray-300 dark:accent-gray-700"
    ios_backgroundColorClassName="accent-gray-300"
  />
</View>;
```

# Text

Source: https://docs.uniwind.dev/components/text

Learn how to use Text with Uniwind className props

## Overview

The `Text` component displays text content. Uniwind provides className prop support for styling this component.

## Styling Convention

<Info>
  **For `style` props:** Use regular Tailwind classes directly (e.g., `className="p-4"`).

**For non-style props** (like `selectionColor`): Use the `accent-` prefix (e.g., `selectionColorClassName="accent-blue-500"`).
</Info>

## Uniwind Bindings

<ParamField type="string">
  Maps to the `style` prop. Use any Tailwind utility classes.
</ParamField>

<ParamField type="string">
  Maps to the `selectionColor` prop. Requires `accent-` prefix for color values.
</ParamField>

## Usage Example

```tsx theme={null}
import { Text } from 'react-native';

<Text
  className="text-lg font-bold text-gray-900 dark:text-white"
  selectionColorClassName="accent-blue-500">
  Hello World
</Text>;
```

# TextInput

Source: https://docs.uniwind.dev/components/text-input

Learn how to use TextInput with Uniwind className props

## Overview

The `TextInput` component allows users to enter text. Uniwind provides className prop support for styling this component with various color customization options.

## Styling Convention

<Info>
  **For `style` props:** Use regular Tailwind classes directly (e.g., `className="p-4"`).

**For non-style props** (like `color`): Use the `accent-` prefix (e.g., `colorClassName="accent-blue-500"`).
</Info>

## Uniwind Bindings

<ParamField type="string">
  Maps to the `style` prop. Use any Tailwind utility classes.
</ParamField>

<ParamField type="string">
  Maps to the `cursorColor` prop. Requires `accent-` prefix for color values.
</ParamField>

<ParamField type="string">
  Maps to the `selectionColor` prop. Requires `accent-` prefix for color values.
</ParamField>

<ParamField type="string">
  Maps to the `placeholderTextColor` prop. Requires `accent-` prefix for color values.
</ParamField>

<ParamField type="string">
  Maps to the `selectionHandleColor` prop. Requires `accent-` prefix for color values.
</ParamField>

<ParamField type="string">
  Maps to the `underlineColorAndroid` prop (Android only). Requires `accent-` prefix for color values.
</ParamField>

## Usage Example

```tsx theme={null}
import { TextInput, View } from 'react-native';

<View className="p-4">
  <TextInput
    placeholder="Enter text..."
    className="rounded-lg border border-gray-300 p-3 text-base"
    cursorColorClassName="accent-blue-500"
    selectionColorClassName="accent-blue-200"
    placeholderTextColorClassName="accent-gray-400 dark:accent-gray-500"
    underlineColorAndroidClassName="accent-transparent"
  />
</View>;
```

# TouchableHighlight

Source: https://docs.uniwind.dev/components/touchable-highlight

Learn how to use TouchableHighlight with Uniwind className props

## Overview

The `TouchableHighlight` component provides visual feedback by underlaying a color when pressed. Uniwind provides className prop support for styling this component.

## Styling Convention

<Info>
  **For `style` props:** Use regular Tailwind classes directly (e.g., `className="p-4"`).

**For non-style props** (like `underlayColor`): Use the `accent-` prefix (e.g., `underlayColorClassName="accent-gray-200"`).
</Info>

## Uniwind Bindings

<ParamField type="string">
  Maps to the `style` prop. Use any Tailwind utility classes.
</ParamField>

<ParamField type="string">
  Maps to the `underlayColor` prop. Requires `accent-` prefix for color values.
</ParamField>

## Usage Example

```tsx theme={null}
import { TouchableHighlight, Text } from 'react-native';

<TouchableHighlight
  className="rounded-lg bg-blue-500 px-6 py-3"
  underlayColorClassName="accent-blue-600 dark:accent-blue-700"
  onPress={() => console.log('Pressed')}>
  <Text className="text-center font-semibold text-white">Press me</Text>
</TouchableHighlight>;
```

# TouchableNativeFeedback

Source: https://docs.uniwind.dev/components/touchable-native-feedback

Learn how to use TouchableNativeFeedback with Uniwind className props

## Overview

The `TouchableNativeFeedback` component (Android only) provides native touch feedback. Uniwind provides className prop support for styling this component.

## Styling Convention

<Info>
  **For `style` props:** Use regular Tailwind classes directly (e.g., `className="p-4"`).

**For non-style props** (like `color`): Use the `accent-` prefix (e.g., `colorClassName="accent-blue-500"`).
</Info>

## Uniwind Bindings

<ParamField type="string">
  Maps to the `style` prop. Use any Tailwind utility classes.
</ParamField>

## Usage Example

```tsx theme={null}
import { TouchableNativeFeedback, View, Text } from 'react-native';

<TouchableNativeFeedback
  onPress={() => console.log('Pressed')}
  background={TouchableNativeFeedback.Ripple('#3b82f6', false)}>
  <View className="rounded-lg bg-blue-500 p-4">
    <Text className="text-center font-bold text-white">Press Me</Text>
  </View>
</TouchableNativeFeedback>;
```

<Tip>
  `TouchableNativeFeedback` is Android-only and provides material design ripple effects. For cross-platform solutions, consider using `TouchableOpacity` or `Pressable` instead.
</Tip>

# TouchableOpacity

Source: https://docs.uniwind.dev/components/touchable-opacity

Learn how to use TouchableOpacity with Uniwind className props

## Overview

The `TouchableOpacity` component wraps views to make them respond properly to touches with opacity feedback. Uniwind provides className prop support for styling this component.

## Styling Convention

<Info>
  **For `style` props:** Use regular Tailwind classes directly (e.g., `className="p-4"`).

**For non-style props** (like `color`): Use the `accent-` prefix (e.g., `colorClassName="accent-blue-500"`).
</Info>

## Uniwind Bindings

<ParamField type="string">
  Maps to the `style` prop. Use any Tailwind utility classes.
</ParamField>

## Usage Example

```tsx theme={null}
import { TouchableOpacity, Text } from 'react-native';

<TouchableOpacity
  onPress={() => console.log('Pressed')}
  activeOpacity={0.7}
  className="m-2 rounded-lg bg-blue-500 p-4">
  <Text className="text-center font-bold text-white">Press Me</Text>
</TouchableOpacity>;
```

# TouchableWithoutFeedback

Source: https://docs.uniwind.dev/components/touchable-without-feedback

Learn how to use TouchableWithoutFeedback with Uniwind className props

## Overview

The `TouchableWithoutFeedback` component responds to touches without providing visual feedback. Uniwind provides className prop support for styling this component.

## Styling Convention

<Info>
  **For `style` props:** Use regular Tailwind classes directly (e.g., `className="p-4"`).

**For non-style props** (like `color`): Use the `accent-` prefix (e.g., `colorClassName="accent-blue-500"`).
</Info>

## Uniwind Bindings

<ParamField type="string">
  Maps to the `style` prop. Use any Tailwind utility classes.
</ParamField>

## Usage Example

```tsx theme={null}
import { TouchableWithoutFeedback, View, Text } from 'react-native';

<TouchableWithoutFeedback onPress={() => console.log('Pressed')}>
  <View className="m-2 rounded-lg bg-gray-100 p-4">
    <Text className="text-center text-gray-900">Press Me (No Feedback)</Text>
  </View>
</TouchableWithoutFeedback>;
```

# View

Source: https://docs.uniwind.dev/components/view

Learn how to use View with Uniwind className props

## Overview

The `View` component is the fundamental building block for UI. Uniwind provides className prop support for styling this component.

## Styling Convention

<Info>
  **For `style` props:** Use regular Tailwind classes directly (e.g., `className="p-4"`).

**For non-style props** (like `color`): Use the `accent-` prefix (e.g., `colorClassName="accent-blue-500"`).
</Info>

## Uniwind Bindings

<ParamField type="string">
  Maps to the `style` prop. Use any Tailwind utility classes.
</ParamField>

## Usage Example

```tsx theme={null}
import { View } from 'react-native';

<View className="flex-1 bg-white p-4 dark:bg-gray-900" />;
```

# VirtualizedList

Source: https://docs.uniwind.dev/components/virtualized-list

Learn how to use VirtualizedList with Uniwind className props

## Overview

The `VirtualizedList` component is the base implementation for `FlatList` and `SectionList`, providing highly performant list rendering. Uniwind provides className prop support for styling various parts of this component.

## Styling Convention

<Info>
  **For `style` props:** Use regular Tailwind classes directly (e.g., `className="p-4"`).

**For non-style props** (like `color`): Use the `accent-` prefix (e.g., `colorClassName="accent-blue-500"`).
</Info>

## Uniwind Bindings

<ParamField type="string">
  Maps to the `style` prop. Use any Tailwind utility classes.
</ParamField>

<ParamField type="string">
  Maps to the `contentContainerStyle` prop. Use regular Tailwind classes (no `accent-` prefix needed).
</ParamField>

<ParamField type="string">
  Maps to the `endFillColor` prop. Requires `accent-` prefix for color values.
</ParamField>

<ParamField type="string">
  Maps to the `ListFooterComponentStyle` prop. Use regular Tailwind classes (no `accent-` prefix needed).
</ParamField>

<ParamField type="string">
  Maps to the `ListHeaderComponentStyle` prop. Use regular Tailwind classes (no `accent-` prefix needed).
</ParamField>

## Usage Example

```tsx theme={null}
import { VirtualizedList, Text } from 'react-native';

<VirtualizedList
  data={items}
  getItem={(data, index) => data[index]}
  getItemCount={(data) => data.length}
  renderItem={({ item }) => <Text className="p-4">{item.name}</Text>}
  className="flex-1"
  contentContainerClassName="p-4"
  endFillColorClassName="accent-gray-100 dark:accent-gray-900"
/>;
```

# FAQ

Source: https://docs.uniwind.dev/faq

Frequently asked questions about Uniwind

## Common Questions

<AccordionGroup>
  <Accordion title="How do I include custom fonts?" icon="font">
    Custom fonts require two steps: loading the font files into your app and configuring the font names in your CSS. Uniwind maps `className` props to font families, but the actual font files need to be included separately.

    <Info>
      **Important:** Uniwind only handles the mapping of classNames to font families. You must include and load the font files separately using Expo Font or React Native's asset system.
    </Info>

    ## Expo Projects

    ### Step 1: Install and configure expo-font

    Add the font files to your project and configure them in `app.json`:

    ```json app.json theme={null}
    {
      "expo": {
        "plugins": [
          [
            "expo-font",
            {
              "fonts": [
                "./assets/fonts/Roboto-Regular.ttf",
                "./assets/fonts/Roboto-Medium.ttf",
                "./assets/fonts/Roboto-Bold.ttf",
                "./assets/fonts/FiraCode-Regular.ttf"
              ]
            }
          ]
        ]
      }
    }
    ```

    <Tip>
      Place your font files in the `assets/fonts` directory or any directory structure that works for your project. Just make sure the paths in `app.json` match your actual file locations.
    </Tip>

    ### Step 2: Define font families in global.css

    Configure your font families and text sizes using CSS variables in the `@theme` directive:

    ```css global.css theme={null}
    @import 'tailwindcss';
    @import 'uniwind';

    @theme {
      /* Other values */
      /* ... */

      /* Font families */
      --font-sans: 'Roboto-Regular';
      --font-sans-medium: 'Roboto-Medium';
      --font-sans-bold: 'Roboto-Bold';
      --font-mono: 'FiraCode-Regular';
    }
    ```

    <Warning>
      The font family names in your CSS must **exactly match** the font file names (without the extension). For example, `Roboto-Regular.ttf` becomes `'Roboto-Regular'`.
    </Warning>

    ### Step 3: Use font classes in your components

    Now you can use the configured font families with Tailwind classes:

    ```tsx theme={null}
    import { Text } from 'react-native'

    export const CustomFontExample = () => (
      <>
        <Text className="font-sans text-base">
          Regular text using Roboto-Regular
        </Text>

        <Text className="font-sans-medium text-lg">
          Medium weight using Roboto-Medium
        </Text>

        <Text className="font-sans-bold text-xl">
          Bold text using Roboto-Bold
        </Text>

        <Text className="font-mono text-sm">
          Monospace text using FiraCode-Regular
        </Text>
      </>
    )
    ```

    ## Bare React Native Projects

    For bare React Native projects without Expo, you can include fonts using the `react-native.config.js` file:

    ### Step 1: Create react-native.config.js

    ```js react-native.config.js theme={null}
    module.exports = {
      project: {
        ios: {},
        android: {},
      },
      assets: ['./assets/fonts'],
    };
    ```

    ### Step 2: Link the fonts

    Run the following command to link your fonts:

    ```bash theme={null}
    npx react-native-asset
    ```

    This will copy your font files to the native iOS and Android projects.

    ### Step 3: Configure in global.css

    After linking the fonts, configure them in your `global.css` the same way as Expo projects:

    ```css global.css theme={null}
    @import 'tailwindcss';
    @import 'uniwind';

    @theme {
      --font-sans: 'Roboto-Regular';
      --font-sans-medium: 'Roboto-Medium';
      --font-sans-bold: 'Roboto-Bold';
      --font-mono: 'FiraCode-Regular';
    }
    ```

    ## Platform-Specific Fonts

    You can define different fonts for different platforms using media queries:

    ```css global.css theme={null}
    @layer theme {
      :root {
        /* Default fonts */
        --font-sans: 'Roboto-Regular';

        /* iOS-specific fonts */
        @media ios {
          --font-sans: 'SF Pro Text';
        }

        /* Android-specific fonts */
        @media android {
          --font-sans: 'Roboto-Regular';
        }

        /* Web-specific fonts */
        @media web {
          --font-sans: 'system-ui', sans-serif;
        }
      }
    }
    ```

    ## Troubleshooting

    ### Fonts not loading

    If your fonts aren't appearing:

    1. **Check font file names** - Make sure the font family name in CSS matches the font file name exactly
    2. **Rebuild the app** - Font changes require a full rebuild, not just a Metro refresh
    3. **Verify file paths** - Ensure the paths in `app.json` or `react-native.config.js` are correct
    4. **Clear cache** - Try clearing Metro bundler cache with `npx expo start --clear`

    ### Font looks different than expected

    React Native doesn't support dynamic font weights. Each weight requires its own font file. Make sure you've:

    * Included all the font weight variants you need
    * Mapped each variant to a CSS variable in `@theme`
    * Used the correct className for each weight

    <Card title="Platform Selectors" icon="react" href="/api/platform-select">
      Learn more about using platform-specific styles
    </Card>

  </Accordion>

  <Accordion title="Where should I put global.css in Expo Router?" icon="folder-tree">
    When using Expo Router, it's recommended to place your `global.css` file in the project root and import it in your root layout file.

    ## Recommended Setup

    ### Step 1: Create global.css in the project root

    Place your `global.css` file in the root of your project:

    ```
    your-project/
    ├── app/
    │   ├── _layout.tsx
    │   └── index.tsx
    ├── components/
    ├── global.css         // ✅ Put it here
    └── package.json
    ```

    ```css global.css theme={null}
    @import 'tailwindcss';
    @import 'uniwind';

    /* Your custom CSS and themes */
    ```

    ### Step 2: Import in your root layout

    Import the CSS file in your root layout file (`app/_layout.tsx`):

    ```tsx app/_layout.tsx theme={null}
    import '../global.css' // Import at the top

    export default function RootLayout() {
      // Your layout code
    }
    ```

    <Info>
      Importing in the root `_layout.tsx` ensures the CSS is loaded before any of your app screens render, and enables hot reload when you modify styles.
    </Info>

    ### Step 3: Configure Metro

    Point Metro to your CSS file:

    ```js metro.config.js theme={null}
    module.exports = withUniwindConfig(config, {
      cssEntryFile: './global.css',
    });
    ```

    ## Why This Structure?

    * **No @source needed**: Tailwind scans from the project root, so it automatically finds `app` and `components` directories
    * **Simpler setup**: No need to manually configure which directories to scan
    * **Standard convention**: Matches typical React Native project structure

    <Tip>
      With `global.css` in the root, Tailwind will automatically scan all directories (app, components, etc.) without needing `@source` directives.
    </Tip>

    ## Alternative: App Directory

    You can also place `global.css` inside the `app` directory:

    ```
    your-project/
    ├── app/
    │   ├── _layout.tsx
    │   ├── global.css     // Alternative location
    │   └── index.tsx
    ├── components/
    └── package.json
    ```

    Then import it in `_layout.tsx`:

    ```tsx app/_layout.tsx theme={null}
    import './global.css' // Note: different path

    export default function RootLayout() {
      // Your layout code
    }
    ```

    And update Metro config:

    ```js metro.config.js theme={null}
    module.exports = withUniwindConfig(config, {
      cssEntryFile: './app/global.css',
    });
    ```

    <Warning>
      **Important:** If you place `global.css` in the `app` directory and have components outside (like a `components` folder), you **must** use `@source` to include them:

      ```css app/global.css theme={null}
      @import 'tailwindcss';
      @import 'uniwind';

      @source '../components';
      ```

      The location of `global.css` determines your app root. Tailwind will only scan for classNames starting from that directory.
    </Warning>

    <Card title="Global CSS Location Guide" icon="css" href="/theming/global-css">
      Learn more about configuring global.css
    </Card>

    <Card title="Monorepos & @source" icon="folder-tree" href="/monorepos">
      Understand how @source works with multiple directories
    </Card>

  </Accordion>

  <Accordion title="Why does my app still fully reload when I change CSS?" icon="arrows-rotate">
    If you're experiencing full app reloads when modifying CSS, even though you followed the documentation and didn't import `global.css` in your root index file, the issue is likely caused by too many Providers in your main App component.

    ## The Problem

    Metro's Fast Refresh can't hot reload components that have too many context providers, state management wrappers, or complex component trees. This is a Metro limitation, not a Uniwind issue.

    ### Common scenario:

    ```tsx App.tsx theme={null}
    import './global.css' // ⚠️ This file has many providers below

    export default function App() {
      return (
        <ReduxProvider store={store}>
          <ApolloProvider client={client}>
            <ThemeProvider>
              <AuthProvider>
                <NavigationProvider>
                  <NotificationProvider>
                    <AnalyticsProvider>
                      {/* Your app */}
                    </AnalyticsProvider>
                  </NotificationProvider>
                </NavigationProvider>
              </AuthProvider>
            </ThemeProvider>
          </ApolloProvider>
        </ReduxProvider>
      )
    }
    ```

    Metro can't efficiently hot reload this file due to the complex provider tree, so any change to `global.css` triggers a full app reload.

    ## The Solution

    Move the `global.css` import one level deeper to a component that has fewer providers:

    ### Option 1: Import in your navigation root

    ```tsx App.tsx theme={null}
    // Remove the import from here
    // import './global.css' // [!code --]

    export default function App() {
      return (
        <ReduxProvider store={store}>
          <ApolloProvider client={client}>
            <NavigationRoot /> {/* Import CSS here instead */}
          </ApolloProvider>
        </ReduxProvider>
      )
    }
    ```

    ```tsx NavigationRoot.tsx theme={null}
    import './global.css' // ✅ Import here

    export const NavigationRoot = () => {
      return (
        <NavigationContainer>
          {/* Your navigation */}
        </NavigationContainer>
      )
    }
    ```

    ### Option 2: Import in your home/main screen

    ```tsx screens/HomeScreen.tsx theme={null}
    import '../global.css' // ✅ Import in a screen component

    export const HomeScreen = () => {
      return (
        <View className="flex-1 bg-background">
          {/* Your content */}
        </View>
      )
    }
    ```

    ### Option 3: Import in Expo Router's nested layout

    If using Expo Router, move the import to a nested layout:

    ```tsx app/_layout.tsx theme={null}
    // Remove from root layout
    // import './global.css' // [!code --]

    export default function RootLayout() {
      return (
        <Providers>
          <Slot />
        </Providers>
      )
    }
    ```

    ```tsx app/(tabs)/_layout.tsx theme={null}
    import '../global.css' // ✅ Import in nested layout

    export default function TabsLayout() {
      return <Tabs />
    }
    ```

    ## How to Choose Where to Import

    Import `global.css` in the **deepest component** that:

    1. ✅ Is mounted early in your app lifecycle
    2. ✅ Doesn't have many providers or complex state
    3. ✅ Is a good candidate for Fast Refresh
    4. ✅ Runs on all platforms (iOS, Android, Web)

    <Tip>
      The goal is to find a component that Metro can efficiently hot reload. Experiment with different locations until you find one that enables Fast Refresh for CSS changes.
    </Tip>

    ## Testing the Fix

    After moving the import:

    1. **Restart Metro** - Clear cache with `npx expo start --clear`
    2. **Make a CSS change** - Modify a color in `global.css`
    3. **Check for Fast Refresh** - Your app should update without a full reload

    <Info>
      If you still see full reloads, try moving the import one level deeper. Some apps with very complex structures may need the import quite deep in the component tree.
    </Info>

    ## Why This Happens

    Metro's Fast Refresh works by:

    1. Detecting which files changed
    2. Finding components that can be safely updated
    3. Hot swapping only those components

    When a file has too many providers or complex state management, Metro can't determine what's safe to update, so it triggers a full reload instead.

    <Warning>
      This is a Metro/React Native limitation, not specific to Uniwind. Any file with complex provider trees will have this issue with Fast Refresh.
    </Warning>

    <Card title="Fast Refresh Documentation" icon="react" href="https://reactnative.dev/docs/fast-refresh">
      Learn more about React Native's Fast Refresh system
    </Card>

  </Accordion>

  <Accordion title="How can I use gradients?" icon="paintbrush">
    Uniwind provides built-in gradient support using Tailwind syntax with React Native's internal implementation. No additional dependencies required!

    ## Built-in Gradient Support (Recommended)

    Use gradient classes directly with the `className` prop:

    ### Directional Gradients

    ```tsx theme={null}
    import { View } from 'react-native'

    // Left to right gradient
    <View className="bg-gradient-to-r from-indigo-500 to-pink-500 rounded size-16" />

    // Top to bottom gradient
    <View className="bg-gradient-to-b from-blue-500 to-purple-500 rounded size-16" />

    // Diagonal gradient (top-left to bottom-right)
    <View className="bg-gradient-to-br from-green-400 to-blue-500 rounded size-16" />
    ```

    **Available directions:**

    * `bg-gradient-to-t` - Top
    * `bg-gradient-to-r` - Right
    * `bg-gradient-to-b` - Bottom
    * `bg-gradient-to-l` - Left
    * `bg-gradient-to-tr` - Top right
    * `bg-gradient-to-br` - Bottom right
    * `bg-gradient-to-bl` - Bottom left
    * `bg-gradient-to-tl` - Top left

    ### Angle-based Gradients

    Use specific angles with `bg-linear-{angle}`:

    ```tsx theme={null}
    import { View } from 'react-native'

    // 90 degree gradient
    <View className="bg-linear-90 from-indigo-500 via-sky-500 to-pink-500 rounded size-16" />

    // 45 degree gradient
    <View className="bg-linear-45 from-red-500 to-yellow-500 rounded size-16" />

    // 180 degree gradient
    <View className="bg-linear-180 from-purple-500 to-pink-500 rounded size-16" />
    ```

    ### Multi-stop Gradients

    Use `from-`, `via-`, and `to-` for multiple color stops:

    ```tsx theme={null}
    import { View } from 'react-native'

    // Three color stops
    <View className="bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 rounded size-16" />

    // With multiple via colors
    <View className="bg-linear-90 from-indigo-500 via-sky-500 via-purple-500 to-pink-500 rounded size-16" />
    ```

    ### Custom Gradients with Arbitrary Values

    For complete control, use arbitrary values with custom angles and color stops:

    ```tsx theme={null}
    import { View } from 'react-native'

    // Custom angle and color stops with percentages
    <View className="bg-linear-[25deg,red_5%,yellow_60%,lime_90%,teal] rounded size-16" />

    // Complex gradient
    <View className="bg-linear-[135deg,rgba(255,0,0,0.8)_0%,rgba(0,255,0,0.6)_50%,rgba(0,0,255,0.8)_100%] rounded size-16" />
    ```

    **Syntax:** `bg-linear-[angle,color1_position,color2_position]`

    <Tip>
      Built-in gradients work seamlessly with theme colors and support all Tailwind color utilities like `from-blue-500`, `via-purple-600`, etc.

      You can check more examples in the offical [Tailwind CSS](https://tailwindcss.com/docs/background-image#adding-a-linear-gradient) documentation.
    </Tip>

    ## Using expo-linear-gradient

    If you need to use `expo-linear-gradient` for specific features, you can't use `withUniwind` since it doesn't support mapping props to arrays. Instead, use multiple `useCSSVariable` calls:

    ### ❌ This won't work

    ```tsx theme={null}
    import { LinearGradient } from 'expo-linear-gradient'
    import { withUniwind } from 'uniwind'

    // Can't map className to colors array
    const StyledLinearGradient = withUniwind(LinearGradient)

    <StyledLinearGradient
      colorsClassName={['accent-red-500', 'accent-transparent']} // ?? Can't map to colors array
    />
    ```

    ### ✅ Use useCSSVariable instead

    ```tsx theme={null}
    import { LinearGradient } from 'expo-linear-gradient'
    import { useCSSVariable } from 'uniwind'

    export const GradientComponent = () => {
      const startColor = useCSSVariable('--color-indigo-500')
      const midColor = useCSSVariable('--color-pink-200')
      const endColor = useCSSVariable('--color-pink-500')

      return (
        <LinearGradient colors={[startColor, midColor, endColor]}/>
      )
    }
    ```

    <Warning>
      For most use cases, we recommend using built-in gradient support instead of `expo-linear-gradient`. It's simpler, requires no extra dependencies, and integrates better with Tailwind syntax.
    </Warning>

    ## Examples

    ### Card with Gradient Background

    ```tsx theme={null}
    import { View, Text } from 'react-native'

    export const GradientCard = () => (
      <View className="bg-gradient-to-br from-purple-600 via-pink-500 to-red-500 p-6 rounded-2xl">
        <Text className="text-white text-2xl font-bold">
          Beautiful Gradient Card
        </Text>
        <Text className="text-white/80 mt-2">
          Using built-in gradient support
        </Text>
      </View>
    )
    ```

    ### Button with Gradient

    ```tsx theme={null}
    import { Pressable, Text } from 'react-native'

    export const GradientButton = ({ onPress, title }) => (
      <Pressable
        onPress={onPress}
        className="bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-3 rounded-full active:opacity-80"
      >
        <Text className="text-white text-center font-semibold">
          {title}
        </Text>
      </Pressable>
    )
    ```

    ### Theme-aware Gradient

    ```tsx theme={null}
    import { View, Text } from 'react-native'

    export const ThemedGradient = () => (
      <View className="bg-gradient-to-r from-blue-500 to-purple-500 dark:from-blue-700 dark:to-purple-700 p-6 rounded-xl">
        <Text className="text-white text-lg">
          This gradient adapts to the theme
        </Text>
      </View>
    )
    ```

  </Accordion>

  <Accordion title="How do you handle merging and deduplicating classNames?" icon="code-merge">
    Uniwind does not automatically deduplicate classNames, especially on web. When you have conflicting styles or duplicate classes, you'll need to handle merging manually.

    <Info>
      **Important:** Uniwind doesn't dedupe classNames. If you pass conflicting styles like `className="bg-red-500 bg-blue-500"`, both classes will be applied, and the behavior depends on CSS specificity rules.
    </Info>

    ## Using tailwind-merge (Recommended)

    For proper className merging and deduplication, we recommend using [`tailwind-merge`](https://github.com/dcastil/tailwind-merge) with a utility function:

    ### Step 1: Install dependencies

    ```bash theme={null}
    bun add tailwind-merge clsx
    ```

    ### Step 2: Create a cn utility

    Create a utility file (e.g., `lib/utils.ts` or `utils/cn.ts`):

    ```ts lib/utils.ts theme={null}
    import { type ClassValue, clsx } from 'clsx';
    import { twMerge } from 'tailwind-merge';

    export function cn(...inputs: ClassValue[]) {
      return twMerge(clsx(inputs));
    }
    ```

    ### Step 3: Use the cn utility

    Now you can merge classNames safely in your components:

    ```tsx theme={null}
    import { View, Text, Pressable } from 'react-native'
    import { cn } from '@/lib/utils'

    export const Button = ({ className, variant = 'default', ...props }) => {
      return (
        <Pressable
          className={cn(
            // Base styles
            'px-4 py-2 rounded-lg',
            // Variant styles
            variant === 'default' && 'bg-blue-500',
            variant === 'destructive' && 'bg-red-500',
            // Custom className (will override conflicting classes)
            className
          )}
          {...props}
        />
      )
    }

    // Usage
    <Button variant="default" className="bg-green-500" />
    // Result: bg-green-500 wins, bg-blue-500 is removed
    ```

    ## Why Use tailwind-merge?

    Without `tailwind-merge`, conflicting classes can cause issues:

    ### ❌ Without tailwind-merge

    ```tsx theme={null}
    import { View } from 'react-native'

    const baseClasses = 'bg-red-500 p-4'
    const customClasses = 'bg-blue-500'

    // Both bg-red-500 and bg-blue-500 are applied
    // Result is unpredictable
    <View className={`${baseClasses} ${customClasses}`} />
    ```

    ### ✅ With tailwind-merge

    ```tsx theme={null}
    import { View } from 'react-native'
    import { cn } from '@/lib/utils'

    const baseClasses = 'bg-red-500 p-4'
    const customClasses = 'bg-blue-500'

    // tailwind-merge removes bg-red-500, keeps bg-blue-500
    // Result: clean, predictable styling
    <View className={cn(baseClasses, customClasses)} />
    ```

    ## Conditional Class Merging

    The `clsx` library inside `cn` makes conditional classes easier:

    ```tsx theme={null}
    import { View } from 'react-native'
    import { cn } from '@/lib/utils'

    export const Card = ({ isActive, isDisabled, className }) => (
      <View
        className={cn(
          'p-4 rounded-lg border',
          isActive && 'border-blue-500 bg-blue-50',
          isDisabled && 'opacity-50',
          !isDisabled && 'active:scale-95',
          className
        )}
      />
    )
    ```

  </Accordion>

  <Accordion title="How does style specificity work in Uniwind?" icon="layer-group">
    Understanding style specificity and priority is important when working with Uniwind to ensure predictable styling behavior.

    ## Inline styles override className

    In Uniwind inline styles always have higher priority than className:

    ```tsx theme={null}
    import { View } from 'react-native'

    // Inline style takes priority
    <View
      className="bg-red-500"
      style={{ backgroundColor: 'blue' }} // This wins
    />
    ```

    **Result:** The background will be blue, not red.

    <Warning>
      Inline styles always have higher priority than className. If you need to override a className style, you can use inline styles or merge classNames properly with `cn` from `tailwind-merge`.
    </Warning>

    ## Platform-specific behavior

    Specificity rules work consistently across platforms:

    ```tsx theme={null}
    import { View } from 'react-native'

    <View
      className="bg-red-500 ios:bg-blue-500 android:bg-green-500"
      style={{ backgroundColor: 'purple' }}
    />
    ```

    **Result on all platforms:** Purple background (inline style always wins)

    ## Best practices

    <Tip>
      **Use className for static styles** and inline styles only for truly dynamic values that can't be represented as classes (e.g., values from API, animation interpolations).
    </Tip>

    <Tip>
      **Use `cn` from tailwind-merge** when building component libraries to ensure predictable className overrides.
    </Tip>

    <Warning>
      **Avoid mixing className and inline styles** for the same property. Choose one approach for consistency and maintainability.
    </Warning>

  </Accordion>

  <Accordion title="How to debug 'Failed to serialize javascript object' error?" icon="bug">
    If you encounter the error **"Uniwind Error - Failed to serialize javascript object"**, this means Uniwind's Metro transformer is unable to serialize a complex pattern in your **global.css** file. This error is specifically about CSS processing, not about classNames in your components.

    ## The Error

    ```
    Uniwind Error - Failed to serialize javascript object
    ```

    This error appears during the Metro bundling process when Uniwind tries to process your `global.css` file. It can cause your app to fail to build or display a white screen.

    <Info>
      This error is about **CSS patterns in global.css** (like complex `@theme` configurations, custom properties, or advanced CSS features), not about using `className` in your components.
    </Info>

    ## Debugging Steps

    To identify what's causing the serialization issue, follow these steps:

    ### Step 1: Add debug logging

    Navigate to the Uniwind Metro transformer file and add a console log to see what's failing:

    ```js node_modules/uniwind/dist/metro/metro-transformer.cjs theme={null}
    // Find the serializeJSObject function and update the catch block:

    try {
      new Function(`function validateJS() { const obj = ({ ${serializedObject} }) }`);
    } catch {
      // Add this console.log to see what's failing
      console.log('Serialization failed for:', serializedObject); // [!code ++]
      Logger.error("Failed to serialize javascript object");
      return "";
    }
    return serializedObject;
    ```

    ### Step 2: Run your app

    After adding the console log, run your Metro bundler:

    ```bash theme={null}
    npx expo start --clear
    # or
    npx react-native start --reset-cache
    ```

    ### Step 3: Check the output

    Look at your Metro terminal output. You should see which object or code pattern is causing the serialization failure.

    ### Step 4: Report the issue

    Once you've identified the problematic code:

    1. Copy the console.log output
    2. Create a minimal reproduction case if possible
    3. Report it on GitHub with the output

    <Info>
      Include the serialization output and the code pattern causing the issue. This helps the maintainers fix the serializer to support your use case.
    </Info>

    ## Common Causes in global.css

    This error is caused by complex patterns in your `global.css` file that the Metro transformer can't serialize. Common causes include:

    * **Complex @theme configurations** - Very large or deeply nested theme definitions
    * **Advanced CSS functions** - Custom CSS functions or calculations that use JavaScript-like syntax
    * **Non-standard CSS syntax** - Experimental or non-standard CSS features
    * **Circular references** - CSS variables that reference each other in complex ways

    ## Temporary Workarounds

    While waiting for a fix:

    * **Simplify your global.css** - Break down complex theme configurations into smaller, simpler parts
    * **Remove experimental features** - Comment out advanced CSS features to isolate the issue

    <Warning>
      Modifying files in `node_modules` is only for debugging. Your changes will be lost when you reinstall dependencies. Always report the issue on GitHub for a permanent fix.
    </Warning>

    <Card title="Report Serialization Issues" icon="github" href="https://github.com/uni-stack/uniwind/issues">
      Found a serialization issue? Help improve Uniwind by reporting it
    </Card>

  </Accordion>

  <Accordion title="How can I fix Metro unstable_enablePackageExports conflicts?" icon="triangle-exclamation">
    Some React Native apps (especially crypto apps) need to disable `unstable_enablePackageExports` in their Metro configuration. However, Uniwind requires this setting to be enabled to work properly.

    ## The Problem

    If your Metro config has:

    ```js metro.config.js theme={null}
    config.resolver.unstable_enablePackageExports = false
    ```

    Uniwind and its dependency (`culori`) won't work correctly because they require package exports to be enabled.

    <Warning>
      Completely disabling `unstable_enablePackageExports` will break Uniwind's module resolution.
    </Warning>

    ## The Solution

    You can selectively enable package exports only for Uniwind and its dependencies while keeping it disabled for everything else:

    ```js metro.config.js theme={null}
    const { getDefaultConfig } = require('expo/metro-config');
    const { withUniwindConfig } = require('uniwind/metro');

    const config = getDefaultConfig(__dirname);

    // Disable package exports globally (for crypto libraries, etc.)
    config.resolver.unstable_enablePackageExports = false;

    // Selectively enable package exports for Uniwind and culori
    config.resolver.resolveRequest = (context, moduleName, platform) => {
      // uniwind and its dependency (culori) require unstable_enablePackageExports to be true
      if (['uniwind', 'culori'].some((prefix) => moduleName.startsWith(prefix))) {
        const newContext = {
          ...context,
          unstable_enablePackageExports: true,
        };

        return context.resolveRequest(newContext, moduleName, platform);
      }

      // default behavior for everything else
      return context.resolveRequest(context, moduleName, platform);
    };

    module.exports = withUniwindConfig(config, {
      cssEntryFile: './src/global.css',
    });
    ```

    <Tip>
      This custom resolver enables package exports only when resolving `uniwind` and `culori`, while keeping it disabled for all other packages.
    </Tip>

    ## Why This Works

    The custom `resolveRequest` function:

    1. **Checks the module name** - If it's `uniwind` or `culori`, it enables package exports
    2. **Creates a new context** - Temporarily overrides the setting for these specific packages
    3. **Falls back to default** - All other packages use the global setting (`false`)

    ## When You Need This

    Use this solution if:

    * You're working with crypto libraries that break with package exports enabled
    * You have other dependencies that require `unstable_enablePackageExports = false`
    * You encounter module resolution errors with Uniwind after disabling package exports

    <Info>
      If you don't have any conflicts with `unstable_enablePackageExports`, you don't need this custom resolver. Uniwind works fine with the default Metro configuration.
    </Info>

    ## Troubleshooting

    If you still encounter issues after adding the custom resolver:

    1. **Clear Metro cache** - Run `npx expo start --clear` or `npx react-native start --reset-cache`
    2. **Rebuild the app** - Package export changes may require a full rebuild
    3. **Check the module name** - Ensure the module causing issues is included in the `['uniwind', 'culori']` array
    4. **Verify Metro config** - Make sure the custom resolver is defined before calling `withUniwindConfig`

    <Card title="Metro Configuration" icon="train" href="/api/metro-config">
      Learn more about configuring Metro for Uniwind
    </Card>

  </Accordion>

  <Accordion title="Does Uniwind work with Vite?" icon="bolt">
    <Badge>Available in Uniwind 1.2.0+</Badge>

    Yes. Use Vite with React Native Web, Tailwind, and the Uniwind Vite plugin.

    ## Setup

    Create `vite.config.ts` in your project root:

    ```ts lines vite.config.ts theme={null}
    import tailwindcss from '@tailwindcss/vite'
    import { uniwind } from 'uniwind/vite'
    import { defineConfig } from 'vite'
    import { rnw } from 'vite-plugin-rnw'

    export default defineConfig({
        plugins: [
            rnw(),
            tailwindcss(),
            uniwind({
                // support same configuration as Metro plugin
                cssEntryFile: './src/App.css',
                extraThemes: ['premium'],
            }),
        ],
    })
    ```

    <Info>
      Point `cssEntryFile` to the CSS file where you import `tailwindcss` and `uniwind`. Keep it at your app root for accurate class scanning.
    </Info>

    <Tip>
      Restart Vite after changing your CSS entry or adding new themes.
    </Tip>

    <Tip>
      Storybook works via Vite too! Use the same `uniwind/vite` plugin in your Storybook Vite config and follow the React Native Web + Vite guide: [https://storybook.js.org/docs/get-started/frameworks/react-native-web-vite](https://storybook.js.org/docs/get-started/frameworks/react-native-web-vite). This gives you the web Storybook UI for visual and interaction testing.
    </Tip>

  </Accordion>

  <Accordion title="How do I enable safe area classNames?" icon="shield">
    <Badge>Available in Uniwind 1.2.0+</Badge>

    Install `react-native-safe-area-context` and wire safe area insets to Uniwind.

    <Warning>
      This applies only to the open source version of Uniwind. In the Pro version, insets are injected automatically from C++.
    </Warning>

    ## Setup

    1. Add the dependency:

    ```bash theme={null}
    bun add react-native-safe-area-context
    ```

    2. Wrap your root layout with `SafeAreaListener` and forward insets to Uniwind:

    ```tsx lines theme={null}
    import { SafeAreaListener } from 'react-native-safe-area-context'
    import { Uniwind } from 'uniwind'

    export const Root = () => (
      <SafeAreaListener
        onChange={({ insets }) => {
          Uniwind.updateInsets(insets)
        }}
      >
        {/* app content */}
      </SafeAreaListener>
    )
    ```

    <Tip>
      Add the listener once at the root of your app to keep all screens in sync.
    </Tip>

    ## Available classNames

    Uniwind provides three categories of safe area utilities:

    * **Padding**: `p-safe`, `pt-safe`, `pb-safe`, `pl-safe`, `pr-safe`, `px-safe`, `py-safe`
    * **Margin**: `m-safe`, `mt-safe`, `mb-safe`, `ml-safe`, `mr-safe`, `mx-safe`, `my-safe`
    * **Inset (positioning)**: `inset-safe`, `top-safe`, `bottom-safe`, `left-safe`, `right-safe`, `x-safe`, `y-safe`

    Each utility also supports `or` and `offset` variants:

    * `{property}-safe-or-{value}` → `Math.max(inset, value)` - ensures minimum spacing (e.g., `pt-safe-or-4`)
    * `{property}-safe-offset-{value}` → `inset + value` - adds extra spacing on top of inset (e.g., `mb-safe-offset-2`)

    ### Class matrix

    | Class               | Example                         | Effect                                              |
    | ------------------- | ------------------------------- | --------------------------------------------------- |
    | `p-safe`            | `className="p-safe"`            | Sets all padding to the current inset values        |
    | `pt-safe`           | `className="pt-safe"`           | Top padding equals top inset                        |
    | `m-safe`            | `className="m-safe"`            | Sets all margins to the inset values                |
    | `inset-safe`        | `className="inset-safe"`        | Sets top/bottom/left/right position to inset values |
    | `top-safe`          | `className="top-safe"`          | Top position equals top inset                       |
    | `y-safe`            | `className="y-safe"`            | Top and bottom positions equal their insets         |
    | `pt-safe-or-4`      | `className="pt-safe-or-4"`      | Top padding is `Math.max(topInset, 16)`             |
    | `pb-safe-offset-4`  | `className="pb-safe-offset-4"`  | Bottom padding is `bottomInset + 16`                |
    | `top-safe-offset-4` | `className="top-safe-offset-4"` | Top position is `topInset + 16`                     |

    ### Positioning Examples

    Use inset utilities for absolutely positioned elements that need to respect safe areas:

    ```tsx theme={null}
    // Floating action button above the bottom safe area
    <Pressable className="absolute bottom-safe right-4 bg-blue-500 rounded-full p-4">
      <PlusIcon />
    </Pressable>

    // Full-screen overlay respecting all safe areas
    <View className="absolute inset-safe bg-black/50">
      {/* Modal content */}
    </View>

    // Header positioned below top safe area with extra padding
    <View className="absolute top-safe-offset-4 left-0 right-0">
      {/* Header content */}
    </View>
    ```

  </Accordion>

  <Accordion title="Does Uniwind work with Next.js?" icon="question">
    Not officially. Uniwind is built for Metro and Vite (via React Native Web), not for Next.js. However, there's an experimental community-driven plugin that adds Next.js support.

    ## Current Support

    Uniwind works out of the box with:

    * ✅ **React Native** (Bare workflow)
    * ✅ **Expo** (Managed and bare workflows)
    * ✅ **Metro bundler** (React Native's default bundler)
    * ✅ **Vite** (with `vite-plugin-rnw` and `uniwind/vite` for web)

    ## Why Not Next.js?

    Next.js uses Webpack (or Turbopack) as its bundler, while Uniwind is architected around Metro's transformer pipeline. These are fundamentally different build systems with different APIs and plugin architectures.

    ## Community Solution

    <Warning>
      **Experimental** - This is a community-driven package, not officially maintained by the Uniwind team.
    </Warning>

    [@a16n-dev](https://github.com/a16n-dev) has created `uniwind-plugin-next`, a webpack plugin that integrates Uniwind into Next.js applications with SSR support.

    <CardGroup>
      <Card title="GitHub Repository" icon="github" href="https://github.com/a16n-dev/uniwind-plugin-next">
        View source and installation instructions
      </Card>

      <Card title="Live Demo" icon="globe" href="https://uniwind-next.a16n.dev/">
        See the plugin in action
      </Card>
    </CardGroup>

    ## Official Next.js Support

    **There is currently no timeline for official Next.js support.** While the community plugin works well for many use cases, official support would require significant effort to build and maintain a separate Webpack/Turbopack plugin alongside the Metro architecture.

    If the community plugin doesn't meet your needs, consider the alternatives below.

    ## Alternatives for Cross-Platform

    If the community plugin doesn't fit your needs:

    * **Use Uniwind for React Native/Expo** - For your mobile apps
    * **Use standard Tailwind CSS for Next.js** - For your web app
    * **Share design tokens** - Keep your color palette and spacing consistent via shared configuration

    <Tip>
      Many teams successfully use Uniwind for their React Native apps while using standard Tailwind CSS for their Next.js web apps, sharing design tokens between them.
    </Tip>

  </Accordion>

  <Accordion title="What UI kits work well with Uniwind?" icon="layer-group">
    Uniwind works with any React Native component library, but we've worked closely with UI kit teams to ensure the best integration and performance.

    ## Recommended UI Kits

    <CardGroup>
      <Card title="React Native Reusables" icon="shapes" href="https://reactnativereusables.com/">
        shadcn/ui for React Native - beautifully crafted components
      </Card>

      <Card title="HeroUI Native" icon="star" href="https://github.com/heroui-inc/heroui-native">
        Beautiful, fast and modern React Native UI library
      </Card>
    </CardGroup>

    ### React Native Reusables - shadcn for React Native

    **React Native Reusables** brings the beloved shadcn/ui philosophy to React Native. Built with Uniwind (or NativeWind), it provides beautifully designed, accessible, and customizable components that you can copy and paste into your apps.

    **Why React Native Reusables?**

    * 🎨 **shadcn Philosophy** - Copy, paste, and own your components. No package bloat
    * ✅ **Uniwind Native** - Built specifically for Uniwind with full className support
    * 🎯 **Beautifully Crafted** - Premium design inspired by shadcn/ui's aesthetics
    * ♿ **Accessible** - WCAG-compliant components that work across all platforms
    * 🎛️ **Fully Customizable** - Modify components to match your exact design requirements
    * 📱 **React Native First** - Designed for mobile, works perfectly on iOS, Android, and web

    <Tip>
      Perfect for developers who love shadcn/ui's approach and want the same elegant components for React Native. Just copy, paste, and customize to your heart's content!
    </Tip>

    ### HeroUI Native - Complete Component Library

    **HeroUI Native** is a comprehensive, production-ready React Native UI library. It's built for speed, accessibility, and seamless integration with Uniwind.

    **Why HeroUI Native?**

    * ✅ **Built for Uniwind** - Designed to work seamlessly with Uniwind's styling system
    * ✅ **Optimized Performance** - Collaborated closely with the HeroUI team for best-in-class performance
    * ✅ **Accessible** - ARIA-compliant components that work on all platforms
    * ✅ **Extensive Theming** - Deep integration with Uniwind's theme system
    * ✅ **Modern Design** - Beautiful, contemporary components out of the box
    * ✅ **Comprehensive** - Full set of components for building production apps

    <Info>
      Both UI kits work seamlessly with Uniwind's `className` prop and support all Tailwind utilities out of the box. Choose based on your preferred workflow: copy-paste (Reusables) or npm install (HeroUI).
    </Info>

    ## More UI Kits Coming

    We're actively working with other UI library teams to bring first-class Uniwind support to more component libraries. Stay tuned for announcements!

    <Tip>
      Want your UI kit featured here? We collaborate closely with library authors to ensure optimal integration and performance. Reach out on GitHub Discussions!
    </Tip>

    ## Using Other Component Libraries

    Uniwind works with any React Native component library. For libraries that don't natively support `className`, you can use [`withUniwind`](/api/with-uniwind) to add className support:

    ```tsx theme={null}
    import { withUniwind } from 'uniwind'
    import { SomeComponent } from 'some-library'

    const StyledComponent = withUniwind(SomeComponent)

    <StyledComponent className="bg-blue-500 p-4" />
    ```

    <Card title="withUniwind API" icon="code" href="/api/with-uniwind">
      Learn how to add className support to any component
    </Card>

    <Card title="Third-party Components" icon="boxes" href="/components/other-components">
      See examples of using Uniwind with various component libraries
    </Card>

  </Accordion>
</AccordionGroup>

# Introduction

Source: https://docs.uniwind.dev/index

Welcome to Uniwind - the fastest Tailwind bindings for React Native!

## Setting up

Get your project up and running in minutes.

<Card title="Get started" icon="laptop" href="/quickstart">
  Installation instructions
</Card>

## Learn about Uniwind

Follow our guides to get the most out of the library.

<Columns>
  <Card title="API documentation" icon="terminal" href="/api/use-uniwind">
    Explore the complete API reference for Uniwind hooks and utilities.
  </Card>

  <Card title="Theming" icon="palette" href="/theming/basics">
    Customize themes, colors, and design tokens for your React Native app.
  </Card>

  <Card title="FAQ" icon="circle-question" href="/faq">
    Answers to frequently asked questions about Uniwind.
  </Card>
</Columns>

## How to use `classNames` with any component

Learn how to apply Uniwind styles to any component in your app.

<Columns>
  <Card title="React Native components" icon="react" href="/components/activity-indicator">
    Style built-in React Native components with Tailwind classes.
  </Card>

  <Card title="3rd party components" icon="code" href="/components/other-components">
    Integrate Uniwind with third-party component libraries.
  </Card>
</Columns>

## Feedback

<Columns>
  <Card title="Leave us feedback!" icon="stars" href="https://github.com/uni-stack/uniwind/discussions">
    Let us know what you think about Uniwind!
  </Card>

  <Card title="Star Uniwind on GitHub!" icon="stars" href="https://github.com/uni-stack/uniwind/stargazers">
    Support Uniwind by giving it a star
  </Card>
</Columns>

# Migrate to Pro

Source: https://docs.uniwind.dev/migrate-to-pro

Upgrade from Uniwind Free to Uniwind Pro

## Overview

Upgrading from Uniwind Free to Uniwind Pro is straightforward. The API is identical, so no code changes are required - just install the Pro package and configure a few dependencies.

<Info>
  **API Compatibility:** Uniwind Pro maintains 100% API compatibility with the free version. Your existing code will work without modifications.
</Info>

## Prerequisites

Before upgrading to Pro, ensure you have an active Uniwind Pro [license](https://uniwind.dev/pricing).

## Installation

### Step 1: Install dependencies

Install Uniwind Pro along with its required dependencies:

<Warning>
  WIP 🚧
</Warning>

<Warning>
  Uniwind Pro requires **React Native Reanimated v4 or higher**. Make sure you're using a compatible version.
</Warning>

### Step 2: Configure Babel

Add the `react-native-worklets/plugin` to your `babel.config.js`:

```js babel.config.js theme={null}
module.exports = {
  // your presets and other configs
  plugins: [
    // other plugins
    'react-native-worklets/plugin', // [!code ++]
  ],
};
```

<Info>
  The `react-native-worklets/plugin` must be listed in the plugins array to work correctly.
</Info>

<Tip>
  If you're already using Reanimated, you may already have `react-native-reanimated/worklets` in your config.
</Tip>

### Step 3: Authenticate with GitHub

Run the Uniwind Pro CLI to authenticate your installation:

<Warning>
  WIP 🚧
</Warning>

You'll see the following menu:

```
  _   _       _          _           _   ____
 | | | |_ __ (_)_      _(_)_ __   __| | |  _ \ _ __ ___
 | | | | '_ \| \ \ /\ / / | '_ \ / _` | | |_) | '__/ _ \
 | |_| | | | | |\ V  V /| | | | | (_| | |  __/| | | (_) |
  \___/|_| |_|_| \_/\_/ |_|_| |_|\__,d| |_|   |_|  \___/


? What would you like to do?
❯ Login with Github
  Buy Uniwind Pro
  Exit
```

**Select "Login with Github":**

1. A browser tab will automatically open
2. Sign in with your GitHub account
3. Authorize the application
4. Wait for the success message: **"You can close this tab and return to the terminal."**

After successful authentication, you'll see a confirmation in your terminal:

```
? Hello @your-username, what would you like to do?
  Your session is valid for the next 179 days
────────────────────────────────────────────
❯ Manage your account
  Install Uniwind Pro
  Logout
  Exit
```

<Info>
  Your authentication session is valid for 180 days. After that, you'll need to re-authenticate.
</Info>

### Step 4: Install Uniwind Pro package

From the CLI menu, select **"Install Uniwind Pro"**:

```
? Hello @your-username, what would you like to do?
  Your session is valid for the next 179 days
────────────────────────────────────────────
  Manage your account
❯ Install Uniwind Pro
  Logout
  Exit
```

The CLI will automatically fetch and install the Uniwind Pro package from the CDN, matching the version of the `uniwind-pro` CLI tool.

<Tip>
  The installation process automatically handles version compatibility, ensuring you get the correct Pro version for your CLI.
</Tip>

### Step 5: Update imports

<Tabs>
  <Tab title="Automatic">
    <Warning>
      WIP 🚧
    </Warning>
  </Tab>

  <Tab title="Manual">
    Replace all `uniwind` references with `uniwind-pro` throughout your codebase.

    #### JavaScript/TypeScript imports

    **Find and replace:**

    * Find: `from 'uniwind'`
    * Replace with: `from 'uniwind-pro'`

    <Tabs>
      <Tab title="Before">
        ```tsx theme={null}
        import { useUniwind } from 'uniwind'
        import { withUniwind } from 'uniwind'
        import { useCSSVariable } from 'uniwind'
        import { useResolveClassNames } from 'uniwind'
        ```
      </Tab>

      <Tab title="After">
        ```tsx theme={null}
        import { useUniwind } from 'uniwind-pro'
        import { withUniwind } from 'uniwind-pro'
        import { useCSSVariable } from 'uniwind-pro'
        import { useResolveClassNames } from 'uniwind-pro'
        ```
      </Tab>
    </Tabs>

    <Tip>
      Use your code editor's "Find and Replace" feature (usually `Cmd/Ctrl + Shift + F`) to quickly update all imports across your project.
    </Tip>

  </Tab>
</Tabs>

#### global.css

Update your CSS entry file:

```js global.css theme={null}
@import 'tailwindcss';
@import 'uniwind'; // [!code --]
@import 'uniwind-pro'; // [!code ++]
```

#### Bundler config

<Tabs>
  <Tab title="Metro">
    Update your `metro.config.js`:

    ```js metro.config.js theme={null}
    const { withUniwindConfig } = require('uniwind/metro'); // [!code --]
    const { withUniwindConfig } = require('uniwind-pro/metro'); // [!code ++]
    ```

  </Tab>

  <Tab title="Vite">
    Update your `vite.config.ts`:

    ```ts vite.config.ts theme={null}
    import { uniwind } from 'uniwind/vite' // [!code --]
    import { uniwind } from 'uniwind-pro/vite' // [!code ++]
    ```

  </Tab>
</Tabs>

#### TypeScript types

The `uniwind-types.d.ts` file will be regenerated automatically. Just restart your Metro server to pick up the new types:

```bash theme={null}
npx expo start --clear
# or
npx react-native start --reset-cache
```

### Step 6: Remove free version

Uninstall the free version of Uniwind from your project:

<Tabs>
  <Tab title="bun">
    ```bash theme={null}
    bun remove uniwind
    ```
  </Tab>

  <Tab title="yarn">
    ```bash theme={null}
    yarn remove uniwind
    ```
  </Tab>

  <Tab title="npm">
    ```bash theme={null}
    npm uninstall uniwind
    ```
  </Tab>
</Tabs>

<Info>
  After removing `uniwind`, make sure to delete it from your `package.json` to avoid any conflicts between the free and Pro versions.
</Info>

### Step 7: Rebuild your app

Rebuild your native app to apply all changes:

<Tabs>
  <Tab title="Expo">
    ```bash theme={null}
    npx expo prebuild --clean
    ```

    Then run your app:

    ```bash theme={null}
    npx expo run:ios
    # or
    npx expo run:android
    ```

  </Tab>

  <Tab title="Bare React Native">
    For iOS, install pods:

    ```bash theme={null}
    cd ios && pod install && cd ..
    ```

    Then run your app:

    ```bash theme={null}
    npx react-native run-ios
    # or
    npx react-native run-android
    ```

  </Tab>
</Tabs>

<Warning>
  A native rebuild is required for Uniwind Pro to work correctly. Simply restarting Metro is not enough. Uniwind Pro doesn't work with Expo Go.
</Warning>

## What You Get with Pro

Uniwind Pro unlocks powerful features that take your React Native styling to the next level:

### Shadow Tree Updates

All component props are connected directly to the C++ engine, eliminating unnecessary re-renders and dramatically improving performance.

<Info>
  **No code changes required** - This optimization works automatically with all your existing components.
</Info>

### Reanimated 4 Animations and Transitions

Use Tailwind CSS class names to create smooth animations without any extra code. Uniwind Pro automatically constructs animated views and properties.

```tsx theme={null}
import { View } from 'react-native';

// Animations work automatically with Tailwind class names
<View className="animate-fade-in duration-300 ease-in-out">
  <Text className="animate-slide-up delay-100">Animated with just classNames!</Text>
</View>;
```

<Tip>
  All Tailwind 4 animation utilities work out of the box. No need to manually configure Reanimated or write animation code.
</Tip>

### Built-in Safe Area Insets

Uniwind Pro automatically injects safe area insets from the native layer - no setup required. If you previously configured `SafeAreaListener` to wire insets manually, you can now remove it:

```tsx theme={null}
// ❌ Remove this setup - no longer needed with Pro
import { SafeAreaListener } from 'react-native-safe-area-context';
import { Uniwind } from 'uniwind';

export const Root = () => (
  <SafeAreaListener
    onChange={({ insets }) => {
      Uniwind.updateInsets(insets);
    }}>
    {/* app content */}
  </SafeAreaListener>
);
```

```tsx theme={null}
// ✅ With Pro, just render your app directly
export const Root = () => <>{/* app content */}</>;
```

All safe area classNames (`pt-safe`, `pb-safe`, `inset-safe`, etc.) work exactly the same - they're now powered by C++ for better performance.

<Tip>
  You can also remove `react-native-safe-area-context` from your dependencies if you were only using it for Uniwind insets.
</Tip>

## 🎉 Success!

Congratulations! You've successfully upgraded to Uniwind Pro. Your app is now running with enhanced performance and all the Pro features.

### What's Next?

<CardGroup>
  <Card title="View Benchmarks" icon="chart-line" href="https://github.com/Unistyles-OSS/uniwind-benchmarks">
    Compare performance improvements
  </Card>

  <Card title="Join Discussions" icon="comments" href="https://github.com/Unistyles-OSS/uniwind/discussions">
    Connect with the community
  </Card>
</CardGroup>

## CI/CD Authentication

For automated builds in CI/CD pipelines, you can generate a token that skips manual GitHub authentication. Sign in to your [Uniwind dashboard](https://uniwind.dev/login) to create a CI/CD token.

<Tip>
  CI/CD tokens allow your build pipelines to install Uniwind Pro without interactive authentication.
</Tip>

## Managing Team Access

Team seats and member access can be managed from your [Uniwind dashboard](https://uniwind.dev/login). From there you can:

- Add or remove team members
- View active seats and usage
- Generate CI/CD tokens
- Manage billing and subscription

## Troubleshooting

If you encounter any issues during migration:

1. **Clear all caches** - Run `npx expo start --clear` or `npx react-native start --reset-cache`
2. **Verify Babel config** - Ensure `react-native-worklets/plugin` is in your plugins array
3. **Check imports** - Make sure all imports are updated from `'uniwind'` to `'uniwind-pro'`
4. **Rebuild native app** - Delete `ios/build` and `android/build` folders, then rebuild

<Card title="Report an Issue" icon="github" href="https://github.com/Unistyles-OSS/uniwind/issues">
  Still having problems? Open an issue on GitHub and we'll help you out
</Card>

<Note>
  Pro users receive **priority support**. Make sure to mention you're a Pro user when reporting issues.
</Note>

# Migration from Nativewind

Source: https://docs.uniwind.dev/migration-from-nativewind

Migrate your React Native app from Nativewind to Uniwind in minutes

Migrating your project from Nativewind to Uniwind should take no more than a few minutes. This guide highlights the main differences and provides a step-by-step migration process.

## Key Differences

Before starting the migration, it's important to understand how Uniwind differs from Nativewind:

<Check>
  Uniwind supports **Tailwind 4 only**. Make sure you upgrade Tailwind CSS to version 4.
</Check>

- **Default rem value**: Uniwind uses `16px` as the default value for the `rem` unit
- **No global overrides**: We don't override global components like Nativewind's `cssInterop`
- **CSS-based theming**: Themes are defined in CSS files instead of `tailwind.config.js`
- **No ThemeProvider required**: Uniwind doesn't require wrapping your app in a `ThemeProvider` to switch themes

## Prerequisites

Nativewind depends on the following packages:

- `react-native-reanimated`
- `react-native-safe-area-context`
- `tailwindcss`

<Info>
  We recommend keeping both `react-native-reanimated` and `react-native-safe-area-context` in your project, as they are very useful for React Native development.
</Info>

<Warning>
  You'll need to upgrade `tailwindcss` to version 4, as Uniwind requires it.
</Warning>

## Migration Steps

### Step 1: Install Uniwind

Follow the [Quickstart](/quickstart) guide to install Uniwind in your project.

### Step 2: Remove Nativewind Babel preset

Remove the Nativewind Babel preset from your `babel.config.js` file:

```js babel.config.js theme={null}
module.exports = {
  presets: ['<existing presets>'], // [!code ++]
  presets: ['<existing presets>', 'nativewind/babel'], // [!code --]
};
```

### Step 3: Update Metro configuration

Modify your `metro.config.js` to remove the Nativewind configuration and use Uniwind's configuration instead:

```js metro.config.js theme={null}
const { getDefaultConfig } = require('@react-native/metro-config');
const { withUniwindConfig } = require('uniwind/metro'); // [!code ++]

const config = getDefaultConfig(__dirname);

module.exports = withUniwindConfig(config, {
  // [!code ++:3]
  cssEntryFile: './src/global.css',
});
```

<Info>
  Learn more about Metro configuration in the [Metro Config](/api/metro-config) documentation.
</Info>

### Step 4: Update your global CSS file

Replace the top of your `global.css` file with the following imports:

```css global.css theme={null}
@import 'tailwindcss';
@import 'uniwind';

/* Your custom CSS and theme configuration (see Step 6) */
```

### Step 5: Remove Nativewind type definitions

Delete the `nativewind.d.ts` file from your project, as it's no longer needed.

### Step 6: Convert your CSS to Tailwind 4 syntax

You can keep most of your existing CSS as-is, but you'll need to follow Tailwind 4's `@theme` syntax for theme configuration.

<Tip>
  Check out the [official Tailwind 4 theme guide](https://tailwindcss.com/docs/theme) for more details on the new syntax.
</Tip>

### Step 7: Migrate theme variables from JavaScript to CSS

If you defined custom theme variables using Nativewind's `vars` helper:

<AccordionGroup>
  <Accordion icon="code" title="Before: JavaScript theme configuration">
    ```ts vars.ts theme={null}
    import { vars } from 'nativewind'

    export const themes = {
      light: vars({
        '--color-primary': '#00a8ff',
        '--color-gray': '#f0f0f0',
        '--color-typography': '#000',
      }),
      dark: vars({
        '--color-primary': '#273c75',
        '--color-gray': '#353b48',
        '--color-typography': '#fff',
      }),
    }
    ```

  </Accordion>

  <Accordion icon="css" title="After: CSS theme configuration">
    Move these variables directly to your `global.css` file:

    ```css global.css theme={null}
    @import 'tailwindcss';
    @import 'uniwind';

    /* Other directives like @theme or custom CSS */

    @layer theme {
      :root {
        @variant light {
          --color-primary: #00a8ff;
          --color-gray: #f0f0f0;
          --color-typography: #000;
        }

        @variant dark {
          --color-primary: #273c75;
          --color-gray: #353b48;
          --color-typography: #fff;
        }
      }
    }
    ```

    <Tip>
      You can now safely delete the file containing the `vars` helper, as it's no longer used.
    </Tip>

  </Accordion>
</AccordionGroup>

<Note>
  If you need to access CSS variables in JavaScript, you can use the [`useResolveClassNames`](/api/use-resolve-class-names) hook.
</Note>

### Step 8: Remove tailwind.config.js

With Uniwind, you no longer need a `tailwind.config.js` file. Theme configuration is now done entirely in CSS.

<AccordionGroup>
  <Accordion icon="file-code" title="Example: Old tailwind.config.js">
    ```js tailwind.config.js theme={null}
    /** @type {import('tailwindcss').Config} */
    module.exports = {
      content: ['./App.tsx'],
      presets: [require('nativewind/preset')],
      theme: {
        extend: {
          colors: {
            primary: 'var(--color-primary)',
            gray: 'var(--color-gray)',
            typography: 'var(--color-typography)',
          },
        },
      },
      plugins: [],
    }
    ```

    <Warning>
      Delete this file. All theme configuration should now be in your `global.css` file.
    </Warning>

  </Accordion>
</AccordionGroup>

### Step 9: Migrate font families from tailwind.config.js

If you customized fonts in your `tailwind.config.js`, you'll need to move them to your `global.css` file. Unlike Tailwind CSS on the web, React Native doesn't support font fallbacks, so you must specify only a single font family.

<AccordionGroup>
  <Accordion icon="file-code" title="Before: tailwind.config.js with font fallbacks">
    ```js tailwind.config.js theme={null}
    module.exports = {
      theme: {
        extend: {
          fontFamily: {
            normal: ['Roboto-Regular', 'sans-serif'],
            medium: ['Roboto-Medium', 'sans-serif'],
            semibold: ['Roboto-SemiBold', 'sans-serif'],
            bold: ['Roboto-Bold', 'sans-serif'],
            mono: ['FiraCode-Regular', 'monospace'],
          },
        },
      },
    }
    ```

    <Warning>
      Font fallbacks like `['Roboto-Regular', 'sans-serif']` don't work in React Native. You can only specify a single font file.
    </Warning>

  </Accordion>

  <Accordion icon="css" title="After: global.css with single fonts">
    Move font definitions to your `global.css` using the `@theme` directive, specifying only the actual font file name:

    ```css global.css theme={null}
    @import 'tailwindcss';
    @import 'uniwind';

    @theme {
      /* Single font per variant - no fallbacks */
      --font-normal: 'Roboto-Regular';
      --font-medium: 'Roboto-Medium';
      --font-semibold: 'Roboto-SemiBold';
      --font-bold: 'Roboto-Bold';
      --font-mono: 'FiraCode-Regular';
    }
    ```

    <Info>
      React Native requires separate font files for each weight. Don't include fallback fonts like `sans-serif` or `monospace` - only use the exact font file name.
    </Info>

    Usage:

    ```tsx theme={null}
    import { Text } from 'react-native'

    <Text className="font-normal">Regular text</Text>
    <Text className="font-medium">Medium weight</Text>
    <Text className="font-bold">Bold text</Text>
    <Text className="font-mono">Monospace text</Text>
    ```

  </Accordion>
</AccordionGroup>

<Card title="Custom Fonts FAQ" icon="font" href="/faq#how-do-i-include-custom-fonts">
  Learn how to load and configure custom fonts in your React Native app
</Card>

### Step 10: (Optional) Customize the default rem value

If you want to keep Nativewind's default `rem` value of `14px`, configure it in your `metro.config.js`:

```js metro.config.js theme={null}
module.exports = withUniwindConfig(config, {
  cssEntryFile: './src/global.css',
  polyfills: {
    // [!code ++:3]
    rem: 14,
  },
});
```

### Step 11: Remove Nativewind's ThemeProvider

Uniwind doesn't require Nativewind's `ThemeProvider` to manage color schemes. Remove the Nativewind-specific theme provider from your app:

<Warning>
  **Important:** This step only applies to **Nativewind's ThemeProvider**. If you're using **React Navigation's ThemeProvider** to manage navigation colors, keep it! Only remove the Nativewind theme management.
</Warning>

<AccordionGroup>
  <Accordion icon="ban" title="Before: With Nativewind ThemeProvider">
    ```tsx NativewindThemeProvider.tsx theme={null}
    export const NativewindThemeProvider = ({ children }: ThemeProviderProps) => {
        const { colorScheme } = useColorScheme()

        return (
            <ThemeContext.Provider value={{ theme: colorScheme as 'light' | 'dark' }}>
                <View style={themes[colorScheme as 'light' | 'dark']} className="flex-1">
                    {children}
                </View>
            </ThemeContext.Provider>
        )
    }
    ```

    ```tsx App.tsx theme={null}
    import { NativewindThemeProvider } from './NativewindThemeProvider';

    export default function App() {
      return (
        <NativewindThemeProvider>
          <YourApp />
        </NativewindThemeProvider>
      );
    }
    ```

  </Accordion>

  <Accordion icon="check" title="After: Without Nativewind ThemeProvider">
    ```tsx App.tsx theme={null}
    export default function App() {
      return <YourApp />;
    }
    ```
  </Accordion>
</AccordionGroup>

### React Navigation Theme Provider

If you're using React Navigation, **keep your NavigationContainer's theme provider**. Uniwind works alongside React Navigation's theme system:

```tsx App.tsx theme={null}
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native'

export default function App() {

  return (
    <NavigationContainer theme={...}>
      {/* ✅ Keep React Navigation's theme */}
      <YourApp />
    </NavigationContainer>
  )
}
```

<Info>
  React Navigation's theme system controls navigation bar colors, header styles, and card backgrounds. This is separate from Uniwind's styling and should be kept for proper navigation UI.
</Info>

### Step 12: Replace cssInterop with `withUniwind`

If you're using Nativewind's `cssInterop` to style third-party components, replace it with Uniwind's `withUniwind`:

<Info>
  Learn more about `withUniwind` in the [withUniwind API documentation](/api/with-uniwind).
</Info>

### Step 13: Handle safe area utilities

Uniwind now supports safe area classNames (`p-safe`, `m-safe`, `safe-*`, `safe-or-*`, `safe-offset-*`) when you forward insets from `react-native-safe-area-context`.

1. Install `react-native-safe-area-context`
2. Wrap your app root with `SafeAreaListener` and update Uniwind insets:

```tsx theme={null}
import { SafeAreaListener } from 'react-native-safe-area-context';
import { Uniwind } from 'uniwind';

export default function App() {
  return (
    <SafeAreaListener
      onChange={({ insets }) => {
        Uniwind.updateInsets(insets);
      }}>
      <View className="p-safe">{/* content */}</View>
    </SafeAreaListener>
  );
}
```

<Warning>
  This applies only to the open source version of Uniwind. In the Pro version, insets are injected automatically from C++.
</Warning>

### Step 14: Update animated class names

If you used Nativewind's `animated` class names from Tailwind, you'll need to use Reanimated's syntax directly.

<Tip>
  Check out the [React Native Reanimated documentation](https://docs.swmansion.com/react-native-reanimated/docs/css-animations/animation-name) for animation patterns.
</Tip>

### Step 15: className dedupe and specificity

Unlike Nativewind, Uniwind does not automatically deduplicate classNames, especially on web. If you have conflicting styles like `className="bg-red-500 bg-blue-500"`, both classes will be applied and the behavior depends on CSS specificity rules. We recommend using [`tailwind-merge`](https://github.com/dcastil/tailwind-merge) to properly merge and deduplicate classNames in your components.

<Info>
  Learn how to set up and use `tailwind-merge` with the `cn` utility in our [FAQ section](/faq#how-do-you-handle-merging-and-deduplicating-classnames).
</Info>

<Tip>
  Also check out the [Style specificity FAQ](/faq#how-does-style-specificity-work-in-uniwind) to understand how inline styles override className and other priority rules.
</Tip>

## Need Help?

<Card title="Missing Features?" icon="github" href="https://github.com/uni-stack/uniwind/issues">
  If you're using Nativewind and notice any missing features in Uniwind, please open an issue on GitHub. We're happy to add support!
</Card>

<Note>
  **Still having issues with migration?** Start a discussion on [GitHub](https://github.com/uni-stack/uniwind/discussions) and we'll help you migrate.
</Note>

# Monorepos

Source: https://docs.uniwind.dev/monorepos

Configure Uniwind to work seamlessly in monorepo setups

## Overview

When working with monorepos or shared component libraries, you may need to include source files from outside your main application directory. Uniwind leverages Tailwind CSS v4's automatic content detection, which intelligently scans your project for class names without manual configuration.

<Info>
  **Not using a monorepo?** This guide also applies to standard projects! If your `global.css` is in a nested folder (like `app/global.css` for Expo Router) and you have components in other directories, you'll need to use `@source` to include them.
</Info>

<Info>
  Tailwind v4 automatically excludes files listed in `.gitignore` and binary file types, so you don't need to worry about scanning `node_modules` or generated files.
</Info>

## Including External Sources

If you're using shared UI components from other packages in your monorepo, you can explicitly include them using the `@source` directive in your `global.css` file.

### Using the @source Directive

Add the `@source` directive to your CSS entry file to include additional directories:

```css global.css theme={null}
@import 'tailwindcss';
@import 'uniwind';

@source '../packages/ui-components';
@source '../packages/shared-components';
```

<Tip>
  The `@source` directive uses the same smart detection rules as automatic scanning, so it will skip binary files and respect `.gitignore` entries.
</Tip>

## Common Use Cases

### Expo Router with Components Outside App Directory

If you're using Expo Router and your `global.css` is in the `app` directory, but you have components in a separate `components` folder:

```css app/global.css theme={null}
@import 'tailwindcss';
@import 'uniwind';

/* Include components directory at the root level */
@source '../components';
```

<Tip>
  This is a common setup for Expo Router projects where routes live in `app` but shared components live in `components`.
</Tip>

### Shared Component Library

If your monorepo has a shared UI library that other apps consume:

```css global.css theme={null}
@import 'tailwindcss';
@import 'uniwind';

/* Include your shared component library */
@source '../../packages/ui-library';
```

### Multiple Package Sources

For complex monorepos with multiple component packages:

```css global.css theme={null}
@import 'tailwindcss';
@import 'uniwind';

@source '../packages/design-system';
@source '../packages/feature-components';
@source '../packages/marketing-components';
```

### Third-Party UI Libraries

Include custom UI libraries from `node_modules` that aren't automatically detected:

```css global.css theme={null}
@import 'tailwindcss';
@import 'uniwind';

@source '../node_modules/@my-company/ui-kit';
```

## How Automatic Detection Works

Tailwind v4 (and by extension, Uniwind) automatically discovers template files in your project using intelligent heuristics:

1. **Respects .gitignore** - Files in `.gitignore` are automatically excluded
2. **Skips binary files** - Images, videos, archives, and other binary formats are ignored
3. **Scans relevant files** - Focuses on source files where className attributes are likely to appear

<Info>
  **Important:** The `cssEntryFile` path in your `metro.config.js` determines the app root. Tailwind scans for classNames starting from the directory containing your `global.css` file. Files outside this directory require the `@source` directive.
</Info>

<Info>
  In most cases, you won't need to configure anything. Automatic detection works out of the box for standard project structures.
</Info>

## When to Use @source

You typically only need the `@source` directive when:

- Your `global.css` is in a nested folder and you have components in sibling or parent directories (common with Expo Router)
- Using shared components from other packages in a monorepo
- Consuming a custom UI library that's outside your main app directory
- Working with Yarn/pnpm workspaces where packages are symlinked
- Including components from a private npm package that contains Uniwind classes

<Tip>
  If your components are already within your app directory or workspace, you don't need `@source` - automatic detection handles it.
</Tip>

## Troubleshooting

### Classes Not Being Detected

If classes from your shared library or components aren't being detected:

1. **Check your `cssEntryFile` path** in `metro.config.js` - make sure it points to the correct `global.css` location
2. Verify the path in your `@source` directive is correct and relative to your `global.css` file
3. Check that the files aren't excluded by `.gitignore`
4. Ensure the source directories contain actual source files, not just compiled JavaScript
5. Restart your Metro bundler after adding `@source` directives

### Performance Concerns

If build times increase after adding `@source`:

- Make sure you're not accidentally including large directories like `node_modules`
- Verify your `.gitignore` is properly configured to exclude build artifacts
- Only include specific package directories rather than entire workspace roots

## Related

<CardGroup>
  <Card title="Quickstart" icon="laptop" href="/quickstart">
    Set up Uniwind in your React Native project
  </Card>

  <Card title="Global CSS" icon="css3" href="/theming/global-css">
    Learn more about configuring your global.css file
  </Card>

  <Card title="Metro Config" icon="train" href="/api/metro-config">
    Configure Metro bundler for Uniwind
  </Card>
</CardGroup>

# Pro Version

Source: https://docs.uniwind.dev/pro-version

Unlock the full potential of Uniwind with cutting-edge performance

<Info>
  💙 **Thank you for using Uniwind!** Whether you choose Free or Pro, we're committed to making it the best styling solution for React Native.
</Info>

## Overview

Uniwind comes in two versions: a **free MIT-licensed** version that covers all your styling needs, and a **Pro version** powered by the Unistyles engine for apps demanding the highest performance.

<Info>
  Both versions are production-ready and actively maintained. Choose the one that fits your project's needs!
</Info>

## Feature Comparison

| Feature                  | Free Version                                              | Pro Version                              |
| ------------------------ | --------------------------------------------------------- | ---------------------------------------- |
| **Tailwind CSS Support** | ✅ Full support                                           | ✅ Full support                          |
| **Theme System**         | ✅ Light, Dark, Custom                                    | ✅ Light, Dark, Custom                   |
| **Platform Selectors**   | ✅ iOS, Android, Web                                      | ✅ iOS, Android, Web                     |
| **CSS Parser**           | ✅ Included                                               | ✅ Included                              |
| **Expo Go Compatible**   | ✅ Yes                                                    | ❌ Requires dev client                   |
| **Performance**          | ⚡ On par with Unistyles 3.0                              | 🚀 Best in class                         |
| **Engine**               | JavaScript-based                                          | C++ with Unistyles engine                |
| **Shadow Tree Updates**  | Standard re-renders                                       | ✨ Zero re-renders                       |
| **Animation support**    | ❌ No translation layer, you need to use `style` property | ✨ Reanimated 4 support via `className`  |
| **Native Updates**       | ❌ Built in RN hooks                                      | ✨ All platform specific values from C++ |
| **Props Automapping**    | ✅ All RN components                                      | ✅ All RN components                     |
| **License**              | MIT & Commercial                                          | Commercial                               |
| **Support**              | Community                                                 | ✨ Priority support                      |
| **Project Limit**        | Unlimited                                                 | Unlimited                                |

## Free Version: Perfect for Most Apps

The free version of Uniwind is packed with everything you need to build beautiful React Native apps:

### What You Get

<Columns>
  <Card title="Full Tailwind Bindings" icon="wind">
    Complete Tailwind CSS v4 support with all utility classes, variants, and customization options.
  </Card>

  <Card title="Great Performance" icon="gauge-high">
    Performance on par with Unistyles 3.0 - fast enough for the vast majority of production apps.
  </Card>

  <Card title="Expo Go Support" icon="mobile">
    Test your app instantly with Expo Go. No need for custom dev clients during development.
  </Card>

  <Card title="Complete Theming" icon="palette">
    Built-in support for color schemes, orientation, and responsive breakpoints.
  </Card>

  <Card title="MIT License" icon="scale-balanced">
    Use it in any project - personal, commercial, open source. No restrictions.
  </Card>

  <Card title="RN Style Props Automapping" icon="wand-magic-sparkles">
    All React Native components work seamlessly with className props.
  </Card>
</Columns>

### Ideal For

- 🎨 Apps with complex styling requirements
- 📱 Standard React Native applications
- 🚀 Startups and indie developers
- 🏢 Commercial products
- 📚 Open-source projects
- 🎓 Learning and prototyping

## Pro Version: Maximum Performance

The Pro version takes performance to the next level with C++ bindings and the battle-tested Unistyles engine.

### What You Get Extra

<Columns>
  <Card title="C++ Bindings with Unistyles Engine" icon="bolt">
    Built on the proven Unistyles C++ engine for native-level performance.
  </Card>

  <Card title="Best in Class Performance" icon="trophy">
    The fastest styling solution available for React Native apps.
  </Card>

  <Card title="Zero Re-renders" icon="sparkles">
    Shadow Tree updates happen without triggering React re-renders, keeping your UI buttery smooth.
  </Card>

  <Card title="Reanimated 4 Animations" icon="wand-magic-sparkles">
    Full integration with the latest Reanimated 4 for advanced animations.
  </Card>

  <Card title="Platform specific updates" icon="mobile-screen">
    Automatic font scale and safe area insets updates directly from the native layer.
  </Card>

  <Card title="Priority Support" icon="headset">
    Get help faster with priority support and direct communication with maintainers.
  </Card>

  <Card title="Unlimited Projects" icon="infinity">
    Use Pro in unlimited projects within your organization. Pay for a seat build any number of projects.
  </Card>
</Columns>

<Card title="View All Pro Features" icon="list-check" href="/pro/theme-transitions">
  Explore detailed documentation for all Pro features
</Card>

### Ideal For

- 🏆 Apps with demanding performance requirements
- 💼 Enterprise applications
- 📈 Apps with large user bases
- ⚡ Performance-critical features

<Warning>
  **Note:** The Pro version requires a custom development build and is not compatible with Expo Go.
</Warning>

## Benchmarks

Uniwind Pro delivers significantly better performance compared to the free version and other React Native styling solutions. We maintain comprehensive benchmarks to demonstrate real-world performance improvements.

<Card title="View Benchmarks" icon="chart-line" href="https://github.com/Unistyles-OSS/uniwind-benchmarks">
  Explore detailed performance comparisons and benchmark results
</Card>

<Info>
  The benchmark repository includes source code and results comparing Uniwind Free, Uniwind Pro, and other popular styling libraries.
</Info>

## Supporting Uniwind Development

We believe in giving back to the community, which is why Uniwind's core features are free and MIT-licensed. If Uniwind saves you time and helps you build better apps, consider supporting us:

### Why Support Us?

- 🛠️ **Active Development**: We're constantly improving Uniwind with new features and bug fixes
- 📚 **Quality Documentation**: Comprehensive guides and examples to help you succeed
- 💬 **Community Support**: Active community and GitHub discussions
- 🚀 **Future Innovation**: Your support enables us to push the boundaries of React Native styling

### Ways to Support

<CardGroup>
  <Card title="Upgrade to Pro" icon="star" href="https://uniwind.dev/pricing">
    Get the best performance and priority support
  </Card>

  <Card title="Sponsor on GitHub" icon="heart" href="https://github.com/sponsors/jpudysz">
    Support development with a monthly contribution
  </Card>

  <Card title="Share Your Story" icon="bullhorn" href="https://x.com">
    Tell others how Uniwind helped your project
  </Card>

  <Card title="Contribute" icon="code-branch" href="https://github.com/uni-stack/uniwind">
    Help improve Uniwind with code contributions
  </Card>
</CardGroup>

## Making the Choice

Still not sure which version is right for you? Here's our recommendation:

### Start with Free

<Tip>
  **We recommend starting with the free version!** It's powerful enough for 95% of apps, and you can always upgrade to Pro later if you need that extra performance boost.
</Tip>

The free version gives you:

- Everything you need to build production apps
- No limitations on features or projects
- Time to evaluate if Pro's performance benefits matter for your use case

### Upgrade to Pro When

Consider upgrading to Pro if you:

- Notice performance bottlenecks with complex styling
- Need the absolute best performance for your users
- Want to support the project while getting extra benefits
- Require priority support for business-critical apps
- Work on apps with large user bases where every millisecond counts

## Frequently Asked Questions

<AccordionGroup>
  <Accordion title="Can I try Pro before buying?">
    No, the Pro version is in a separate GitHub repository. There is no trial version available - you'll need to purchase access to get the Pro features.
  </Accordion>

  <Accordion title="Can I upgrade from Free to Pro later?">
    Absolutely! Upgrading is seamless - the API is identical, so no code changes are needed. Just install the Pro package and you're good to go. See the [Migration Guide](/migrate-to-pro) for step-by-step instructions.
  </Accordion>

  <Accordion title="Is the free version truly unlimited?">
    Yes! The free version is MIT licensed - use it in unlimited projects, commercial or personal. No hidden catches!
  </Accordion>

  <Accordion title="What does priority support include?">
    Pro users get faster response times, direct access to maintainers, and help with integration issues.
  </Accordion>

  <Accordion title="Can I use Pro in multiple projects?">
    Yes! Your Pro license covers unlimited projects within your organization.
  </Accordion>

  <Accordion title="Does Pro work with Expo Go?">
    No, Pro requires a custom development build because of its native C++ components. However, it works great with EAS Build and bare React Native.
  </Accordion>
</AccordionGroup>

## Get Started Today

<CardGroup>
  <Card title="Start with Free" icon="rocket" href="/quickstart">
    Begin building with Uniwind in minutes
  </Card>

  <Card title="Explore Pro" icon="star" href="https://uniwind.dev/pricing">
    See Pro pricing and features
  </Card>
</CardGroup>

---

# Changelog

Source: https://docs.uniwind.dev/pro/changelog

Latest updates and improvements to Uniwind Pro

<Update label="January 11, 2026">
  ## Uniwind Pro Beta

We're thrilled to announce the first beta release of Uniwind Pro! This release is powered by the brand new **Unistyles 2nd generation C++ engine** with full **Fabric** support.

All Pro features are now available:

- **Zero re-renders** - Shadow Tree updates happen directly in C++ without triggering React re-renders
- **Built-in safe area insets** - Automatically injected from the native layer, no setup required
- **Reanimated 4 support** - Use Tailwind classes for animations via `className`
- **Full Fabric support** - Built from the ground up for the new React Native architecture

  <Info>
    All features listed on the [pricing page](https://uniwind.dev/pricing) have been implemented in this beta release.
  </Info>

### What's next?

We're doing final checks before removing the waitlist and inviting subscribers. It's a matter of days rather than weeks now.
</Update>

# Compatibility

Source: https://docs.uniwind.dev/pro/compatibility

Supported React Native, Expo, and dependency versions for Uniwind Pro

## Overview

<Tip>
  When upgrading Uniwind Pro, check this page for any dependency version changes that may affect your project.
</Tip>

Uniwind Pro follows the [extended React Native release cycle](https://reactnative.dev/versions). We support the **last 2 versions of Expo SDK** rather than the last 3 versions of React Native, giving you more time to migrate between major releases.

<Info>
  **Reanimated v4 is required** for all Uniwind Pro versions. Make sure you're using a compatible version of React Native Reanimated.
</Info>

## Version Compatibility

| Uniwind Pro  | React Native           | Expo SDK | Nitro Modules |
| ------------ | ---------------------- | -------- | ------------- |
| 1.0.0-beta.1 | 0.81, 0.82, 0.83, 0.84 | 54, 55   | >= 0.32.1+    |

<Warning>
  Each Uniwind Pro release specifies the minimum version of `react-native-nitro-modules` required. Make sure your project meets these requirements.

Using an unsupported version combination may lead to unexpected behavior or build failures. Always check compatibility before upgrading.
</Warning>

## Dependencies

### Required

| Dependency                   | Minimum Version | Notes                                                  |
| ---------------------------- | --------------- | ------------------------------------------------------ |
| `react-native-reanimated`    | 4.0.0           | Required for animations via `className`                |
| `react-native-worklets`      | -               | Compatible with your `react-native-reanimated` version |
| `react-native-nitro-modules` | See table above | Version varies per Uniwind Pro release                 |

# Get Your License

Source: https://docs.uniwind.dev/pro/get-license

Purchase and manage your Uniwind Pro license

<Info>
  Under construction 🚧
</Info>

# Native Insets

Source: https://docs.uniwind.dev/pro/native-insets

Safe area insets injected automatically from C++ with zero setup

## Overview

<Tip>
  **No setup required.** Safe area insets are automatically injected from the native layer. You don't need `react-native-safe-area-context` or any additional configuration.
</Tip>

Uniwind Pro delivers safe area insets directly from C++ to your classNames. The native layer monitors inset changes (orientation, device notches) and updates your components automatically without triggering React re-renders.

## Free vs Pro

| Feature                    | Free Version                                  | Pro Version |
| -------------------------- | --------------------------------------------- | ----------- |
| Safe area classNames       | Supported                                     | Supported   |
| Setup required             | `SafeAreaListener` + `Uniwind.updateInsets()` | None        |
| Dependencies               | `react-native-safe-area-context`              | None        |
| Re-renders on inset change | Yes                                           | No          |

## How It Works

1. **Native monitoring** - The C++ layer subscribes to safe area inset changes from iOS/Android
2. **Direct updates** - When insets change (initial render, orientation changes), values are pushed directly to the shadow tree
3. **No React involvement** - Components using safe area classes update without re-rendering
4. **Single frame** - All affected components update atomically in the same frame

<Info>
  This is part of Uniwind Pro's shadow tree update mechanism. See [Shadow Tree Updates](/pro/shadow-tree-updates) for more details.
</Info>

## Related

<CardGroup>
  <Card title="Shadow Tree Updates" icon="bolt" href="/pro/shadow-tree-updates">
    Learn how Uniwind Pro updates views without re-renders
  </Card>

  <Card title="Migration Guide" icon="rocket" href="/migrate-to-pro">
    Step-by-step guide to upgrade from Free to Pro
  </Card>
</CardGroup>

# Reanimated Animations

Source: https://docs.uniwind.dev/pro/reanimated-animations

Use Tailwind classNames to trigger high-performance native animations

## Overview

<Tip>
  **No complex animation logic required.** Use your favorite classNames to trigger high-performance animations. Our translation layer ensures that your animations remain performant, responsive and 100% native.
</Tip>

Uniwind Pro integrates seamlessly with `react-native-reanimated` (v4.0.0+) to provide CSS-like animations and transitions using Tailwind classes. Instead of using the `style` prop with Reanimated, you can use `className` to animate your components.

<Info>
  Uniwind Pro requires **Reanimated v4.0.0 or higher** for animation support.
</Info>

## How It Works

When you use `animate-*` or `transition-*` classes, Uniwind automatically:

1. Detects animation/transition properties in your `className`
2. Sets `isAnimated: true` on the style result
3. Swaps the native component for its Reanimated equivalent (e.g., `View` → `Animated.View`)
4. Applies CSS animations via Reanimated's CSS animation support

**No manual setup required** - just use the classes and Uniwind handles the rest.

## Keyframe Animations

Built-in Tailwind keyframe animations work out of the box:

```tsx theme={null}
import { View, Text, Pressable } from 'react-native'

// Spin animation (360° rotation loop)
<View className="size-32 bg-lime-500 rounded animate-spin" />

// Bounce animation (vertical bounce)
<View className="size-32 bg-lime-500 rounded animate-bounce" />

// Pulse animation (opacity fade in/out)
<View className="size-32 bg-lime-500 rounded animate-pulse" />

// Ping animation (scale + fade out)
<View className="size-32 bg-lime-500 rounded animate-ping" />

// Works on most components
<Pressable className="size-32 bg-base rounded-xl animate-spin" />

// iOS only (no Android support from Reanimated)
<Text className="text-default animate-spin">Spinning Text</Text>
```

## Transitions

Animate property changes smoothly when `className` or state changes:

```tsx theme={null}
import { View, Pressable } from 'react-native'

// Transition colors on press
<Pressable
  className="size-32 bg-base rounded-xl active:bg-primary transition-colors duration-500"
/>

// Transition opacity
<View
  className={`size-32 bg-sky-800 rounded transition-opacity duration-1000 ${
    isVisible ? 'opacity-100' : 'opacity-0'
  }`}
/>

// Transition transform
<View
  className={`size-32 bg-sky-800 rounded transition-transform duration-1000 ${
    isLeft ? '-translate-x-full' : 'translate-x-full'
  }`}
/>

// Transition all properties
<View
  className={`size-32 rounded transition-all duration-1000 border-8 ${
    state
      ? '-translate-x-full bg-lime-500 border-red-500 rounded-[64px]'
      : 'translate-x-full bg-red-500 border-lime-500 rounded-none'
  }`}
/>
```

## Supported Animation Classes

### Keyframe Animations

| Class            | Description            |
| ---------------- | ---------------------- |
| `animate-spin`   | 360° rotation loop     |
| `animate-bounce` | Vertical bounce effect |
| `animate-pulse`  | Opacity fade in/out    |
| `animate-ping`   | Scale up + fade out    |

### Transition Properties

| Class                  | Properties Animated                  |
| ---------------------- | ------------------------------------ |
| `transition-none`      | No transition                        |
| `transition-all`       | All properties                       |
| `transition-colors`    | Background, border, text colors      |
| `transition-opacity`   | Opacity                              |
| `transition-shadow`    | Box shadow                           |
| `transition-transform` | Transform (scale, rotate, translate) |

### Duration

| Class           | Duration |
| --------------- | -------- |
| `duration-75`   | 75ms     |
| `duration-100`  | 100ms    |
| `duration-150`  | 150ms    |
| `duration-200`  | 200ms    |
| `duration-300`  | 300ms    |
| `duration-500`  | 500ms    |
| `duration-700`  | 700ms    |
| `duration-1000` | 1000ms   |

### Timing Functions

| Class         | Easing      |
| ------------- | ----------- |
| `ease-linear` | Linear      |
| `ease-in`     | Ease in     |
| `ease-out`    | Ease out    |
| `ease-in-out` | Ease in-out |

### Delay

| Class        | Delay  |
| ------------ | ------ |
| `delay-75`   | 75ms   |
| `delay-100`  | 100ms  |
| `delay-150`  | 150ms  |
| `delay-200`  | 200ms  |
| `delay-300`  | 300ms  |
| `delay-500`  | 500ms  |
| `delay-700`  | 700ms  |
| `delay-1000` | 1000ms |

## Using Reanimated Directly

You can also use Reanimated's `Animated.*` components directly with Uniwind classes:

```tsx theme={null}
import Animated, { FadeIn, FlipInXUp, LinearTransition } from 'react-native-reanimated'

// Entering/exiting animations
<Animated.Text
  entering={FadeIn.delay(500)}
  className="text-foreground text-lg"
>
  Fading in text
</Animated.Text>

// Animated FlatList with entering animations per item
<Animated.FlatList
  data={data}
  className="flex-none"
  contentContainerClassName="px-2"
  layout={LinearTransition}
  ItemSeparatorComponent={() => (
    <Animated.View className="h-px bg-border" />
  )}
  renderItem={({ item }) => (
    <Animated.Text
      entering={FlipInXUp}
      className="text-foreground py-2"
    >
      {item}
    </Animated.Text>
  )}
/>
```

## Components Supporting Animations

These components automatically switch to Reanimated versions when animation classes are detected:

| Component         | Animated Version                |
| ----------------- | ------------------------------- |
| `View`            | `Animated.View`                 |
| `Text`            | `Animated.Text`                 |
| `Image`           | `Animated.Image`                |
| `ImageBackground` | `Animated.ImageBackground`      |
| `ScrollView`      | `Animated.ScrollView`           |
| `FlatList`        | `Animated.FlatList`             |
| `TextInput`       | `Animated.TextInput` (iOS only) |
| `Pressable`       | `Animated.View` wrapper         |

## Practical Examples

### Animated Button

```tsx theme={null}
import { Pressable, Text } from 'react-native';

<Pressable className="rounded-lg bg-blue-500 px-6 py-3 transition-all duration-150 active:scale-95 active:bg-blue-600">
  <Text className="font-semibold text-white">Press Me</Text>
</Pressable>;
```

### Interactive Card

```tsx theme={null}
import { Pressable, Text } from 'react-native';

<Pressable className="rounded-xl bg-white p-4 transition-transform duration-150 active:scale-95">
  <Text className="text-gray-800">Interactive Card</Text>
</Pressable>;
```

### Disabled State with Transition

```tsx theme={null}
import { Pressable, Text } from 'react-native';

<Pressable
  disabled={isLoading}
  className="rounded-lg bg-blue-500 px-6 py-3 transition-colors duration-300 disabled:bg-gray-300">
  <Text className="text-white">Submit</Text>
</Pressable>;
```

### Loading Spinner

```tsx theme={null}
import { View } from 'react-native';

<View className="size-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-500" />;
```

## Related

<CardGroup>
  <Card title="Shadow Tree Updates" icon="bolt" href="/pro/shadow-tree-updates">
    Learn how Uniwind Pro updates views without re-renders
  </Card>

  <Card title="Theme Transitions" icon="wand-magic-sparkles" href="/pro/theme-transitions">
    Add smooth animated transitions when switching themes
  </Card>
</CardGroup>

# Shadow Tree Updates

Source: https://docs.uniwind.dev/pro/shadow-tree-updates

Update any React Native style prop with zero re-renders

## Overview

<Tip>
  **No code changes required.** The C++ engine starts working automatically when you install Uniwind Pro. Your existing components will benefit from shadow tree updates without any modifications.
</Tip>

Uniwind Pro allows you to update any React Native style prop without triggering component re-renders. It leverages direct Shadow Tree updates to inject styles without waking up React. By creating a direct, optimized highway between your classNames and the native layer, we eliminate rendering lag entirely.

<Info>
  Uniwind Pro is built on the **2nd generation [Unistyles](https://unistyl.es) C++ engine**, a new and improved version that powers the shadow tree update mechanism.
</Info>

## The Traditional Re-render Problem

In standard React Native, these scenarios trigger component re-renders:

| Trigger                          | What happens                                                                     |
| -------------------------------- | -------------------------------------------------------------------------------- |
| `useColorScheme()`               | Component subscribes to system appearance changes and re-renders when it changes |
| Theme Context Provider           | All consumers re-render when context value updates                               |
| `Appearance.addChangeListener()` | Manual subscription requires state update, which triggers re-render              |

This creates a cascade of re-renders through the component tree, with each component recalculating styles and passing new props down.

<Warning>
  Without Pro, switching themes causes every themed component to re-render sequentially. This leads to visible flickering and the "rainbow" effect where components update at different times.
</Warning>

## How Uniwind Pro Updates Views

Uniwind Pro bypasses React's reconciliation entirely for style changes:

```
Runtime detects change (theme, color scheme, orientation, etc.)
        ↓
Uniwind recalculates styles for affected classes
        ↓
C++ core applies mutations directly
        ↓
Native views update instantly — no React re-render
```

<Tip>
  All views update atomically in the same frame. No partial states, no flickering.
</Tip>

## Supported Components

The following components support shadow tree updates with no re-renders. All components support `className` for the main style, and additional props use the `{propName}ClassName` pattern.

<AccordionGroup>
  <Accordion title="View">
    | Prop        | Description |
    | ----------- | ----------- |
    | `className` | Main styles |
  </Accordion>

  <Accordion title="Text">
    | Prop                      | Description                    |
    | ------------------------- | ------------------------------ |
    | `className`               | Main styles                    |
    | `selectionColorClassName` | Text selection highlight color |
  </Accordion>

  <Accordion title="TextInput">
    | Prop                             | Description                      |
    | -------------------------------- | -------------------------------- |
    | `className`                      | Main styles                      |
    | `cursorColorClassName`           | Cursor/caret color               |
    | `selectionColorClassName`        | Text selection highlight color   |
    | `selectionHandleColorClassName`  | Selection handle color (Android) |
    | `underlineColorAndroidClassName` | Underline color (Android)        |
    | `placeholderTextColorClassName`  | Placeholder text color           |
  </Accordion>

  <Accordion title="Image">
    | Prop                 | Description      |
    | -------------------- | ---------------- |
    | `className`          | Main styles      |
    | `tintColorClassName` | Image tint color |
  </Accordion>

  <Accordion title="ImageBackground">
    | Prop                 | Description      |
    | -------------------- | ---------------- |
    | `className`          | Main styles      |
    | `tintColorClassName` | Image tint color |
  </Accordion>

  <Accordion title="Switch">
    | Prop                           | Description            |
    | ------------------------------ | ---------------------- |
    | `className`                    | Main styles            |
    | `thumbColorClassName`          | Thumb/knob color       |
    | `trackColorOnClassName`        | Track color when on    |
    | `trackColorOffClassName`       | Track color when off   |
    | `ios_backgroundColorClassName` | Background color (iOS) |
  </Accordion>

  <Accordion title="ActivityIndicator">
    | Prop             | Description   |
    | ---------------- | ------------- |
    | `className`      | Main styles   |
    | `colorClassName` | Spinner color |
  </Accordion>

  <Accordion title="Button">
    | Prop             | Description  |
    | ---------------- | ------------ |
    | `className`      | Main styles  |
    | `colorClassName` | Button color |
  </Accordion>

  <Accordion title="Modal">
    | Prop                     | Description            |
    | ------------------------ | ---------------------- |
    | `className`              | Main styles            |
    | `backdropColorClassName` | Backdrop/overlay color |
  </Accordion>

  <Accordion title="RefreshControl">
    | Prop                               | Description                    |
    | ---------------------------------- | ------------------------------ |
    | `className`                        | Main styles                    |
    | `tintColorClassName`               | Spinner tint color (iOS)       |
    | `titleColorClassName`              | Title text color (iOS)         |
    | `progressBackgroundColorClassName` | Progress background (Android)  |
    | `colorsClassName`                  | Spinner colors array (Android) |
  </Accordion>

  <Accordion title="ScrollView">
    | Prop                        | Description              |
    | --------------------------- | ------------------------ |
    | `className`                 | Main styles              |
    | `contentContainerClassName` | Content container styles |
    | `endFillColorClassName`     | End fill color (Android) |
  </Accordion>

  <Accordion title="FlatList">
    | Prop                           | Description                            |
    | ------------------------------ | -------------------------------------- |
    | `className`                    | Main styles                            |
    | `contentContainerClassName`    | Content container styles               |
    | `columnWrapperClassName`       | Column wrapper styles (numColumns > 1) |
    | `ListHeaderComponentClassName` | Header component styles                |
    | `ListFooterComponentClassName` | Footer component styles                |
    | `endFillColorClassName`        | End fill color (Android)               |
  </Accordion>

  <Accordion title="SectionList">
    | Prop                           | Description              |
    | ------------------------------ | ------------------------ |
    | `className`                    | Main styles              |
    | `contentContainerClassName`    | Content container styles |
    | `ListHeaderComponentClassName` | Header component styles  |
    | `ListFooterComponentClassName` | Footer component styles  |
    | `endFillColorClassName`        | End fill color (Android) |
  </Accordion>

  <Accordion title="VirtualizedList">
    | Prop                           | Description              |
    | ------------------------------ | ------------------------ |
    | `className`                    | Main styles              |
    | `contentContainerClassName`    | Content container styles |
    | `ListHeaderComponentClassName` | Header component styles  |
    | `ListFooterComponentClassName` | Footer component styles  |
    | `endFillColorClassName`        | End fill color (Android) |
  </Accordion>

  <Accordion title="KeyboardAvoidingView">
    | Prop                        | Description              |
    | --------------------------- | ------------------------ |
    | `className`                 | Main styles              |
    | `contentContainerClassName` | Content container styles |
  </Accordion>

  <Accordion title="Pressable">
    | Prop        | Description                                             |
    | ----------- | ------------------------------------------------------- |
    | `className` | Main styles (supports `pressed:`, `disabled:` variants) |
  </Accordion>

  <Accordion title="TouchableOpacity">
    | Prop        | Description |
    | ----------- | ----------- |
    | `className` | Main styles |
  </Accordion>

  <Accordion title="TouchableWithoutFeedback">
    | Prop        | Description |
    | ----------- | ----------- |
    | `className` | Main styles |
  </Accordion>

  <Accordion title="TouchableNativeFeedback">
    | Prop        | Description                                             |
    | ----------- | ------------------------------------------------------- |
    | `className` | Main styles (supports `pressed:`, `disabled:` variants) |
  </Accordion>

  <Accordion title="SafeAreaView">
    | Prop        | Description |
    | ----------- | ----------- |
    | `className` | Main styles |
  </Accordion>
</AccordionGroup>

### Components Requiring Re-renders

Some React Native components cannot use shadow tree updates due to their internal implementation:

| Component            | Reason                                              |
| -------------------- | --------------------------------------------------- |
| `InputAccessoryView` | No shadow node exposed by React Native              |
| `TouchableHighlight` | Uses internal React state to manage `underlayColor` |

These components use the `useResolveClassNames` hook which subscribes to UniwindListener and triggers React re-renders when dependencies change.

## Summary

| Approach          | Re-renders                 | Update Speed | Flickering |
| ----------------- | -------------------------- | ------------ | ---------- |
| Traditional React | Every themed component     | Sequential   | Yes        |
| Uniwind Pro       | None (for most components) | Single frame | No         |

<Info>
  Uniwind Pro achieves single-frame theme updates by bypassing React's reconciliation entirely for style changes, resulting in smoother transitions and better performance.
</Info>

## Related

<CardGroup>
  <Card title="Theme Transitions" icon="wand-magic-sparkles" href="/pro/theme-transitions">
    Add smooth animated transitions when switching themes
  </Card>

  <Card title="Unistyles" icon="code" href="https://unistyl.es">
    Learn more about the C++ engine powering Uniwind Pro
  </Card>
</CardGroup>

# Theme Transitions

Source: https://docs.uniwind.dev/pro/theme-transitions

Smooth animated theme transitions powered by native snapshots

## Overview

Uniwind Pro provides animated theme transitions when switching between themes at runtime. The transition creates a snapshot overlay of the current screen before the theme changes, then animates that overlay away to reveal the new theme underneath.

<Info>
  Switching themes has never been this smooth. Uniwind Pro handles theme transitions on the native side, offering you multiple transition strategies out of the box.
</Info>

<Warning>
  Theme transitions are only available on iOS and Android. Web is not supported.
</Warning>

## Usage

```tsx theme={null}
import { Uniwind, ThemeTransitionPreset } from 'uniwind-pro';

// Switch theme with a transition animation
Uniwind.setTheme('dark', { preset: ThemeTransitionPreset.Fade });

// Switch theme without animation
Uniwind.setTheme('light');
```

## API Reference

### setTheme(themeName, transition?)

<ParamField type="string">
  The name of the theme to switch to (e.g., `'light'`, `'dark'`, or a custom theme name).
</ParamField>

<ParamField type="{ preset: ThemeTransitionPreset }">
  Optional transition configuration. If omitted, the theme changes instantly without animation.
</ParamField>

### Available Presets

| Preset                                   | Value | Description                                     |
| ---------------------------------------- | ----- | ----------------------------------------------- |
| `ThemeTransitionPreset.None`             | 0     | No animation, instant theme change              |
| `ThemeTransitionPreset.Fade`             | 1     | Fade out animation                              |
| `ThemeTransitionPreset.SlideRightToLeft` | 2     | Sliding mask animation from right to left       |
| `ThemeTransitionPreset.CircleTopRight`   | 3     | Circular reveal expanding from top-right corner |

## How It Works

The transition animation happens in two phases:

1. **Prepare Phase** - When `setTheme` is called with a transition, the native layer captures a bitmap/snapshot of the current screen and places it as an overlay on top of the view hierarchy

2. **Animate Phase** - The app switches themes while the overlay hides the change. The overlay then animates away (fading, sliding, or revealing) to show the fully-themed new state underneath. After the animation completes, the overlay is removed from the view hierarchy

## Perfect Shadow Tree Synchronization

Uniwind Pro synchronizes theme updates across the shadow tree, native components, and React re-renders, all in a single frame.

<Warning>
  Traditional React State + ShadowTree approaches suffer from sequential rendering: React state updates, then the shadow tree updates, then native views update. This causes visible flickering or partial theme states during transitions.
</Warning>

Uniwind Pro achieves single-frame perfection by:

- Updating the native shadow tree directly without waiting for React reconciliation
- Coordinating appearance changes (light/dark mode) with style updates atomically
- Using the snapshot overlay to hide any micro-delays, ensuring users see only the smooth animated reveal of the fully-themed new state

<Tip>
  When the overlay animates away, the entire UI underneath has already been updated to the new theme. No partial states, no flickering, no "rainbow" effect of components updating at different times.
</Tip>

## Native Implementation

<Tabs>
  <Tab title="iOS">
    * Uses `UIView.snapshotView(afterScreenUpdates:)` for the overlay
    * Animates with `CABasicAnimation` and `CAShapeLayer` masks
    * Overrides appearance via `window.overrideUserInterfaceStyle`
  </Tab>

  <Tab title="Android">
    * Creates a `Bitmap` snapshot via `Canvas.draw()`
    * Uses `ObjectAnimator` with `RectEvaluator` for clipping animations
    * Custom `RevealOverlay` view with `PorterDuff.Mode.CLEAR` for circle reveal
    * Overrides appearance via `AppCompatDelegate.setDefaultNightMode()`
  </Tab>
</Tabs>

## Important Notes

<AccordionGroup>
  <Accordion title="OS-level theme transitions are not affected">
    This only animates Uniwind's in-app theme changes. The system dark/light mode transition (triggered by Control Center or Settings) happens instantly at the OS level before the app receives the notification, so users won't see that transition regardless.
  </Accordion>

  <Accordion title="Fixed animation duration">
    Animation duration is fixed at 500ms with ease-in-ease-out timing on both platforms.
  </Accordion>

  <Accordion title="Future API extensions">
    Additional presets, customizable duration, and easing options are planned for future releases.
  </Accordion>
</AccordionGroup>

# Quickstart

Source: https://docs.uniwind.dev/quickstart

Start building with Uniwind in 3 minutes!

### Step 1: Install Uniwind and Tailwind

<Check>
  Uniwind only supports **Tailwind 4**.
</Check>

<AccordionGroup>
  <Accordion icon="terminal" title="Installation">
    <CodeGroup>
      ```bash bun theme={null}
        bun add uniwind tailwindcss
      ```

      ```bash better-t-stack theme={null}
        bun create better-t-stack@latest --template uniwind
      ```

      ```bash create-expo-app theme={null}
        npx create-expo-app -e with-router-uniwind
      ```
    </CodeGroup>

  </Accordion>

  <Accordion icon="css" title="Create global.css file">
    This file will serve as your CSS entry point.

    ```css lines theme={null}
    @import 'tailwindcss';
    @import 'uniwind';
    ```

    <Info>
      We recommend keeping this file in the root of your project.

      **Location matters!** The location of `global.css` determines your app root - Tailwind will automatically scan for classNames starting from this directory. If you place `global.css` in a nested folder (like `app/global.css`), classNames in other directories won't be detected unless you explicitly include them using the `@source` directive.
    </Info>

  </Accordion>

  <Accordion icon="file-import" title="Import global.css file">
    Import the CSS file in your `App.tsx` (main component).

    ```tsx theme={null}
    import './global.css' // <-- file from previous step

    // other imports

    export const App = () => {} // <-- your app's main component
    ```

    <Danger>Don’t import `global.css` in the root `index.ts`/`index.js` file where you register the Root Component, as any change will trigger a full reload instead of hot reload.</Danger>

    ```tsx theme={null}
    // ‼️ Don't do that
    import './global.css';

    import { registerRootComponent } from 'expo';
    import { App } from './src';  // <- ✅ import it somewhere in the src folder

    registerRootComponent(App);
    ```

  </Accordion>
</AccordionGroup>

### Step 2: Configure bundler

<Tabs>
  <Tab title="Expo (Metro)">
    <AccordionGroup>
      <Accordion icon="train" title="Modify metro.config.js">
        <Info>If you don't see a `metro.config.js` file in your project, you can create it with `npx expo customize metro.config.js`.</Info>

        ```js lines metro.config.js theme={null}
        const { getDefaultConfig } = require('expo/metro-config');
        const { withUniwindConfig } = require('uniwind/metro'); // [!code ++]

        const config = getDefaultConfig(__dirname);

        // your metro modifications

        module.exports = withUniwindConfig(config, {  // [!code ++:7]
          // relative path to your global.css file (from previous step)
          cssEntryFile: './src/global.css',
          // (optional) path where we gonna auto-generate typings
          // defaults to project's root
          dtsFile: './src/uniwind-types.d.ts'
        });
        ```

        <Info>We recommend placing the `uniwind-types.d.ts` file in the `src` or `app` directory, as it will be automatically included by TypeScript. For custom paths (e.g., root of your project), please include it in your `tsconfig.json`.</Info>
        <Warning>You need to run metro server to generate typings and fix all TypeScript errors.</Warning>

        <Warning>
          **Important:** `withUniwindConfig` must be the **outermost wrapper** in your Metro config. If you use other Metro config wrappers, make sure `withUniwindConfig` wraps them all.

          ```js theme={null}
          // ✅ Correct - Uniwind wraps everything
          module.exports = withUniwindConfig(
            withOtherConfig(
              withAnotherConfig(config, options),
              moreOptions
            ),
            { cssEntryFile: './src/global.css' }
          );

          // ❌ Wrong - Uniwind is innermost
          module.exports = withOtherConfig(
            withUniwindConfig(config, { cssEntryFile: './src/global.css' }),
            options
          );
          ```
        </Warning>
      </Accordion>
    </AccordionGroup>

  </Tab>

  <Tab title="Bare React Native (Metro)">
    <AccordionGroup>
      <Accordion icon="train" title="Modify metro.config.js">
        ```js lines metro.config.js theme={null}
        const { getDefaultConfig } = require('@react-native/metro-config')
        const { withUniwindConfig } = require('uniwind/metro'); // [!code ++]

        const config = getDefaultConfig(__dirname);

        // your metro modifications

        module.exports = withUniwindConfig(config, {  // [!code ++:7]
          // relative path to your global.css file (from previous step)
          cssEntryFile: './src/global.css',
          // (optional) path where we gonna auto-generate typings
          // defaults to project's root
          dtsFile: './src/uniwind-types.d.ts'
        });
        ```

        <Info>We recommend placing the `uniwind-types.d.ts` file in the `src` or `app` directory, as it will be automatically included by TypeScript. For custom paths (e.g., root of your project), please include it in your `tsconfig.json`.</Info>
        <Warning>You need to run metro server to generate typings and fix all TypeScript errors.</Warning>

        <Warning>
          **Important:** `withUniwindConfig` must be the **outermost wrapper** in your Metro config. If you use other Metro config wrappers, make sure `withUniwindConfig` wraps them all.

          ```js theme={null}
          // ✅ Correct - Uniwind wraps everything
          module.exports = withUniwindConfig(
            withOtherConfig(
              withAnotherConfig(config, options),
              moreOptions
            ),
            { cssEntryFile: './src/global.css' }
          );

          // ❌ Wrong - Uniwind is innermost
          module.exports = withOtherConfig(
            withUniwindConfig(config, { cssEntryFile: './src/global.css' }),
            options
          );
          ```
        </Warning>
      </Accordion>
    </AccordionGroup>

  </Tab>

  <Tab title="Vite">
    <AccordionGroup>
      <Accordion icon="bolt" title="Create vite.config.ts">
        <Badge>Available in Uniwind 1.2.0+</Badge>

        Add Uniwind and Tailwind plugins alongside React Native Web.

        ```ts lines vite.config.ts theme={null}
        import tailwindcss from '@tailwindcss/vite'
        import { uniwind } from 'uniwind/vite'
        import { defineConfig } from 'vite'
        import { rnw } from 'vite-plugin-rnw'

        // https://vite.dev/config/
        export default defineConfig({
            plugins: [
                rnw(),
                tailwindcss(),
                uniwind({
                    // relative path to your global.css file (from previous step)
                    cssEntryFile: './src/global.css',
                    // (optional) path where we gonna auto-generate typings
                    // defaults to project's root
                    dtsFile: './src/uniwind-types.d.ts'
                }),
            ],
        })
        ```

        <Info>
          Point `cssEntryFile` to the CSS file where you import `tailwindcss` and `uniwind`. Keep it at your app root for className scanning.
        </Info>
      </Accordion>
    </AccordionGroup>

  </Tab>
</Tabs>

### Step 3: (Optional) Enable Tailwind IntelliSense for Uniwind

<Tabs>
  <Tab title="VSCode/ Windsurf /Cursor">
    <Accordion icon="cog" title="settings.json">
      1. Open `settings.json` file in your editor
      2. Add the following configuration:

         ```json theme={null}
         {
             "tailwindCSS.classAttributes": [
                 "class",
                 "className",
                 "headerClassName",
                 "contentContainerClassName",
                 "columnWrapperClassName",
                 "endFillColorClassName",
                 "imageClassName",
                 "tintColorClassName",
                 "ios_backgroundColorClassName",
                 "thumbColorClassName",
                 "trackColorOnClassName",
                 "trackColorOffClassName",
                 "selectionColorClassName",
                 "cursorColorClassName",
                 "underlineColorAndroidClassName",
                 "placeholderTextColorClassName",
                 "selectionHandleColorClassName",
                 "colorsClassName",
                 "progressBackgroundColorClassName",
                 "titleColorClassName",
                 "underlayColorClassName",
                 "colorClassName",
                 "drawerBackgroundColorClassName",
                 "statusBarBackgroundColorClassName",
                 "backdropColorClassName",
                 "backgroundColorClassName",
                 "ListFooterComponentClassName",
                 "ListHeaderComponentClassName"
             ],
             "tailwindCSS.classFunctions": [
                 "useResolveClassNames"
             ]
         }
         ```
    </Accordion>

  </Tab>

  <Tab title="Zed">
    <Accordion icon="cog" title="settings.json">
      1. Open `settings.json` file in your editor
      2. Add the following configuration:

         ```json theme={null}
             {
               "lsp": {
                 "tailwindcss-language-server": {
                   "settings": {
                     "classAttributes": [
                       "class",
                       "className",
                       "headerClassName",
                       "contentContainerClassName",
                       "columnWrapperClassName",
                       "endFillColorClassName",
                       "imageClassName",
                       "tintColorClassName",
                       "ios_backgroundColorClassName",
                       "thumbColorClassName",
                       "trackColorOnClassName",
                       "trackColorOffClassName",
                       "selectionColorClassName",
                       "cursorColorClassName",
                       "underlineColorAndroidClassName",
                       "placeholderTextColorClassName",
                       "selectionHandleColorClassName",
                       "colorsClassName",
                       "progressBackgroundColorClassName",
                       "titleColorClassName",
                       "underlayColorClassName",
                       "colorClassName",
                       "drawerBackgroundColorClassName",
                       "statusBarBackgroundColorClassName",
                       "backdropColorClassName",
                       "backgroundColorClassName",
                       "ListFooterComponentClassName",
                       "ListHeaderComponentClassName"
                     ],
                     "classFunctions": ["useResolveClassNames"]
                   }
                 }
               }
             }
         ```
    </Accordion>

  </Tab>
</Tabs>

## Next steps

Now that you have your Uniwind project running, explore these key features:

<CardGroup>
  <Card title="API documentation" icon="terminal" href="/api/use-uniwind">
    Explore the complete API reference for Uniwind hooks and utilities.
  </Card>

  <Card title="Theming" icon="palette" href="/theming/basics">
    Customize themes, colors, and design tokens for your React Native app.
  </Card>

  <Card title="React Native components" icon="react" href="/components/activity-indicator">
    Style built-in React Native components with Tailwind classes.
  </Card>

  <Card title="3rd party components" icon="code" href="/components/other-components">
    Integrate Uniwind with third-party component libraries.
  </Card>

  <Card title="Monorepos & @source" icon="folder-tree" href="/monorepos">
    Learn how to include components from multiple directories using @source.
  </Card>
</CardGroup>

<Note>
  **Need help?** Start a discussion on [GitHub](https://github.com/uni-stack/uniwind/discussions).
</Note>

# Tailwind Basics

Source: https://docs.uniwind.dev/tailwind-basics

Learn how to use Tailwind CSS classes effectively with Uniwind

## Understanding Tailwind CSS

If you're new to Tailwind CSS, we highly recommend exploring the official [Tailwind documentation](https://tailwindcss.com/docs) to learn about utility classes, responsive design, and customization options.

## Working with Dynamic `classNames`

Uniwind uses the Tailwind parser to process your `className` strings at build time. This means that **dynamically constructed class names cannot be detected** by the Tailwind compiler, as explained in the [Tailwind guide on detecting classes](https://tailwindcss.com/docs/content-configuration#dynamic-class-names).

<Warning>
  Always use complete class names in your source code. Never construct class names using string interpolation or concatenation.
</Warning>

### ❌ Incorrect Usage

The following examples show common mistakes that prevent Tailwind from detecting your classes:

#### Example 1: String interpolation in class names

```tsx theme={null}
<View className="bg-{{ error ? 'red' : 'green' }}-600" />
```

**Why this doesn't work:** The Tailwind compiler cannot detect the classes `bg-red-600` and `bg-green-600` because they're constructed dynamically. Uniwind won't be able to precompile these classes, resulting in no styling.

#### Example 2: Template literals with variables

```tsx theme={null}
<Text className={`text-${props.color}`} />
```

**Why this doesn't work:** The Tailwind compiler cannot determine what `text-${props.color}` will be at runtime, so it won't generate the necessary styles.

### ✅ Correct Usage

Here are the recommended patterns for conditionally applying Tailwind classes:

#### Solution 1: Use complete class names with conditionals

```tsx theme={null}
<View className={error ? 'bg-red-600' : 'bg-green-600'} />
```

**Why this works:** The Tailwind compiler can detect both `bg-red-600` and `bg-green-600` because you've written out the complete class names.

#### Solution 2: Create a mapping object with complete class names

```tsx theme={null}
const colorVariants = {
  black: 'bg-black text-white',
  blue: 'bg-blue-500 text-white',
  white: 'bg-white text-black',
};

<Text className={colorVariants[props.color]} />;
```

**Why this works:** All possible class names are written in full within the `colorVariants` object, allowing Tailwind to detect and generate them at build time.

<Tip>
  You can use this pattern to create reusable style variants based on props, making your components more maintainable.
</Tip>

## Advanced Pattern: Variants and Compound Variants

For more complex component styling with multiple variants and conditions, we recommend using [tailwind-variants](https://www.tailwind-variants.org/), a popular open-source library that Uniwind fully supports.

Tailwind Variants allows you to:

- Define multiple style variants for your components
- Create compound variants (styles that apply when multiple conditions are met)
- Manage complex conditional styling in a clean, maintainable way

### Example with tailwind-variants

```tsx theme={null}
import { tv } from 'tailwind-variants';

const button = tv({
  base: 'font-semibold rounded-lg px-4 py-2',
  variants: {
    color: {
      primary: 'bg-blue-500 text-white',
      secondary: 'bg-gray-500 text-white',
      danger: 'bg-red-500 text-white',
    },
    size: {
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg',
    },
  },
  compoundVariants: [
    {
      color: 'primary',
      size: 'lg',
      class: 'bg-blue-600',
    },
  ],
  defaultVariants: {
    color: 'primary',
    size: 'md',
  },
});

// Usage
<Pressable className={button({ color: 'primary', size: 'lg' })}>
  <Text>Click me</Text>
</Pressable>;
```

<Info>
  Learn more about tailwind-variants in their [official documentation](https://www.tailwind-variants.org/docs/introduction).
</Info>

# Theming Basics

Source: https://docs.uniwind.dev/theming/basics

Learn how to use and manage themes in Uniwind

## Overview

Uniwind provides a powerful theming system that allows you to create beautiful, consistent user interfaces that adapt to user preferences. By default, Uniwind includes three pre-configured themes: `light`, `dark`, and `system`.

## Default Themes

Uniwind pre-registers three themes out of the box, so you can start using them immediately without any configuration.

### Available Themes

| Theme    | Description                                                        |
| -------- | ------------------------------------------------------------------ |
| `light`  | Light theme                                                        |
| `dark`   | Dark theme                                                         |
| `system` | Automatically follows the device's system color scheme preferences |

### Light and Dark Themes

If you only need `light` and `dark` themes, you're all set! Uniwind automatically registers these themes for you, and you can start using theme-based class variants immediately:

```tsx theme={null}
import { View, Text } from 'react-native';

export const ThemedComponent = () => (
  <View className="bg-white p-4 dark:bg-gray-900">
    <Text className="text-gray-900 dark:text-white">This text adapts to the current theme</Text>
  </View>
);
```

### System Theme

The `system` theme is a special theme that automatically syncs with your device's color scheme. When enabled, your app will automatically switch between light and dark themes based on the user's device settings.

<Tip>
  Using the `system` theme provides the best user experience, as it respects the user's device-wide preferences.
</Tip>

## Default Configuration

Here are the default values that Uniwind uses for theming:

<ParamField type="Array<string>">
  The list of available themes.

**Default:**

```ts theme={null}
['light', 'dark', 'system'];
```

</ParamField>

<ParamField type="boolean">
  Whether themes automatically adapt to the device's color scheme.

**Default:**

```ts theme={null}
true;
```

</ParamField>

<ParamField type="string">
  The theme that's applied when the app first launches.

**Default:**

```ts theme={null}
'light' | 'dark';
```

Automatically determined based on your device's current color scheme.
</ParamField>

## Changing Themes

You can programmatically change the active theme at runtime using the `setTheme` function.

### Switch to a Specific Theme

```tsx theme={null}
import { Uniwind } from 'uniwind';

// Switch to dark theme
Uniwind.setTheme('dark');

// Switch to light theme
Uniwind.setTheme('light');
```

<Info>
  When you set the theme to `light` or `dark`, Uniwind automatically calls React Native's [`Appearance.setColorScheme`](https://reactnative.dev/docs/appearance). This ensures native components like `Alert`, `Modal`, and system dialogs match your app's theme.
</Info>

<Warning>
  Switching from `system` to `light` or `dark` disables adaptive themes. The app will stay on the selected theme even if the device color scheme changes.
</Warning>

### Enable System Theme

To enable automatic theme switching based on the device's color scheme:

```tsx theme={null}
import { Uniwind } from 'uniwind';

// Enable system theme (adaptive themes)
Uniwind.setTheme('system');
```

<Tip>
  Setting the theme to `system` re-enables adaptive themes, allowing your app to automatically follow device color scheme changes.
</Tip>

### Creating a Theme Switcher

Here's a complete example of a theme switcher component:

```tsx theme={null}
import { View, Pressable, Text } from 'react-native';
import { Uniwind, useUniwind } from 'uniwind';

export const ThemeSwitcher = () => {
  const { theme, hasAdaptiveThemes } = useUniwind();

  const themes = [
    { name: 'light', label: 'Light', icon: '☀️' },
    { name: 'dark', label: 'Dark', icon: '🌙' },
    { name: 'system', label: 'System', icon: '⚙️' },
  ];
  const activeTheme = hasAdaptiveThemes ? 'system' : theme;

  return (
    <View className="gap-4 p-4">
      <Text className="text-sm text-gray-600 dark:text-gray-300">Current: {activeTheme}</Text>

      <View className="flex-row gap-2">
        {themes.map((t) => (
          <Pressable
            key={t.name}
            onPress={() => Uniwind.setTheme(t.name)}
            className={`items-center rounded-lg px-4 py-3 ${
              activeTheme === t.name ? 'bg-blue-500' : 'bg-gray-200 dark:bg-gray-700'
            } `}>
            <Text className="mb-1 text-2xl">{t.icon}</Text>
            <Text
              className={`text-xs ${
                activeTheme === t.name ? 'text-white' : 'text-gray-900 dark:text-white'
              }`}>
              {t.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
};
```

## Accessing Theme Information

Uniwind exposes a global object that provides information about the current theme state.

### Runtime Theme Information

You can access theme information programmatically:

```tsx theme={null}
import { Uniwind } from 'uniwind';

// Get the current theme name
console.log(Uniwind.currentTheme); // e.g., 'light', 'dark', or 'system'

// Check if adaptive themes are enabled
console.log(Uniwind.hasAdaptiveThemes); // e.g., true or false
```

### Using the useUniwind Hook

For React components, use the `useUniwind` hook to access theme information and automatically re-render when the theme changes:

```tsx theme={null}
import { useUniwind } from 'uniwind';
import { View, Text } from 'react-native';

export const ThemeDisplay = () => {
  const { theme, hasAdaptiveThemes } = useUniwind();

  return (
    <View className="p-4">
      <Text className="text-lg font-bold">Current theme: {theme}</Text>
      <Text className="mt-1 text-sm text-gray-600 dark:text-gray-300">
        {hasAdaptiveThemes ? 'Following system theme' : 'Fixed theme'}
      </Text>
    </View>
  );
};
```

## API Reference

### Uniwind Global Object

<ParamField type="(themeName: string) => void">
  Changes the active theme at runtime.

**Parameters:**

- `themeName`: The name of the theme to activate (`'light'`, `'dark'`, `'system'`, or a custom theme name)
  </ParamField>

<ParamField type="string">
  The name of the currently active theme.

**Returns:** `'light'`, `'dark'`, `'system'`, or a custom theme name
</ParamField>

<ParamField type="boolean">
  Indicates whether adaptive themes are currently enabled.

**Returns:** `true` if adaptive themes are enabled, `false` otherwise
</ParamField>

<ParamField type="(theme: string, variables: Record<string, string | number>) => void">
  Dynamically updates CSS variables at runtime for a specific theme.

**Parameters:**

- `theme`: The name of the theme to update (`'light'`, `'dark'`, or a custom theme name)
- `variables`: An object mapping CSS variable names (with `--` prefix) to their new values

  <Info>
    For detailed usage examples and platform-specific behavior, see the [updateCSSVariables documentation](/theming/update-css-variables).
  </Info>
</ParamField>

## Using Theme Variants in ClassNames

Apply different styles based on the active theme using the `dark:` variant:

```tsx theme={null}
import { View, Text } from 'react-native';

export const Card = () => (
  <View className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:shadow-lg">
    <Text className="text-lg font-bold text-gray-900 dark:text-white">Card Title</Text>
    <Text className="mt-2 text-gray-600 dark:text-gray-300">
      Card content adapts to the theme automatically
    </Text>
  </View>
);
```

## Best Practices

<Tip>
  **Use semantic color names:** Instead of hardcoding colors, define theme-aware color tokens in your Tailwind config for better consistency.
</Tip>

<Tip>
  **Test both themes:** Always test your UI in both light and dark themes to ensure proper contrast and readability.
</Tip>

<Warning>
  **Avoid theme-specific logic in components:** Let the styling system handle theme switching. Keep your component logic theme-agnostic.
</Warning>

## Related

<CardGroup>
  <Card title="Custom Themes" icon="swatchbook" href="/theming/custom-themes">
    Learn how to create custom themes beyond light and dark
  </Card>

  <Card title="useUniwind Hook" icon="code" href="/api/use-uniwind">
    Access theme information in your React components
  </Card>

  <Card title="Global CSS" icon="css" href="/theming/global-css">
    Define global CSS variables for your themes
  </Card>

  <Card title="Update CSS Variables" icon="wand-magic-sparkles" href="/theming/update-css-variables">
    Dynamically update CSS variables at runtime
  </Card>

  <Card title="Style Based on Themes" icon="paintbrush" href="/theming/style-based-on-themes">
    Advanced theme-based styling techniques
  </Card>
</CardGroup>

# Custom Themes

Source: https://docs.uniwind.dev/theming/custom-themes

Create and manage custom themes beyond light and dark in Uniwind

## Overview

While Uniwind provides `light` and `dark` themes by default, you can create unlimited custom themes for advanced use cases. Custom themes are perfect for branding variations, seasonal themes, accessibility modes, or any scenario where you need more than two color schemes.

<Info>
  Custom themes work exactly like the default themes, with full support for theme switching and CSS variable management.
</Info>

## Creating a Custom Theme

Creating a custom theme involves two steps:

1. Define theme-specific CSS variables in `global.css`
2. Register the theme in `metro.config.js`

### Step 1: Define Theme Variables in global.css

Add your custom theme using the `@variant` directive. All themes must define the same set of variables.

<Warning>
  **Important:** Every theme must define the same CSS variables. If you add a variable to one theme, add it to all themes. Uniwind will warn you in `__DEV__` mode if variables are missing.
</Warning>

#### Example: Adding a "Premium" Theme

```css global.css theme={null}
@import 'tailwindcss';
@import 'uniwind';

@layer theme {
  :root {
    /* Dark theme variables */
    @variant dark {
      --color-background: #000000;
      --color-foreground: #ffffff;
      --color-primary: #3b82f6;
      --color-card: #1f2937;
      --color-border: #374151;
    }

    /* Light theme variables */
    @variant light {
      --color-background: #ffffff;
      --color-foreground: #000000;
      --color-primary: #3b82f6;
      --color-card: #ffffff;
      --color-border: #e5e7eb;
    }

    /* Premium theme variables */
    @variant premium {
      --color-background: #1e1b4b;
      --color-foreground: #fef3c7;
      --color-primary: #fbbf24;
      --color-card: #312e81;
      --color-border: #4c1d95;
    }
  }
}
```

### Step 2: Register Theme in metro.config.js

Add your custom theme to the `extraThemes` array in your Metro configuration:

```js metro.config.js theme={null}
module.exports = withUniwindConfig(config, {
  cssEntryFile: './src/global.css',
  dtsFile: './src/uniwind-types.d.ts',
  extraThemes: ['premium'], // Register your custom theme here
});
```

<Tip>
  After adding a new theme, restart your Metro bundler for the changes to take effect.
</Tip>

### Step 3: Use Your Custom Theme

Switch to your custom theme programmatically:

```tsx theme={null}
import { Uniwind } from 'uniwind';

// Switch to premium theme
Uniwind.setTheme('premium');
```

## Complete Example: Multiple Custom Themes

Here's a complete example with multiple custom themes for different use cases:

### global.css with Multiple Themes

```css global.css theme={null}
@import 'tailwindcss';
@import 'uniwind';

@layer theme {
  :root {
    @variant dark {
      --color-background: oklch(0.1316 0.0041 17.69);
      --color-foreground: oklch(0.98 0 0);
      --color-primary: oklch(0.6 0.2 240);
      --color-card: oklch(0.2 0.01 240);
      --color-border: oklch(0.3 0.02 240);
    }

    @variant light {
      --color-background: oklch(1 0 0);
      --color-foreground: oklch(0.2 0 0);
      --color-primary: oklch(0.5 0.2 240);
      --color-card: oklch(0.98 0 0);
      --color-border: oklch(0.9 0.01 240);
    }

    /* Ocean theme - Cool blues and teals */
    @variant ocean {
      --color-background: oklch(0.25 0.05 220);
      --color-foreground: oklch(0.95 0.02 200);
      --color-primary: oklch(0.6 0.15 200);
      --color-card: oklch(0.3 0.06 215);
      --color-border: oklch(0.4 0.08 210);
    }

    /* Sunset theme - Warm oranges and purples */
    @variant sunset {
      --color-background: oklch(0.3 0.08 30);
      --color-foreground: oklch(0.95 0.03 60);
      --color-primary: oklch(0.65 0.18 40);
      --color-card: oklch(0.35 0.1 25);
      --color-border: oklch(0.45 0.12 35);
    }

    /* Forest theme - Natural greens */
    @variant forest {
      --color-background: oklch(0.2 0.05 150);
      --color-foreground: oklch(0.95 0.02 140);
      --color-primary: oklch(0.55 0.15 145);
      --color-card: oklch(0.25 0.06 155);
      --color-border: oklch(0.35 0.08 150);
    }

    /* High Contrast theme - Accessibility focused */
    @variant high-contrast {
      --color-background: oklch(0 0 0);
      --color-foreground: oklch(1 0 0);
      --color-primary: oklch(0.7 0.25 60);
      --color-card: oklch(0.1 0 0);
      --color-border: oklch(1 0 0);
    }
  }
}
```

### metro.config.js with Multiple Themes

```js metro.config.js theme={null}
const { getDefaultConfig } = require('expo/metro-config');
const { withUniwindConfig } = require('uniwind/metro');

const config = getDefaultConfig(__dirname);

module.exports = withUniwindConfig(config, {
  cssEntryFile: './src/global.css',
  dtsFile: './src/uniwind-types.d.ts',
  extraThemes: ['ocean', 'sunset', 'forest', 'high-contrast'],
});
```

### Theme Switcher Component

Create a theme switcher that includes your custom themes:

```tsx ThemeSwitcher.tsx theme={null}
import { View, Pressable, Text, ScrollView } from 'react-native';
import { Uniwind, useUniwind } from 'uniwind';

export const ThemeSwitcher = () => {
  const { theme, hasAdaptiveThemes } = useUniwind();

  const themes = [
    { name: 'light', label: 'Light', icon: '☀️' },
    { name: 'dark', label: 'Dark', icon: '🌙' },
    { name: 'ocean', label: 'Ocean', icon: '🌊' },
    { name: 'sunset', label: 'Sunset', icon: '🌅' },
    { name: 'forest', label: 'Forest', icon: '🌲' },
    { name: 'high-contrast', label: 'High Contrast', icon: '♿' },
  ];
  const activeTheme = hasAdaptiveThemes ? 'system' : theme;

  return (
    <View className="gap-4 p-4">
      <Text className="text-foreground text-sm">Current: {activeTheme}</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View className="flex-row gap-2">
          {themes.map((t) => (
            <Pressable
              key={t.name}
              onPress={() => Uniwind.setTheme(t.name)}
              className={`items-center rounded-lg px-4 py-3 ${activeTheme === t.name ? 'bg-primary' : 'bg-card border-border border'} `}>
              <Text
                className={`text-2xl ${activeTheme === t.name ? 'text-white' : 'text-foreground'}`}>
                {t.icon}
              </Text>
              <Text
                className={`mt-1 text-xs ${activeTheme === t.name ? 'text-white' : 'text-foreground'}`}>
                {t.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};
```

## Best Practices

<Tip>
  **Keep variable names consistent:** Use the same variable names across all themes. This ensures components look correct regardless of the active theme.
</Tip>

<Tip>
  **Test all themes:** Always test your UI with every theme to ensure proper contrast and readability.
</Tip>

<Tip>
  **Use OKLCH for better colors:** Consider using OKLCH color space for more perceptually uniform themes. See the [Global CSS](/theming/global-css) guide for details.
</Tip>

<Warning>
  **Don't forget to restart Metro:** Changes to `metro.config.js` require a Metro bundler restart to take effect.
</Warning>

## Troubleshooting

### Theme not appearing

1. Check that the theme is registered in `extraThemes` array
2. Verify all CSS variables are defined in the `@variant`
3. Restart Metro bundler
4. Clear Metro cache: `npx expo start --clear`

### Missing styles

1. Ensure all themes define the same set of CSS variables
2. Check for typos in variable names
3. Look for warnings in `__DEV__` mode about missing variables

## Related

<CardGroup>
  <Card title="Theming Basics" icon="palette" href="/theming/basics">
    Learn the fundamentals of theming in Uniwind
  </Card>

  <Card title="Global CSS" icon="css" href="/theming/global-css">
    Configure global styles and CSS variables
  </Card>

  <Card title="Update CSS Variables" icon="wand-magic-sparkles" href="/theming/update-css-variables">
    Dynamically update CSS variables at runtime
  </Card>

  <Card title="useUniwind Hook" icon="code" href="/api/use-uniwind">
    Access theme information in your React components
  </Card>

  <Card title="Style Based on Themes" icon="paintbrush" href="/theming/style-based-on-themes">
    Advanced theme-based styling techniques
  </Card>
</CardGroup>

# Global CSS

Source: https://docs.uniwind.dev/theming/global-css

Configure global styles, themes, and CSS variables in your Uniwind app

## Overview

The `global.css` file is the main entry point for Uniwind's styling system. It's where you import Tailwind and Uniwind, define theme-specific CSS variables, customize Tailwind's configuration, and add global styles for your entire application.

<Info>
  The `global.css` file must be imported in your app's entry point (usually `App.tsx`) for Uniwind to work correctly.
</Info>

## Required Imports

Every `global.css` file must include these two essential imports:

```css global.css theme={null}
/* Required: Import Tailwind CSS */
@import 'tailwindcss';

/* Required: Import Uniwind */
@import 'uniwind';
```

These imports enable:

- All Tailwind utility classes
- Uniwind's React Native compatibility layer
- Theme-based variants (`dark:`, `light`)
- Platform-specific variants (`ios:`, `android:`, `web:`)

## Customizing Tailwind Configuration

Use the `@theme` directive to customize Tailwind's default configuration values:

### Modifying Design Tokens

```css global.css theme={null}
@import 'tailwindcss';
@import 'uniwind';

@theme {
  /* Customize base font size */
  --text-base: 15px;

  /* Customize spacing scale */
  --spacing-1: 4px;
  --spacing-2: 8px;
  --spacing-3: 12px;
  --spacing-4: 16px;

  /* Customize border radius */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;

  /* Add custom colors */
  --color-primary: #3b82f6;
  --color-secondary: #8b5cf6;
  --color-accent: #ec4899;
}
```

<Warning>
  **Important:** Variables in `@theme` only customize Tailwind utility classes. They do **not** apply globally to unstyled components. If you want to change the default font size for all Text components, you need to use `className="text-base"` on each component.
</Warning>

```tsx theme={null}
import { Text } from 'react-native'

// ❌ This will NOT use --text-base (uses React Native's default ~14px)
<Text>Unstyled text</Text>

// ✅ This WILL use --text-base (15px from your @theme)
<Text className="text-base">Styled text</Text>
```

### Extending the Color Palette

```css global.css theme={null}
@theme {
  /* Add brand colors */
  --color-brand-50: #eff6ff;
  --color-brand-100: #dbeafe;
  --color-brand-200: #bfdbfe;
  --color-brand-300: #93c5fd;
  --color-brand-400: #60a5fa;
  --color-brand-500: #3b82f6;
  --color-brand-600: #2563eb;
  --color-brand-700: #1d4ed8;
  --color-brand-800: #1e40af;
  --color-brand-900: #1e3a8a;
}
```

Usage:

```tsx theme={null}
<View className="bg-brand-500 p-4 text-white" />
```

## Theme-Specific Variables

Define different CSS variable values for each theme using the `@layer theme` directive with `@variant`:

### Basic Theme Variables

```css global.css theme={null}
@import 'tailwindcss';
@import 'uniwind';

@layer theme {
  :root {
    /* Dark theme variables */
    @variant dark {
      --color-background: #000000;
      --color-foreground: #ffffff;
      --color-muted: #374151;
      --color-border: #1f2937;
    }

    /* Light theme variables */
    @variant light {
      --color-background: #ffffff;
      --color-foreground: #000000;
      --color-muted: #f3f4f6;
      --color-border: #e5e7eb;
    }
  }
}
```

### Complete Theme System

```css global.css theme={null}
@import 'tailwindcss';
@import 'uniwind';

@layer theme {
  :root {
    @variant dark {
      /* Backgrounds */
      --color-background: #000000;
      --color-background-secondary: #111827;
      --color-card: #1f2937;

      /* Text colors */
      --color-foreground: #ffffff;
      --color-foreground-secondary: #9ca3af;
      --color-muted: #6b7280;

      /* Borders */
      --color-border: #374151;
      --color-border-subtle: #1f2937;

      /* Interactive elements */
      --color-primary: #3b82f6;
      --color-primary-hover: #2563eb;
      --color-danger: #ef4444;
      --color-success: #10b981;
      --color-warning: #f59e0b;
    }

    @variant light {
      /* Backgrounds */
      --color-background: #ffffff;
      --color-background-secondary: #f9fafb;
      --color-card: #ffffff;

      /* Text colors */
      --color-foreground: #111827;
      --color-foreground-secondary: #6b7280;
      --color-muted: #9ca3af;

      /* Borders */
      --color-border: #e5e7eb;
      --color-border-subtle: #f3f4f6;

      /* Interactive elements */
      --color-primary: #3b82f6;
      --color-primary-hover: #2563eb;
      --color-danger: #ef4444;
      --color-success: #10b981;
      --color-warning: #f59e0b;
    }
  }
}
```

### OKLCH Color Support

Uniwind supports modern [OKLCH color space](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/oklch), which provides more perceptually uniform colors and better color manipulation compared to traditional RGB/HSL:

```css global.css theme={null}
@layer theme {
  :root {
    @variant dark {
      --color-background: oklch(0.1316 0.0041 17.69);
      --color-foreground: oklch(0.18 0.0033 17.46);
      --color-primary: oklch(0 0 0);
      --color-inverted: oklch(1 0 0);
      --color-gray: oklch(0.452 0.0042 39.45);
    }

    @variant light {
      --color-background: oklch(1 0 0);
      --color-foreground: oklch(96.715% 0.00011 271.152);
      --color-primary: oklch(1 0 0);
      --color-inverted: oklch(0 0 0);
      --color-gray: oklch(0.9612 0 0);
    }
  }
}
```

**Benefits of OKLCH:**

- **Perceptually uniform**: Colors that look equally bright to the human eye
- **Wider color gamut**: Access to more vibrant colors on modern displays
- **Better interpolation**: Smooth color transitions without muddy intermediate colors
- **Consistent lightness**: Easier to create accessible color palettes

<Tip>
  Use [OKLCH Color Picker](https://oklch.com/) to explore and generate OKLCH colors for your theme.
</Tip>

### Using Theme Variables

Once defined, reference your CSS variables directly as Tailwind utilities:

```tsx theme={null}
import { View, Text } from 'react-native';

export const ThemedCard = () => (
  <View className="bg-card border-border rounded-lg border p-4">
    <Text className="text-foreground text-lg font-bold">Card Title</Text>
    <Text className="text-foreground-secondary mt-2">
      This card automatically adapts to the current theme
    </Text>
  </View>
);
```

<Info>
  No need to use `var()` or brackets! Simply use the variable name without the `--color-` prefix. For example, `--color-primary` becomes `bg-primary` or `text-primary`.
</Info>

## Custom Themes

Define variables for custom themes beyond light and dark:

```css global.css theme={null}
@layer theme {
  :root {
    @variant dark {
      --color-background: #000000;
      --color-foreground: #ffffff;
    }

    @variant light {
      --color-background: #ffffff;
      --color-foreground: #000000;
    }

    /* Custom ocean theme */
    @variant ocean {
      --color-background: #0c4a6e;
      --color-foreground: #e0f2fe;
      --color-primary: #06b6d4;
      --color-accent: #67e8f9;
    }

    /* Custom sunset theme */
    @variant sunset {
      --color-background: #7c2d12;
      --color-foreground: #fef3c7;
      --color-primary: #f59e0b;
      --color-accent: #fb923c;
    }
  }
}
```

Learn more about custom themes in the [Custom Themes](/theming/custom-themes) guide.

## Static Theme Variables

If you need to define CSS variables that should always be available in JavaScript (via `useCSSVariable`) but aren't used in any `className`, use the `@theme static` directive:

```css global.css theme={null}
@import 'tailwindcss';
@import 'uniwind';

@theme static {
  /* Chart-specific values */
  --chart-line-width: 2;
  --chart-dot-radius: 4;
  --chart-grid-color: rgba(0, 0, 0, 0.1);

  /* Custom brand colors not used in classNames */
  --color-al-teal-10: #eaeeee;
  --color-al-teal-25: #cad4d5;
  --color-al-teal-75: #607d81;
  --color-al-teal-100: #2b5257;

  /* Native module configuration values */
  --map-zoom-level: 15;
  --animation-duration: 300;
}
```

### When to Use Static Variables

<Info>
  Variables defined in `@theme static` are always available via the [`useCSSVariable`](/api/use-css-variable) hook, even if they're never used in any `className`.
</Info>

Use `@theme static` for:

- **Third-party library configuration**: Values needed for chart libraries, maps, or other JavaScript APIs
- **Runtime calculations**: Design tokens used for JavaScript logic or animations
- **Native module values**: Configuration passed to native modules
- **JavaScript-only values**: Any CSS variable that should be accessible in JavaScript but doesn't need to generate Tailwind utilities

### Example: Using Static Variables

```tsx theme={null}
import { useCSSVariable } from 'uniwind';
import { LineChart } from 'react-native-chart-kit';

export const Chart = () => {
  const lineWidth = useCSSVariable('--chart-line-width');
  const dotRadius = useCSSVariable('--chart-dot-radius');
  const gridColor = useCSSVariable('--chart-grid-color');

  return (
    <LineChart
      data={data}
      chartConfig={{
        strokeWidth: lineWidth,
        dotRadius: dotRadius,
        color: () => gridColor,
      }}
    />
  );
};
```

<Tip>
  You can use any valid CSS in `global.css`. For more information, check the [CSS Parser](/api/css) documentation.
</Tip>

## Best Practices

<Tip>
  **Use semantic variable names:** Name variables based on their purpose (e.g., `--color-background`, `--color-primary`) rather than their value (e.g., `--color-blue-500`).
</Tip>

<Tip>
  **Keep theme variables consistent:** Ensure all themes define the same set of variables. If you miss a variable in one theme, we will warn you about it in `__DEV__` mode.
</Tip>

<Warning>
  **Avoid hard-coded colors in components:** Use CSS variables for colors that should adapt to themes. This ensures your UI remains consistent across theme changes.
</Warning>

## Related

<CardGroup>
  <Card title="useCSSVariable" icon="code" href="/api/use-css-variable">
    Access CSS variable values in JavaScript
  </Card>

  <Card title="Theming Basics" icon="palette" href="/theming/basics">
    Learn the fundamentals of theming in Uniwind
  </Card>

  <Card title="Custom Themes" icon="swatchbook" href="/theming/custom-themes">
    Create and manage custom themes
  </Card>

  <Card title="CSS Parser" icon="code" href="/api/css">
    Learn about Uniwind's CSS parsing capabilities
  </Card>

  <Card title="Style Based on Themes" icon="paintbrush" href="/theming/style-based-on-themes">
    Advanced theme-based styling techniques
  </Card>
</CardGroup>

# Style Based on Themes

Source: https://docs.uniwind.dev/theming/style-based-on-themes

Learn different approaches to create theme-aware styles in Uniwind

## Overview

Uniwind provides two approaches for creating theme-aware styles: using theme variant prefixes (like `dark:`) or defining CSS variables with `@layer theme`. Each approach has its use cases and benefits.

## Approach 1: Theme Variant Prefixes

The simplest way to style components based on themes is using the `dark:` variant prefix.

### Basic Usage

By default, styles apply to all themes:

```tsx theme={null}
import { View } from 'react-native';

// This red background applies to both light and dark themes
<View className="bg-red-500" />;
```

Add theme-specific styles using the `dark:` prefix:

```tsx theme={null}
import { View } from 'react-native';

// Red in light mode, darker red in dark mode
<View className="bg-red-500 dark:bg-red-600" />;
```

### Multiple Theme-Specific Styles

You can combine multiple theme-aware utilities:

```tsx theme={null}
import { View, Text } from 'react-native';

export const Card = () => (
  <View className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900 dark:shadow-lg">
    <Text className="text-lg font-bold text-gray-900 dark:text-white">Card Title</Text>
    <Text className="mt-2 text-gray-600 dark:text-gray-300">
      Card description with theme-aware colors
    </Text>
  </View>
);
```

### When to Use Theme Variant Prefixes

<Tip>
  **Best for:** One-off styling, prototyping, or small components where you want explicit control over light and dark mode colors.
</Tip>

**Pros:**

- Explicit and easy to understand
- No setup required
- Full control over each theme's appearance
- Works great for small apps or prototypes

**Cons:**

- Verbose for larger apps
- Requires repeating `dark:` prefix for many properties
- Difficult to maintain consistent colors across components
- Doesn't scale well to 3+ themes

## Approach 2: CSS Variables with @layer theme

For larger applications, defining theme-specific CSS variables provides a more scalable and maintainable solution.

### Setting Up CSS Variables

Define your theme variables in `global.css`:

```css global.css theme={null}
@import 'tailwindcss';
@import 'uniwind';

@layer theme {
  :root {
    @variant dark {
      --color-background: #000000;
      --color-foreground: #ffffff;
      --color-card: #1f2937;
      --color-border: #374151;
      --color-muted: #6b7280;
    }

    @variant light {
      --color-background: #ffffff;
      --color-foreground: #000000;
      --color-card: #ffffff;
      --color-border: #e5e7eb;
      --color-muted: #9ca3af;
    }
  }
}
```

### Using CSS Variables

Reference your variables directly in components:

```tsx theme={null}
import { View, Text } from 'react-native';

export const Card = () => (
  <View className="bg-card border-border rounded-lg border p-4">
    <Text className="text-foreground text-lg font-bold">Card Title</Text>
    <Text className="text-muted mt-2">Card description that automatically adapts to the theme</Text>
  </View>
);
```

<Info>
  `bg-background` automatically resolves to `#ffffff` in light theme and `#000000` in dark theme. No `dark:` prefix needed!
</Info>

### When to Use CSS Variables

<Tip>
  **Best for:** Medium to large applications, design systems, or apps with consistent color palettes across many components.
</Tip>

**Pros:**

- Clean, maintainable code
- Consistent colors across the entire app
- Easy to update themes in one place
- Scales well to any number of themes
- Semantic naming improves code readability

**Cons:**

- Requires initial setup
- Less explicit than variant prefixes
- Need to define all variables upfront

## Supporting Multiple Themes

CSS variables make it easy to support unlimited custom themes:

```css global.css theme={null}
@layer theme {
  :root {
    @variant dark {
      --color-background: #000000;
      --color-foreground: #ffffff;
      --color-primary: #3b82f6;
    }

    @variant light {
      --color-background: #ffffff;
      --color-foreground: #000000;
      --color-primary: #3b82f6;
    }

    @variant ocean {
      --color-background: #0c4a6e;
      --color-foreground: #e0f2fe;
      --color-primary: #06b6d4;
    }

    @variant sunset {
      --color-background: #7c2d12;
      --color-foreground: #fef3c7;
      --color-primary: #f59e0b;
    }
  }
}
```

Components using these variables automatically work with all themes:

```tsx theme={null}
import { View, Text } from 'react-native';

export const ThemedComponent = () => (
  <View className="bg-background p-4">
    <Text className="text-foreground">
      This component works with light, dark, ocean, and sunset themes!
    </Text>
    <View className="bg-primary mt-4 rounded p-2">
      <Text className="text-background">Primary action</Text>
    </View>
  </View>
);
```

<Tip>
  To register additional themes, follow the [Custom Themes](/theming/custom-themes) guide.
</Tip>

## Migration Guide

### From Theme Variants to CSS Variables

1. **Identify repeated colors** across your components
2. **Define CSS variables** for these colors in `global.css`
3. **Replace theme variants** with CSS variable references
4. **Test thoroughly** in all themes

Example migration:

```tsx theme={null}
// Before: Using theme variants
<View className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
  <Text className="text-gray-900 dark:text-white">Hello</Text>
</View>

// After: Using CSS variables
<View className="bg-card border border-border">
  <Text className="text-foreground">Hello</Text>
</View>
```

## Related

<CardGroup>
  <Card title="Theming Basics" icon="palette" href="/theming/basics">
    Learn the fundamentals of theming in Uniwind
  </Card>

  <Card title="Global CSS" icon="css" href="/theming/global-css">
    Configure global styles and CSS variables
  </Card>

  <Card title="Custom Themes" icon="swatchbook" href="/theming/custom-themes">
    Create custom themes beyond light and dark
  </Card>

  <Card title="useUniwind Hook" icon="code" href="/api/use-uniwind">
    Access theme information in your components
  </Card>
</CardGroup>

# updateCSSVariables

Source: https://docs.uniwind.dev/theming/update-css-variables

Dynamically update CSS variables at runtime for specific themes

<Badge>Available in Uniwind 1.1.0+</Badge>

## Overview

The `updateCSSVariables` method allows you to dynamically modify CSS variable values at runtime for a specific theme. This is useful for creating user-customizable themes, implementing dynamic color schemes, or adapting styles based on runtime conditions.

<Info>
  Variable changes are persisted per theme, so switching between themes will preserve the custom values you've set for each one.
</Info>

## When to Use This Method

Use `updateCSSVariables` when you need to:

- Build user-customizable themes (e.g., custom accent colors, spacing preferences)
- Implement dynamic brand theming (e.g., white-label apps)
- Adjust theme colors based on runtime data (e.g., user preferences, A/B testing)
- Create theme editors or design tools within your app
- Adapt colors based on external factors (e.g., time of day, location)

<Tip>
  **For static theme customization**, prefer defining variables directly in your `global.css` file using `@theme` and `@variant` directives.
</Tip>

## Usage

### Basic Example

```tsx theme={null}
import { Uniwind } from 'uniwind';

// Update a single variable for the light theme
Uniwind.updateCSSVariables('light', {
  '--color-primary': '#ff6b6b',
});
```

### Multiple Variables at Once

```tsx theme={null}
import { Uniwind } from 'uniwind';

// Update multiple variables for the dark theme
Uniwind.updateCSSVariables('dark', {
  '--color-primary': '#4ecdc4',
  '--color-secondary': '#ffe66d',
  '--color-background': '#1a1a2e',
  '--spacing': 16,
});
```

### User-Customizable Theme

```tsx theme={null}
import { Uniwind } from 'uniwind';
import { View, Button } from 'react-native';

export const ThemeCustomizer = () => {
  const applyCustomColors = (accentColor: string, backgroundColor: string) => {
    Uniwind.updateCSSVariables(Uniwind.currentTheme, {
      '--color-accent': accentColor,
      '--color-background': backgroundColor,
    });
  };

  return (
    <View className="p-4">
      <Button title="Ocean Theme" onPress={() => applyCustomColors('#0077be', '#e0f7fa')} />
      <Button title="Sunset Theme" onPress={() => applyCustomColors('#ff6b35', '#fff5e6')} />
      <Button title="Forest Theme" onPress={() => applyCustomColors('#2d6a4f', '#d8f3dc')} />
    </View>
  );
};
```

## How It Works

`updateCSSVariables` modifies CSS variables for a specific theme and persists those changes. The variables you update can be:

- **Scoped theme variables**: Variables defined inside `@variant` blocks (e.g., `@variant light { --color-primary: ... }`)
- **Shared variables**: Variables defined in `@theme` that are available across all themes

When you switch themes, your customized values are preserved and applied automatically.

### Variable Persistence

```tsx theme={null}
// Customize the light theme
Uniwind.updateCSSVariables('light', {
  '--color-primary': '#ff6b6b',
});

// Switch to dark theme
Uniwind.setTheme('dark');

// Switch back to light theme
Uniwind.setTheme('light');
// ✅ The custom --color-primary value is still applied
```

## API Reference

### Method Signature

```typescript theme={null}
Uniwind.updateCSSVariables(theme: string, variables: Record<string, string | number>): void
```

### Parameters

<ParamField type="string">
  The name of the theme to update. This should match a theme name defined in your `global.css` file (e.g., `'light'`, `'dark'`, or custom theme names).
</ParamField>

<ParamField type="Record<string, string | number>">
  An object mapping CSS variable names (with `--` prefix) to their new values.

- **Keys**: Must be valid CSS variable names starting with `--` (validated in development mode)
- **Values**: Can be strings (colors, units) or numbers (numeric values like spacing)

```tsx theme={null}
{
  '--color-primary': '#3b82f6',     // String color
  '--spacing': 16,             // Number (converted to px on web)
  '--radius-sm': 8,
}
```

</ParamField>

### Return Value

This method returns `void`. It updates the CSS variables immediately and triggers a re-render if the updated theme is currently active.

## Platform Differences

<Accordion title="Web Platform" icon="globe">
  On web, `updateCSSVariables` applies changes directly to the DOM using `document.documentElement.style.setProperty()`:

- Numeric values are automatically converted to pixel units (e.g., `16` becomes `"16px"`)
- String values are applied as-is
- Changes take effect immediately
- Updates trigger listener notifications if the modified theme is active

```tsx theme={null}
// Web behavior
Uniwind.updateCSSVariables('light', {
  '--spacing': 16, // Applied as "16px"
  '--color-primary': '#3b82f6', // Applied as "#3b82f6"
});
```

</Accordion>

<Accordion title="Native Platform" icon="mobile">
  On React Native, `updateCSSVariables` updates the internal variable store with normalized values:

- Color values are parsed and normalized to hex format using Culori
- Numeric values are stored directly as numbers
- Variables are added as getters to both `UniwindStore.vars` and theme-specific variable objects
- Updates trigger listener notifications if the modified theme is active

```tsx theme={null}
// Native behavior
Uniwind.updateCSSVariables('light', {
  '--spacing': 16, // Stored as 16
  '--color-primary': 'rgb(59, 130, 246)', // Normalized to "#3b82f6"
});
```

</Accordion>

## Important Notes

<Warning>
  CSS variable names must include the `--` prefix. In development mode, Uniwind will validate this and warn you if you forget the prefix.
</Warning>

```tsx theme={null}
// ✅ Correct
Uniwind.updateCSSVariables('light', {
  '--color-primary': '#ff0000',
});

// ❌ Will show a warning in development
Uniwind.updateCSSVariables('light', {
  'color-primary': '#ff0000', // Missing -- prefix
});
```

<Info>
  Updates only trigger component re-renders if the modified theme is currently active. Updating an inactive theme will store the changes but won't cause immediate visual updates.
</Info>

## Making Variables Available

For `updateCSSVariables` to work with a CSS variable, the variable must be defined in your theme. There are two ways to ensure variables are available:

### Option 1: Define in Theme Variants

Define variables inside `@variant` blocks in your `global.css`:

```css global.css theme={null}
@import 'tailwindcss';
@import 'uniwind';

@layer theme {
  :root {
    @variant light {
      --color-primary: #3b82f6;
      --color-background: #ffffff;
    }

    @variant dark {
      --color-primary: #60a5fa;
      --color-background: #1f2937;
    }
  }
}
```

Now you can update these variables at runtime:

```tsx theme={null}
Uniwind.updateCSSVariables('light', {
  '--color-primary': '#ff0000', // ✅ Works
});
```

### Option 2: Define in Shared Theme

Define variables in `@theme` to make them available across all themes:

```css global.css theme={null}
@import 'tailwindcss';
@import 'uniwind';

@theme {
  --color-brand-primary: #3b82f6;
  --color-brand-secondary: #8b5cf6;
  --spacing-custom: 24px;
}
```

These can be updated for any theme:

```tsx theme={null}
Uniwind.updateCSSVariables('light', {
  '--color-brand-primary': '#ff6b6b', // ✅ Works
  '--spacing-custom': 32, // ✅ Works
});
```

## Performance Considerations

<Info>
  `updateCSSVariables` is optimized to only trigger re-renders when necessary. Updates to inactive themes don't cause re-renders.
</Info>

Keep in mind:

- Changes are applied synchronously and take effect immediately
- Only components using the updated variables will re-render (if the theme is active)
- Updating variables frequently (e.g., on every slider drag) is fine, but consider debouncing for very rapid updates
- Variables are stored per theme, so memory usage scales with the number of themes and customized variables

## Related

<CardGroup>
  <Card title="useCSSVariable" icon="code" href="/api/use-css-variable">
    Read CSS variable values in JavaScript
  </Card>

  <Card title="Custom Themes" icon="palette" href="/theming/custom-themes">
    Learn how to create custom themes
  </Card>

  <Card title="Global CSS" icon="css" href="/theming/global-css">
    Define CSS variables in your theme configuration
  </Card>

  <Card title="Theming Basics" icon="palette" href="/theming/basics">
    Understand how themes work in Uniwind
  </Card>
</CardGroup>
