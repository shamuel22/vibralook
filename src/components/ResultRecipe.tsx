/**
 * Ordered, spoken-as-a-whole application steps with total time and explicit palette
 * provenance. Thumbnails crop only the supplied final photo; missing photos and
 * preparation/finishing steps use neutral functional symbols, never invented artwork.
 */
import { Image } from 'expo-image';
import { Check, Clock3, Droplet } from 'lucide-react-native';
import { StyleSheet, useWindowDimensions, View } from 'react-native';

import type { RecipeStep } from '@/domain/types';
import { useT } from '@/i18n';
import { colors, radius, space } from '@/theme';

import { AppText } from './AppText';
import { ZoneIcon } from './ZoneIcon';

export interface ResultRecipeProps {
  steps: RecipeStep[];
  imageUri?: string | number;
  paletteSource: 'kit' | 'guide';
}

const THUMB = space[12] + space[2];
const PHOTO_WIDTH = THUMB * 3;
const PHOTO_HEIGHT = (PHOTO_WIDTH * 5) / 4;
const CROP = { eyes: { x: 0.5, y: 0.4 }, cheeks: { x: 0.65, y: 0.55 }, lips: { x: 0.5, y: 0.7 } } as const;

export function ResultRecipe({ steps, imageUri, paletteSource }: ResultRecipeProps) {
  const t = useT();
  const { fontScale } = useWindowDimensions();
  const numberSize = space[8] * Math.max(1, Math.min(2, fontScale));
  const total = steps.reduce((minutes, step) => minutes + step.minutes, 0);
  return (
    <View style={styles.recipe}>
      <AppText variant="eyebrow" accessibilityRole="header">
        {t('result.howTo')}
      </AppText>
      <View accessibilityRole="list" style={styles.list}>
        {steps.map((step, index) => {
          const zoneLabel = t(`result.stepZone.${step.zone}`);
          const minutes = t('common.minutes', { count: step.minutes });
          const crop = step.zone === 'prep' || step.zone === 'finish' ? undefined : CROP[step.zone];
          const Fallback = step.zone === 'prep' ? Droplet : Check;
          return (
            <View
              key={`${index}-${step.zone}`}
              accessible
              role="listitem"
              accessibilityLabel={`${t('common.stepOf', { current: index + 1, total: steps.length })}, ${zoneLabel}, ${step.text}, ${minutes}`}
              style={styles.step}
            >
              <View style={styles.stepHeader} accessible={false} importantForAccessibility="no-hide-descendants">
                <View style={[styles.number, { width: numberSize, height: numberSize }]}>
                  <AppText variant="labelStrong">{index + 1}</AppText>
                </View>
                <View style={styles.thumb}>
                  {imageUri !== undefined && crop ? (
                    <Image
                      source={imageUri}
                      contentFit="cover"
                      contentPosition="center"
                      accessibilityLabel={zoneLabel}
                      style={[
                        styles.crop,
                        { left: THUMB / 2 - PHOTO_WIDTH * crop.x, top: THUMB / 2 - PHOTO_HEIGHT * crop.y },
                      ]}
                    />
                  ) : (
                    <View style={styles.fallback}>
                      {step.zone === 'prep' || step.zone === 'finish' ? (
                        <Fallback size={space[6]} color={colors.ink} strokeWidth={1.75} />
                      ) : (
                        <ZoneIcon zone={step.zone} />
                      )}
                    </View>
                  )}
                </View>
                <View style={styles.instruction}>
                  <AppText variant="bodyStrong">{zoneLabel}</AppText>
                  <AppText variant="label" color={colors.ink}>
                    {step.text}
                  </AppText>
                  <AppText variant="label">{minutes}</AppText>
                </View>
              </View>
            </View>
          );
        })}
      </View>
      <View style={styles.total} accessible accessibilityLabel={t('result.totalTime', { minutes: total })}>
        <Clock3 size={space[5]} color={colors.ink} strokeWidth={1.75} />
        <AppText variant="bodyStrong" style={styles.totalLabel}>
          {t('result.totalTime', { minutes: total })}
        </AppText>
      </View>
      <View style={[styles.source, paletteSource === 'guide' && styles.guide]}>
        <AppText variant="labelStrong">
          {t(paletteSource === 'kit' ? 'looks.paletteKit' : 'looks.paletteGuide')}
        </AppText>
        <AppText variant="label" color={colors.ink}>
          {t(paletteSource === 'kit' ? 'result.kitLabel' : 'result.guideLabel')}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  recipe: { gap: space[4] },
  list: { gap: space[6] },
  step: { gap: space[2] },
  stepHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: space[3] },
  number: {
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumb: {
    width: THUMB,
    height: THUMB,
    borderRadius: radius.sm,
    overflow: 'hidden',
  },
  crop: { position: 'absolute', width: PHOTO_WIDTH, height: PHOTO_HEIGHT },
  fallback: {
    flex: 1,
    borderRadius: radius.pill,
    backgroundColor: colors.creamDeep,
    justifyContent: 'center',
    alignItems: 'center',
  },
  instruction: { flex: 1, minWidth: 0, gap: space[1] },
  total: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: space[2],
    borderTopWidth: 1,
    borderTopColor: colors.line,
    paddingTop: space[4],
  },
  totalLabel: { flex: 1 },
  source: { padding: space[4], borderWidth: 1, borderColor: colors.line, borderRadius: radius.md, gap: space[2] },
  guide: { backgroundColor: colors.creamDeep, borderColor: colors.sand },
});
