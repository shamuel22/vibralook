/**
 * Remembers whether this device already saw the intro. A per-device convenience only:
 * if storage fails, the intro simply shows again — the app never blocks on it.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

const KEY = 'vibralook.onboarding.seen.v1';

interface OnboardingValue {
  loaded: boolean;
  seen: boolean;
  markSeen: () => void;
}

const OnboardingContext = createContext<OnboardingValue | null>(null);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [loaded, setLoaded] = useState(false);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((v) => setSeen(v === '1'))
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  const markSeen = useCallback(() => {
    setSeen(true);
    AsyncStorage.setItem(KEY, '1').catch(() => {});
  }, []);

  const value = useMemo(() => ({ loaded, seen, markSeen }), [loaded, seen, markSeen]);
  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>;
}

export function useOnboarding(): OnboardingValue {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error('useOnboarding must be used inside <OnboardingProvider>');
  return ctx;
}
