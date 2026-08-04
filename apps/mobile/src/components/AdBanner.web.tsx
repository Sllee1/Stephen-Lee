/**
 * `react-native-google-mobile-ads` has no web build at all, so this
 * platform-specific file (Metro resolves `.web.tsx` over `.tsx` when
 * bundling for web) keeps the web target buildable rather than failing to
 * resolve the native module. No ad network serves web banners in this app
 * anyway — ads are a mobile-only monetization path.
 */
export function AdBanner() {
  return null;
}
