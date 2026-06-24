const { expo } = require('./app.json');

const iosGoogleServicesFile =
  process.env.GOOGLE_SERVICES_INFO_PLIST ?? './src/config/GoogleService-Info.plist';
const androidGoogleServicesFile =
  process.env.GOOGLE_SERVICES_JSON ?? './src/config/google-services.json';
const plugins = expo.plugins ?? [];
const hasRNFirebaseIOSPlugin = plugins.includes('./plugins/with-rn-firebase-ios');
const hasAndroidNdkVersionPlugin = plugins.includes('./plugins/with-android-ndk-version');
const hasFmtConstevalFixPlugin = plugins.includes('./plugins/with-fmt-consteval-fix');
const hasIosSdkrootAutoPlugin = plugins.includes('./plugins/with-ios-sdkroot-auto');

const resolvedPlugins = [
  ...plugins,
  ...(!hasRNFirebaseIOSPlugin ? ['./plugins/with-rn-firebase-ios'] : []),
  ...(!hasAndroidNdkVersionPlugin ? ['./plugins/with-android-ndk-version'] : []),
  ...(!hasFmtConstevalFixPlugin ? ['./plugins/with-fmt-consteval-fix'] : []),
  ...(!hasIosSdkrootAutoPlugin ? ['./plugins/with-ios-sdkroot-auto'] : []),
];

module.exports = {
  ...expo,
  plugins: resolvedPlugins,
  ios: {
    ...expo.ios,
    googleServicesFile: iosGoogleServicesFile,
  },
  android: {
    ...expo.android,
    googleServicesFile: androidGoogleServicesFile,
  },
};
