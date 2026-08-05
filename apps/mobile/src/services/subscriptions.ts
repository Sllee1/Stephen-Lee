import { Platform } from "react-native";
import Purchases, { type CustomerInfo } from "react-native-purchases";
import RevenueCatUI, { PAYWALL_RESULT } from "react-native-purchases-ui";

const IOS_KEY = process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY ?? "";
const ANDROID_KEY = process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY ?? "";

/** Must match the entitlement identifier configured in the RevenueCat dashboard. */
export const PRO_ENTITLEMENT_ID = process.env.EXPO_PUBLIC_REVENUECAT_ENTITLEMENT_ID ?? "Healthapp Pro";

export { PAYWALL_RESULT };

/**
 * RevenueCat wraps StoreKit (iOS) + Play Billing (Android) behind one SDK,
 * and its webhook (apps/backend/src/routes/subscriptions.ts) is what
 * actually flips a user's entitlement server-side — this module just
 * configures the SDK and presents its prebuilt paywall/customer-center UI.
 * `appUserId` must be our backend's userId so the webhook's `app_user_id`
 * matches our DB.
 */
export function configurePurchases(appUserId: string) {
  const apiKey = Platform.OS === "ios" ? IOS_KEY : ANDROID_KEY;
  if (!apiKey) {
    console.warn("[subscriptions] No RevenueCat API key set — skipping SDK configure. Set EXPO_PUBLIC_REVENUECAT_*_KEY.");
    return;
  }
  Purchases.configure({ apiKey, appUserID: appUserId });
}

/** True if the current customer holds the Pro entitlement, per the RevenueCat SDK's local cache. */
export function isProEntitled(customerInfo: CustomerInfo): boolean {
  return customerInfo.entitlements.active[PRO_ENTITLEMENT_ID] != null;
}

export async function getCustomerInfo(): Promise<CustomerInfo | null> {
  try {
    return await Purchases.getCustomerInfo();
  } catch {
    return null;
  }
}

/**
 * Presents RevenueCat's dashboard-configured paywall (the Lifetime/Yearly/
 * Monthly packages of the current offering, with their pricing/copy/layout
 * all managed remotely — no app update needed to change them).
 */
export function presentPaywall(): Promise<PAYWALL_RESULT> {
  return RevenueCatUI.presentPaywall();
}

/** Presents the paywall only if the user doesn't already hold the Pro entitlement. */
export function presentPaywallIfNeeded(): Promise<PAYWALL_RESULT> {
  return RevenueCatUI.presentPaywallIfNeeded({ requiredEntitlementIdentifier: PRO_ENTITLEMENT_ID });
}

/** Presents RevenueCat's Customer Center — self-serve manage/cancel/refund/restore for an already-subscribed user. */
export function presentCustomerCenter(): Promise<void> {
  return RevenueCatUI.presentCustomerCenter();
}
