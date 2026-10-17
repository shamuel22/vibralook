/**
 * Pantalla 6 — Creación. One translation followed by independent render jobs;
 * the first completed look unlocks comparison while the others continue rendering.
 */
import { Image } from 'expo-image';
import { Redirect, router, useFocusEffect, useIsFocused } from 'expo-router';
import { Check } from 'lucide-react-native';
import { useCallback, useEffect, useMemo, useRef, type ReactNode } from 'react';
import { AccessibilityInfo, Platform, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, useReducedMotion } from 'react-native-reanimated';

import {
  AppText,
  EditorialHeading,
  InlineNotice,
  LookProgressCard,
  PrimaryButton,
  RibbonAccent,
  Screen,
  SecondaryButton,
} from '@/components';
import { VARIANTS, VIBE_MIN_LENGTH } from '@/domain/types';
import { useT } from '@/i18n';
import { allVariantsSettled, anyVariantReady, jobFor, variantRecipe } from '@/state/selectors';
import { useSession } from '@/state/session';
import { colors, easing, motion, radius, space } from '@/theme';
import { useCancelOnLeave } from '@/hooks/useCancelOnLeave';

function ProgressEntrance({ index, children }: { index: number; children: ReactNode }) {
  const reduced = useReducedMotion();
  const entering = useMemo(
    () =>
      reduced
        ? undefined
        : FadeInDown.duration(motion.base)
            .delay(index * motion.stagger)
            .easing(easing.enter)
            .withInitialValues({ transform: [{ translateY: space[2] }] }),
    [index, reduced],
  );
  return <Animated.View entering={entering}>{children}</Animated.View>;
}

export default function CreatingScreen() {
  const t = useT();
  const { state, actions } = useSession();
  const focused = useIsFocused();
  const autoStarted = useRef(false);
  const retrying = useRef(false);
  const cancelled = useRef(false);
  const announced = useRef(false);
  const source = state.sourceImage;
  const translating = state.translation.status === 'loading';
  const ready = anyVariantReady(state);
  const settled = allVariantsSettled(state);
  const shimmerVariant = VARIANTS.find(
    (variant) => jobFor(state, variantRecipe(state, variant))?.status === 'processing',
  );

  // Back (gesture or Android button) while interpreting cancels the request before leaving.
  useCancelOnLeave(translating, actions.cancelInFlight);

  useFocusEffect(
    useCallback(() => {
      cancelled.current = false;
    }, []),
  );

  useFocusEffect(
    useCallback(() => {
      if (!source || cancelled.current) return;
      if (state.translation.status !== 'idle' || state.variants.length > 0) {
        autoStarted.current = false;
        return;
      }
      // Set synchronously before dispatch: a StrictMode effect replay cannot start twice.
      if (autoStarted.current) return;
      autoStarted.current = true;
      void actions.startLooks();
    }, [source, state.translation.status, state.variants.length, actions]),
  );

  useEffect(() => {
    if (translating) announced.current = false;
    if (!focused || !ready || announced.current) return;
    announced.current = true;
    // Android gets a polite live region below. iOS queues the same notification.
    if (Platform.OS === 'ios') {
      AccessibilityInfo.announceForAccessibilityWithOptions(
        `${t('creating.statusSuccess')}. ${t('creating.seeLooks')}`,
        { queue: true },
      );
    }
  }, [focused, ready, t, translating]);

  const retryTranslation = () => {
    if (retrying.current || state.translation.status !== 'error') return;
    retrying.current = true;
    void actions.startLooks().finally(() => {
      retrying.current = false;
    });
  };
  const changePhoto = () => {
    cancelled.current = true;
    actions.cancelInFlight();
    router.dismissTo('/selfie');
  };
  const cancel = () => {
    cancelled.current = true;
    actions.cancelInFlight();
    if (router.canGoBack()) router.back();
    else router.replace('/kit');
  };

  // Deep links can skip earlier steps; never translate an empty vibe.
  if (state.userIntent.text.trim().length < VIBE_MIN_LENGTH) return <Redirect href="/" />;
  if (!source) return <Redirect href="/selfie" />;
  const translationError = state.translation.status === 'error';
  // The provider found no usable face: retrying the same photo cannot help, a new one can.
  const noFace = state.variants.some((recipe) => jobFor(state, recipe)?.error?.code === 'noFace');
  const interpreting = translating || state.translation.status === 'idle';

  return (
    <Screen
      header={{ stage: 'looks', backLocked: translating }}
      background={<RibbonAccent />}
      footer={
        <>
          <PrimaryButton
            label={t('creating.seeLooks')}
            disabled={!ready}
            onPress={() => {
              if (ready) router.push('/looks');
            }}
          />
          <SecondaryButton label={t('creating.cancelSession')} onPress={cancel} />
        </>
      }
    >
      <EditorialHeading title={t('creating.title')} subtitle={t('creating.subtitle')} />
      <View style={styles.guideCard}>
        <Image
          source={{ uri: source.uri }}
          contentFit="cover"
          accessibilityLabel={t('selfie.review.photoAlt')}
          style={styles.photo}
        />
        <View style={styles.guideCopy}>
          <View style={styles.guideHeading}>
            <AppText variant="h3" style={styles.headingText}>
              {t('creating.guidePhotoTitle')}
            </AppText>
            <View
              style={styles.badge}
              accessible={false}
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
            >
              <Check size={space[4]} color={colors.white} strokeWidth={2} />
            </View>
          </View>
          <AppText variant="label" color={colors.muted}>
            {t('creating.guidePhotoBody')}
          </AppText>
        </View>
      </View>
      {translationError ? (
        <View style={styles.errorActions}>
          <InlineNotice
            tone="error"
            focusOnMount
            message={t('creating.translateError')}
            action={{ label: t('common.retry'), onPress: retryTranslation }}
          />
          <SecondaryButton label={t('common.back')} onPress={() => router.dismissTo('/')} />
        </View>
      ) : (
        <>
          {!settled && (
            <AppText variant="labelStrong" accessibilityLiveRegion="polite">
              {t(interpreting ? 'creating.stageInterpreting' : 'creating.stageTrying')}
            </AppText>
          )}
          <View style={styles.cards}>
            {VARIANTS.map((variant, index) => {
              const recipe = interpreting ? undefined : variantRecipe(state, variant);
              return (
                <ProgressEntrance key={variant} index={index}>
                  <LookProgressCard
                    variant={variant}
                    recipe={recipe}
                    status={interpreting ? 'interpreting' : (jobFor(state, recipe)?.status ?? 'pending')}
                    error={jobFor(state, recipe)?.error}
                    animateProgress={variant === shimmerVariant}
                    onRetry={() => void actions.retryVariant(variant)}
                  />
                </ProgressEntrance>
              );
            })}
          </View>
        </>
      )}
      {noFace && (
        <InlineNotice
          tone="error"
          focusOnMount
          message={t('creating.noFaceNotice')}
          action={{ label: t('creating.changePhoto'), onPress: changePhoto }}
        />
      )}
      {state.variants.some((recipe) => recipe.origin === 'editorial') && (
        <InlineNotice tone="info" message={t('creating.editorialNotice')} />
      )}
      <View accessibilityLiveRegion="polite">
        {ready && (
          <AppText variant="labelStrong" color={colors.success}>
            {t('creating.statusSuccess')}. {t('creating.seeLooks')}
          </AppText>
        )}
      </View>
      <View style={styles.spacer} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  guideCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[4],
    padding: space[3],
    backgroundColor: colors.white,
    borderRadius: radius.md,
  },
  photo: { width: '28%', aspectRatio: 4 / 5, borderRadius: radius.md },
  guideCopy: { flex: 1, gap: space[2] },
  guideHeading: { flexDirection: 'row', alignItems: 'flex-start', gap: space[2] },
  headingText: { flex: 1 },
  badge: {
    width: space[6],
    height: space[6],
    borderRadius: radius.pill,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cards: { gap: space[4] },
  errorActions: { gap: space[3] },
  spacer: { height: space[4] },
});
