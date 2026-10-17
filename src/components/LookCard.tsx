/**
 * The downloadable PNG card (brief §4, Pantalla 5): final image, palette and steps, built
 * only from the saved recipe. No brands, no product claims. Rendered off-screen at a fixed
 * width and captured with react-native-view-shot by the Result screen.
 */
import { Image } from 'expo-image';
import { forwardRef, type ComponentRef } from 'react';
import { StyleSheet, View } from 'react-native';

import { recipePalette } from '@/domain/recipe';
import { getShade } from '@/domain/shades';
import type { LookRecipe } from '@/domain/types';
import { useT, type TKey } from '@/i18n';
import { colors, radius, space } from '@/theme';

import { AppText } from './AppText';

const LOGO = require('../../assets/brand/vl_logo_horizontal@3x.png');
export const LOOK_CARD_WIDTH = 360;

export interface LookCardProps {
  recipe: LookRecipe;
  imageUri: string;
  simulated: boolean;
  onImageLoad?: () => void;
}

export const LookCard = forwardRef<ComponentRef<typeof View>, LookCardProps>(function LookCard(
  { recipe, imageUri, simulated, onImageLoad },
  ref,
) {
  const t = useT();
  const total = recipe.steps.reduce((n, s) => n + s.minutes, 0);
  return (
    <View ref={ref} collapsable={false} style={styles.card}>
      <Image source={LOGO} style={styles.logo} contentFit="contain" />
      <View style={styles.photo}>
        <Image source={imageUri} style={StyleSheet.absoluteFill} contentFit="cover" onLoad={onImageLoad} />
      </View>
      {simulated ? (
        <AppText variant="label" color={colors.error} align="center">
          {t('common.simulatedSeal')}
        </AppText>
      ) : null}
      <View style={styles.titleRow}>
        <AppText variant="h2">{t(`variants.${recipe.variant}`)}</AppText>
        <AppText variant="label">{recipe.tagline}</AppText>
      </View>
      <View style={styles.palette}>
        {recipePalette(recipe).map(({ zone, shadeId }) => (
          <View key={zone} style={styles.swatchItem}>
            <View style={[styles.swatch, { backgroundColor: getShade(shadeId).hex }]} />
            <AppText variant="label" color={colors.ink} align="center" numberOfLines={2}>
              {t(getShade(shadeId).nameKey as TKey)}
            </AppText>
          </View>
        ))}
      </View>
      <View style={styles.steps}>
        <AppText variant="eyebrow">
          {t('result.howTo')} · {t('result.totalTime', { minutes: total })}
        </AppText>
        {recipe.steps.map((s, i) => (
          <View key={i} style={styles.step}>
            <AppText variant="labelStrong">{i + 1}.</AppText>
            <AppText variant="label" color={colors.ink} style={styles.flex}>
              {s.text}
            </AppText>
          </View>
        ))}
      </View>
      <AppText variant="label" align="center" style={styles.foot}>
        {recipe.paletteSource === 'kit' ? t('result.kitLabel') : t('result.guideLabel')}
      </AppText>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    width: LOOK_CARD_WIDTH,
    padding: space[5],
    gap: space[4],
    backgroundColor: colors.cream,
  },
  logo: { height: 22, width: 126, alignSelf: 'center' },
  photo: { width: '100%', aspectRatio: 4 / 5, borderRadius: radius.md, overflow: 'hidden', backgroundColor: colors.creamDeep },
  titleRow: { gap: space[1], alignItems: 'center' },
  palette: { flexDirection: 'row', justifyContent: 'center', gap: space[4] },
  swatchItem: { width: 80, alignItems: 'center', gap: space[1] },
  swatch: { width: 36, height: 36, borderRadius: 18, borderWidth: 1, borderColor: colors.line },
  steps: { gap: space[2] },
  step: { flexDirection: 'row', gap: space[2] },
  flex: { flex: 1 },
  foot: { fontSize: 12, lineHeight: 16 },
});
