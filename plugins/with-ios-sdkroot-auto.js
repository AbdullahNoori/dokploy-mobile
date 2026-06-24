const { withXcodeProject } = require('expo/config-plugins');

function withIosSdkrootAuto(config) {
  return withXcodeProject(config, (mod) => {
    const project = mod.modResults;
    const configurations = project.pbxXCBuildConfigurationSection();

    for (const key of Object.keys(configurations)) {
      const configuration = configurations[key];

      if (
        !configuration ||
        typeof configuration !== 'object' ||
        !configuration.buildSettings
      ) {
        continue;
      }

      configuration.buildSettings.SDKROOT = 'iphoneos';
    }

    return mod;
  });
}

module.exports = withIosSdkrootAuto;
