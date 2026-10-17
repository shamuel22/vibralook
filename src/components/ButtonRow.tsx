/**
 * Footer pair of actions. Side by side when they fit; stacked (primary first) at large
 * font scales or narrow widths so labels never break mid-word.
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
      <View style={secondary ? styles.primary : styles.secondary}>{primary}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: space[3] },
  column: { gap: space[2] },
  secondary: { flex: 1 },
  primary: { flex: 1.5 },
});
