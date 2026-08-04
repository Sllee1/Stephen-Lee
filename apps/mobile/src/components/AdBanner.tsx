import React from "react";
import { BannerAd, BannerAdSize, TestIds } from "react-native-google-mobile-ads";
import { useEntitlement } from "../context/EntitlementContext";

const unitId = process.env.EXPO_PUBLIC_ADMOB_BANNER_UNIT_ID || TestIds.BANNER;

/** Renders nothing for premium/subscribed users — mount this once near the bottom of each tab screen. */
export function AdBanner() {
  const { adsEnabled } = useEntitlement();
  if (!adsEnabled) return null;
  return <BannerAd unitId={unitId} size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER} />;
}
