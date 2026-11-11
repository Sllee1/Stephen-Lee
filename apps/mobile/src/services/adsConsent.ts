import Constants from "expo-constants";
import { Platform } from "react-native";

// Same Expo-Go-safe pattern as AdBanner.tsx / subscriptions.ts — AdMob's UMP
// consent module and expo-tracking-transparency's native ATT prompt are
// both outside Expo Go's bundled SDK, so skip entirely there. A development
// build is needed to actually exercise either.
const isExpoGo = Constants.appOwnership === "expo";

let initialized = false;

/**
 * Must run once, before the first ad request. Order matters:
 *  1. Gather UMP consent (AdMob's Google-rendered form for EEA/UK users
 *     under GDPR — a no-op everywhere else, but required there regardless
 *     of platform).
 *  2. Request Apple's App Tracking Transparency permission (iOS only).
 *     Required by App Store review guideline 5.1.2 since AdMob's
 *     personalized ads use the IDFA — ship without this prompt and Apple
 *     rejects on review. The Google Mobile Ads SDK automatically falls
 *     back to non-personalized ads if this is denied; no extra wiring
 *     needed on this end.
 *  3. Initialize the Google Mobile Ads SDK so it starts up already knowing
 *     the result of both.
 */
export async function initializeAds(): Promise<void> {
  if (initialized || isExpoGo) return;
  initialized = true;

  try {
    const { AdsConsent } = require("react-native-google-mobile-ads") as typeof import("react-native-google-mobile-ads");
    await AdsConsent.gatherConsent();
  } catch (err) {
    console.warn("[adsConsent] UMP consent gathering failed", err);
  }

  if (Platform.OS === "ios") {
    try {
      const { requestTrackingPermissionsAsync } = require("expo-tracking-transparency") as typeof import("expo-tracking-transparency");
      await requestTrackingPermissionsAsync();
    } catch (err) {
      console.warn("[adsConsent] ATT request failed", err);
    }
  }

  try {
    const { default: mobileAds } = require("react-native-google-mobile-ads") as typeof import("react-native-google-mobile-ads");
    await mobileAds().initialize();
  } catch (err) {
    console.warn("[adsConsent] mobileAds().initialize() failed", err);
  }
}
