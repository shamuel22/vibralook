/**
 * Menu sheet (PLAN §2.2): only real functions — language, start over, how we use your photo,
 * and the dev gallery in development builds. Presented as a native form sheet.
 */
import { router } from 'expo-router';
import { Globe, Info, RotateCcw, Wrench } from 'lucide-react-native';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText, ChoiceChips, InlineNotice, PressableScale } from '@/components';
import { useI18n } from '@/i18n';
import { useSession } from '@/state/session';
import { colors, layout, radius, space } from '@/theme';

function Row({
  icon: Icon,
  label,
  onPress,
  expanded,
}: {
  icon: typeof Info;
  label: string;
  onPress: () => void;
  expanded?: boolean;
}) {
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ expanded }}
      onPress={onPress}
      style={styles.row}
      pressedStyle={styles.rowPressed}
    >
      <Icon color={colors.ink} size={20} strokeWidth={1.75} />
      <AppText variant="bodyStrong" style={styles.rowLabel}>
        {label}
      </AppText>
    </PressableScale>
  );
}

export default function MenuSheet() {
  const { t, locale, setLocale } = useI18n();
  const { actions } = useSession();
  const insets = useSafeAreaInsets();
  const [showPhotoUse, setShowPhotoUse] = useState(false);

  const startOver = () => {
    Alert.alert(t('menu.startOver'), t('menu.startOverConfirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('menu.startOver'),
        style: 'destructive',
        onPress: () => {
          actions.startOver();
          router.dismissAll();
          router.replace('/');
        },
      },
    ]);
  };

  return (
    <ScrollView contentContainerStyle={[styles.body, { paddingBottom: insets.bottom + space[6] }]}>
      <AppText variant="h2">{t('menu.title')}</AppText>

      <View style={styles.group}>
        <View style={styles.groupHead}>
          <Globe color={colors.ink} size={20} strokeWidth={1.75} />
          <AppText variant="bodyStrong">{t('menu.language')}</AppText>
        </View>
        <ChoiceChips
          label={t('menu.language')}
          value={locale}
          onChange={setLocale}
          options={[
            { value: 'es', label: t('menu.spanish') },
            { value: 'en', label: t('menu.english') },
          ]}
        />
      </View>

      <View style={styles.list}>
        <Row
          icon={Info}
          label={t('menu.photoUse')}
          expanded={showPhotoUse}
          onPress={() => setShowPhotoUse((v) => !v)}
        />
        {showPhotoUse && <InlineNotice tone="privacy" message={t('menu.photoUseBody')} />}
        <Row icon={RotateCcw} label={t('menu.startOver')} onPress={startOver} />
        {__DEV__ && (
          <Row
            icon={Wrench}
            label={t('menu.devGallery')}
            onPress={() => {
              router.back();
              router.push('/dev/gallery');
            }}
          />
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  body: { padding: layout.gutter, gap: space[6], backgroundColor: colors.cream },
  group: { gap: space[3] },
  groupHead: { flexDirection: 'row', alignItems: 'center', gap: space[2] },
  list: { gap: space[2] },
  row: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
    paddingHorizontal: space[4],
    borderRadius: radius.md,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
  },
  rowPressed: { backgroundColor: colors.creamDeep },
  rowLabel: { flex: 1 },
});
