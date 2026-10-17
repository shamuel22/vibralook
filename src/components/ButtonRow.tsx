/**
 * Footer pair of actions. Side by side when they fit; stacked (primary first) at large
 * font scales or narrow widths so labels never break mid-word.
 */
import { Children, type ReactNode } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';

import { space } from '@/theme';

/** Above this font scale, or below this width (pt), two buttons no longer share a row. */
const STACK_FONT_SCALE = 1.3;
const STACK_WIDTH = 340;

export function ButtonRow({ secondary, primary }: { secondary?: ReactNode; primary: ReactNode }) {
  const { fontScale, width } = useWindowDimensions();
  const stack = fontScale >= STACK_FONT_SCALE || width < STACK_WIDTH;
  const items = Children.toArray([secondary, primary]).filter(Boolean);

  if (stack) {
    // Primary first: it is the expected next step and the easiest to reach.
    return <View style={styles.column}>{[...items].reverse()}</View>;
  }
  return (
    <View style={styles.row}>
      {items.map((item, i) => (
        <View key={i} style={i === items.length - 1 && items.length > 1 ? styles.primary : styles.secondary}>
          {item}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: space[3] },
  column: { gap: space[2] },
  secondary: { flex: 1 },
  primary: { flex: 1.5 },
});
