import type {
  AnalyzeBuildPhotoResponse,
  AnalyzeFoodPhotoResponse,
  AnalyzeTechniqueVideoRequest,
  AnalyzeTechniqueVideoResponse,
  LookupFoodResponse,
} from "@nutrition-app/shared";
import { api } from "./client";

export function analyzeFoodPhoto(imageBase64: string) {
  return api<AnalyzeFoodPhotoResponse>("/ai/analyze-food-photo", { method: "POST", body: JSON.stringify({ imageBase64 }) });
}

export function analyzeBuildPhoto(imageBase64: string, thumbUrl: string) {
  return api<AnalyzeBuildPhotoResponse>("/ai/analyze-build-photo", { method: "POST", body: JSON.stringify({ imageBase64, thumbUrl }) });
}

export function lookupFoodByName(name: string, servingHint?: string) {
  return api<LookupFoodResponse>("/ai/lookup-food", { method: "POST", body: JSON.stringify({ name, servingHint }) });
}

export function analyzeTechniqueVideo(input: AnalyzeTechniqueVideoRequest) {
  return api<AnalyzeTechniqueVideoResponse>("/ai/analyze-technique-video", { method: "POST", body: JSON.stringify(input) });
}
