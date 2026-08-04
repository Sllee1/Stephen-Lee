import { Platform } from "react-native";
import Purchases, { type CustomerInfo } from "react-native-purchases";

const IOS_KEY = process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY ?? "";
const ANDROID_KEY = process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY ?? "";

/**
 * RevenueCat wraps StoreKit (iOS) + Play Billing (Android) behind one SDK,
 * and its webhook (apps/backend/src/routes/subscriptions.ts) is what
 * actually flips a user's entitlement server-side — this module just
 * configures the SDK and exposes purchase/restore. `appUserId` must be our
 * backend's userId so the webhook's `app_user_id` matches our DB.
 */
export function configurePurchases(appUserId: string) {
  const apiKey = Platform.OS === "ios" ? IOS_KEY : ANDROID_KEY;
  if (!apiKey) {
    console.warn("[subscriptions] No RevenueCat API key set — skipping SDK configure. Set EXPO_PUBLIC_REVENUECAT_*_KEY.");
    return;
  }
  Purchases.configure({ apiKey, appUserID: appUserId });
}

export async function getOfferings() {
  const offerings = await Purchases.getOfferings();
  return offerings.current;
}

export async function purchasePackage(pkg: Parameters<typeof Purchases.purchasePackage>[0]): Promise<CustomerInfo> {
  const { customerInfo } = await Purchases.purchasePackage(pkg);
  return customerInfo;
}

export async function restorePurchases(): Promise<CustomerInfo> {
  return Purchases.restorePurchases();
}
