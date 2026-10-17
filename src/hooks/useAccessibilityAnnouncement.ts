import { useIsFocused } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, AppState, Platform } from 'react-native';

/** Stack screens stay mounted. Only the focused, foreground screen may speak. */
export function useScreenActive() {
  const focused = useIsFocused();
  const [foreground, setForeground] = useState(AppState.currentState === 'active');
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => setForeground(state === 'active'));
    return () => subscription.remove();
  }, []);
  return focused && foreground;
}

/** Android uses live regions; iOS needs explicit speech. Consume hidden transitions too,
 * so returning to a screen never replays completed background work. */
export function useAccessibilityAnnouncement(message: string | null, announceOnMount = false) {
  const active = useScreenActive();
  const previous = useRef(announceOnMount ? null : message);
  useEffect(() => {
    const changed = previous.current !== message;
    previous.current = message;
    if (changed && message && active && AppState.currentState === 'active' && Platform.OS === 'ios') {
      AccessibilityInfo.announceForAccessibilityWithOptions(message, { queue: true });
    }
  }, [active, message]);
  return active;
}
