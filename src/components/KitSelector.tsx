/**
 * One optional kit category. Named swatches support empty, one/two selections and
 * the limit state; constraint-disabled categories and finishes explain why.
 * All changes stay with the parent; this component never calls a service or store.
 */
import { StyleSheet, View } from 'react-native';

import { isFinishAllowed, isZoneAllowed } from '@/domain/constraints';
import { shadesForZone } from '@/domain/shades';
import {
  FINISHES_BY_ZONE,
  KIT_MAX_PER_ZONE,
  type Constraint,
  type Finish,
  type KitItem,
  type Zone,
} from '@/domain/types';
import { useT } from '@/i18n';
import { colors, radius, shadow, space } from '@/theme';

import { AppText } from './AppText';
import { ChoiceChips } from './ChoiceChips';
import { InlineNotice } from './InlineNotice';
import { Swatch, shadeLabel } from './Swatch';
import { ZoneIcon } from './ZoneIcon';

export interface KitSelectorProps {
  zone: Zone;
  items: KitItem[];
  constraints: Constraint[];
  onToggleShade: (shadeId: string) => void;
  onSetFinish: (shadeId: string, finish: Finish) => void;
}

export function KitSelector({ zone, items, constraints, onToggleShade, onSetFinish }: KitSelectorProps) {
  const t = useT();
  const allowed = isZoneAllowed(zone, constraints);
  const zoneReason = t('kit.blockedByConstraint', { constraint: t('intent.constraints.noShadow') });
  const finishReason = t('kit.finishBlocked', { constraint: t('intent.constraints.noShine') });
  const atLimit = items.length >= KIT_MAX_PER_ZONE;
  return (
    <View style={styles.card}>
      <View style={[styles.content, !allowed && styles.dimmed]}>
        <View style={styles.heading}>
          <ZoneIcon zone={zone} />
          <View style={styles.flex}>
            <AppText variant="h3">{t(`kit.zones.${zone}`)}</AppText>
            <AppText variant="labelStrong">{t(`kit.zoneProduct.${zone}`)}</AppText>
          </View>
        </View>
        <AppText variant="label">
          {t('kit.zoneHint', { max: KIT_MAX_PER_ZONE })} {t('kit.selectedCount', { count: items.length })}
        </AppText>
        <View style={styles.swatches}>
          {shadesForZone(zone).map((shade) => {
            const selected = items.some((item) => item.shadeId === shade.id);
            const disabled = !allowed || (!selected && atLimit);
            return (
              <Swatch
                key={shade.id}
                shadeId={shade.id}
                size="md"
                selected={selected}
                disabled={disabled}
                disabledReason={!allowed ? zoneReason : t('kit.limitReached', { max: KIT_MAX_PER_ZONE })}
                onPress={() => {
                  if (!disabled) onToggleShade(shade.id);
                }}
              />
            );
          })}
        </View>
        {atLimit && allowed && <AppText variant="label">{t('kit.limitReached', { max: KIT_MAX_PER_ZONE })}</AppText>}
        {items.map((item) => (
          <View key={item.shadeId} style={styles.selectedShade}>
            <View style={styles.heading}>
              <Swatch shadeId={item.shadeId} size="sm" />
              <AppText variant="labelStrong" style={styles.flex}>
                {shadeLabel(t, item.shadeId)}
              </AppText>
            </View>
            <ChoiceChips
              label={`${shadeLabel(t, item.shadeId)} · ${t('kit.finishLabel')}`}
              value={item.finish}
              options={FINISHES_BY_ZONE[zone].map((finish) => ({
                value: finish,
                label: t(`finishes.${finish}`),
                disabled: !allowed || !isFinishAllowed(finish, constraints),
                disabledReason: !allowed ? zoneReason : finishReason,
              }))}
              onChange={(finish) => {
                if (allowed && isFinishAllowed(finish, constraints)) onSetFinish(item.shadeId, finish);
              }}
            />
          </View>
        ))}
        {allowed && constraints.includes('noShine') && <AppText variant="label">{finishReason}</AppText>}
      </View>
      {!allowed && <InlineNotice message={zoneReason} />}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.white, borderRadius: radius.md, padding: space[4], gap: space[4], ...shadow.card },
  content: { gap: space[3] },
  dimmed: { opacity: 0.55 },
  heading: { flexDirection: 'row', alignItems: 'flex-start', gap: space[3] },
  flex: { flex: 1, minWidth: 0 },
  swatches: { flexDirection: 'row', flexWrap: 'wrap', gap: space[2] },
  selectedShade: { gap: space[2], paddingTop: space[3], borderTopWidth: 1, borderTopColor: colors.line },
});
