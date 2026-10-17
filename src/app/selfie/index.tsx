/**
 * Pantalla 2 — Preparar selfie. Permission follows a deliberate tap; processing and
 * validation preserve the person's vibe and kit on every recovery path.
 */
import { useCameraPermissions } from 'expo-camera';
import { launchImageLibraryAsync } from 'expo-image-picker';
import { openSettings } from 'expo-linking';
import { router, useFocusEffect } from 'expo-router';
import { Ban, Camera, Image as ImageIcon, ScanFace, Sun } from 'lucide-react-native';
import { useCallback, useRef, useState } from 'react';
import { AppState, StyleSheet, View, useWindowDimensions } from 'react-native';

import {
  ArtPlaceholder,
  EditorialHeading,
  InlineNotice,
  PrimaryButton,
  RibbonAccent,
  Screen,
  SecondaryButton,
} from '@/components';
import { SelfieTip } from '@/components/SelfieTip';
import { useT, type TKey } from '@/i18n';
import { prepareSelfie, SelfiePreparationError } from '@/services/imagePrep';
import { useSession } from '@/state/session';
import { layout, space } from '@/theme';

export default function PrepareSelfieScreen() {
  const t = useT();
  const { actions } = useSession();
  const [permission, requestPermission, refreshPermission] = useCameraPermissions();
  const [attempted, setAttempted] = useState(false);
  const [opening, setOpening] = useState(false);
  const [picking, setPicking] = useState(false);
  const [error, setError] = useState<TKey | null>(null);
  const operation = useRef(0);
  const busy = useRef(false);
  const { fontScale } = useWindowDimensions();

  useFocusEffect(
    useCallback(() => {
      busy.current = false;
      setOpening(false);
      setPicking(false);
      void refreshPermission().catch(() => {});
      // Returning from Settings may have changed the permission.
      const subscription = AppState.addEventListener('change', (next) => {
        if (next === 'active') void refreshPermission().catch(() => {});
      });
      return () => {
        operation.current += 1;
        busy.current = false;
        subscription.remove();
      };
    }, [refreshPermission]),
  );

  const openCamera = async () => {
    if (busy.current) return;
    busy.current = true;
    const id = ++operation.current;
    setOpening(true);
    setAttempted(true);
    setError(null);
    try {
      const current = await refreshPermission();
      const access = current.granted || !current.canAskAgain ? current : await requestPermission();
      if (id !== operation.current) return;
      // A missing or failing camera is handled by the camera screen (onMountError → upload).
      if (access.granted) router.push('/selfie/camera');
      setOpening(false);
      busy.current = false;
    } catch {
      if (id !== operation.current) return;
      setError('selfie.camera.error');
      setOpening(false);
      busy.current = false;
    }
  };

  const upload = async () => {
    if (busy.current) return;
    busy.current = true;
    const id = ++operation.current;
    setPicking(true);
    setError(null);
    try {
      const result = await launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: false, quality: 1 });
      if (result.canceled || id !== operation.current) return;
      const prepared = await prepareSelfie(result.assets[0].uri, 'library');
      if (id !== operation.current) return;
      actions.cancelInFlight();
      // Review owns the visible checking state, so validation must not delay navigation.
      void actions.submitSelfie(prepared);
      router.push('/selfie/review');
    } catch (failure) {
      if (id === operation.current) {
        const issue = failure instanceof SelfiePreparationError ? failure.issue : 'unsupported';
        setError(`selfie.review.issues.${issue}`);
      }
    } finally {
      if (id === operation.current) {
        setPicking(false);
        busy.current = false;
      }
    }
  };

  const permanentlyDenied = attempted && permission && !permission.granted && !permission.canAskAgain;
  return (
    <Screen
      header={{ stage: 'selfie' }}
      background={<RibbonAccent />}
      footer={
        <>
          <PrimaryButton
            label={t('selfie.prepare.openCamera')}
            icon={Camera}
            loading={opening}
            disabled={picking}
            onPress={() => void openCamera()}
          />
          <SecondaryButton
            label={t('selfie.prepare.uploadPhoto')}
            icon={ImageIcon}
            loading={picking}
            disabled={opening}
            onPress={() => void upload()}
          />
        </>
      }
    >
      <EditorialHeading title={t('selfie.prepare.title')} subtitle={t('selfie.prepare.subtitle')} />
      <ArtPlaceholder
        id="vl_selfie_guia_encuadre_v01"
        aspectRatio={1}
        decorative
        contentFit="contain"
        style={styles.art}
      />
      <View style={styles.tips}>
        {(
          [
            [ScanFace, 'tipFaceTitle', 'tipFaceBody'],
            [Sun, 'tipLightTitle', 'tipLightBody'],
            [Ban, 'tipFilterTitle', 'tipFilterBody'],
          ] as const
        ).map(([icon, title, body]) => (
          <View key={title} style={[styles.tip, { flexBasis: layout.minTouch * 2 * Math.min(fontScale, 2) }]}>
            <SelfieTip icon={icon} title={t(`selfie.prepare.${title}`)} body={t(`selfie.prepare.${body}`)} />
          </View>
        ))}
      </View>
      <InlineNotice tone="privacy" message={t('selfie.prepare.privacy')} />
      {permanentlyDenied && (
        <InlineNotice
          tone="error"
          message={`${t('selfie.prepare.deniedTitle')}. ${t('selfie.prepare.deniedBody')}`}
          action={{
            label: t('selfie.prepare.openSettings'),
            onPress: () => {
              void openSettings().catch(() => setError('errors.generic'));
            },
          }}
        />
      )}
      {error && <InlineNotice key={error} tone="error" message={t(error)} focusOnMount />}
      <View style={styles.spacer} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  art: { width: '70%', alignSelf: 'center' },
  tips: { flexDirection: 'row', flexWrap: 'wrap', gap: space[3], justifyContent: 'center' },
  tip: { flexGrow: 1, flexShrink: 1 },
  spacer: { height: space[4] },
});
