/**
 * Swatch: a color sample with an accessible name (e.g. "rosa malva"), never just a hex.
 * Selection is ring + check badge + accessibilityState — not color alone (DESIGN §5).
 * Display-only when `onPress` is omitted.
 */
import { Check, Lock } from 'lucide-react-native';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { getShade } from '@/domain/shades';
import { useT, type TKey } from '@/i18n';
import { colors, layout } from '@/theme';

import { PressableScale } from './PressableScale';

const SIZES = { sm: 24, md: 36, lg: 44 } as const;

export interface SwatchProps {
  shadeId: string;
  size?: keyof typeof SIZES;
  selected?: boolean;
  disabled?: boolean;
  disabledReason?: string;
  onPress?: () => void;
  /** Overrides the spoken label (default: the shade's localized name). */
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}

export function shadeLabel(t: ReturnType<typeof useT>, shadeId: string): string {
  return t(getShade(shadeId).nameKey as TKey);
}

export function Swatch({
  shadeId,
  size = 'md',
  selected = false,
  disabled = false,
  disabledReason,
  onPress,
  accessibilityLabel,
  style,
}: SwatchProps) {
  const t = useT();
  const shade = getShade(shadeId);
  const d = SIZES[size];
  const label = accessibilityLabel ?? shadeLabel(t, shadeId);
  const ring = d + 8;

  const dot = (
    <View style={[styles.ringBox, { width: ring, height: ring, borderRadius: ring / 2 }, selected && styles.ringOn]}>
      <View
        style={[
          styles.dot,
          { width: d, height: d, borderRadius: d / 2, backgroundColor: shade.hex },
          disabled && styles.dotDisabled,
        ]}
      />
      {selected && (
        <View style={styles.badge}>
          <Check color={colors.white} size={10} strokeWidth={3} />
        </View>
      )}
      {disabled && !selected && (
        <View style={styles.badgeMuted}>
          <Lock color={colors.white} size={9} strokeWidth={2.5} />
        </View>
      )}
    </View>
  );

  if (!onPress) {
    return (
      <View style={style} accessible accessibilityRole="image" accessibilityLabel={label}>
        {dot}
      </View>
    );
  }

  return (
    <PressableScale
      accessibilityRole="checkbox"
      accessibilityLabel={label}
      accessibilityHint={disabled ? disabledReason : undefined}
      accessibilityState={{ checked: selected, disabled }}
      disabled={disabled}
      onPress={onPress}
      containerStyle={style}
      style={[styles.touch, { minWidth: Math.max(layout.minTouch, ring), minHeight: Math.max(layout.minTouch, ring) }]}
    >
      {dot}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  touch: { alignItems: 'center', justifyContent: 'center' },
  ringBox: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  ringOn: { borderColor: colors.ink },
  dot: { borderWidth: 1, borderColor: 'rgba(36, 23, 43, 0.12)' },
  dotDisabled: { opacity: 0.35 },
  badge: {
    position: 'absolute',
    right: -2,
    top: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.ink,
    borderWidth: 2,
    borderColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeMuted: {
    position: 'absolute',
    right: -2,
    top: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
