import Constants from "expo-constants";
import { Platform } from "react-native";
import type PurchasesType from "react-native-purchases";
import type { CustomerInfo } from "react-native-purchases";
import type RevenueCatUIType from "react-native-purchases-ui";

const IOS_KEY = process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY ?? "";
const ANDROID_KEY = process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY ?? "";

/** Must match the entitlement identifier configured in the RevenueCat dashboard. */
export const PRO_ENTITLEMENT_ID = process.env.EXPO_PUBLIC_REVENUECAT_ENTITLEMENT_ID ?? "Healthapp Pro";

// Mirrors @revenuecat/purchases-typescript-internal's PAYWALL_RESULT enum
// verbatim (values only, not re-exported from the package) so this file
// never needs a static import of react-native-purchases-ui — see isExpoGo
// below for why that matters.
export const PAYWALL_RESULT = {
  NOT_PRESENTED: "NOT_PRESENTED",
  ERROR: "ERROR",
  CANCELLED: "CANCELLED",
  PURCHASED: "PURCHASED",
  RESTORED: "RESTORED",
} as const;
export type PAYWALL_RESULT = (typeof PAYWALL_RESULT)[keyof typeof PAYWALL_RESULT];

// react-native-purchases and react-native-purchases-ui are native modules
// outside Expo's SDK, so Expo Go (which only ships Expo's own bundled native
// modules) can't run them — requiring either package crashes the whole app
// at launch, not just the purchase flow, since EntitlementProvider calls
// configurePurchases() from its root-level effect. Every function below
// require()s the SDK lazily and only when not running in Expo Go, so the
// rest of the app stays testable there; RevenueCat features themselves need
// a development build (see README).
const isExpoGo = Constants.appOwnership === "expo";

function warnExpoGo(feature: string) {
  console.warn(`[subscriptions] ${feature} isn't available in Expo Go (react-native-purchases is a native module) — use a development build to test it.`);
}

function loadPurchases(): typeof PurchasesType {
  return require("react-native-purchases").default;
}

function loadRevenueCatUI(): typeof RevenueCatUIType {
  return require("react-native-purchases-ui").default;
}

/**
 * RevenueCat wraps StoreKit (iOS) + Play Billing (Android) behind one SDK,
 * and its webhook (apps/backend/src/routes/subscriptions.ts) is what
 * actually flips a user's entitlement server-side — this module just
 * configures the SDK and presents its prebuilt paywall/customer-center UI.
 * `appUserId` must be our backend's userId so the webhook's `app_user_id`
 * matches our DB.
 */
export function configurePurchases(appUserId: string) {
  if (isExpoGo) return warnExpoGo("configurePurchases");
  const apiKey = Platform.OS === "ios" ? IOS_KEY : ANDROID_KEY;
  if (!apiKey) {
    console.warn("[subscriptions] No RevenueCat API key set — skipping SDK configure. Set EXPO_PUBLIC_REVENUECAT_*_KEY.");
    return;
  }
  loadPurchases().configure({ apiKey, appUserID: appUserId });
}

/** True if the current customer holds the Pro entitlement, per the RevenueCat SDK's local cache. */
export function isProEntitled(customerInfo: CustomerInfo): boolean {
  return customerInfo.entitlements.active[PRO_ENTITLEMENT_ID] != null;
}

export async function getCustomerInfo(): Promise<CustomerInfo | null> {
  if (isExpoGo) return null;
  try {
    return await loadPurchases().getCustomerInfo();
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
  if (isExpoGo) {
    warnExpoGo("presentPaywall");
    return Promise.resolve(PAYWALL_RESULT.NOT_PRESENTED);
  }
  return loadRevenueCatUI().presentPaywall();
}

/** Presents the paywall only if the user doesn't already hold the Pro entitlement. */
export function presentPaywallIfNeeded(): Promise<PAYWALL_RESULT> {
  if (isExpoGo) {
    warnExpoGo("presentPaywallIfNeeded");
    return Promise.resolve(PAYWALL_RESULT.NOT_PRESENTED);
  }
  return loadRevenueCatUI().presentPaywallIfNeeded({ requiredEntitlementIdentifier: PRO_ENTITLEMENT_ID });
}

/** Presents RevenueCat's Customer Center — self-serve manage/cancel/refund/restore for an already-subscribed user. */
export function presentCustomerCenter(): Promise<void> {
  if (isExpoGo) {
    warnExpoGo("presentCustomerCenter");
    return Promise.resolve();
  }
  return loadRevenueCatUI().presentCustomerCenter();
}
