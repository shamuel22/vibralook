/**
 * Pantalla 4 — Revisar selfie. The normalized original retains its full aspect ratio;
 * basic validation gates the next step without scoring or altering the person's face.
 */
import { Image } from 'expo-image';
import { Redirect, router } from 'expo-router';
import { CheckCircle2, RotateCcw } from 'lucide-react-native';
import { ActivityIndicator, StyleSheet, View, useWindowDimensions } from 'react-native';

import {
  AppText,
  EditorialHeading,
  InlineNotice,
  PrimaryButton,
  RibbonAccent,
  Screen,
  SecondaryButton,
} from '@/components';
import { useMotionAllowed } from '@/hooks/useMotionAllowed';
import { useT } from '@/i18n';
import { useSession } from '@/state/session';
import { colors, layout, radius, space } from '@/theme';

function CheckItem({ label }: { label: string }) {
  return (
    <View style={styles.checkItem}>
      <View accessible={false} importantForAccessibility="no-hide-descendants">
        <CheckCircle2 size={space[6]} color={colors.ink} strokeWidth={1.5} />
      </View>
      <AppText variant="label" style={styles.checkLabel}>
        {label}
      </AppText>
    </View>
  );
}

export default function ReviewSelfieScreen() {
  const t = useT();
  const motionAllowed = useMotionAllowed();
  const { state } = useSession();
  const { width, height } = useWindowDimensions();
  const image = state.sourceImage;
  if (!image) return <Redirect href="/selfie" />;
  const aspect = image.width / image.height;
  const photoWidth = Math.min(width - layout.gutter * 2, layout.maxWidth - layout.gutter * 2, height * 0.42 * aspect);
  const valid = image.check.status === 'valid';

  return (
    <Screen
      header={{ stage: 'selfie' }}
      background={<RibbonAccent />}
      footer={
        <View style={styles.footer}>
          <SecondaryButton
            label={t('selfie.review.retake')}
            icon={RotateCcw}
            style={styles.footerButton}
            onPress={() => router.replace(image.origin === 'camera' ? '/selfie/camera' : '/selfie')}
          />
          <PrimaryButton
            label={t('selfie.review.use')}
            disabled={!valid}
            style={styles.primaryButton}
            onPress={() => {
              if (valid) router.push('/kit');
            }}
          />
        </View>
      }
    >
      <EditorialHeading title={t('selfie.review.title')} subtitle={t('selfie.review.subtitle')} />
      <View style={[styles.photo, { width: photoWidth, aspectRatio: aspect }]}>
        <Image
          source={{ uri: image.uri }}
          contentFit="cover"
          style={StyleSheet.absoluteFill}
          accessibilityLabel={t('selfie.review.photoAlt')}
        />
        {image.check.status === 'checking' && (
          <View
            style={styles.checking}
            accessible
            accessibilityRole="text"
            accessibilityLiveRegion="polite"
            accessibilityLabel={t('selfie.review.checking')}
          >
            <ActivityIndicator color={colors.white} size="small" animating={motionAllowed} />
            <AppText variant="label" color={colors.white} style={styles.checkingText}>
              {t('selfie.review.checking')}
            </AppText>
          </View>
        )}
      </View>
      {valid && (
        <View style={styles.checks}>
          <CheckItem label={t('selfie.review.checkFace')} />
          <CheckItem label={t('selfie.review.checkLight')} />
        </View>
      )}
      {image.check.status === 'invalid' && (
        <InlineNotice
          key={image.check.issue}
          tone="error"
          focusOnMount
          message={t(`selfie.review.issues.${image.check.issue}`)}
        />
      )}
      <View style={styles.spacer} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  photo: { alignSelf: 'center', borderRadius: radius.md, overflow: 'hidden', backgroundColor: colors.creamDeep },
  checking: {
    position: 'absolute',
    bottom: space[3],
    left: space[3],
    right: space[3],
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[2],
    padding: space[3],
    borderRadius: radius.pill,
    backgroundColor: colors.inkScrim,
  },
  checkingText: { flex: 1 },
  checks: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: colors.creamDeep,
    borderRadius: radius.md,
    padding: space[4],
    gap: space[4],
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[2],
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: '40%',
  },
  checkLabel: { flexShrink: 1 },
  footer: { flexDirection: 'row', flexWrap: 'wrap', gap: space[3] },
  footerButton: { flexGrow: 1, flexBasis: layout.minTouch * 3 },
  primaryButton: { flexGrow: 1.6, flexBasis: layout.minTouch * 4 },
  spacer: { height: space[4] },
});
