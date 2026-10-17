/**
 * Pantalla 3 — Cámara. A real preview with framing advice, never face detection.
 * Native camera sessions exist only while focused and in the foreground.
 */
import { CameraView, useCameraPermissions, type CameraType } from 'expo-camera';
import { launchImageLibraryAsync } from 'expo-image-picker';
import { router, useFocusEffect, useIsFocused } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Image as ImageIcon, RefreshCw, X, type LucideIcon } from 'lucide-react-native';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, AppState, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { useReducedMotion } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText, BrandHeader, InlineNotice, PressableScale, SecondaryButton } from '@/components';
import { FaceGuide } from '@/components/FaceGuide';
import { useMotionAllowed } from '@/hooks/useMotionAllowed';
import { useT, type TKey } from '@/i18n';
import { prepareSelfie, SelfiePreparationError } from '@/services/imagePrep';
import { useSession } from '@/state/session';
import { colors, cssEasing, layout, motion, radius, space } from '@/theme';

type CameraState = 'starting' | 'ready' | 'capturing' | 'error';

function CameraControl({
  icon: Icon,
  label,
  disabled,
  onPress,
}: {
  icon: LucideIcon;
  label: string;
  disabled?: boolean;
  onPress: () => void;
}) {
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      containerStyle={styles.controlWrap}
      style={styles.control}
    >
      <View
        style={styles.controlIcon}
        accessible={false}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        <Icon size={space[6]} color={colors.ink} strokeWidth={1.75} />
      </View>
      <AppText variant="label" align="center" color={colors.white}>
        {label}
      </AppText>
    </PressableScale>
  );
}

function CameraHint({ ready }: { ready: boolean }) {
  const t = useT();
  const reduced = useReducedMotion();
  const [light, setLight] = useState(false);
  useEffect(() => {
    if (!ready) return;
    const timer = setInterval(() => setLight((value) => !value), motion.ribbonCycle / 2);
    return () => clearInterval(timer);
  }, [ready]);
  const searching = t('selfie.camera.hintSearching');
  const lighting = t('selfie.camera.hintLight');
  const showLight = ready && light;
  const transition = {
    transitionProperty: 'opacity' as const,
    transitionDuration: reduced ? 0 : motion.base,
    transitionTimingFunction: cssEasing.standard,
  };
  return (
    <View style={styles.hint} accessible accessibilityRole="text" accessibilityLabel={showLight ? lighting : searching}>
      <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" accessible={false}>
        <AppText variant="label" align="center" style={styles.measureHint}>
          {searching.length > lighting.length ? searching : lighting}
        </AppText>
        <Animated.View style={[styles.hintLayer, transition, { opacity: showLight ? 0 : 1 }]}>
          <AppText variant="label" align="center" color={colors.white}>
            {searching}
          </AppText>
        </Animated.View>
        <Animated.View style={[styles.hintLayer, transition, { opacity: showLight ? 1 : 0 }]}>
          <AppText variant="label" align="center" color={colors.white}>
            {lighting}
          </AppText>
        </Animated.View>
      </View>
    </View>
  );
}

export default function CameraScreen() {
  const t = useT();
  const motionAllowed = useMotionAllowed();
  const { actions } = useSession();
  const insets = useSafeAreaInsets();
  const focused = useIsFocused();
  const [permission, , refreshPermission] = useCameraPermissions();
  const [foreground, setForeground] = useState(AppState.currentState === 'active');
  const [facing, setFacing] = useState<CameraType>('front');
  const [status, setStatus] = useState<CameraState>('starting');
  const [error, setError] = useState<TKey>('selfie.camera.error');
  const [picking, setPicking] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const camera = useRef<CameraView>(null);
  const busy = useRef(false);
  const operation = useRef(0);

  useFocusEffect(
    useCallback(() => {
      busy.current = false;
      setPicking(false);
      setStatus('starting');
      void refreshPermission().catch(() => {
        setError('selfie.camera.error');
        setStatus('error');
      });
      return () => {
        operation.current += 1;
        busy.current = false;
      };
    }, [refreshPermission]),
  );

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (next) => {
      setForeground(next === 'active');
      if (next === 'active') {
        void refreshPermission().catch(() => {});
      } else {
        setStatus((current) => (current === 'ready' ? 'starting' : current));
      }
    });
    return () => subscription.remove();
  }, [refreshPermission]);

  const cameraActive = focused && foreground && permission?.granted && status !== 'error' && !picking;
  useEffect(() => {
    if (!cameraActive || status !== 'starting') return;
    const timeout = setTimeout(() => {
      setError('selfie.camera.error');
      setStatus('error');
    }, motion.ribbonCycle);
    return () => clearTimeout(timeout);
  }, [cameraActive, status]);

  const submit = async (uri: string, origin: 'camera' | 'library', id: number) => {
    const prepared = await prepareSelfie(uri, origin);
    if (id !== operation.current) return;
    actions.cancelInFlight();
    void actions.submitSelfie(prepared);
    router.replace('/selfie/review');
  };

  const capture = async () => {
    if (busy.current || status !== 'ready' || !camera.current) return;
    busy.current = true;
    const id = ++operation.current;
    setStatus('capturing');
    try {
      // Keep native orientation processing; never flip the saved original ourselves.
      const photo = await camera.current.takePictureAsync({ quality: 1, skipProcessing: false });
      if (id === operation.current) await submit(photo.uri, 'camera', id);
    } catch (failure) {
      if (id !== operation.current) return;
      setError(
        failure instanceof SelfiePreparationError ? `selfie.review.issues.${failure.issue}` : 'selfie.camera.error',
      );
      setStatus('error');
    } finally {
      if (id === operation.current) busy.current = false;
    }
  };

  const upload = async () => {
    if (busy.current) return;
    busy.current = true;
    const id = ++operation.current;
    setPicking(true);
    try {
      const result = await launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: false, quality: 1 });
      if (!result.canceled && id === operation.current) await submit(result.assets[0].uri, 'library', id);
    } catch (failure) {
      if (id === operation.current) {
        const issue = failure instanceof SelfiePreparationError ? failure.issue : 'unsupported';
        setError(`selfie.review.issues.${issue}`);
        setStatus('error');
      }
    } finally {
      if (id === operation.current) {
        setPicking(false);
        busy.current = false;
      }
    }
  };

  const cancel = () => {
    operation.current += 1;
    busy.current = false;
    if (router.canGoBack()) router.back();
    else router.replace('/selfie');
  };
  const retry = async () => {
    if (busy.current) return;
    const id = ++operation.current;
    busy.current = true;
    try {
      const access = await refreshPermission();
      if (id !== operation.current) return;
      if (!access.granted) {
        router.replace('/selfie');
        return;
      }
      setStatus('starting');
      setAttempt((value) => value + 1);
    } catch {
      if (id === operation.current) setStatus('error');
    } finally {
      if (id === operation.current) busy.current = false;
    }
  };
  const denied = permission && !permission.granted;
  const failed = status === 'error' || denied;

  return (
    <View style={[styles.root, { paddingTop: insets.top, paddingLeft: insets.left, paddingRight: insets.right }]}>
      {focused && <StatusBar style="light" />}
      <View style={styles.header}>
        <BrandHeader hideMenu hideBack />
        <AppText variant="h1" align="center" style={styles.title}>
          {t('selfie.camera.title')}
        </AppText>
      </View>
      <View style={styles.preview}>
        {cameraActive && (
          <CameraView
            key={`${facing}-${attempt}`}
            ref={camera}
            style={StyleSheet.absoluteFill}
            facing={facing}
            mode="picture"
            mirror={false}
            animateShutter={false}
            accessible={false}
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
            onCameraReady={() => setStatus((current) => (current === 'starting' ? 'ready' : current))}
            onMountError={() => {
              setError('selfie.camera.error');
              setStatus('error');
            }}
          />
        )}
        {!failed && (
          <>
            <View style={styles.guideArea}>
              <FaceGuide />
            </View>
            <View style={styles.hintArea}>
              {status === 'capturing' ? (
                <View style={styles.hint} accessibilityLiveRegion="polite">
                  <AppText variant="label" color={colors.white} align="center">
                    {t('selfie.camera.capturing')}
                  </AppText>
                </View>
              ) : (
                <CameraHint
                  key={status === 'ready' && cameraActive ? 'ready' : 'starting'}
                  ready={status === 'ready' && Boolean(cameraActive)}
                />
              )}
            </View>
          </>
        )}
        {failed && (
          <ScrollView contentContainerStyle={styles.errorArea}>
            <InlineNotice
              tone="error"
              message={t(denied ? 'selfie.camera.error' : error)}
              focusOnMount
              action={{ label: t('common.retry'), onPress: () => void retry() }}
            />
            <SecondaryButton
              label={t('selfie.prepare.uploadPhoto')}
              icon={ImageIcon}
              loading={picking}
              onPress={() => void upload()}
            />
          </ScrollView>
        )}
      </View>
      <View style={[styles.controls, { paddingBottom: Math.max(insets.bottom, space[4]) }]}>
        <CameraControl icon={X} label={t('selfie.camera.cancel')} onPress={cancel} />
        <PressableScale
          accessibilityRole="button"
          accessibilityLabel={t('selfie.camera.shutter')}
          accessibilityState={{ disabled: status !== 'ready' || !cameraActive, busy: status === 'capturing' }}
          disabled={status !== 'ready' || !cameraActive}
          onPress={() => void capture()}
          style={styles.shutter}
        >
          <View style={styles.shutterInner}>
            {(status === 'starting' || status === 'capturing') && !failed && (
              <ActivityIndicator color={colors.white} size="small" animating={motionAllowed} />
            )}
          </View>
        </PressableScale>
        <CameraControl
          icon={RefreshCw}
          label={t('selfie.camera.flip')}
          // Also a way out of an error: the other lens may work (e.g. a device without a front camera).
          disabled={status === 'starting' || status === 'capturing' || Boolean(denied)}
          onPress={() => {
            setStatus('starting');
            setAttempt((value) => value + 1);
            setFacing((value) => (value === 'front' ? 'back' : 'front'));
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.ink },
  header: { backgroundColor: colors.cream, paddingBottom: space[4] },
  title: { paddingHorizontal: layout.gutter },
  preview: { flex: 1, backgroundColor: colors.ink },
  guideArea: { ...StyleSheet.absoluteFill, bottom: '20%' },
  hintArea: { position: 'absolute', bottom: space[4], left: layout.gutter, right: layout.gutter, alignItems: 'center' },
  hint: {
    backgroundColor: colors.inkScrim,
    borderRadius: radius.pill,
    paddingHorizontal: space[5],
    paddingVertical: space[3],
    maxWidth: '100%',
  },
  measureHint: { opacity: 0 },
  hintLayer: { ...StyleSheet.absoluteFill, justifyContent: 'center' },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    gap: space[3],
    paddingTop: space[4],
    paddingHorizontal: layout.gutter,
  },
  controlWrap: { flex: 1, maxWidth: layout.minTouch * 3 },
  control: { minWidth: layout.minTouch, minHeight: layout.minTouch, alignItems: 'center', gap: space[2] },
  controlIcon: {
    width: layout.minTouch,
    height: layout.minTouch,
    borderRadius: radius.pill,
    backgroundColor: colors.cream,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutter: {
    width: space[16] + space[2],
    height: space[16] + space[2],
    borderRadius: radius.pill,
    borderWidth: space[1],
    borderColor: colors.cream,
    padding: space[1],
  },
  shutterInner: {
    flex: 1,
    borderRadius: radius.pill,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorArea: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: layout.gutter,
    gap: space[4],
    width: '100%',
    maxWidth: layout.maxWidth,
    alignSelf: 'center',
  },
});
