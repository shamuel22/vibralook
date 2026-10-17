/**
 * Pantalla 1 — Intención. The vibe text is the only thing asked up front; ideas, time,
 * intensity and limits sit collapsed under «Ajusta si quieres», each one opening on its own
 * and showing its current value. Sensible defaults (10 min, balanced, no limits) apply.
 * First launch goes to the intro. Nothing is sent anywhere here.
 */
import { Redirect, router } from 'expo-router';
import { Clock, Gauge, Sun } from 'lucide-react-native';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import {
  AppText,
  ChoiceChips,
  Disclosure,
  EditorialHeading,
  PrimaryButton,
  RibbonAccent,
  Screen,
  VibeComposer,
  VibeExamples,
} from '@/components';
import { conflictsWith } from '@/domain/constraints';
import {
  VIBE_MAX_LENGTH,
  VIBE_MIN_LENGTH,
  type Constraint,
  type IntensityPreference,
  type TimeBudget,
} from '@/domain/types';
import { useT } from '@/i18n';
import { useOnboarding } from '@/state/onboarding';
import { useSession } from '@/state/session';
import { colors, radius, shadow, space } from '@/theme';

const TIMES: TimeBudget[] = [5, 10, 20];
const INTENSITIES: IntensityPreference[] = ['subtle', 'balanced', 'expressive'];
const CONSTRAINTS: Constraint[] = ['noShadow', 'noShine', 'discreetLips'];

export default function IntentScreen() {
  const t = useT();
  const { state, actions } = useSession();
  const { userIntent, constraints } = state;
  const [error, setError] = useState<string | undefined>();
  const [errorAttempt, setErrorAttempt] = useState(0);
  const onboarding = useOnboarding();

  const submit = () => {
    const text = userIntent.text.trim();
    if (text.length < VIBE_MIN_LENGTH) {
      setErrorAttempt((attempt) => attempt + 1);
      setError(t('intent.errorEmpty', { min: VIBE_MIN_LENGTH }));
      return;
    }
    if (text.length > VIBE_MAX_LENGTH) {
      setErrorAttempt((attempt) => attempt + 1);
      setError(t('intent.errorTooLong', { max: VIBE_MAX_LENGTH }));
      return;
    }
    setError(undefined);
    router.push('/selfie');
  };

  if (!onboarding.loaded) return null;
  if (!onboarding.seen) return <Redirect href="/welcome" />;

  const setText = (text: string) => {
    actions.dispatch({ type: 'intent/text', text });
    if (error) setError(undefined);
  };
  const limitsSummary =
    constraints.length === 0
      ? t('intent.constraintsNone')
      : constraints.map((c) => t(`intent.constraints.${c}`)).join(' · ');

  return (
    <Screen
      header={{ hideBack: true, stage: 'vibe' }}
      background={<RibbonAccent height={120} />}
      footer={<PrimaryButton label={t('intent.cta')} onPress={submit} />}
    >
      <EditorialHeading title={t('intent.title')} subtitle={t('intent.subtitle')} />

      <VibeComposer value={userIntent.text} error={error} errorAttempt={errorAttempt} onChange={setText} />

      <View style={styles.options}>
        <AppText variant="eyebrow">{t('intent.adjustLabel')}</AppText>

        <Disclosure label={t('intent.examplesLabel')} summary={t('intent.examplesSummary')}>
          <VibeExamples value={userIntent.text} onChange={setText} />
        </Disclosure>
        <View style={styles.divider} />

        <Disclosure label={t('intent.timeLabel')} summary={t('common.minutes', { count: userIntent.time })}>
          <ChoiceChips
            label={t('intent.timeLabel')}
            value={userIntent.time}
            onChange={(time) => actions.dispatch({ type: 'intent/time', time })}
            options={TIMES.map((m) => ({ value: m, label: t('common.minutes', { count: m }), icon: Clock }))}
          />
        </Disclosure>
        <View style={styles.divider} />

        <Disclosure label={t('intent.intensityLabel')} summary={t(`intent.intensity.${userIntent.intensity}`)}>
          <ChoiceChips
            label={t('intent.intensityLabel')}
            value={userIntent.intensity}
            onChange={(intensity) => actions.dispatch({ type: 'intent/intensity', intensity })}
            options={INTENSITIES.map((v) => ({ value: v, label: t(`intent.intensity.${v}`), icon: Gauge }))}
          />
        </Disclosure>
        <View style={styles.divider} />

        <Disclosure label={t('intent.constraintsLabel')} summary={limitsSummary} hint={t('intent.constraintsHint')}>
          <ChoiceChips<Constraint>
            multiple
            label={t('intent.constraintsLabel')}
            value={constraints}
            onChange={(constraint) => actions.dispatch({ type: 'intent/toggleConstraint', constraint })}
            options={CONSTRAINTS.map((c) => {
              const conflict = constraints.includes(c) ? null : conflictsWith(constraints, c);
              return {
                value: c,
                label: t(`intent.constraints.${c}`),
                icon: c === 'noShine' ? Sun : undefined,
                disabled: Boolean(conflict),
                disabledReason: conflict ? t(`intent.constraints.${conflict}`) : undefined,
              };
            })}
          />
        </Disclosure>
      </View>

      {/* Room so the last chips clear the decorative ribbon. */}
      <View style={styles.spacer} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  options: {
    paddingHorizontal: space[4],
    paddingTop: space[4],
    paddingBottom: space[1],
    borderRadius: radius.lg,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    ...shadow.card,
  },
  divider: { height: 1, backgroundColor: colors.line },
  spacer: { height: space[8] },
});
