/**
 * Leaving a screen during critical work (system back, swipe, Android back) first cancels
 * that work, then lets the navigation continue — so nothing keeps running for a screen the
 * person already left, and no late result lands somewhere else.
 */
import { usePreventRemove } from 'expo-router';
import { useEffect, useRef } from 'react';

export function useCancelOnLeave(busy: boolean, cancel: () => void) {
  const pending = useRef<(() => void) | null>(null);

  usePreventRemove(busy, ({ repeat }) => {
    pending.current = repeat;
    cancel();
  });

  // `repeat` only works once prevention is off, i.e. after the cancel reached the state.
  useEffect(() => {
    if (busy || !pending.current) return;
    const repeat = pending.current;
    pending.current = null;
    repeat();
  }, [busy]);
}
