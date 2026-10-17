/**
 * EditorialHeading (DESIGN §5): serif title + short sans support line, centered.
 * Handles two-line titles and long translations (no fixed heights).
 */
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, space } from '@/theme';

import { AppText } from './AppText';

export function EditorialHeading({
  title,
  subtitle,
  level = 1,
  align = 'center',
  style,
}: {
  title: string;
  subtitle?: string;
  level?: 1 | 2;
  align?: 'center' | 'left';
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.wrap, align === 'center' && styles.center, style]}>
      <AppText variant={level === 1 ? 'h1' : 'h2'} align={align}>
        {title}
      </AppText>
      {subtitle ? (
        <AppText variant="body" color={colors.muted} align={align} style={styles.subtitle}>
          {subtitle}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: space[2] },
  center: { alignItems: 'center' },
  subtitle: { maxWidth: 420 },
});
