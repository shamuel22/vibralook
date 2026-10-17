/**
 * PrimaryButton / SecondaryButton (DESIGN §5): pill, 54pt high.
 * Primary: white on ink. Secondary: ink on white with ink border.
 * States: normal, pressed, loading, disabled. Loading keeps the label for screen readers
 * and blocks repeat presses.
 */
import { ArrowRight, type LucideIcon } from 'lucide-react-native';
import { ActivityIndicator, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { useMotionAllowed } from '@/hooks/useMotionAllowed';
import { colors, layout, radius, space } from '@/theme';

import { AppText } from './AppText';
import { PressableScale } from './PressableScale';

export interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  /** Leading icon (camera, image, eye, bookmark…). */
  icon?: LucideIcon;
  /** Trailing arrow for forward actions (default on primary). */
  arrow?: boolean;
  loading?: boolean;
  /** Label shown while loading (e.g. "Guardando…"). */
  loadingLabel?: string;
  disabled?: boolean;
  accessibilityHint?: string;
  style?: StyleProp<ViewStyle>;
  /** Compact height (44pt) for inline actions inside cards. */
  compact?: boolean;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  icon: Icon,
  arrow = variant === 'primary',
  loading = false,
  loadingLabel,
  disabled = false,
  accessibilityHint,
  style,
  compact = false,
}: ButtonProps) {
  const motionAllowed = useMotionAllowed();
  const primary = variant === 'primary';
  const fg = primary ? colors.white : colors.ink;
  const inactive = disabled || loading;
  const iconSize = compact ? 18 : 20;

  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={loading && loadingLabel ? loadingLabel : label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled, busy: loading }}
      disabled={inactive}
      onPress={onPress}
      containerStyle={style}
      style={[
        styles.base,
        compact && styles.compact,
        primary ? styles.primary : styles.secondary,
        disabled && (primary ? styles.primaryDisabled : styles.secondaryDisabled),
      ]}
      pressedStyle={primary ? styles.primaryPressed : styles.secondaryPressed}
    >
      <View style={styles.row}>
        {loading ? (
          <ActivityIndicator color={fg} size="small" animating={motionAllowed} />
        ) : Icon ? (
          <Icon color={fg} size={iconSize} strokeWidth={1.75} />
        ) : null}
        <AppText variant="button" color={fg} numberOfLines={2} align="center" style={styles.label}>
          {loading && loadingLabel ? loadingLabel : label}
        </AppText>
        {arrow && !loading ? <ArrowRight color={fg} size={iconSize} strokeWidth={1.75} /> : null}
      </View>
    </PressableScale>
  );
}

export function PrimaryButton(props: Omit<ButtonProps, 'variant'>) {
  return <Button {...props} variant="primary" />;
}

export function SecondaryButton(props: Omit<ButtonProps, 'variant'>) {
  return <Button {...props} variant="secondary" />;
}

const styles = StyleSheet.create({
  base: {
    minHeight: layout.buttonHeight,
    borderRadius: radius.pill,
    paddingHorizontal: space[6],
    paddingVertical: space[3],
    justifyContent: 'center',
  },
  compact: { minHeight: layout.minTouch, paddingHorizontal: space[4], paddingVertical: space[2] },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space[3] },
  label: { flexShrink: 1 },
  primary: { backgroundColor: colors.ink },
  primaryPressed: { backgroundColor: colors.inkPressed },
  primaryDisabled: { backgroundColor: colors.muted, opacity: 0.55 },
  secondary: { backgroundColor: colors.white, borderWidth: 1.5, borderColor: colors.ink },
  secondaryPressed: { backgroundColor: colors.creamDeep },
  secondaryDisabled: { borderColor: colors.muted, opacity: 0.5 },
});
