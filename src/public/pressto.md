Title: GitHub - enzomanuelmangano/pressto: Your React Native app deserves better tap interactions.

URL Source: https://github.com/enzomanuelmangano/pressto

Markdown Content:
Pressto 🔥
----------

[](https://github.com/enzomanuelmangano/pressto#pressto-)

pressto.mp4

**Replace TouchableOpacity with animated pressables that run on the main thread.**

Built on [react-native-gesture-handler](https://docs.swmansion.com/react-native-gesture-handler/) and [react-native-reanimated](https://docs.swmansion.com/react-native-reanimated/) for 60fps animations.

Installation
------------

[](https://github.com/enzomanuelmangano/pressto#installation)

bun add pressto react-native-reanimated react-native-gesture-handler react-native-worklets

Quickstart
----------

[](https://github.com/enzomanuelmangano/pressto#quickstart)

import { PressableScale } from 'pressto';

function App() {
  return (
    <PressableScale onPress={() => console.log('pressed')}>
      <Text>Press me</Text>
    </PressableScale>
  );
}

**That's it.** Your pressable now scales smoothly on press with main-thread animations.

* * *

Basic Usage
-----------

[](https://github.com/enzomanuelmangano/pressto#basic-usage)
### Pre-built Components

[](https://github.com/enzomanuelmangano/pressto#pre-built-components)
Pressto comes with two ready-to-use components:

**PressableScale** - Scales down when pressed

import { PressableScale } from 'pressto';

<PressableScale onPress={() => alert('Pressed!')}>
  <Text>Scale Animation</Text>
</PressableScale>;

**PressableOpacity** - Fades when pressed

import { PressableOpacity } from 'pressto';

<PressableOpacity onPress={() => alert('Pressed!')}>
  <Text>Opacity Animation</Text>
</PressableOpacity>;

Both components accept all standard React Native Pressable props (`onPress`, `onPressIn`, `onPressOut`, `style`, etc.).

* * *

Custom Animations
-----------------

[](https://github.com/enzomanuelmangano/pressto#custom-animations)
### Create Your Own Pressable

[](https://github.com/enzomanuelmangano/pressto#create-your-own-pressable)
Use `createAnimatedPressable` to create custom animations:

import { createAnimatedPressable } from 'pressto';

const PressableRotate = createAnimatedPressable((progress) => {
  'worklet';
  return {
    transform: [{ rotate: `${progress * 45}deg` }],
  };
});

// Use it like any other pressable
<PressableRotate onPress={() => console.log('rotated!')}>
  <Text>Rotate Me</Text>
</PressableRotate>;

**The `progress` parameter** goes from `0` (idle) to `1` (pressed), allowing you to interpolate any style property.

> **⚠️ Important:** The `'worklet';` directive is **required** at the start of your animation function. Without it, animations won't run on the UI thread.
> 
> 
> **Tip:** Install [eslint-plugin-pressto](https://github.com/enzomanuelmangano/pressto/tree/main/eslint-plugin-pressto) to catch missing `'worklet'` directives at development time.

* * *

Configuration
-------------

[](https://github.com/enzomanuelmangano/pressto#configuration)
Use `PressablesConfig` to customize animation behavior for all pressables in your app:

import { PressablesConfig, PressableScale } from 'pressto';

function App() {
  return (
    <PressablesConfig
      animationType="spring"
      animationConfig={{ damping: 30, stiffness: 200 }}
      config={{ minScale: 0.9, activeOpacity: 0.6 }}
    >
      <PressableScale onPress={() => console.log('pressed')}>
        <Text>Now with spring animation!</Text>
      </PressableScale>
    </PressablesConfig>
  );
}

**Options:**

*   `animationType`: `'timing'` or `'spring'` (default: `'timing'`)
*   `animationConfig`: Pass timing or spring configuration
*   `config`: Set default values for `minScale`, `activeOpacity`, `baseScale`

### Global Handlers

[](https://github.com/enzomanuelmangano/pressto#global-handlers)
Add global handlers like haptic feedback:

import { PressablesConfig } from 'pressto';
import * as Haptics from 'expo-haptics';

function App() {
  return (
    <PressablesConfig
      globalHandlers={{
        onPress: () => {
          Haptics.selectionAsync();
        },
      }}
    >
      {/* All pressables will trigger haptics */}
      <YourApp />
    </PressablesConfig>
  );
}

* * *

Advanced Features
-----------------

[](https://github.com/enzomanuelmangano/pressto#advanced-features)
### Interaction States

[](https://github.com/enzomanuelmangano/pressto#interaction-states)
Access advanced state in your custom pressables:

const ToggleButton = createAnimatedPressable((progress, options) => {
  'worklet';

  const { isPressed, isToggled, isSelected } = options;
  // isPressed: true while actively pressing
  // isToggled: toggles on each press (persistent)
  // isSelected: true for last pressed item in a group

  return {
    backgroundColor: isToggled ? '#4CAF50' : '#2196F3',
    opacity: isPressed ? 0.8 : 1,
    borderWidth: isSelected ? 3 : 0,
  };
});

### Theme Metadata

[](https://github.com/enzomanuelmangano/pressto#theme-metadata)
Pass your design system into worklets with type safety:

const theme = {
  colors: { primary: '#6366F1' },
  spacing: { medium: 16 },
};

type Theme = typeof theme;

const ThemedButton = createAnimatedPressable<Theme>((progress, { metadata }) => {
  'worklet';
  return {
    backgroundColor: metadata.colors.primary,
    padding: metadata.spacing.medium,
  };
});

<PressablesConfig metadata={theme}>
  <ThemedButton onPress={() => {}} />
</PressablesConfig>

### Web Hover Support

[](https://github.com/enzomanuelmangano/pressto#web-hover-support)
Activate animations on hover (web only):

// Per component
<PressableScale activateOnHover onPress={() => {}}>
  <Text>Hover me!</Text>
</PressableScale>

// Or globally
<PressablesConfig activateOnHover>
  <YourApp />
</PressablesConfig>

### Avoid highlight flicker effect in Scrollable List

[](https://github.com/enzomanuelmangano/pressto#avoid-highlight-flicker-effect-in-scrollable-list)
Since pressto is built on top of the BaseButton from react-native-gesture-handler, it handles tap conflict detection automatically when used with a FlatList imported from react-native-gesture-handler.

import { FlatList } from 'react-native-gesture-handler';
import { PressableScale } from 'pressto';

function App() {
  return (
    <FlatList
      data={data}
      renderItem={({ item }) => (
        <PressableScale onPress={() => console.log(item)}>
          <Text>{item.title}</Text>
        </PressableScale>
      )}
    />
  );
}

You can also use whatever Scrollable component you want, as long as it supports the renderScrollComponent prop.

import { WhateverList } from 'your-favorite-list-package'
import { ScrollView } from 'react-native-gesture-handler';
import { PressableScale } from 'pressto';

function App() {
  return (
    <WhateverList
      data={data}
      renderItem={({ item }) => (
        <PressableScale onPress={() => console.log(item)}>
          <Text>{item.title}</Text>
        </PressableScale>
      )}
      renderScrollComponent={(props) => <ScrollView {...props} />}
    />
  );
}

* * *

API Reference
-------------

[](https://github.com/enzomanuelmangano/pressto#api-reference)
### `createAnimatedPressable<TMetadata>(animatedStyle)`

[](https://github.com/enzomanuelmangano/pressto#createanimatedpressabletmetadataanimatedstyle)
Creates a custom animated pressable.

**Parameters:**

*   `animatedStyle`: Function that returns animated styles 
    *   `progress`: number (0-1) - Animation progress
    *   `options.isPressed`: boolean - Currently being pressed
    *   `options.isToggled`: boolean - Toggle state (persistent)
    *   `options.isSelected`: boolean - Selected in group
    *   `options.metadata`: TMetadata - Custom theme data
    *   `options.config`: PressableConfig - Default values (minScale, activeOpacity, baseScale)

### `PressablesConfig`

[](https://github.com/enzomanuelmangano/pressto#pressablesconfig)
Global configuration provider.

**Props:**

*   `animationType`: 'timing' | 'spring' - Default: 'timing'
*   `animationConfig`: Timing/spring config object
*   `config`: { activeOpacity, minScale, baseScale }
*   `globalHandlers`: { onPress, onPressIn, onPressOut }
*   `metadata`: Custom theme/config (type-safe)
*   `activateOnHover`: boolean - Web only

### `PressableConfig`

[](https://github.com/enzomanuelmangano/pressto#pressableconfig)
Default animation values:

{
  activeOpacity: 0.5,   // PressableOpacity target
  minScale: 0.96,       // PressableScale target
  baseScale: 1          // PressableScale idle scale
}

* * *

Migration Guide
---------------

[](https://github.com/enzomanuelmangano/pressto#migration-guide)
### v0.5.1 → v0.6.0

[](https://github.com/enzomanuelmangano/pressto#v051--v060)
`PressablesConfig` prop renamed: `config` → `animationConfig`

<PressablesConfig
- config={{ damping: 30, stiffness: 200 }}
+ animationConfig={{ damping: 30, stiffness: 200 }}
>

### v0.3.x → v0.5.x

[](https://github.com/enzomanuelmangano/pressto#v03x--v05x)
`progress` is now a plain `number` instead of `SharedValue<number>`:

- opacity: progress.get() * 0.5,
+ opacity: progress * 0.5,

* * *

Contributing
------------

[](https://github.com/enzomanuelmangano/pressto#contributing)
See [CONTRIBUTING.md](https://github.com/enzomanuelmangano/pressto/blob/main/CONTRIBUTING.md)

License
-------

[](https://github.com/enzomanuelmangano/pressto#license)
MIT

* * *

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)
