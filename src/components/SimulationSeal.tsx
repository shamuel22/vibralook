/**
 * Visible seal on any image produced by the Phase 1 mock: the picture is the untouched
 * selfie, not a virtual try-on (brief §8.3, DESIGN §9.4). Rendered over photos.
 */
import { FlaskConical } from 'lucide-react-native';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { useT } from '@/i18n';
import { colors, radius, space } from '@/theme';

import { AppText } from './AppText';

export function SimulationSeal({ style, compact }: { style?: StyleProp<ViewStyle>; compact?: boolean }) {
  const t = useT();
  return (
    <View style={[styles.pill, style]} accessible accessibilityLabel={t('common.simulatedSeal')}>
      <FlaskConical color={colors.white} size={14} strokeWidth={2} />
      {!compact && (
        <AppText variant="label" color={colors.white} numberOfLines={2} style={styles.text}>
          {t('common.simulatedSeal')}
        </AppText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[1],
    alignSelf: 'flex-start',
    backgroundColor: colors.inkScrim,
    borderRadius: radius.pill,
    paddingHorizontal: space[3],
    paddingVertical: space[1],
  },
  text: { fontSize: 12, lineHeight: 16, flexShrink: 1 },
});
