const { withPodfile, withPodfileProperties } = require('expo/config-plugins');

function withRNFirebaseIOS(config) {
  config = withPodfileProperties(config, (mod) => {
    mod.modResults['ios.useFrameworks'] = 'static';
    return mod;
  });

  config = withPodfile(config, (mod) => {
    const src = mod.modResults.contents;
    const marker = '$RNFirebaseAsStaticFramework = true';

    if (!src.includes(marker)) {
      mod.modResults.contents = src.replace(
        /use_frameworks!\s*:linkage\s*=>\s*podfile_properties\['ios\.useFrameworks'\]\.to_sym if podfile_properties\['ios\.useFrameworks'\]/,
        (match) => `${match}\n  ${marker}`
      );
    }

    return mod;
  });

  return config;
}

module.exports = withRNFirebaseIOS;
