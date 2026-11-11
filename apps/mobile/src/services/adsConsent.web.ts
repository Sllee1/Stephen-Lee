/**
 * Neither `react-native-google-mobile-ads` nor `expo-tracking-transparency`
 * ship a web build (same reasoning as subscriptions.web.ts / AdBanner.web.tsx)
 * — there's no ad SDK or ATT prompt to initialize on web.
 */
export async function initializeAds(): Promise<void> {}
