import { useCallback, useEffect, useState } from "react";
import type { Profile } from "@nutrition-app/shared";
import { getProfile, saveProfile } from "../api/profile";
import { ApiError } from "../api/client";

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getProfile();
      setProfile(result);
      setNeedsOnboarding(false);

      // The backend's reminder cron matches a scheduled HH:MM against this
      // timezone, not the server's own — self-heal it here (covers profiles
      // created before this field existed, defaulted to "UTC", and users
      // who've since traveled) rather than only setting it once at onboarding.
      const deviceTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (deviceTz && result.timezone !== deviceTz) {
        saveProfile({ timezone: deviceTz }).catch(() => {
          /* non-fatal — reminders just keep using the previous value */
        });
      }
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        setNeedsOnboarding(true);
        setProfile(null);
      } else {
        // Leaving `profile` null with no `error` set is indistinguishable
        // from still loading, since screens gate on `loading || !profile` —
        // that stuck every profile-dependent screen on its spinner forever
        // whenever this request failed (e.g. a timed-out cold start).
        setProfile(null);
        setError(err instanceof ApiError ? err.message : "Couldn't load your profile — try again.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { profile, loading, needsOnboarding, error, refetch };
}
