const { withProjectBuildGradle } = require('expo/config-plugins');

const NDK_VERSION_BLOCK = `
// Keep native modules on the Expo/React Native NDK version. Some modules can
// otherwise fall back to an incomplete local side-by-side NDK installation.
subprojects { subproject ->
  subproject.plugins.withId("com.android.library") {
    subproject.android.ndkVersion = rootProject.ext.ndkVersion
  }
  subproject.plugins.withId("com.android.application") {
    subproject.android.ndkVersion = rootProject.ext.ndkVersion
  }
}
`;

function withAndroidNdkVersion(config) {
  return withProjectBuildGradle(config, (mod) => {
    const src = mod.modResults.contents;

    if (!src.includes('Keep native modules on the Expo/React Native NDK version')) {
      mod.modResults.contents = `${src.trimEnd()}\n${NDK_VERSION_BLOCK}`;
    }

    return mod;
  });
}

module.exports = withAndroidNdkVersion;
