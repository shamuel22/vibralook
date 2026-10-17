/**
 * RibbonAccent (DESIGN §2, §5, §6): translucent brand-gradient bands behind content.
 * Decorative only (hidden from screen readers), one per screen, away from reading areas.
 * Motion: slow 6px drift on an 8s cycle, UI thread, transform + opacity only.
 * Paused when reduced motion is on, the app is backgrounded, or the screen loses focus.
 *
 * These simple bands are allowed in code; the watercolor ribbon artwork
 * (`vl_cintas_pie_v01`) can replace them once delivered.
 */
import { useIsFocused } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { AppState, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { colors, motion, ribbon } from '@/theme';

export interface RibbonAccentProps {
  /** Where the bands sit; the component fills its parent edge-to-edge. */
  placement?: 'bottom' | 'top';
  height?: number;
  style?: StyleProp<ViewStyle>;
}

function useAppActive(): boolean {
  const [active, setActive] = useState(AppState.currentState === 'active');
  useEffect(() => {
    const sub = AppState.addEventListener('change', (s) => setActive(s === 'active'));
    return () => sub.remove();
  }, []);
  return active;
}

export function RibbonAccent({ placement = 'bottom', height = 140, style }: RibbonAccentProps) {
  const reduceMotion = useReducedMotion();
  const focused = useIsFocused();
  const appActive = useAppActive();
  const drift = useSharedValue(0);
  const animate = !reduceMotion && focused && appActive;

  useEffect(() => {
    if (animate) {
      drift.set(
        withRepeat(withTiming(1, { duration: motion.ribbonCycle / 2, easing: Easing.inOut(Easing.sin) }), -1, true),
      );
    } else {
      cancelAnimation(drift);
    }
    return () => cancelAnimation(drift);
  }, [animate, drift]);

  const a = useAnimatedStyle(() => ({
    transform: [{ translateX: -6 + drift.get() * 12 }, { rotate: '-9deg' }],
    opacity: 0.34 + drift.get() * 0.08,
  }));
  const b = useAnimatedStyle(() => ({
    transform: [{ translateX: 5 - drift.get() * 10 }, { rotate: '5deg' }],
    opacity: 0.46 - drift.get() * 0.08,
  }));
  const c = useAnimatedStyle(() => ({
    transform: [{ translateX: -3 + drift.get() * 6 }, { rotate: '-3deg' }],
    opacity: 0.3 + drift.get() * 0.06,
  }));

  return (
    <View
      pointerEvents="none"
      accessible={false}
      importantForAccessibility="no-hide-descendants"
      style={[styles.wrap, placement === 'bottom' ? styles.bottom : styles.top, { height }, style]}
    >
      <Animated.View style={[styles.band, { height: height * 0.42, bottom: height * 0.28 }, a]}>
        <LinearGradient
          colors={[colors.orchid, colors.rose]}
          start={ribbon.start}
          end={ribbon.end}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
      <Animated.View style={[styles.band, { height: height * 0.34, bottom: height * 0.04 }, b]}>
        <LinearGradient
          colors={ribbon.colors}
          locations={ribbon.locations}
          start={ribbon.start}
          end={ribbon.end}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
      <Animated.View style={[styles.band, { height: height * 0.22, bottom: -height * 0.06 }, c]}>
        <LinearGradient
          colors={[colors.rose, colors.coral]}
          start={ribbon.start}
          end={ribbon.end}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 0, right: 0, overflow: 'hidden' },
  bottom: { bottom: 0 },
  top: { top: 0 },
  band: { position: 'absolute', left: '-25%', width: '150%', borderRadius: 999, overflow: 'hidden' },
});
