import { useState, useCallback, useEffect } from 'react';
import { UserProfile } from '../types';

const STORAGE_KEY = 'pg_user_profile';

const DEFAULT_PROFILE: UserProfile = {
  name: '',
  preferred_program: '',
  travel_goal: '',
  max_annual_fee: '',
  home_city: 'Sydney',
};

function loadProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return { ...DEFAULT_PROFILE, ...JSON.parse(raw) };
    }
  } catch {
    // Corrupted data — reset
  }
  return { ...DEFAULT_PROFILE };
}

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile>(loadProfile);

  // Persist on every change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  }, [profile]);

  const updateField = useCallback(<K extends keyof UserProfile>(key: K, value: UserProfile[K]) => {
    setProfile((prev) => ({ ...prev, [key]: value }));
  }, []);

  const hasAnyPreference = profile.name !== '' ||
    profile.preferred_program !== '' ||
    profile.travel_goal !== '' ||
    profile.max_annual_fee !== '' ||
    (profile.home_city !== '' && profile.home_city !== 'Sydney');

  return { profile, updateField, hasAnyPreference };
}
