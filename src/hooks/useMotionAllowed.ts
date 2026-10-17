import { useIsFocused } from 'expo-router';
import { useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';

export function useMotionAllowed() {
  const focused = useIsFocused();
  const reduced = useReducedMotion();
  const [active, setActive] = useState(AppState.currentState === 'active');

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      setActive(state === 'active');
    });
    return () => sub.remove();
  }, []);

  return focused && active && !reduced;
}
