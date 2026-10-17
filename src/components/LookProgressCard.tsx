/**
 * Independent render progress: interpreting, pending, processing, success and retryable
 * error. The only loop is an indeterminate shimmer, paused off-screen/in background
 * and omitted with reduced motion. Provider jobs never get invented percentages.
 */
import { useFocusEffect } from 'expo-router';
import { Check, Clock3, ScanLine, WandSparkles } from 'lucide-react-native';
import { useCallback, useEffect, useState } from 'react';
import { AppState, StyleSheet, View } from 'react-native';
import Animated, { useReducedMotion } from 'react-native-reanimated';

import { recipePalette } from '@/domain/recipe';
import type { LookRecipe, RenderStatus, VariantKey } from '@/domain/types';
import { useAccessibilityAnnouncement } from '@/hooks/useAccessibilityAnnouncement';
import { useT } from '@/i18n';
import { colors, motion, radius, shadow, space } from '@/theme';

import { AppText } from './AppText';
import { ArtPlaceholder, type ArtId } from './ArtPlaceholder';
import { Button } from './Button';
import { InlineNotice } from './InlineNotice';
import { Swatch } from './Swatch';

export interface LookProgressCardProps {
  variant: VariantKey;
  recipe?: LookRecipe;
  status: 'interpreting' | RenderStatus;
  animateProgress?: boolean;
  onRetry?: () => void;
}

const ART: Record<VariantKey, ArtId> = {
  whisper: 'vl_creacion_textura_susurro_v01',
  balance: 'vl_creacion_textura_equilibrio_v01',
  statement: 'vl_creacion_textura_declaracion_v01',
};
const STATUS = {
  interpreting: 'creating.stageInterpreting',
  pending: 'creating.statusPending',
  processing: 'creating.statusProcessing',
  success: 'creating.statusSuccess',
  error: 'creating.statusError',
} as const;
const ICON = { interpreting: WandSparkles, pending: Clock3, processing: ScanLine, success: Check } as const;
const SHIMMER = {
  from: { transform: [{ translateX: '-100%' }] },
  to: { transform: [{ translateX: '300%' }] },
} as const;

function IndeterminateBar() {
  const reduced = useReducedMotion();
  const [foreground, setForeground] = useState(AppState.currentState === 'active');
  const [focused, setFocused] = useState(false);
  useFocusEffect(
    useCallback(() => {
      setFocused(true);
      return () => setFocused(false);
    }, []),
  );
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => setForeground(state === 'active'));
    return () => subscription.remove();
  }, []);
  return (
    <View
      style={styles.track}
      accessible={false}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <Animated.View
        style={[
          styles.shimmer,
          !reduced && {
            animationName: SHIMMER,
            animationDuration: motion.scene * 3,
            animationTimingFunction: 'linear',
            animationIterationCount: 'infinite',
            animationPlayState: foreground && focused ? 'running' : 'paused',
          },
        ]}
      />
    </View>
  );
}

export function LookProgressCard({ variant, recipe, status, animateProgress = false, onRetry }: LookProgressCardProps) {
  const t = useT();
  const Icon = status === 'error' ? null : ICON[status];
  const active = useAccessibilityAnnouncement(`${t(`variants.${variant}`)}. ${t(STATUS[status])}`);
  return (
    <View style={[styles.card, status === 'processing' && styles.processing]}>
      <View style={styles.row}>
        <ArtPlaceholder id={ART[variant]} aspectRatio={1} decorative compact style={styles.art} />
        <View style={styles.content}>
          <View style={styles.heading}>
            <AppText variant="h3" style={styles.flex}>
              {t(`variants.${variant}`)}
            </AppText>
            {status === 'success' && (
              <View
                style={styles.check}
                accessible={false}
                accessibilityElementsHidden
                importantForAccessibility="no-hide-descendants"
              >
                <Check size={space[4]} color={colors.white} strokeWidth={2} />
              </View>
            )}
          </View>
          <AppText variant="label">{t(`variantIntent.${variant}`)}</AppText>
          <View style={styles.palette}>
            {recipe
              ? recipePalette(recipe).map(({ zone, shadeId }) => <Swatch key={zone} shadeId={shadeId} size="sm" />)
              : [0, 1, 2].map((key) => <View key={key} style={styles.empty} accessible={false} />)}
          </View>
          {Icon && (
            <View
              accessible
              accessibilityRole="text"
              accessibilityLiveRegion={active ? 'polite' : 'none'}
              accessibilityLabel={t(STATUS[status])}
              style={styles.status}
            >
              <Icon color={status === 'success' ? colors.success : colors.muted} size={space[4]} strokeWidth={1.75} />
              <AppText variant="label" color={status === 'success' ? colors.success : colors.muted} style={styles.flex}>
                {t(STATUS[status])}
              </AppText>
            </View>
          )}
          {status === 'processing' && animateProgress && <IndeterminateBar />}
        </View>
      </View>
      {status === 'error' && (
        <View style={styles.error}>
          {/* InlineNotice's error role is assertive. Present its visual surface inside a
              polite status element, with the retry kept as a separate accessible action. */}
          <View
            accessible
            accessibilityRole="text"
            accessibilityLiveRegion={active ? 'polite' : 'none'}
            accessibilityLabel={t('creating.statusError')}
          >
            <View accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
              <InlineNotice tone="error" message={t('creating.statusError')} />
            </View>
          </View>
          {onRetry && <Button variant="secondary" compact arrow={false} label={t('looks.retry')} onPress={onRetry} />}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: space[4],
    gap: space[3],
    borderRadius: radius.md,
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.white,
    ...shadow.card,
  },
  processing: { borderColor: colors.coral },
  row: { flexDirection: 'row', gap: space[3], alignItems: 'flex-start' },
  art: { width: '28%', flexShrink: 1 },
  content: { flex: 1, minWidth: 0, gap: space[2] },
  heading: { flexDirection: 'row', alignItems: 'flex-start', gap: space[2] },
  flex: { flex: 1 },
  check: {
    width: space[6],
    height: space[6],
    borderRadius: radius.pill,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  palette: { flexDirection: 'row', flexWrap: 'wrap', gap: space[1] },
  empty: {
    width: space[6],
    height: space[6],
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.creamDeep,
  },
  status: { flexDirection: 'row', gap: space[2], alignItems: 'flex-start' },
  track: { height: space[1], backgroundColor: colors.creamDeep, borderRadius: radius.pill, overflow: 'hidden' },
  shimmer: { width: '33.333%', height: '100%', backgroundColor: colors.coral, borderRadius: radius.pill },
  error: { gap: space[2] },
});
