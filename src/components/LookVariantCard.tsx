/**
 * One selectable interpretation with independent retry/compare actions. Waiting and
 * failed jobs show a palette frame, never a selfie disguised as a finished render.
 * The radio is a sibling of the action buttons so assistive tech can reach all three.
 */
import { Image } from 'expo-image';
import { AlertCircle, Info } from 'lucide-react-native';
import { ActivityIndicator, StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, { useReducedMotion } from 'react-native-reanimated';

import { recipePalette } from '@/domain/recipe';
import { getShade } from '@/domain/shades';
import type { LookRecipe, RenderJob } from '@/domain/types';
import { useMotionAllowed } from '@/hooks/useMotionAllowed';
import { useT } from '@/i18n';
import { colors, cssEasing, layout, motion, radius, shadow, space } from '@/theme';

import { AppText } from './AppText';
import { PressableScale } from './PressableScale';
import { SimulationSeal } from './SimulationSeal';
import { Swatch, shadeLabel } from './Swatch';

export interface LookVariantCardProps {
  recipe: LookRecipe;
  job?: RenderJob;
  selected: boolean;
  onSelect: () => void;
  onRetry: () => void;
  onCompare?: () => void;
}

export function LookVariantCard({ recipe, job, selected, onSelect, onRetry, onCompare }: LookVariantCardProps) {
  const t = useT();
  const reduced = useReducedMotion();
  // Large text: photo above the copy so neither column gets squeezed.
  const stacked = useWindowDimensions().fontScale >= 1.3;
  const motionAllowed = useMotionAllowed();
  const ready = job?.status === 'success';
  const failed = job?.status === 'error';
  const name = t(`variants.${recipe.variant}`);
  const palette = recipePalette(recipe);
  const source = t(recipe.paletteSource === 'kit' ? 'looks.paletteKit' : 'looks.paletteGuide');
  const status = t(selected ? 'looks.chosen' : ready ? 'looks.choose' : failed ? 'looks.retry' : 'looks.loading');

  return (
    <Animated.View
      style={[
        styles.card,
        selected && styles.selected,
        {
          transform: [{ translateY: selected && !reduced ? -space[3] / 4 : 0 }],
          transitionProperty: 'transform',
          transitionDuration: reduced ? 0 : motion.base,
          transitionTimingFunction: cssEasing.standard,
        },
      ]}
    >
      <PressableScale
        accessibilityRole="radio"
        accessibilityLabel={`${name}. ${recipe.tagline}. ${palette.map(({ shadeId }) => shadeLabel(t, shadeId)).join(', ')}. ${source}. ${status}${job?.simulated && ready ? `. ${t('common.simulatedSeal')}` : ''}${recipe.kitShortfall ? `. ${t('looks.kitShortfall')}` : ''}`}
        accessibilityState={{ selected, checked: selected, disabled: !ready }}
        disabled={!ready}
        onPress={onSelect}
        containerStyle={StyleSheet.absoluteFill}
        style={styles.selectionSurface}
        pressedStyle={styles.pressed}
      >
        <View />
      </PressableScale>
      <View style={[styles.row, stacked && styles.stackedRow]} pointerEvents="box-none">
        <View style={[styles.photoColumn, stacked && styles.stackedPhoto]} pointerEvents="box-none">
          <View style={[styles.photo, ready && (stacked ? styles.photoSquare : styles.photoAspect)]} pointerEvents={failed ? 'box-none' : 'none'}>
            {ready && job.imageUri ? (
              <Image
                source={job.imageUri}
                contentFit="cover"
                contentPosition="center"
                accessibilityLabel={t('looks.lookAlt', { variant: name })}
                style={StyleSheet.absoluteFill}
              />
            ) : (
              <View style={styles.placeholder}>
                {failed ? (
                  <>
                    <AlertCircle color={colors.error} size={space[6]} strokeWidth={1.75} accessible={false} />
                    <PressableScale
                      accessibilityRole="button"
                      accessibilityLabel={t('looks.retry')}
                      accessibilityState={{ disabled: false }}
                      onPress={onRetry}
                      style={styles.retry}
                      pressedStyle={styles.pressed}
                    >
                      <AppText variant="labelStrong" align="center">
                        {t('looks.retry')}
                      </AppText>
                    </PressableScale>
                  </>
                ) : (
                  <>
                    <View style={styles.flatPalette}>
                      {palette.map(({ zone, shadeId }) => (
                        <View key={zone} style={[styles.flatSwatch, { backgroundColor: getShade(shadeId).hex }]} />
                      ))}
                    </View>
                    <ActivityIndicator color={colors.ink} size="small" animating={motionAllowed} />
                    <AppText variant="label" color={colors.ink} align="center">
                      {t('looks.loading')}
                    </AppText>
                  </>
                )}
              </View>
            )}
          </View>
          {ready && job.simulated && (
            <View pointerEvents="none" style={styles.seal}>
              <SimulationSeal compact />
            </View>
          )}
        </View>
        <View style={styles.info} pointerEvents="box-none">
          <View
            pointerEvents="none"
            accessible={false}
            importantForAccessibility="no-hide-descendants"
            style={styles.copy}
          >
            <View style={styles.choice}>
              <View style={[styles.radio, selected && styles.radioSelected]}>
                {selected && <View style={styles.radioDot} />}
              </View>
              <AppText variant="labelStrong" style={styles.flex}>
                {status}
              </AppText>
            </View>
            <AppText variant="h3">{name}</AppText>
            <AppText variant="label" color={colors.ink}>
              {recipe.tagline}
            </AppText>
            <View style={styles.palette}>
              {palette.map(({ zone, shadeId }) => (
                <Swatch key={zone} shadeId={shadeId} size="sm" />
              ))}
            </View>
            <View style={styles.tag}>
              <AppText variant="labelStrong">{source}</AppText>
            </View>
            {recipe.kitShortfall && (
              <View style={styles.shortfall}>
                <Info color={colors.muted} size={space[4]} strokeWidth={1.75} />
                <AppText variant="label" style={styles.flex}>
                  {t('looks.kitShortfall')}
                </AppText>
              </View>
            )}
          </View>
          {ready && onCompare && (
            <PressableScale
              accessibilityRole="button"
              accessibilityLabel={`${t('looks.compare')}: ${name}`}
              accessibilityState={{ disabled: false }}
              onPress={onCompare}
              style={styles.compare}
              pressedStyle={styles.pressed}
            >
              <AppText variant="labelStrong" style={styles.link}>
                {t('looks.compare')}
              </AppText>
            </PressableScale>
          )}
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.white,
    backgroundColor: colors.white,
    ...shadow.card,
  },
  selected: { borderColor: colors.coral },
  selectionSurface: { flex: 1, borderRadius: radius.md },
  pressed: { backgroundColor: colors.creamDeep },
  row: { flexDirection: 'row', padding: space[2], gap: space[3], alignItems: 'flex-start' },
  photoColumn: { width: '42%', gap: space[2] },
  photo: { width: '100%', borderRadius: radius.md, overflow: 'hidden', backgroundColor: colors.creamDeep },
  photoAspect: { aspectRatio: 4 / 5 },
  photoSquare: { aspectRatio: 1 },
  stackedRow: { flexDirection: 'column', alignItems: 'stretch' },
  stackedPhoto: { width: '100%' },
  placeholder: {
    minHeight: space[12] * 3,
    alignItems: 'center',
    justifyContent: 'center',
    padding: space[2],
    gap: space[2],
  },
  flatPalette: {
    flexDirection: 'row',
    alignSelf: 'stretch',
    height: space[8],
    overflow: 'hidden',
    borderRadius: radius.sm,
  },
  flatSwatch: { flex: 1 },
  seal: { position: 'absolute', top: space[2], left: space[2] },
  retry: {
    minHeight: layout.minTouch,
    paddingHorizontal: space[2],
    paddingVertical: space[2],
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.ink,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: { flex: 1, minWidth: 0, gap: space[2], paddingVertical: space[2] },
  copy: { gap: space[2] },
  choice: { flexDirection: 'row', alignItems: 'flex-start', gap: space[2] },
  radio: {
    width: space[5],
    height: space[5],
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: { borderColor: colors.ink },
  radioDot: { width: space[3], height: space[3], backgroundColor: colors.ink, borderRadius: radius.pill },
  flex: { flex: 1 },
  palette: { flexDirection: 'row', flexWrap: 'wrap', gap: space[1] },
  tag: {
    alignSelf: 'flex-start',
    backgroundColor: colors.creamDeep,
    borderRadius: radius.sm,
    paddingHorizontal: space[2],
    paddingVertical: space[1],
  },
  shortfall: { flexDirection: 'row', alignItems: 'flex-start', gap: space[1] },
  compare: { minHeight: layout.minTouch, justifyContent: 'center', borderRadius: radius.sm, paddingVertical: space[2] },
  link: { textDecorationLine: 'underline' },
});
