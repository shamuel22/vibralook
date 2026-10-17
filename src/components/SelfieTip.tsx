/** A short, wrapping framing tip; the icon adds no information for screen readers. */
import type { LucideIcon } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { colors, radius, space } from '@/theme';

import { AppText } from './AppText';

export function SelfieTip({ icon: Icon, title, body }: { icon: LucideIcon; title: string; body: string }) {
  return (
    <View style={styles.tip}>
      <View
        style={styles.icon}
        accessible={false}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        <Icon size={space[8]} color={colors.ink} strokeWidth={1.5} />
      </View>
      <AppText variant="labelStrong" align="center">
        {title}
      </AppText>
      <AppText variant="label" align="center" color={colors.muted}>
        {body}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  tip: { flexGrow: 1, flexShrink: 1, alignItems: 'center', gap: space[2] },
  icon: {
    width: space[12],
    height: space[12],
    borderRadius: radius.pill,
    backgroundColor: colors.creamDeep,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
