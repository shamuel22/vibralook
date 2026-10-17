/**
 * Onboarding — one screen: what VIBRA LOOK is and the three moves of the journey.
 * Shown on first launch (and from the menu). The hero is final artwork from the graphics
 * team (`vl_onboarding_hero_v01`); until it lands, its placeholder keeps the exact frame.
 */
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, useReducedMotion } from 'react-native-reanimated';

import { AppText, ArtPlaceholder, InlineNotice, PrimaryButton, RibbonAccent, Screen } from '@/components';
import { useT, type TKey } from '@/i18n';
import { useMotionAllowed } from '@/hooks/useMotionAllowed';
import { useOnboarding } from '@/state/onboarding';
import { colors, easing, layout, motion, radius, space } from '@/theme';

const SYMBOL = require('../../assets/brand/vl_symbol.png');
const STEPS = [1, 2, 3] as const;
const STEP_ENTER = STEPS.map((_, i) =>
  FadeInDown.delay(motion.base + i * motion.stagger)
    .duration(motion.emphasis)
    .easing(easing.enter)
    .withInitialValues({ transform: [{ translateY: space[2] }] }),
);

export default function WelcomeScreen() {
  const t = useT();
  const reduceMotion = useReducedMotion();
  const { markSeen } = useOnboarding();
  // The hero loops: it pauses with reduced motion, off-screen or in the background.
  const motionAllowed = useMotionAllowed();

  const start = () => {
    markSeen();
    if (router.canGoBack()) router.back();
    else router.replace('/');
  };

  return (
    <Screen
      header={{ hideBack: true }}
      background={<RibbonAccent height={120} />}
      footer={<PrimaryButton label={t('onboarding.cta')} onPress={start} />}
    >
      <View style={styles.hero}>
        <ArtPlaceholder
          id="vl_onboarding_hero_comparacion_v03"
          aspectRatio={4 / 5}
          decorative
          autoplay={motionAllowed}
          style={styles.heroArt}
        />
        {/* Honesty: this is an illustration, not a virtual try-on of the person using the app. */}
        <View style={styles.caption} accessible accessibilityLabel={t('onboarding.illustrative')}>
          <AppText variant="label" color={colors.white}>
            {t('onboarding.illustrative')}
          </AppText>
        </View>
        {/* Approved brand symbol anchors the hero while the artwork is pending. */}
        <View
          style={styles.badge}
          accessible={false}
          importantForAccessibility="no-hide-descendants"
          accessibilityElementsHidden
        >
          <Image source={SYMBOL} style={styles.symbol} contentFit="contain" />
        </View>
      </View>

      <View style={styles.intro}>
        <AppText variant="eyebrow" align="center">
          {t('onboarding.eyebrow')}
        </AppText>
        <AppText variant="h1" align="center">
          {t('onboarding.title')}
        </AppText>
        <AppText variant="body" color={colors.muted} align="center">
          {t('onboarding.body')}
        </AppText>
      </View>

      <View style={styles.steps} accessibilityRole="list">
        {STEPS.map((n, i) => (
          <Animated.View
            key={n}
            entering={reduceMotion ? undefined : STEP_ENTER[i]}
            style={styles.step}
            accessible
            accessibilityLabel={`${n}. ${t(`onboarding.step${n}Title` as TKey)}. ${t(`onboarding.step${n}Body` as TKey)}`}
          >
            <View style={styles.number}>
              <AppText variant="labelStrong" color={colors.white}>
                {n}
              </AppText>
            </View>
            <View style={styles.stepText}>
              <AppText variant="bodyStrong">{t(`onboarding.step${n}Title` as TKey)}</AppText>
              <AppText variant="label">{t(`onboarding.step${n}Body` as TKey)}</AppText>
            </View>
          </Animated.View>
        ))}
      </View>

      <InlineNotice tone="privacy" message={t('selfie.prepare.privacy')} />
      <View style={styles.spacer} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  // Full bleed: the ribbons run off the screen edge instead of stopping at the gutter.
  hero: { marginHorizontal: -layout.gutter, alignItems: 'center' },
  heroArt: { width: '100%', borderRadius: 0 },
  caption: {
    position: 'absolute',
    top: space[3],
    right: layout.gutter,
    backgroundColor: colors.inkScrim,
    borderRadius: radius.pill,
    paddingHorizontal: space[3],
    paddingVertical: space[1],
  },
  badge: {
    position: 'absolute',
    bottom: -space[6],
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: colors.cream,
  },
  symbol: { width: 42, height: 30 },
  intro: { gap: space[3], marginTop: space[6], alignItems: 'center' },
  steps: { gap: space[4] },
  step: { flexDirection: 'row', gap: space[4], alignItems: 'flex-start' },
  number: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepText: { flex: 1, gap: space[1] },
  spacer: { height: space[6] },
});
