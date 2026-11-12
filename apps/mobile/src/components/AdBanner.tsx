import React from "react";
import { Platform } from "react-native";
import Constants from "expo-constants";
import type { BannerAd as BannerAdType, BannerAdSize as BannerAdSizeType, TestIds as TestIdsType } from "react-native-google-mobile-ads";
import { useEntitlement } from "../context/EntitlementContext";

// AdMob ad unit IDs are created per-platform (an iOS unit ID won't serve
// correctly if used on Android, or vice versa) — this only worked
// unnoticed during testing because Google's shared test banner ID happens
// to be identical on both platforms.
const IOS_BANNER_UNIT_ID = process.env.EXPO_PUBLIC_ADMOB_BANNER_UNIT_ID_IOS;
const ANDROID_BANNER_UNIT_ID = process.env.EXPO_PUBLIC_ADMOB_BANNER_UNIT_ID_ANDROID;

// react-native-google-mobile-ads is a native module outside Expo Go's
// bundled SDK — requiring it crashes Expo Go at launch, so it's deferred
// until render and skipped entirely there (same reasoning as
// services/subscriptions.ts). Use a development build to test real ads.
const isExpoGo = Constants.appOwnership === "expo";

function loadAdsModule(): { BannerAd: typeof BannerAdType; BannerAdSize: typeof BannerAdSizeType; TestIds: typeof TestIdsType } {
  return require("react-native-google-mobile-ads");
}

/** Renders nothing for premium/subscribed users, or when running in Expo Go — mount this once near the bottom of each tab screen. */
export function AdBanner() {
  const { adsEnabled } = useEntitlement();
  if (!adsEnabled || isExpoGo) return null;

  const { BannerAd, BannerAdSize, TestIds } = loadAdsModule();
  const unitId = (Platform.OS === "ios" ? IOS_BANNER_UNIT_ID : ANDROID_BANNER_UNIT_ID) || TestIds.BANNER;
  return <BannerAd unitId={unitId} size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER} />;
}
