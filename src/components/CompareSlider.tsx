/**
 * Before/after comparison. Both images keep the same frame; two inverse translations
 * reveal the after image without animating layout. Drag is direct on the UI thread;
 * taps settle with a clamped spring, and assistive adjustments move immediately.
 */
import { Image } from 'expo-image';
import { GripVertical } from 'lucide-react-native';
import { useState } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { GestureDetector, useCompetingGestures, usePanGesture, useTapGesture } from 'react-native-gesture-handler';
import Animated, {
  cancelAnimation,
  useAnimatedReaction,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { useT } from '@/i18n';
import { colors, layout, radius, space, spring } from '@/theme';

import { AppText } from './AppText';
import { SimulationSeal } from './SimulationSeal';

export interface CompareSliderProps {
  beforeUri: string | number;
  afterUri: string | number;
  afterSimulated?: boolean;
  aspectRatio?: number;
  initial?: number;
  style?: StyleProp<ViewStyle>;
  beforeAlt: string;
  afterAlt: string;
}

function clamp(value: number) {
  'worklet';
  return Math.max(0, Math.min(1, value));
}

export function CompareSlider({
  beforeUri,
  afterUri,
  afterSimulated = false,
  aspectRatio = 4 / 5,
  initial = 0.5,
  style,
  beforeAlt,
  afterAlt,
}: CompareSliderProps) {
  const t = useT();
  const reduced = useReducedMotion();
  const start = Number.isFinite(initial) ? clamp(initial) : 0.5;
  const position = useSharedValue(start);
  const committed = useSharedValue(Math.round(start * 100));
  const frameWidth = useSharedValue(0);
  const [width, setWidth] = useState(0);
  const [percent, setPercent] = useState(Math.round(start * 100));

  // React receives only committed accessibility values, never the animation frames.
  useAnimatedReaction(
    () => committed.get(),
    (next, previous) => {
      if (previous !== null && next !== previous) scheduleOnRN(setPercent, next);
    },
  );

  const pan = usePanGesture({
    maxPointers: 1,
    activeOffsetX: [-space[2], space[2]],
    failOffsetY: [-space[3], space[3]],
    onActivate: (event) => {
      'worklet';
      cancelAnimation(position);
      if (frameWidth.get() > 0) position.set(clamp(event.x / frameWidth.get()));
    },
    onUpdate: (event) => {
      'worklet';
      if (event.numberOfPointers === 1 && frameWidth.get() > 0) position.set(clamp(event.x / frameWidth.get()));
    },
    onDeactivate: () => {
      'worklet';
      committed.set(Math.round(position.get() * 100));
    },
  });
  const tap = useTapGesture({
    maxDistance: space[2],
    onDeactivate: (event) => {
      'worklet';
      if (event.canceled || frameWidth.get() <= 0) return;
      const next = clamp(event.x / frameWidth.get());
      position.set(reduced ? next : withSpring(next, { ...spring.settle, overshootClamping: true }));
      committed.set(Math.round(next * 100));
    },
  });
  const gesture = useCompetingGestures(pan, tap);
  const clip = useAnimatedStyle(() => ({ transform: [{ translateX: (position.get() - 1) * frameWidth.get() }] }));
  const counter = useAnimatedStyle(() => ({ transform: [{ translateX: (1 - position.get()) * frameWidth.get() }] }));
  const divider = useAnimatedStyle(() => ({ transform: [{ translateX: position.get() * frameWidth.get() }] }));
  const handle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: Math.max(
          0,
          Math.min(frameWidth.get() - layout.minTouch, position.get() * frameWidth.get() - layout.minTouch / 2),
        ),
      },
    ],
  }));

  return (
    <GestureDetector gesture={gesture}>
      <View
        accessible
        accessibilityRole="adjustable"
        accessibilityLabel={t('compare.label')}
        accessibilityHint={`${t('compare.hint')}. ${beforeAlt}. ${afterAlt}${afterSimulated ? `. ${t('common.simulatedSeal')}` : ''}`}
        accessibilityValue={{
          min: 0,
          max: 100,
          now: percent,
          text: t('compare.position', { after: percent, before: 100 - percent }),
        }}
        accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
        onAccessibilityAction={({ nativeEvent }) => {
          if (nativeEvent.actionName !== 'increment' && nativeEvent.actionName !== 'decrement') return;
          cancelAnimation(position);
          const next = clamp(position.get() + (nativeEvent.actionName === 'increment' ? 0.1 : -0.1));
          position.set(next);
          committed.set(Math.round(next * 100));
        }}
        onLayout={({ nativeEvent }) => {
          setWidth(nativeEvent.layout.width);
          frameWidth.set(nativeEvent.layout.width);
        }}
        style={[styles.frame, { aspectRatio }, style]}
      >
        <View
          pointerEvents="none"
          accessible={false}
          importantForAccessibility="no-hide-descendants"
          style={StyleSheet.absoluteFill}
        >
          <Image
            source={beforeUri}
            contentFit="cover"
            contentPosition="center"
            accessibilityLabel={beforeAlt}
            style={StyleSheet.absoluteFill}
          />
          <View style={[styles.pill, styles.before]}>
            <AppText variant="labelStrong" color={colors.white}>
              {t('compare.before')}
            </AppText>
          </View>
          <Animated.View style={[StyleSheet.absoluteFill, styles.clip, clip]}>
            <Animated.View style={[styles.afterFrame, { width }, counter]}>
              <Image
                source={afterUri}
                contentFit="cover"
                contentPosition="center"
                accessibilityLabel={afterAlt}
                style={StyleSheet.absoluteFill}
              />
              <View style={[styles.pill, styles.after]}>
                <AppText variant="labelStrong" color={colors.white}>
                  {t('compare.after')}
                </AppText>
              </View>
              {afterSimulated && <SimulationSeal compact style={styles.seal} />}
            </Animated.View>
          </Animated.View>
          <Animated.View style={[styles.divider, divider]} />
          <Animated.View style={[styles.handle, handle]}>
            <GripVertical size={space[6]} color={colors.ink} strokeWidth={1.75} />
          </Animated.View>
        </View>
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  frame: { width: '100%', overflow: 'hidden', borderRadius: radius.md, backgroundColor: colors.creamDeep },
  clip: { overflow: 'hidden' },
  afterFrame: { position: 'absolute', top: 0, bottom: 0, left: 0 },
  pill: {
    position: 'absolute',
    top: space[3],
    backgroundColor: colors.inkScrim,
    borderRadius: radius.pill,
    paddingHorizontal: space[3],
    paddingVertical: space[1],
    maxWidth: '42%',
  },
  before: { right: space[3] },
  after: { left: space[3] },
  seal: { position: 'absolute', left: space[3], bottom: space[3] },
  divider: { position: 'absolute', top: 0, bottom: 0, left: 0, width: 2, backgroundColor: colors.white },
  handle: {
    position: 'absolute',
    top: '50%',
    left: 0,
    marginTop: -layout.minTouch / 2,
    width: layout.minTouch,
    height: layout.minTouch,
    borderRadius: radius.pill,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
