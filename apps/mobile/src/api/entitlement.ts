import { api } from "./client";

export interface EntitlementResponse {
  tier: "free" | "premium";
  adsEnabled: boolean;
  expiresAt: string | null;
}

export function getEntitlement() {
  return api<EntitlementResponse>("/entitlement");
}

export function registerPushToken(token: string, platform: "ios" | "android") {
  return api<void>("/push/register", { method: "POST", body: JSON.stringify({ token, platform }) });
}
