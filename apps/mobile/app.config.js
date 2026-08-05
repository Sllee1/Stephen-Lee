// Expo merges app.json's "expo" object in as the `config` argument here, so
// app.json stays the source of truth for everything static — this file only
// adds what app.json can't express: an env-driven plugin config. (The
// AdMob *App ID* is a native, build-time value read by the
// react-native-google-mobile-ads config plugin at `expo prebuild`, unlike
// EXPO_PUBLIC_ADMOB_BANNER_UNIT_ID in .env, which is a runtime JS value the
// ad *unit* ID reads from — see src/components/AdBanner.tsx.)
//
// Google's official test App IDs are the fallback, mirroring the existing
// EXPO_PUBLIC_ADMOB_BANNER_UNIT_ID default-to-test-ID pattern in .env.example.
const TEST_IOS_APP_ID = "ca-app-pub-3940256099942544~1458002511";
const TEST_ANDROID_APP_ID = "ca-app-pub-3940256099942544~3347511713";

/** @type {import('expo/config').ConfigContext} */
module.exports = ({ config }) => ({
  ...config,
  plugins: [
    ...(config.plugins ?? []),
    [
      "react-native-google-mobile-ads",
      {
        iosAppId: process.env.ADMOB_IOS_APP_ID || TEST_IOS_APP_ID,
        androidAppId: process.env.ADMOB_ANDROID_APP_ID || TEST_ANDROID_APP_ID,
      },
    ],
  ],
});
