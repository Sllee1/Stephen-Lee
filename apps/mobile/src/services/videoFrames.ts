import * as VideoThumbnails from "expo-video-thumbnails";
import * as FileSystem from "expo-file-system";

export interface ExtractedFrame {
  time: number; // seconds
  imageBase64: string;
  thumbUri: string; // local file:// uri, handy for an on-screen preview
}

export interface ExtractFramesResult {
  frames: ExtractedFrame[];
  cappedAt: number | null; // seconds, set if the clip was longer than the cap
}

const MAX_DURATION_SEC = 60;

/**
 * The prototype extracted frames with an offscreen <video>/<canvas> pair —
 * RN has no DOM, so this uses expo-video-thumbnails (native
 * AVAssetImageGenerator / MediaMetadataRetriever under the hood) to grab a
 * still at each timestamp instead. Same idea — evenly-spaced JPEG frames
 * read as a chronological sequence — different mechanism.
 */
export async function extractVideoFrames(uri: string, durationMs: number, maxFrames = 6): Promise<ExtractFramesResult> {
  const fullDurationSec = durationMs / 1000;
  const durationSec = Math.min(fullDurationSec, MAX_DURATION_SEC);
  if (!durationSec || !isFinite(durationSec) || durationSec <= 0) {
    throw new Error("Couldn't read that video's length.");
  }

  const count = Math.max(3, Math.min(maxFrames, Math.ceil(durationSec)));
  const frames: ExtractedFrame[] = [];

  for (let i = 0; i < count; i++) {
    const timeSec = (durationSec * (i + 0.5)) / count;
    const { uri: thumbUri } = await VideoThumbnails.getThumbnailAsync(uri, { time: timeSec * 1000, quality: 0.6 });
    const imageBase64 = await FileSystem.readAsStringAsync(thumbUri, { encoding: FileSystem.EncodingType.Base64 });
    frames.push({ time: timeSec, imageBase64, thumbUri });
  }

  return { frames, cappedAt: fullDurationSec > MAX_DURATION_SEC ? MAX_DURATION_SEC : null };
}
