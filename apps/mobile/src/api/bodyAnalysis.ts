import type { AnalyzeBuildPhotoResponse } from "@nutrition-app/shared";
import { api, ApiError } from "./client";

export type SavedBodyAnalysis = AnalyzeBuildPhotoResponse & { thumbUrl: string };

/** Null if the user has never submitted a build photo — not an error case. */
export async function getBodyAnalysis(): Promise<SavedBodyAnalysis | null> {
  try {
    return await api<SavedBodyAnalysis>("/body-analysis");
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  }
}

export function deleteBodyAnalysis() {
  return api<void>("/body-analysis", { method: "DELETE" });
}
