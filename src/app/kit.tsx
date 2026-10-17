/**
 * Pantalla 5 — Mi kit mínimo (optional). Up to two shades per category with a finish each.
 * Declaring a kit makes recipes use only those items; skipping labels the result as a
 * guidance palette. Either way, any previous looks are cleared so they match the new input.
 */
import { Image } from 'expo-image';
import { Redirect, router } from 'expo-router';
import { Check } from 'lucide-react-native';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import {
  AppText,
  ButtonRow,
  EditorialHeading,
  InlineNotice,
  KitSelector,
  PrimaryButton,
  Screen,
  SecondaryButton,
} from '@/components';
import { allowedFinishes } from '@/domain/constraints';
import type { Zone } from '@/domain/types';
import { useT } from '@/i18n';
import { useSession } from '@/state/session';
import { colors, radius, shadow, space } from '@/theme';

const ZONE_ORDER: Zone[] = ['lips', 'eyes', 'cheeks'];

export default function KitScreen() {
  const t = useT();
  const { state, actions } = useSession();
  const { kit, constraints, sourceImage } = state;
  const [emptyError, setEmptyError] = useState(false);

  if (!sourceImage) return <Redirect href="/selfie" />;

  const total = ZONE_ORDER.reduce((n, z) => n + kit.items[z].length, 0);

  const proceed = (mode: 'declare' | 'skip') => {
    if (mode === 'declare' && total === 0) {
      setEmptyError(true);
      return;
    }
    actions.dispatch({ type: 'looks/reset' });
    actions.dispatch({ type: mode === 'declare' ? 'kit/declare' : 'kit/skip' });
    router.push('/creating');
  };

  return (
    <Screen
      header={{ stage: 'kit' }}
      footer={
        <ButtonRow
          secondary={<SecondaryButton label={t('kit.skip')} arrow={false} onPress={() => proceed('skip')} />}
          primary={<PrimaryButton label={t('kit.continue')} onPress={() => proceed('declare')} />}
        />
      }
    >
      <EditorialHeading title={t('kit.title')} subtitle={t('kit.subtitle')} />

      <View style={styles.photoCard}>
        <Image
          source={sourceImage.uri}
          style={styles.thumb}
          contentFit="cover"
          accessibilityLabel={t('selfie.review.photoAlt')}
        />
        <View style={styles.photoText}>
          <AppText variant="h3">{t('kit.photoReadyTitle')}</AppText>
          <AppText variant="label">{t('kit.photoReadyBody')}</AppText>
        </View>
        <View style={styles.check} accessible={false} importantForAccessibility="no-hide-descendants">
          <Check color={colors.white} size={16} strokeWidth={2.5} />
        </View>
      </View>

      {ZONE_ORDER.map((zone) => (
        <KitSelector
          key={zone}
          zone={zone}
          items={kit.items[zone]}
          constraints={constraints}
          onToggleShade={(shadeId) => {
            setEmptyError(false);
            actions.dispatch({
              type: 'kit/toggleShade',
              zone,
              shadeId,
              defaultFinish: allowedFinishes(zone, constraints)[0] ?? 'matte',
            });
          }}
          onSetFinish={(shadeId, finish) => actions.dispatch({ type: 'kit/finish', zone, shadeId, finish })}
        />
      ))}

      {emptyError ? <InlineNotice tone="error" focusOnMount message={t('kit.emptyDeclared')} /> : null}
      <InlineNotice tone="info" message={t('kit.approximation')} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  photoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[4],
    padding: space[3],
    borderRadius: radius.lg,
    backgroundColor: colors.white,
    ...shadow.card,
  },
  thumb: { width: 96, aspectRatio: 4 / 5, borderRadius: radius.md, backgroundColor: colors.creamDeep },
  // Leaves room for the check badge in the corner.
  photoText: { flex: 1, gap: space[1], paddingRight: space[8] },
  check: {
    position: 'absolute',
    top: space[3],
    right: space[3],
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
