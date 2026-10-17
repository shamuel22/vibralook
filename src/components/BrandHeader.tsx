/**
 * BrandHeader (DESIGN §4–5): back · compact logo · menu, plus optional contextual progress
 * ("Paso 2 de 5"). No tab bar. States: normal, camera (on dark), back locked during a
 * critical upload.
 */
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { ChevronLeft, Menu } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { useT } from '@/i18n';
import { STAGES, type Stage } from '@/state/selectors';
import { colors, layout, space } from '@/theme';

import { AppText } from './AppText';
import { PressableScale } from './PressableScale';

const LOGO = require('../../assets/brand/vl_logo_horizontal.png');
const LOGO_ASPECT = 5.739;

export interface BrandHeaderProps {
  /** Hide the back button (first screen). */
  hideBack?: boolean;
  /** Back stays visible but inert (critical upload in progress). */
  backLocked?: boolean;
  onBack?: () => void;
  /** Person-facing stage, shown as "Paso n de 5". */
  stage?: Stage;
  /** Light icons for dark camera surfaces. */
  tone?: 'default' | 'onDark';
  /** Hide the menu (camera). */
  hideMenu?: boolean;
}

export function BrandHeader({ hideBack, backLocked, onBack, stage, tone = 'default', hideMenu }: BrandHeaderProps) {
  const t = useT();
  const fg = tone === 'onDark' ? colors.white : colors.ink;
  const stepIndex = stage ? STAGES.indexOf(stage) + 1 : 0;

  const goBack = () => {
    if (onBack) onBack();
    else if (router.canGoBack()) router.back();
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.bar}>
        <View style={styles.side}>
          {!hideBack && (
            <PressableScale
              accessibilityRole="button"
              accessibilityLabel={t('common.back')}
              accessibilityState={{ disabled: backLocked }}
              disabled={backLocked}
              onPress={goBack}
              style={[styles.iconBtn, backLocked && styles.locked]}
            >
              <ChevronLeft color={fg} size={26} strokeWidth={1.5} />
            </PressableScale>
          )}
        </View>
        <View style={styles.logoWrap}>
          {/* The brand file is never recolored (DESIGN §2); camera keeps a cream header. */}
          <Image source={LOGO} style={styles.logo} contentFit="contain" accessibilityLabel={t('common.brand')} />
        </View>
        <View style={[styles.side, styles.right]}>
          {!hideMenu && (
            <PressableScale
              accessibilityRole="button"
              accessibilityLabel={t('common.menu')}
              onPress={() => router.push('/menu')}
              style={styles.iconBtn}
            >
              <Menu color={fg} size={24} strokeWidth={1.5} />
            </PressableScale>
          )}
        </View>
      </View>
      {stage ? (
        <View style={styles.progress} accessible accessibilityLabel={t('common.stepOf', { current: stepIndex, total: STAGES.length })}>
          <View style={styles.dots} importantForAccessibility="no-hide-descendants">
            {STAGES.map((s, i) => (
              <View key={s} style={[styles.dot, i < stepIndex && styles.dotDone, i === stepIndex - 1 && styles.dotCurrent]} />
            ))}
          </View>
          <AppText variant="label" color={tone === 'onDark' ? colors.white : colors.muted}>
            {t('common.stepOf', { current: stepIndex, total: STAGES.length })} · {t(`stages.${stage}`)}
          </AppText>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: space[2] },
  bar: { height: layout.headerHeight, flexDirection: 'row', alignItems: 'center' },
  side: { width: 56, alignItems: 'flex-start' },
  right: { alignItems: 'flex-end' },
  iconBtn: {
    width: layout.minTouch,
    height: layout.minTouch,
    alignItems: 'center',
    justifyContent: 'center',
  },
  locked: { opacity: 0.35 },
  logoWrap: { flex: 1, alignItems: 'center' },
  logo: { height: 22, width: Math.round(22 * LOGO_ASPECT) },
  progress: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space[2], paddingBottom: space[1] },
  dots: { flexDirection: 'row', gap: space[1] },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.line },
  dotDone: { backgroundColor: colors.rose },
  dotCurrent: { width: 16, backgroundColor: colors.ink },
});
