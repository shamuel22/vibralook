/**
 * Pantalla 1 — Intención. Free-text vibe + time, intensity and optional limits.
 * Nothing is sent anywhere here; the CTA validates the text and continues to the selfie.
 */
import { router } from 'expo-router';
import { Clock, Gauge, Sun } from 'lucide-react-native';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import {
  AppText,
  ChoiceChips,
  EditorialHeading,
  PrimaryButton,
  RibbonAccent,
  Screen,
  VibeComposer,
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
import { useSession } from '@/state/session';
import { space } from '@/theme';

const TIMES: TimeBudget[] = [5, 10, 20];
const INTENSITIES: IntensityPreference[] = ['subtle', 'balanced', 'expressive'];
const CONSTRAINTS: Constraint[] = ['noShadow', 'noShine', 'discreetLips'];

function Group({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <View style={styles.group}>
      <View style={styles.groupHead}>
        <AppText variant="labelStrong">{label}</AppText>
        {hint ? <AppText variant="label">{hint}</AppText> : null}
      </View>
      {children}
    </View>
  );
}

export default function IntentScreen() {
  const t = useT();
  const { state, actions } = useSession();
  const { userIntent, constraints } = state;
  const [error, setError] = useState<string | undefined>();
  const [errorAttempt, setErrorAttempt] = useState(0);

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

  return (
    <Screen
      header={{ hideBack: true, stage: 'vibe' }}
      background={<RibbonAccent height={120} />}
      footer={<PrimaryButton label={t('intent.cta')} onPress={submit} />}
    >
      <EditorialHeading title={t('intent.title')} subtitle={t('intent.subtitle')} />

      <VibeComposer
        value={userIntent.text}
        error={error}
        errorAttempt={errorAttempt}
        onChange={(text) => {
          actions.dispatch({ type: 'intent/text', text });
          if (error) setError(undefined);
        }}
      />

      <Group label={t('intent.timeLabel')}>
        <ChoiceChips
          label={t('intent.timeLabel')}
          value={userIntent.time}
          onChange={(time) => actions.dispatch({ type: 'intent/time', time })}
          options={TIMES.map((m) => ({ value: m, label: t('common.minutes', { count: m }), icon: Clock }))}
        />
      </Group>

      <Group label={t('intent.intensityLabel')}>
        <ChoiceChips
          label={t('intent.intensityLabel')}
          value={userIntent.intensity}
          onChange={(intensity) => actions.dispatch({ type: 'intent/intensity', intensity })}
          options={INTENSITIES.map((v) => ({ value: v, label: t(`intent.intensity.${v}`), icon: Gauge }))}
        />
      </Group>

      <Group label={t('intent.constraintsLabel')} hint={t('intent.constraintsHint')}>
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
      </Group>

      {/* Room so the last chips clear the decorative ribbon. */}
      <View style={styles.spacer} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  group: { gap: space[3] },
  groupHead: { gap: space[1] },
  spacer: { height: space[8] },
});
