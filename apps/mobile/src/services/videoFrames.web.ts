export interface ExtractedFrame {
  time: number;
  imageBase64: string;
  thumbUri: string;
}

export interface ExtractFramesResult {
  frames: ExtractedFrame[];
  cappedAt: number | null;
}

/**
 * `expo-video-thumbnails` has no web build, so this platform-specific file
 * (Metro resolves `.web.ts` over `.ts` when bundling for web) keeps the web
 * target buildable instead of failing to resolve the native module. The
 * technique-check feature depends on native frame extraction and genuinely
 * doesn't have a web equivalent — TechniqueCheckSection's own video-picker
 * flow is what surfaces this to the user, not a bundling failure.
 */
export async function extractVideoFrames(): Promise<ExtractFramesResult> {
  throw new Error("Technique check isn't available on web — try this from the mobile app.");
}
