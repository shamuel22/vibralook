/**
 * Dev gallery — QA surface for tokens, type, shades, mock knobs and (from Etapa 2)
 * every component state. Not linked from the product UI except the dev menu entry.
 */
import { Stack } from 'expo-router';
import { useSyncExternalStore } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText } from '@/components/AppText';
import { shadesForZone } from '@/domain/shades';
import { VARIANTS, ZONES, type SelfieIssue } from '@/domain/types';
import { useI18n, type TKey } from '@/i18n';
import { getMockSettings, subscribeMockSettings, updateMockSettings } from '@/services/mock/settings';
import { colors, layout, radius, space, type TextVariant } from '@/theme';

const COLOR_TOKENS = Object.entries(colors) as [keyof typeof colors, string][];
const TYPE_SAMPLES: [TextVariant, string][] = [
  ['h1', '¿Qué vibra quieres transmitir?'],
  ['h2', 'Tres maneras de sentirlo'],
  ['h3', 'Equilibrio'],
  ['body', 'Cuéntanos tu momento y lo traducimos en un look para ti.'],
  ['bodyStrong', 'Traducir mi vibra'],
  ['label', 'Tu foto se usa para crear la prueba virtual.'],
  ['labelStrong', 'Conservar ojos'],
  ['eyebrow', 'Cómo aplicarlo'],
];
const SELFIE_ISSUES: SelfieIssue[] = ['noFace', 'multipleFaces', 'tooDark', 'tooSmall', 'unsupported'];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <AppText variant="eyebrow">{title}</AppText>
      {children}
    </View>
  );
}

function Toggle({ label, on, onPress }: { label: string; on: boolean; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: on }}
      onPress={onPress}
      style={[styles.toggle, on && styles.toggleOn]}
    >
      <AppText variant="labelStrong" color={on ? colors.white : colors.ink}>
        {on ? '● ' : '○ '}
        {label}
      </AppText>
    </Pressable>
  );
}

export default function DevGallery() {
  const { t, locale, setLocale } = useI18n();
  const mock = useSyncExternalStore(subscribeMockSettings, getMockSettings);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <Stack.Screen options={{ title: 'Dev gallery' }} />
      <ScrollView contentContainerStyle={styles.body}>
        <AppText variant="h1">Galería dev</AppText>

        <Section title="Idioma">
          <View style={styles.row}>
            <Toggle label="Español" on={locale === 'es'} onPress={() => setLocale('es')} />
            <Toggle label="English" on={locale === 'en'} onPress={() => setLocale('en')} />
          </View>
          <AppText>{t('intent.title')}</AppText>
        </Section>

        <Section title="Colores">
          <View style={styles.wrap}>
            {COLOR_TOKENS.map(([name, value]) => (
              <View key={name} style={styles.colorCell}>
                <View style={[styles.colorChip, { backgroundColor: value }]} />
                <AppText variant="labelStrong">{name}</AppText>
                <AppText variant="label">{value}</AppText>
              </View>
            ))}
          </View>
        </Section>

        <Section title="Tipografía">
          {TYPE_SAMPLES.map(([v, s]) => (
            <View key={v} style={styles.typeRow}>
              <AppText variant="label">{v}</AppText>
              <AppText variant={v}>{s}</AppText>
            </View>
          ))}
        </Section>

        <Section title="Biblioteca de tonos">
          {ZONES.map((zone) => (
            <View key={zone} style={styles.typeRow}>
              <AppText variant="labelStrong">{t(`kit.zones.${zone}` as TKey)}</AppText>
              <View style={styles.wrap}>
                {shadesForZone(zone).map((s) => (
                  <View key={s.id} style={styles.shadeCell}>
                    <View style={[styles.shade, { backgroundColor: s.hex }]} />
                    <AppText variant="label" numberOfLines={2} align="center">
                      {t(s.nameKey as TKey)}
                    </AppText>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </Section>

        <Section title="Mock · forzar estados">
          <AppText variant="label">Fallar el próximo render de una variante</AppText>
          <View style={styles.wrap}>
            {VARIANTS.map((v) => (
              <Toggle
                key={v}
                label={t(`variants.${v}` as TKey)}
                on={mock.failVariantOnce === v}
                onPress={() => updateMockSettings({ failVariantOnce: mock.failVariantOnce === v ? null : v })}
              />
            ))}
          </View>
          <AppText variant="label">Selfie inválida en la próxima revisión</AppText>
          <View style={styles.wrap}>
            {SELFIE_ISSUES.map((i) => (
              <Toggle
                key={i}
                label={i}
                on={mock.selfieIssueOnce === i}
                onPress={() => updateMockSettings({ selfieIssueOnce: mock.selfieIssueOnce === i ? null : i })}
              />
            ))}
          </View>
          <View style={styles.wrap}>
            <Toggle
              label="Fallar traducción"
              on={mock.failTranslateOnce}
              onPress={() => updateMockSettings({ failTranslateOnce: !mock.failTranslateOnce })}
            />
            <Toggle
              label="Fallar edición"
              on={mock.failEditOnce}
              onPress={() => updateMockSettings({ failEditOnce: !mock.failEditOnce })}
            />
            <Toggle
              label="Proveedor lento"
              on={mock.renderLatency[1] > 5000}
              onPress={() =>
                updateMockSettings({ renderLatency: mock.renderLatency[1] > 5000 ? [1800, 4200] : [6000, 12000] })
              }
            />
          </View>
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.cream },
  body: { padding: layout.gutter, gap: space[8], paddingBottom: space[16] },
  section: { gap: space[3] },
  row: { flexDirection: 'row', gap: space[2] },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: space[3] },
  colorCell: { width: 96, gap: space[1] },
  colorChip: { height: 48, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.line },
  typeRow: { gap: space[1] },
  shadeCell: { width: 64, alignItems: 'center', gap: space[1] },
  shade: { width: 40, height: 40, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.line },
  toggle: {
    minHeight: layout.minTouch,
    paddingHorizontal: space[4],
    justifyContent: 'center',
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.ink,
    backgroundColor: colors.white,
  },
  toggleOn: { backgroundColor: colors.ink },
});
