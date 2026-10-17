/**
 * Footer pair of actions, responsive by measurement rather than by fixed breakpoints:
 * both buttons are measured at their natural width (invisible copies); if they fit side by
 * side they share the row, otherwise they stack (primary first). No label is ever cut or
 * broken mid-word, whatever the screen width, language or OS font size.
 */
import { useState, type ReactNode } from 'react';
import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';

import { space } from '@/theme';

const GAP = space[3];

export function ButtonRow({ secondary, primary }: { secondary?: ReactNode; primary: ReactNode }) {
  const [available, setAvailable] = useState(0);
  const [secondaryWidth, setSecondaryWidth] = useState(0);
  const [primaryWidth, setPrimaryWidth] = useState(0);

  const measure = (set: (n: number) => void) => (e: LayoutChangeEvent) =>
    set(Math.ceil(e.nativeEvent.layout.width));

  if (!secondary) return <View>{primary}</View>;

  const measured = available > 0 && secondaryWidth > 0 && primaryWidth > 0;
  const fits = measured && secondaryWidth + GAP + primaryWidth <= available;

  return (
    <View onLayout={measure(setAvailable)}>
      {/* Invisible natural-width copies, used only for measuring. */}
      <View
        style={styles.measure}
        pointerEvents="none"
        accessible={false}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        <View style={styles.natural} onLayout={measure(setSecondaryWidth)}>
          {secondary}
        </View>
        <View style={styles.natural} onLayout={measure(setPrimaryWidth)}>
          {primary}
        </View>
      </View>

      {/* Hidden until measured, so a cut label never flashes on the first frame. */}
      <View style={!measured && styles.pending}>
        {fits ? (
          <View style={styles.row}>
            <View style={styles.natural}>{secondary}</View>
            <View style={styles.fill}>{primary}</View>
          </View>
        ) : (
          // Primary first: it is the expected next step and the easiest to reach.
          <View style={styles.column}>
            {primary}
            {secondary}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  measure: { position: 'absolute', top: 0, left: 0, flexDirection: 'row', opacity: 0 },
  natural: { flexShrink: 0, alignSelf: 'flex-start' },
  pending: { opacity: 0 },
  row: { flexDirection: 'row', gap: GAP },
  fill: { flex: 1 },
  column: { gap: space[2] },
});
