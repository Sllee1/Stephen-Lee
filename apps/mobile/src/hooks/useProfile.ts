import { useCallback, useEffect, useState } from "react";
import type { Profile } from "@nutrition-app/shared";
import { getProfile } from "../api/profile";
import { ApiError } from "../api/client";

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getProfile();
      setProfile(result);
      setNeedsOnboarding(false);
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        setNeedsOnboarding(true);
        setProfile(null);
      } else {
        throw err;
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { profile, loading, needsOnboarding, refetch };
}
