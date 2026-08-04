import type { Profile } from "@nutrition-app/shared";
import { api } from "./client";

export function getProfile() {
  return api<Profile>("/profile");
}

export function saveProfile(patch: Partial<Profile>) {
  return api<Profile>("/profile", { method: "PUT", body: JSON.stringify(patch) });
}
