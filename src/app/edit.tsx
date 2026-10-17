/**
 * Pantalla 8 — Hazlo tuyo. Edit one zone at a time; the other zones keep their exact
 * recipe parameters. «Ver cambio» validates first (a blocked change never renders), then
 * re-renders from the ORIGINAL selfie while the last valid image stays on screen with
 * «Aplicando cambio…». The new image dissolves in only when it arrives. One-step undo.
 */
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { Redirect, router } from 'expo-router';
import { Eye, RotateCcw } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';

import {
  AppText,
  ButtonRow,
  EditorialHeading,
  InlineNotice,
  PressableScale,
  PrimaryButton,
  Screen,
  SecondaryButton,
  SimulationSeal,
  ZoneEditor,
} from '@/components';
import type { Violation } from '@/domain/constraints';
import { ZONES, type Zone } from '@/domain/types';
import { useCancelOnLeave } from '@/hooks/useCancelOnLeave';
import { useMotionAllowed } from '@/hooks/useMotionAllowed';
import { joinList, useT } from '@/i18n';
import { imageFor, isSimulated, jobFor, renderErrorKey } from '@/state/selectors';
import { useSession } from '@/state/session';
import { colors, motion, radius, space } from '@/theme';

export default function EditScreen() {
  const t = useT();
  const reduceMotion = useReducedMotion();
  const motionAllowed = useMotionAllowed();
  const { state, actions } = useSession();
  const { selectedRecipe, draftRecipe, previousRecipe, edit, sourceImage } = state;
  const [open, setOpen] = useState<Zone | null>(() => ZONES.find((z) => selectedRecipe?.[z].enabled) ?? 'lips');
  const [showBefore, setShowBefore] = useState(false);
  const [blocked, setBlocked] = useState<Violation | null>(null);

  // One haptic per confirmed edit, fired when the new image actually arrives (or fails).
  useEffect(() => {
    if (edit.lastChange) void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [edit.lastChange]);
  useEffect(() => {
    if (edit.failed) void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  }, [edit.failed]);

  // Leaving mid-edit cancels it; the last valid look stays selected.
  useCancelOnLeave(edit.applyingId !== null, actions.cancelEdit);

  if (!sourceImage) return <Redirect href="/selfie" />;
  if (!selectedRecipe) return <Redirect href="/looks" />;

  const working = draftRecipe ?? selectedRecipe;
  const editError = edit.failed ? jobFor(state, draftRecipe)?.error : undefined;
  const applying = edit.applyingId !== null;
  const image = imageFor(state, selectedRecipe);
  const zoneList = (zones: Zone[]) =>
    joinList(
      zones.map((z) => t(`zonesLower.${z}`)),
      t('edit.listJoin'),
    );
  const others = state.variants.filter((v) => v.variant !== selectedRecipe.variant);

  const apply = async () => {
    setBlocked(null);
    const violations = await actions.applyDraft();
    if (violations.length > 0) setBlocked(violations[0]);
  };

  const summary = edit.lastChange
    ? edit.lastChange.kept.length > 0
      ? t('edit.summaryOne', { kept: zoneList(edit.lastChange.kept), changed: zoneList(edit.lastChange.changed) })
      : t('edit.summaryAll', { changed: zoneList(edit.lastChange.changed) })
    : null;

  const blockedMessage =
    blocked && 'constraint' in blocked
      ? t('edit.blocked', { constraint: t(`intent.constraints.${blocked.constraint}`) })
      : blocked
        ? t('edit.finishNotInKit')
        : null;

  return (
    <Screen
      header={{ stage: 'looks', backLocked: applying }}
      footer={
        draftRecipe || applying ? (
          <ButtonRow
            secondary={
              <SecondaryButton
                label={t('common.cancel')}
                arrow={false}
                disabled={applying}
                onPress={() => {
                  setBlocked(null);
                  actions.dispatch({ type: 'edit/discard' });
                }}
              />
            }
            primary={
              <PrimaryButton
                label={t('edit.seeChange')}
                icon={Eye}
                arrow={false}
                loading={applying}
                loadingLabel={t('edit.applying')}
                onPress={apply}
              />
            }
          />
        ) : (
          <ButtonRow
            secondary={
              previousRecipe ? (
                <SecondaryButton
                  label={t('common.undo')}
                  icon={RotateCcw}
                  arrow={false}
                  onPress={() => actions.dispatch({ type: 'edit/undo' })}
                />
              ) : undefined
            }
            primary={
              <PrimaryButton
                label={t('edit.toResult')}
                onPress={() => {
                  actions.dispatch({ type: 'result/finalize' });
                  router.push('/result');
                }}
              />
            }
          />
        )
      }
    >
      <EditorialHeading title={t('edit.title')} subtitle={t('edit.subtitle')} />

      <View style={styles.photo}>
        <Image
          source={image ?? sourceImage.uri}
          contentFit="cover"
          transition={reduceMotion ? 0 : motion.emphasis}
          style={StyleSheet.absoluteFill}
          accessible={!showBefore}
          accessibilityLabel={t('looks.lookAlt', { variant: t(`variants.${selectedRecipe.variant}`) })}
        />
        <Image
          source={sourceImage.uri}
          contentFit="cover"
          transition={0}
          style={[StyleSheet.absoluteFill, { opacity: showBefore ? 1 : 0 }]}
          accessible={showBefore}
          accessibilityLabel={t('selfie.review.photoAlt')}
        />
        {!showBefore && isSimulated(state, selectedRecipe) ? <SimulationSeal style={styles.seal} /> : null}
        <PressableScale
          accessibilityRole="switch"
          accessibilityLabel={t('compare.showBefore')}
          accessibilityState={{ checked: showBefore }}
          onPress={() => setShowBefore((v) => !v)}
          // Position on the pressable itself: absolute styles on the inner view left the touch
          // area at zero height (unreachable on iOS and for screen readers).
          containerStyle={styles.beforePos}
          style={[styles.beforeBtn, showBefore && styles.beforeBtnOn]}
        >
          <AppText variant="labelStrong" color={showBefore ? colors.ink : colors.white}>
            {showBefore ? t('compare.after') : t('compare.showBefore')}
          </AppText>
        </PressableScale>
      </View>
      {applying ? (
        <View style={styles.applying} accessibilityLiveRegion="polite">
          <ActivityIndicator color={colors.white} size="small" animating={motionAllowed} />
          <AppText variant="labelStrong" color={colors.white}>
            {t('edit.applying')}
          </AppText>
        </View>
      ) : null}

      {summary && !draftRecipe && !applying ? <InlineNotice tone="success" message={summary} /> : null}
      {edit.undone ? <InlineNotice tone="info" announce message={t('edit.undone')} /> : null}
      {edit.failed ? (
        <InlineNotice
          tone="error"
          focusOnMount
          message={editError?.retriable === false ? `${t('edit.renderError')} ${t(renderErrorKey(editError))}` : t('edit.renderError')}
          action={editError?.retriable === false ? undefined : { label: t('common.retry'), onPress: apply }}
        />
      ) : null}
      {blockedMessage ? <InlineNotice tone="error" focusOnMount message={blockedMessage} /> : null}

      <View style={styles.zones}>
        {(['eyes', 'lips', 'cheeks'] as const).map((zone) => (
          <ZoneEditor
            key={zone}
            zone={zone}
            value={working[zone]}
            rendered={selectedRecipe[zone]}
            expanded={open === zone}
            onToggle={() => setOpen((o) => (o === zone ? null : zone))}
            constraints={state.constraints}
            kit={state.kit}
            otherVariants={others.map((v) => ({ variant: v.variant, zone: v[zone] }))}
            onChange={(next) => {
              setBlocked(null);
              actions.dispatch({ type: 'edit/zone', zone, next });
            }}
            onCopyFrom={(from) => {
              setBlocked(null);
              actions.dispatch({ type: 'edit/copyZone', zone, from });
            }}
            locked={applying}
          />
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  photo: {
    width: '100%',
    aspectRatio: 4 / 5,
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: colors.creamDeep,
  },
  seal: { position: 'absolute', left: 0, right: 0, bottom: 0, borderRadius: 0 },
  beforePos: { position: 'absolute', top: space[3], right: space[3] },
  beforeBtn: {
    minHeight: 44,
    paddingHorizontal: space[4],
    justifyContent: 'center',
    borderRadius: radius.pill,
    backgroundColor: colors.inkScrim,
  },
  beforeBtnOn: { backgroundColor: colors.white },
  applying: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[2],
    paddingHorizontal: space[4],
    paddingVertical: space[2],
    borderRadius: radius.pill,
    backgroundColor: colors.inkScrim,
  },
  zones: { gap: space[3] },
});
