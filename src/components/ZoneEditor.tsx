/**
 * Controlled zone accordion: kept/changed, intensity bounds, shade/finish restrictions,
 * kit-only choices, copying and disabled zones. Applying a render locks every action.
 * Only the chevron and body opacity/translation animate, with reduced-motion parity.
 */
import { Check, ChevronDown, Circle, Minus, Plus } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, useReducedMotion } from 'react-native-reanimated';

import { isFinishAllowed, isZoneAllowed, maxIntensity, zoneViolations } from '@/domain/constraints';
import { sameZone } from '@/domain/recipe';
import { getShade, shadesForZone } from '@/domain/shades';
import {
  FINISHES_BY_ZONE,
  type Constraint,
  type Kit,
  type VariantKey,
  type Zone,
  type ZoneIntensity,
  type ZoneRecipe,
} from '@/domain/types';
import { useT } from '@/i18n';
import { colors, cssEasing, easing, layout, motion, radius, space } from '@/theme';

import { AppText } from './AppText';
import { ChoiceChips } from './ChoiceChips';
import { InlineNotice } from './InlineNotice';
import { PressableScale } from './PressableScale';
import { Swatch, shadeLabel } from './Swatch';
import { ZoneIcon } from './ZoneIcon';

export interface ZoneEditorProps {
  zone: Zone;
  value: ZoneRecipe;
  rendered: ZoneRecipe;
  expanded: boolean;
  onToggle: () => void;
  constraints: Constraint[];
  kit: Kit;
  otherVariants: { variant: VariantKey; zone: ZoneRecipe }[];
  onChange: (next: ZoneRecipe) => void;
  onCopyFrom: (variant: VariantKey) => void;
  locked?: boolean;
}

const BODY_ENTER = FadeInDown.duration(motion.base)
  .easing(easing.enter)
  .withInitialValues({ opacity: 0, transform: [{ translateY: space[2] }] });
const LEVELS = [1, 2, 3, 4, 5] as const;

export function ZoneEditor({
  zone,
  value,
  rendered,
  expanded,
  onToggle,
  constraints,
  kit,
  otherVariants,
  onChange,
  onCopyFrom,
  locked = false,
}: ZoneEditorProps) {
  const t = useT();
  const reduced = useReducedMotion();
  const kept = sameZone(value, rendered);
  const zoneAllowed = isZoneAllowed(zone, constraints);
  const editable = value.enabled && zoneAllowed;
  const cap = maxIntensity(zone, constraints);
  const declared = kit.status === 'declared';
  const shades = declared ? kit.items[zone].map((item) => getShade(item.shadeId)) : shadesForZone(zone);
  const off = t(value.disabledReason === 'notInKit' ? 'edit.zoneOffKit' : 'edit.zoneOff', {
    product: t(`kit.zoneProduct.${zone}`).toLowerCase(),
  });
  const constraintReason = t('kit.blockedByConstraint', { constraint: t('intent.constraints.noShadow') });
  const finishReason = t('kit.finishBlocked', { constraint: t('intent.constraints.noShine') });
  const summary = editable
    ? `${shadeLabel(t, value.shadeId)} · ${t(`finishes.${value.finish}`)} · ${t('edit.intensityLevel', { level: value.intensity })}`
    : t('edit.zoneOff');
  // A zone outside the look has nothing to keep or change.
  const statusKey = kept ? 'edit.kept' : 'edit.changed';

  function change(next: ZoneRecipe) {
    if (locked || !editable || zoneViolations(zone, next, constraints, kit).length) return;
    if (declared && !kit.items[zone].some((item) => item.shadeId === next.shadeId && item.finish === next.finish))
      return;
    onChange(next);
  }

  return (
    <View style={styles.card} accessibilityState={{ busy: locked }}>
      <PressableScale
        accessibilityRole="button"
        accessibilityLabel={`${t(`kit.zones.${zone}`)}. ${summary}${editable ? `. ${t(statusKey)}` : ''}`}
        accessibilityState={{ expanded, disabled: locked, busy: locked }}
        disabled={locked}
        onPress={onToggle}
        style={styles.header}
        pressedStyle={styles.pressed}
      >
        <View style={styles.headerRow}>
          <ZoneIcon zone={zone} />
          <AppText variant="h3" style={styles.flex}>
            {t(`kit.zones.${zone}`)}
          </AppText>
          <Animated.View
            style={{
              transform: [{ rotate: expanded ? '180deg' : '0deg' }],
              transitionProperty: 'transform',
              transitionDuration: reduced ? 0 : motion.base,
              transitionTimingFunction: cssEasing.standard,
            }}
            accessible={false}
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
          >
            <ChevronDown size={space[6]} color={colors.ink} strokeWidth={1.75} />
          </Animated.View>
        </View>
        <AppText variant="label" color={colors.ink}>
          {summary}
        </AppText>
        {editable && (
          <View style={[styles.status, !kept && styles.changed]}>
            {kept ? (
              <Check size={space[4]} color={colors.ink} strokeWidth={1.75} />
            ) : (
              <Circle size={space[2]} fill={colors.ink} color={colors.ink} />
            )}
            <AppText variant="labelStrong" style={styles.statusText}>
              {t(statusKey)}
            </AppText>
          </View>
        )}
      </PressableScale>
      {expanded && (
        <Animated.View
          entering={reduced ? undefined : BODY_ENTER}
          style={styles.body}
          accessible={locked}
          accessibilityLabel={locked ? t('edit.applying') : undefined}
          accessibilityState={{ busy: locked, disabled: locked }}
        >
          {!editable ? (
            (!zoneAllowed || value.disabledReason === 'notInKit') && (
              <InlineNotice message={!zoneAllowed ? constraintReason : off} />
            )
          ) : (
            <>
              <AppText variant="labelStrong">{t('intent.intensityLabel')}</AppText>
              <View style={styles.intensityRow}>
                <PressableScale
                  accessibilityRole="button"
                  accessibilityLabel={t('edit.lessIntensity')}
                  accessibilityState={{ disabled: locked || value.intensity <= 1, busy: locked }}
                  disabled={locked || value.intensity <= 1}
                  onPress={() => change({ ...value, intensity: (value.intensity - 1) as ZoneIntensity })}
                  style={[styles.intensityButton, (locked || value.intensity <= 1) && styles.disabled]}
                  pressedStyle={styles.pressed}
                >
                  <Minus size={space[5]} color={colors.ink} strokeWidth={1.75} />
                </PressableScale>
                <View
                  style={styles.levels}
                  accessible
                  accessibilityRole="text"
                  accessibilityLabel={t('edit.intensityLevel', { level: value.intensity })}
                >
                  {LEVELS.map((level) => (
                    <View
                      key={level}
                      style={[styles.level, level <= value.intensity && styles.filled, level > cap && styles.capped]}
                    />
                  ))}
                </View>
                <PressableScale
                  accessibilityRole="button"
                  accessibilityLabel={t('edit.moreIntensity')}
                  accessibilityState={{ disabled: locked || value.intensity >= cap, busy: locked }}
                  disabled={locked || value.intensity >= cap}
                  accessibilityHint={cap < 5 ? t('intent.constraints.discreetLips') : undefined}
                  onPress={() => change({ ...value, intensity: (value.intensity + 1) as ZoneIntensity })}
                  style={[styles.intensityButton, (locked || value.intensity >= cap) && styles.disabled]}
                  pressedStyle={styles.pressed}
                >
                  <Plus size={space[5]} color={colors.ink} strokeWidth={1.75} />
                </PressableScale>
              </View>
              <AppText variant="label">
                {t('edit.intensityLevel', { level: value.intensity })}
                {cap < 5 ? ` · ${t('intent.constraints.discreetLips')}` : ''}
              </AppText>
              <AppText variant="labelStrong">{t('edit.changeShade')}</AppText>
              <View style={styles.swatches}>
                {shades.map((shade) => {
                  const item = declared
                    ? kit.items[zone].find((candidate) => candidate.shadeId === shade.id)
                    : undefined;
                  const blocked = Boolean(item && !isFinishAllowed(item.finish, constraints));
                  return (
                    <Swatch
                      key={shade.id}
                      shadeId={shade.id}
                      size="md"
                      selected={shade.id === value.shadeId}
                      disabled={locked || blocked}
                      accessibilityLabel={`${shadeLabel(t, shade.id)}${item ? ` · ${t(`finishes.${item.finish}`)}` : ''}`}
                      disabledReason={locked ? t('edit.applying') : finishReason}
                      onPress={() =>
                        change({
                          ...value,
                          shadeId: shade.id,
                          finish: item?.finish ?? value.finish,
                          source: declared ? 'kit' : 'guide',
                        })
                      }
                    />
                  );
                })}
              </View>
              <AppText variant="labelStrong">{t('kit.finishLabel')}</AppText>
              <ChoiceChips
                label={t('kit.finishLabel')}
                value={value.finish}
                options={FINISHES_BY_ZONE[zone].map((finish) => ({
                  value: finish,
                  label: t(`finishes.${finish}`),
                  disabled:
                    locked ||
                    !isFinishAllowed(finish, constraints) ||
                    (declared &&
                      !kit.items[zone].some((item) => item.shadeId === value.shadeId && item.finish === finish)),
                  disabledReason: locked
                    ? t('edit.applying')
                    : !isFinishAllowed(finish, constraints)
                      ? finishReason
                      : t('edit.finishNotInKit'),
                }))}
                onChange={(finish) => change({ ...value, finish })}
              />
              {constraints.includes('noShine') && <AppText variant="label">{finishReason}</AppText>}
              {declared && <AppText variant="label">{t('result.kitLabel')}</AppText>}
              <AppText variant="labelStrong">{t('edit.useFromOther')}</AppText>
              <View style={styles.copies}>
                {otherVariants.map((other) => {
                  const violations = zoneViolations(zone, other.zone, constraints, kit);
                  const missingFinish =
                    declared &&
                    !kit.items[zone].some(
                      (item) => item.shadeId === other.zone.shadeId && item.finish === other.zone.finish,
                    );
                  const disabled = locked || !other.zone.enabled || violations.length > 0 || missingFinish;
                  const violation = violations[0];
                  const reason = locked
                    ? t('edit.applying')
                    : !other.zone.enabled
                      ? t('edit.zoneOff')
                      : violation && 'constraint' in violation
                        ? t('edit.blocked', { constraint: t(`intent.constraints.${violation.constraint}`) })
                        : t('edit.finishNotInKit');
                  const label = t('edit.useFromVariant', { variant: t(`variants.${other.variant}`) });
                  return (
                    <PressableScale
                      key={other.variant}
                      accessibilityRole="button"
                      accessibilityLabel={label}
                      accessibilityHint={disabled ? reason : undefined}
                      accessibilityState={{ disabled, busy: locked }}
                      disabled={disabled}
                      onPress={() => {
                        if (!disabled) onCopyFrom(other.variant);
                      }}
                      style={[styles.copy, disabled && styles.disabled]}
                      pressedStyle={styles.pressed}
                    >
                      <View
                        accessible={false}
                        accessibilityElementsHidden
                        importantForAccessibility="no-hide-descendants"
                      >
                        <Swatch shadeId={other.zone.shadeId} size="sm" />
                      </View>
                      <AppText variant="labelStrong" style={styles.copyLabel}>
                        {label}
                      </AppText>
                    </PressableScale>
                  );
                })}
              </View>
            </>
          )}
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.white, borderRadius: radius.md, borderWidth: 1, borderColor: colors.line },
  header: { minHeight: layout.minTouch, padding: space[4], borderRadius: radius.md, gap: space[2] },
  headerRow: { flexDirection: 'row', gap: space[3], alignItems: 'flex-start' },
  flex: { flex: 1, minWidth: 0 },
  pressed: { backgroundColor: colors.creamDeep },
  status: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[2],
    backgroundColor: colors.creamDeep,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: space[3],
    paddingVertical: space[1],
  },
  changed: { borderColor: colors.coral, backgroundColor: colors.white },
  statusText: { flexShrink: 1 },
  body: { padding: space[4], paddingTop: 0, gap: space[3] },
  intensityRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space[2] },
  intensityButton: {
    width: layout.minTouch,
    height: layout.minTouch,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.pill,
  },
  levels: { flex: 1, flexDirection: 'row', flexWrap: 'wrap', gap: space[2], justifyContent: 'center' },
  level: { width: space[3], height: space[3], borderWidth: 1, borderColor: colors.muted, borderRadius: radius.pill },
  filled: { backgroundColor: colors.ink, borderColor: colors.ink },
  capped: { borderStyle: 'dashed', opacity: 0.5 },
  swatches: { flexDirection: 'row', flexWrap: 'wrap', gap: space[2] },
  copies: { gap: space[2] },
  copy: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: layout.minTouch,
    gap: space[2],
    paddingHorizontal: space[3],
    paddingVertical: space[2],
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.line,
  },
  copyLabel: { flexShrink: 1 },
  disabled: { opacity: 0.5, backgroundColor: colors.creamDeep },
});
