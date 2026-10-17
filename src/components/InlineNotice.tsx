/**
 * InlineNotice (DESIGN §5): a concrete message placed next to the problem.
 * Tones: info, error, success — always icon + text, never color alone.
 * Errors announce themselves (role alert); pass `focusOnMount` when the notice blocks progress.
 */
import { AlertCircle, CheckCircle2, Info, Lock, type LucideIcon } from 'lucide-react-native';
import { useEffect, useRef, type ComponentRef } from 'react';
import { AccessibilityInfo, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { FadeInDown, useReducedMotion } from 'react-native-reanimated';

import { colors, easing, motion, radius, space } from '@/theme';

import { AppText } from './AppText';
import { Button } from './Button';

export type NoticeTone = 'info' | 'error' | 'success' | 'privacy';

const NOTICE_ENTER = FadeInDown.duration(motion.base)
  .easing(easing.enter)
  .withInitialValues({
    transform: [{ translateY: space[2] }],
  });

const TONES: Record<NoticeTone, { icon: LucideIcon; fg: string; bg: string; border: string }> = {
  info: { icon: Info, fg: colors.ink, bg: colors.creamDeep, border: colors.line },
  privacy: { icon: Lock, fg: colors.ink, bg: colors.creamDeep, border: colors.line },
  error: { icon: AlertCircle, fg: colors.error, bg: colors.errorSoft, border: colors.errorLine },
  success: { icon: CheckCircle2, fg: colors.success, bg: colors.successSoft, border: colors.successLine },
};

export interface InlineNoticeProps {
  tone?: NoticeTone;
  message: string;
  action?: { label: string; onPress: () => void };
  focusOnMount?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function InlineNotice({ tone = 'info', message, action, focusOnMount, style }: InlineNoticeProps) {
  const ref = useRef<ComponentRef<typeof View>>(null);
  const reduceMotion = useReducedMotion();
  const cfg = TONES[tone];
  const Icon = cfg.icon;

  useEffect(() => {
    if (!focusOnMount) return;
    if (ref.current) AccessibilityInfo.sendAccessibilityEvent(ref.current, 'focus');
  }, [focusOnMount]);

  return (
    <Animated.View
      entering={reduceMotion ? undefined : NOTICE_ENTER}
      style={[styles.box, { backgroundColor: cfg.bg, borderColor: cfg.border }, style]}
    >
      <View
        ref={ref}
        accessible
        accessibilityRole={tone === 'error' ? 'alert' : 'text'}
        accessibilityLiveRegion={tone === 'error' ? 'assertive' : 'polite'}
        style={styles.row}
      >
        <Icon color={cfg.fg} size={20} strokeWidth={1.75} />
        <AppText variant="label" color={tone === 'error' || tone === 'success' ? cfg.fg : colors.ink} style={styles.text}>
          {message}
        </AppText>
      </View>
      {action ? (
        <Button variant="secondary" compact arrow={false} label={action.label} onPress={action.onPress} style={styles.action} />
      ) : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  box: { borderRadius: radius.md, borderWidth: 1, padding: space[4], gap: space[3] },
  row: { flexDirection: 'row', gap: space[3], alignItems: 'flex-start' },
  text: { flex: 1 },
  action: { alignSelf: 'flex-start' },
});
