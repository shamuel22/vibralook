/**
 * Disclosure row: a label with its current value, collapsed by default; tap to reveal the
 * options. Each row opens independently. The summary keeps the chosen value visible while
 * closed, so hiding options never hides a decision.
 */
import { ChevronDown } from 'lucide-react-native';
import { useState, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, useReducedMotion } from 'react-native-reanimated';

import { useT } from '@/i18n';
import { colors, cssEasing, easing, layout, motion, space } from '@/theme';

import { AppText } from './AppText';
import { PressableScale } from './PressableScale';

const BODY_ENTER = FadeInDown.duration(motion.base)
  .easing(easing.enter)
  .withInitialValues({ transform: [{ translateY: -space[2] }] });

export interface DisclosureProps {
  label: string;
  /** Current value shown while collapsed (e.g. "10 min"). */
  summary: string;
  hint?: string;
  defaultExpanded?: boolean;
  children: ReactNode;
}

export function Disclosure({ label, summary, hint, defaultExpanded = false, children }: DisclosureProps) {
  const t = useT();
  const reduceMotion = useReducedMotion();
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <View>
      <PressableScale
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${summary}`}
        accessibilityHint={t('intent.optionsHint')}
        accessibilityState={{ expanded }}
        onPress={() => setExpanded((v) => !v)}
        scaleTo={0.99}
        style={styles.header}
      >
        <AppText variant="labelStrong" style={styles.label}>
          {label}
        </AppText>
        <AppText variant="label" color={colors.ink} numberOfLines={expanded ? undefined : 1} style={styles.summary}>
          {summary}
        </AppText>
        <Animated.View
          style={{
            transform: [{ rotate: expanded ? '180deg' : '0deg' }],
            transitionProperty: 'transform',
            transitionDuration: reduceMotion ? 0 : motion.base,
            transitionTimingFunction: cssEasing.standard,
          }}
        >
          <ChevronDown color={colors.ink} size={20} strokeWidth={1.75} />
        </Animated.View>
      </PressableScale>
      {expanded ? (
        <Animated.View entering={reduceMotion ? undefined : BODY_ENTER} style={styles.body}>
          {hint ? <AppText variant="label">{hint}</AppText> : null}
          {children}
        </Animated.View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    minHeight: layout.buttonHeight,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: space[2],
    paddingVertical: space[2],
  },
  label: { flexShrink: 0 },
  summary: { flex: 1, minWidth: 80, textAlign: 'right' },
  body: { gap: space[3], paddingBottom: space[4] },
});
