import React from "react";
import Constants from "expo-constants";
import type { BannerAd as BannerAdType, BannerAdSize as BannerAdSizeType, TestIds as TestIdsType } from "react-native-google-mobile-ads";
import { useEntitlement } from "../context/EntitlementContext";

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
  const unitId = process.env.EXPO_PUBLIC_ADMOB_BANNER_UNIT_ID || TestIds.BANNER;
  return <BannerAd unitId={unitId} size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER} />;
}
