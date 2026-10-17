/**
 * ChoiceChips (DESIGN §5) for time, intensity and constraints.
 * States: normal, active, disabled (with a spoken reason), pressed.
 * Active is ink fill + white text + check mark — never color alone.
 */
import { Check, type LucideIcon } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { colors, layout, radius, space } from '@/theme';

import { AppText } from './AppText';
import { PressableScale } from './PressableScale';

export interface ChipOption<T extends string | number> {
  value: T;
  label: string;
  icon?: LucideIcon;
  disabled?: boolean;
  /** Why it is disabled — read by screen readers and shown by the parent if needed. */
  disabledReason?: string;
}

interface BaseProps<T extends string | number> {
  /** Group label for accessibility (e.g. "Tiempo disponible"). */
  label: string;
  options: ChipOption<T>[];
}

interface SingleProps<T extends string | number> extends BaseProps<T> {
  multiple?: false;
  value: T;
  onChange: (value: T) => void;
}

interface MultiProps<T extends string | number> extends BaseProps<T> {
  multiple: true;
  value: T[];
  onChange: (value: T) => void;
}

export type ChoiceChipsProps<T extends string | number> = SingleProps<T> | MultiProps<T>;

export function ChoiceChips<T extends string | number>(props: ChoiceChipsProps<T>) {
  const { label, options, multiple } = props;
  const isActive = (v: T) => (multiple ? (props.value as T[]).includes(v) : props.value === v);

  return (
    <View accessibilityRole={multiple ? undefined : 'radiogroup'} accessibilityLabel={label} style={styles.row}>
      {options.map((o) => {
        const active = isActive(o.value);
        const Icon = o.icon;
        const fg = active ? colors.white : o.disabled ? colors.muted : colors.ink;
        return (
          <PressableScale
            key={String(o.value)}
            accessibilityRole={multiple ? 'checkbox' : 'radio'}
            accessibilityLabel={o.label}
            accessibilityHint={o.disabled ? o.disabledReason : undefined}
            accessibilityState={{ checked: active, selected: active, disabled: o.disabled }}
            disabled={o.disabled}
            onPress={() => props.onChange(o.value)}
            transitionColors
            style={[styles.chip, o.disabled && styles.disabled, active && styles.active, active && o.disabled && styles.activeDisabled]}
            pressedStyle={active ? styles.activePressed : styles.pressed}
          >
            <View style={styles.inner}>
              {active ? (
                <Check color={fg} size={16} strokeWidth={2.25} />
              ) : Icon ? (
                <Icon color={fg} size={16} strokeWidth={1.75} />
              ) : null}
              <AppText variant="labelStrong" color={fg} numberOfLines={1}>
                {o.label}
              </AppText>
            </View>
          </PressableScale>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: space[2] },
  chip: {
    minHeight: layout.minTouch,
    paddingHorizontal: space[4],
    justifyContent: 'center',
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white,
  },
  inner: { flexDirection: 'row', alignItems: 'center', gap: space[2] },
  active: { backgroundColor: colors.ink, borderColor: colors.ink, borderStyle: 'solid' },
  activeDisabled: { opacity: 0.55 },
  pressed: { backgroundColor: colors.creamDeep },
  activePressed: { backgroundColor: colors.inkPressed },
  disabled: { backgroundColor: colors.cream, borderStyle: 'dashed', opacity: 0.7 },
});
