/**
 * Pantalla 9 — Llévalo a la vida real. Final image vs. original, palette, the vibe
 * translation, 3–5 steps within the chosen time, and a PNG card saved to Photos or shared.
 * Everything shown comes from `finalRecipe` (honesty rule).
 */
import * as Haptics from 'expo-haptics';
import { Asset, requestPermissionsAsync } from 'expo-media-library';
import { Redirect, router } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { Bookmark, Share2 } from 'lucide-react-native';
import { useRef, useState, type ComponentRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { captureRef } from 'react-native-view-shot';

import {
  AppText,
  CompareSlider,
  EditorialHeading,
  InlineNotice,
  PrimaryButton,
  ResultRecipe,
  Screen,
  SecondaryButton,
  Swatch,
  shadeLabel,
} from '@/components';
import { LookCard, LOOK_CARD_WIDTH } from '@/components/LookCard';
import { recipePalette } from '@/domain/recipe';
import { useT } from '@/i18n';
import { imageFor, isSimulated } from '@/state/selectors';
import { useSession } from '@/state/session';
import { colors, radius, shadow, space } from '@/theme';

type SaveState = 'idle' | 'saving' | 'saved' | 'error';

export default function ResultScreen() {
  const t = useT();
  const { state, actions } = useSession();
  const { finalRecipe, sourceImage } = state;
  const card = useRef<ComponentRef<typeof View>>(null);
  const [save, setSave] = useState<SaveState>('idle');
  const [sharing, setSharing] = useState(false);

  if (!sourceImage) return <Redirect href="/selfie" />;
  const image = imageFor(state, finalRecipe);
  if (!finalRecipe || !image) return <Redirect href="/edit" />;

  const simulated = isSimulated(state, finalRecipe);
  const name = t(`variants.${finalRecipe.variant}`);

  const capture = () => captureRef(card, { format: 'png', quality: 1, result: 'tmpfile' });

  const saveCard = async () => {
    setSave('saving');
    try {
      const uri = await capture();
      const permission = await requestPermissionsAsync(true);
      if (!permission.granted) throw new Error('media-permission');
      await Asset.create(uri);
      setSave('saved');
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      setSave('error');
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const shareCard = async () => {
    setSharing(true);
    try {
      const uri = await capture();
      if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(uri, { mimeType: 'image/png' });
    } catch {
      setSave('error');
    } finally {
      setSharing(false);
    }
  };

  return (
    <Screen
      header={{ stage: 'result' }}
      footer={
        <View style={styles.row}>
          <SecondaryButton
            label={t('result.share')}
            icon={Share2}
            arrow={false}
            loading={sharing}
            onPress={shareCard}
            style={styles.flex}
          />
          <PrimaryButton
            label={t('result.save')}
            icon={Bookmark}
            arrow={false}
            loading={save === 'saving'}
            loadingLabel={t('result.saving')}
            onPress={saveCard}
            style={styles.flex2}
          />
        </View>
      }
    >
      <EditorialHeading title={t('result.title')} subtitle={t('result.subtitle')} />

      <CompareSlider
        beforeUri={sourceImage.uri}
        afterUri={image}
        afterSimulated={simulated}
        initial={0.85}
        beforeAlt={t('selfie.review.photoAlt')}
        afterAlt={t('looks.lookAlt', { variant: name })}
      />

      {save === 'saved' ? <InlineNotice tone="success" message={t('result.saved')} /> : null}
      {save === 'error' ? <InlineNotice tone="error" focusOnMount message={t('result.saveError')} /> : null}

      <View style={styles.paletteRow}>
        <View style={styles.swatches}>
          {recipePalette(finalRecipe).map(({ zone, shadeId }) => (
            <Swatch key={zone} shadeId={shadeId} size="lg" accessibilityLabel={`${t(`kit.zones.${zone}`)}: ${shadeLabel(t, shadeId)}`} />
          ))}
        </View>
        <View style={styles.flex}>
          <AppText variant="eyebrow">{name}</AppText>
          <AppText variant="label">{finalRecipe.tagline}</AppText>
        </View>
      </View>

      <View style={styles.why}>
        <AppText variant="h3">{t('result.whyTitle')}</AppText>
        <AppText variant="body">{finalRecipe.explanation}</AppText>
      </View>

      <ResultRecipe steps={finalRecipe.steps} imageUri={image} paletteSource={finalRecipe.paletteSource} />

      <InlineNotice tone="info" message={t('result.approximation')} />

      <SecondaryButton
        label={t('result.newVibe')}
        arrow={false}
        onPress={() => {
          actions.startOver();
          router.dismissAll();
          router.replace('/');
        }}
      />

      {/* Off-screen source of the PNG card; captured, never shown or read twice. */}
      <View style={styles.offscreen} pointerEvents="none" accessible={false} importantForAccessibility="no-hide-descendants">
        <LookCard ref={card} recipe={finalRecipe} imageUri={image} simulated={simulated} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  row: { flexDirection: 'row', gap: space[3] },
  flex2: { flex: 1.5 },
  paletteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[4],
    padding: space[4],
    borderRadius: radius.lg,
    backgroundColor: colors.white,
    ...shadow.card,
  },
  swatches: { flexDirection: 'row', gap: space[1] },
  why: { gap: space[2] },
  offscreen: { position: 'absolute', left: -LOOK_CARD_WIDTH * 3, top: 0, width: LOOK_CARD_WIDTH },
});
