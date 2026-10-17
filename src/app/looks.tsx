/**
 * Pantalla 7 — Tres traducciones. Susurro / Equilibrio / Declaración on the same selfie.
 * Results arrive progressively (renders keep running from Creación); a failed variant
 * offers its own retry and never hides the others. Any ready look can be compared with
 * the original before choosing.
 */
import { Redirect, router } from 'expo-router';
import { X } from 'lucide-react-native';
import { useState } from 'react';
import { Modal, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { FadeInDown, useReducedMotion } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  AppText,
  CompareSlider,
  EditorialHeading,
  LookVariantCard,
  PressableScale,
  PrimaryButton,
  Screen,
} from '@/components';
import { VARIANTS, type VariantKey } from '@/domain/types';
import { useT } from '@/i18n';
import { imageFor, variantRecipe } from '@/state/selectors';
import { useSession } from '@/state/session';
import { colors, easing, layout, motion, space } from '@/theme';

const LOOK_ENTRANCES = VARIANTS.map((_, index) =>
  FadeInDown.delay(index * motion.stagger)
    .duration(motion.emphasis)
    .easing(easing.enter)
    .withInitialValues({
      transform: [{ translateY: space[2] }],
    }),
);

export default function LooksScreen() {
  const t = useT();
  const reduceMotion = useReducedMotion();
  const insets = useSafeAreaInsets();
  const { state, actions } = useSession();
  const [selected, setSelected] = useState<VariantKey | null>(state.chosenVariant);
  const [comparing, setComparing] = useState<VariantKey | null>(null);
  const [compareOpen, setCompareOpen] = useState(false);

  if (!state.sourceImage) return <Redirect href="/selfie" />;
  if (state.variants.length === 0) return <Redirect href="/creating" />;

  const selectedRecipe = selected ? variantRecipe(state, selected) : undefined;
  const canChoose = Boolean(selectedRecipe && imageFor(state, selectedRecipe));

  const choose = (variant: VariantKey) => {
    setCompareOpen(false);
    actions.dispatch({ type: 'looks/choose', variant });
    router.push('/edit');
  };

  const compareRecipe = comparing ? variantRecipe(state, comparing) : undefined;
  const compareImage = imageFor(state, compareRecipe);

  return (
    <Screen
      header={{ stage: 'looks' }}
      footer={
        <PrimaryButton
          label={t('looks.choose')}
          disabled={!canChoose}
          onPress={() => selected && choose(selected)}
        />
      }
    >
      <EditorialHeading title={t('looks.title')} subtitle={t('looks.subtitle')} />

      <View style={styles.list} accessibilityRole="radiogroup" accessibilityLabel={t('looks.title')}>
        {VARIANTS.map((variant, i) => {
          const recipe = variantRecipe(state, variant);
          if (!recipe) return null;
          return (
            <Animated.View
              key={variant}
              entering={reduceMotion ? undefined : LOOK_ENTRANCES[i]}
            >
              <LookVariantCard
                recipe={recipe}
                job={state.renderJobs[recipe.id]}
                selected={selected === variant}
                onSelect={() => setSelected(variant)}
                onRetry={() => actions.retryVariant(variant)}
                onCompare={() => {
                  setComparing(variant);
                  setCompareOpen(true);
                }}
              />
            </Animated.View>
          );
        })}
      </View>

      <Modal
        visible={Boolean(compareOpen && comparing && compareImage)}
        animationType={reduceMotion ? 'fade' : 'slide'}
        presentationStyle="pageSheet"
        onRequestClose={() => setCompareOpen(false)}
      >
        {comparing && compareImage ? (
          // Modals are a separate native root: gestures need their own root view on Android.
          <GestureHandlerRootView
            style={[
              styles.sheet,
              {
                paddingTop: Platform.OS === 'android' ? insets.top + space[2] : space[4],
                paddingBottom: Math.max(insets.bottom, space[4]),
              },
            ]}
          >
            <View style={styles.sheetHead}>
              <AppText variant="h2" style={styles.flex}>
                {t(`variants.${comparing}`)}
              </AppText>
              <PressableScale
                accessibilityRole="button"
                accessibilityLabel={t('common.close')}
                onPress={() => setCompareOpen(false)}
                style={styles.close}
              >
                <X color={colors.ink} size={24} strokeWidth={1.75} />
              </PressableScale>
            </View>
            <ScrollView contentContainerStyle={styles.sheetBody}>
              <CompareSlider
                beforeUri={state.sourceImage.uri}
                afterUri={compareImage}
                afterSimulated={state.renderJobs[compareRecipe!.id]?.simulated}
                beforeAlt={t('selfie.review.photoAlt')}
                afterAlt={t('looks.lookAlt', { variant: t(`variants.${comparing}`) })}
              />
              <AppText variant="label" align="center">
                {t('compare.hint')}
              </AppText>
              <AppText variant="body">{compareRecipe?.explanation}</AppText>
            </ScrollView>
            <PrimaryButton label={t('looks.choose')} onPress={() => choose(comparing)} />
          </GestureHandlerRootView>
        ) : null}
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { gap: space[4] },
  flex: { flex: 1 },
  sheet: { flex: 1, backgroundColor: colors.cream, paddingHorizontal: layout.gutter, gap: space[4] },
  sheetHead: { flexDirection: 'row', alignItems: 'center' },
  close: { width: layout.minTouch, height: layout.minTouch, alignItems: 'center', justifyContent: 'center' },
  sheetBody: { gap: space[4], paddingBottom: space[4] },
});
