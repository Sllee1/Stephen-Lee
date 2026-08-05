import type { CustomerInfo } from "react-native-purchases";

/**
 * Neither `react-native-purchases` nor `react-native-purchases-ui` ship a
 * web build, so this platform-specific file (Metro resolves `.web.ts` over
 * `.ts` when bundling for web) keeps the web target buildable rather than
 * failing to resolve the native module. In-app purchases are a mobile-only
 * monetization path — there's no App Store/Play Store equivalent on web.
 */
export const PRO_ENTITLEMENT_ID = process.env.EXPO_PUBLIC_REVENUECAT_ENTITLEMENT_ID ?? "Healthapp Pro";

export enum PAYWALL_RESULT {
  NOT_PRESENTED = "NOT_PRESENTED",
  ERROR = "ERROR",
  CANCELLED = "CANCELLED",
  PURCHASED = "PURCHASED",
  RESTORED = "RESTORED",
}

export function configurePurchases(_appUserId: string) {}

export function isProEntitled(_customerInfo: CustomerInfo): boolean {
  return false;
}

export async function getCustomerInfo(): Promise<CustomerInfo | null> {
  return null;
}

export async function presentPaywall(): Promise<PAYWALL_RESULT> {
  return PAYWALL_RESULT.NOT_PRESENTED;
}

export async function presentPaywallIfNeeded(): Promise<PAYWALL_RESULT> {
  return PAYWALL_RESULT.NOT_PRESENTED;
}

export async function presentCustomerCenter(): Promise<void> {}
