/**
 * Dev gallery — QA surface for tokens, type, shades, mock knobs and (from Etapa 2)
 * every component state. Not linked from the product UI except the dev menu entry.
 */
import { Link, Stack } from 'expo-router';
import { Camera, Clock, Image as ImageIcon, SlidersHorizontal, Sun } from 'lucide-react-native';
import { useState, useSyncExternalStore } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  AppText,
  ArtPlaceholder,
  BrandHeader,
  Button,
  ChoiceChips,
  EditorialHeading,
  InlineNotice,
  RibbonAccent,
  SimulationSeal,
  Swatch,
} from '@/components';
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
  const [time, setTime] = useState<5 | 10 | 20>(10);
  const [limits, setLimits] = useState<string[]>(['noShine']);
  const [picked, setPicked] = useState('lip-mauve');

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <Stack.Screen options={{ title: 'Dev gallery' }} />
      <ScrollView contentContainerStyle={styles.body}>
        <AppText variant="h1">Galería dev</AppText>

        <Link href="/dev/components" style={styles.linkOut}>
          <AppText variant="bodyStrong">Componentes compuestos (Codex) →</AppText>
        </Link>

        <Section title="BrandHeader">
          <View style={styles.frame}>
            <BrandHeader stage="kit" />
          </View>
          <View style={styles.frame}>
            <BrandHeader hideBack />
          </View>
          <View style={styles.frame}>
            <BrandHeader backLocked stage="looks" />
          </View>
        </Section>

        <Section title="EditorialHeading">
          <EditorialHeading title={t('intent.title')} subtitle={t('intent.subtitle')} />
          <EditorialHeading level={2} title={t('looks.title')} subtitle={t('looks.subtitle')} />
        </Section>

        <Section title="Botones">
          <Button label={t('intent.cta')} onPress={() => {}} />
          <Button label={t('selfie.prepare.openCamera')} icon={Camera} onPress={() => {}} />
          <Button variant="secondary" label={t('selfie.prepare.uploadPhoto')} icon={ImageIcon} onPress={() => {}} />
          <Button label={t('result.save')} loading loadingLabel={t('result.saving')} onPress={() => {}} />
          <Button label={t('looks.choose')} disabled onPress={() => {}} />
          <Button variant="secondary" label={t('kit.skip')} disabled onPress={() => {}} />
          <View style={styles.row}>
            <Button compact variant="secondary" arrow={false} label={t('edit.keep', { zone: t('kit.zones.eyes') })} onPress={() => {}} />
            <Button compact arrow={false} label={t('edit.seeChange')} onPress={() => {}} />
          </View>
        </Section>

        <Section title="ChoiceChips">
          <ChoiceChips
            label={t('intent.timeLabel')}
            value={time}
            onChange={setTime}
            options={[5, 10, 20].map((m) => ({ value: m as 5 | 10 | 20, label: t('common.minutes', { count: m }), icon: Clock }))}
          />
          <ChoiceChips
            label={t('intent.intensityLabel')}
            value="balanced"
            onChange={() => {}}
            options={(['subtle', 'balanced', 'expressive'] as const).map((v) => ({
              value: v,
              label: t(`intent.intensity.${v}`),
              icon: SlidersHorizontal,
            }))}
          />
          <ChoiceChips<string>
            multiple
            label={t('intent.constraintsLabel')}
            value={limits}
            onChange={(v) => setLimits((l) => (l.includes(v) ? l.filter((x) => x !== v) : [...l, v]))}
            options={[
              { value: 'noShadow', label: t('intent.constraints.noShadow') },
              { value: 'noShine', label: t('intent.constraints.noShine'), icon: Sun },
              { value: 'discreetLips', label: t('intent.constraints.discreetLips'), disabled: true, disabledReason: 'Ejemplo inhabilitado' },
            ]}
          />
        </Section>

        <Section title="Swatch">
          <View style={styles.wrap}>
            {['lip-dusty-pink', 'lip-mauve', 'lip-cherry', 'lip-wine'].map((id) => (
              <Swatch key={id} shadeId={id} selected={picked === id} onPress={() => setPicked(id)} />
            ))}
            <Swatch shadeId="lip-plum" disabled disabledReason="Bloqueado" onPress={() => {}} />
          </View>
          <View style={styles.wrap}>
            <Swatch shadeId="eye-smoky-plum" size="sm" />
            <Swatch shadeId="lip-wine" size="sm" />
            <Swatch shadeId="cheek-brick-rose" size="sm" />
            <Swatch shadeId="eye-lavender" size="lg" />
          </View>
        </Section>

        <Section title="InlineNotice">
          <InlineNotice tone="privacy" message={t('selfie.prepare.privacy')} />
          <InlineNotice tone="info" message={t('kit.approximation')} />
          <InlineNotice tone="success" message={t('edit.summaryOne', { kept: 'los ojos y las mejillas', changed: 'los labios' })} />
          <InlineNotice tone="error" message={t('creating.statusError')} action={{ label: t('looks.retry'), onPress: () => {} }} />
        </Section>

        <Section title="ArtPlaceholder + SimulationSeal">
          <ArtPlaceholder id="vl_intencion_escena_jazz_v01" aspectRatio={16 / 9} />
          <View style={styles.row}>
            <ArtPlaceholder id="vl_creacion_textura_susurro_v01" aspectRatio={1} compact style={styles.thumb} />
            <SimulationSeal />
          </View>
          <SimulationSeal compact />
        </Section>

        <Section title="RibbonAccent">
          <View style={styles.ribbonFrame}>
            <RibbonAccent />
          </View>
        </Section>

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
  linkOut: { padding: space[4], borderRadius: radius.md, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.white },
  frame: { borderWidth: 1, borderColor: colors.line, borderRadius: radius.sm },
  thumb: { width: 88 },
  ribbonFrame: { height: 160, borderRadius: radius.md, overflow: 'hidden', backgroundColor: colors.cream, borderWidth: 1, borderColor: colors.line },
});
