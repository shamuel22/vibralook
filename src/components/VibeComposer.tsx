/**
 * VibeComposer (DESIGN §5): free text with editable examples and a reasonable limit.
 * States: empty, valid, error. Picking an example fills the field (still editable) and
 * shows that example's scene artwork slot; typing freely hides it.
 */
import { PencilLine } from 'lucide-react-native';
import { useRef, type ComponentRef } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { VIBE_MAX_LENGTH } from '@/domain/types';
import { useT } from '@/i18n';
import { colors, fonts, layout, radius, shadow, space } from '@/theme';

import { AppText } from './AppText';
import { ArtPlaceholder, type ArtId } from './ArtPlaceholder';
import { PressableScale } from './PressableScale';

export type VibeExample = 'jazz' | 'sakura' | 'meeting';
export const VIBE_EXAMPLES: VibeExample[] = ['jazz', 'sakura', 'meeting'];
const EXAMPLE_ART: Record<VibeExample, ArtId> = {
  jazz: 'vl_intencion_escena_jazz_v01',
  sakura: 'vl_intencion_escena_sakura_v01',
  meeting: 'vl_intencion_escena_reunion_v01',
};

export interface VibeComposerProps {
  value: string;
  onChange: (text: string) => void;
  error?: string;
}

export function VibeComposer({ value, onChange, error }: VibeComposerProps) {
  const t = useT();
  const input = useRef<ComponentRef<typeof TextInput>>(null);
  const activeExample = VIBE_EXAMPLES.find((e) => t(`intent.examples.${e}`) === value.trim());

  return (
    <View style={styles.wrap}>
      <View style={[styles.card, error ? styles.cardError : null]}>
        {activeExample ? (
          <View>
            <ArtPlaceholder id={EXAMPLE_ART[activeExample]} aspectRatio={16 / 9} decorative style={styles.art} />
          </View>
        ) : null}
        <Pressable
          accessible={false}
          onPress={() => input.current?.focus()}
          style={styles.inputArea}
        >
          <View style={styles.labelRow}>
            <AppText variant="labelStrong" nativeID="vibe-label">
              {t('intent.fieldLabel')}
            </AppText>
            <PencilLine color={colors.muted} size={18} strokeWidth={1.5} />
          </View>
          <TextInput
            ref={input}
            value={value}
            onChangeText={onChange}
            placeholder={t('intent.placeholder')}
            placeholderTextColor={colors.muted}
            multiline
            maxLength={VIBE_MAX_LENGTH}
            submitBehavior="blurAndSubmit"
            returnKeyType="done"
            accessibilityLabel={t('intent.fieldLabel')}
            accessibilityLabelledBy="vibe-label"
            accessibilityHint={error}
            maxFontSizeMultiplier={2}
            style={styles.input}
            selectionColor={colors.coral}
          />
          {activeExample ? (
            <AppText variant="label">{t(`intent.exampleCardBody.${activeExample}`)}</AppText>
          ) : null}
          <AppText variant="label" align="right" accessibilityElementsHidden importantForAccessibility="no">
            {t('intent.counter', { count: value.length, max: VIBE_MAX_LENGTH })}
          </AppText>
        </Pressable>
      </View>

      {error ? (
        <AppText variant="labelStrong" color={colors.error} accessibilityRole="alert" accessibilityLiveRegion="assertive">
          {error}
        </AppText>
      ) : null}

      <View style={styles.examples}>
        <AppText variant="eyebrow">{t('intent.examplesLabel')}</AppText>
        <View style={styles.exampleRow}>
          {VIBE_EXAMPLES.map((e) => {
            const label = t(`intent.examples.${e}`);
            const active = activeExample === e;
            return (
              <PressableScale
                key={e}
                accessibilityRole="button"
                accessibilityLabel={label}
                accessibilityHint={t('intent.editExample')}
                accessibilityState={{ selected: active }}
                onPress={() => onChange(label)}
                transitionColors
                style={[styles.example, active && styles.exampleActive]}
                pressedStyle={styles.examplePressed}
              >
                <AppText variant="labelStrong" color={colors.ink}>
                  {label}
                </AppText>
              </PressableScale>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: space[3] },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    overflow: 'hidden',
    ...shadow.card,
  },
  cardError: { borderColor: colors.error, borderWidth: 1.5 },
  art: { borderRadius: 0, borderWidth: 0, borderBottomWidth: 1.5 },
  inputArea: { padding: space[4], gap: space[2] },
  labelRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  input: {
    fontFamily: fonts.serif,
    fontSize: 22,
    lineHeight: 28,
    color: colors.ink,
    minHeight: 64,
    padding: 0,
    textAlignVertical: 'top',
  },
  examples: { gap: space[2], marginTop: space[2] },
  exampleRow: { flexDirection: 'row', flexWrap: 'wrap', gap: space[2] },
  example: {
    minHeight: layout.minTouch,
    justifyContent: 'center',
    paddingHorizontal: space[4],
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.creamDeep,
  },
  exampleActive: { borderColor: colors.ink, backgroundColor: colors.white },
  examplePressed: { backgroundColor: colors.white },
});
