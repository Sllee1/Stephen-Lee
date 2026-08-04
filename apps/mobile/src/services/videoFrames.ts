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

// Used when the picker doesn't report a duration at all (see below) — native
// thumbnail generation clamps to a video's last frame when asked for a time
// past its end, so requesting fixed offsets works fine for typical short
// clips even without knowing the real length up front.
const FALLBACK_TIMESTAMPS_SEC = [0.5, 2, 4, 6, 9, 12];

/**
 * The prototype extracted frames with an offscreen <video>/<canvas> pair —
 * RN has no DOM, so this uses expo-video-thumbnails (native
 * AVAssetImageGenerator / MediaMetadataRetriever under the hood) to grab a
 * still at each timestamp instead. Same idea — evenly-spaced JPEG frames
 * read as a chronological sequence — different mechanism.
 *
 * `durationMs` is nullable because `ImagePickerAsset.duration` isn't
 * reliably populated across pickers/platforms (notably Android's media
 * library picker frequently returns null) — treating that as a hard error
 * blocked the feature for a lot of real videos, so this falls back to fixed
 * timestamps instead of failing outright, and skips any individual
 * timestamp that fails rather than aborting the whole extraction.
 */
export async function extractVideoFrames(uri: string, durationMs: number | null, maxFrames = 6): Promise<ExtractFramesResult> {
  let timestampsSec: number[];
  let cappedAt: number | null = null;

  if (durationMs && isFinite(durationMs) && durationMs > 0) {
    const fullDurationSec = durationMs / 1000;
    const durationSec = Math.min(fullDurationSec, MAX_DURATION_SEC);
    const count = Math.max(3, Math.min(maxFrames, Math.ceil(durationSec)));
    timestampsSec = Array.from({ length: count }, (_, i) => (durationSec * (i + 0.5)) / count);
    cappedAt = fullDurationSec > MAX_DURATION_SEC ? MAX_DURATION_SEC : null;
  } else {
    timestampsSec = FALLBACK_TIMESTAMPS_SEC.slice(0, maxFrames);
  }

  const frames: ExtractedFrame[] = [];
  for (const timeSec of timestampsSec) {
    try {
      const { uri: thumbUri } = await VideoThumbnails.getThumbnailAsync(uri, { time: timeSec * 1000, quality: 0.6 });
      const imageBase64 = await FileSystem.readAsStringAsync(thumbUri, { encoding: FileSystem.EncodingType.Base64 });
      frames.push({ time: timeSec, imageBase64, thumbUri });
    } catch {
      // Past the end of a short clip, or a transient decode failure for
      // this one timestamp — skip it rather than failing the whole thing.
    }
  }

  if (frames.length === 0) {
    throw new Error("Couldn't read any frames from that video — try a different clip or format (MP4/H.264 is safest).");
  }

  return { frames, cappedAt };
}
