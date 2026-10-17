/**
 * Footer pair of actions. Side by side when they fit; stacked (primary first) at large
 * font scales or narrow widths. Labels never break mid-word.
 */
import type { ReactNode } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';

import { space } from '@/theme';

/** Above this font scale, or below this width (pt), two buttons no longer share a row. */
const STACK_FONT_SCALE = 1.15;
const STACK_WIDTH = 380;

export function ButtonRow({ secondary, primary }: { secondary?: ReactNode; primary: ReactNode }) {
  const { fontScale, width } = useWindowDimensions();
  const stack = fontScale > STACK_FONT_SCALE || width < STACK_WIDTH;

  if (stack) {
    // Primary first: it is the expected next step and the easiest to reach.
    return (
      <View style={styles.column}>
        {primary}
        {secondary}
      </View>
    );
  }
  return (
    <View style={styles.row}>
      {secondary ? <View style={styles.secondary}>{secondary}</View> : null}
      <View style={styles.primary}>{primary}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: space[3] },
  column: { gap: space[2] },
  // The secondary keeps its natural width so its label never breaks mid-word ("Rept/ir");
  // the primary takes the rest and may wrap between words if it must.
  secondary: { flexShrink: 0 },
  primary: { flex: 1, minWidth: 0 },
});
