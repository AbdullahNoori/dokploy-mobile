const { expo } = require('./app.json');

const iosGoogleServicesFile =
  process.env.GOOGLE_SERVICES_INFO_PLIST ?? './src/config/GoogleService-Info.plist';
const androidGoogleServicesFile =
  process.env.GOOGLE_SERVICES_JSON ?? './src/config/google-services.json';
const plugins = expo.plugins ?? [];
const hasRNFirebaseIOSPlugin = plugins.includes('./plugins/with-rn-firebase-ios');

module.exports = {
  ...expo,
  plugins: hasRNFirebaseIOSPlugin
    ? plugins
    : [...plugins, './plugins/with-rn-firebase-ios'],
  ios: {
    ...expo.ios,
    googleServicesFile: iosGoogleServicesFile,
  },
  android: {
    ...expo.android,
    googleServicesFile: androidGoogleServicesFile,
  },
};
