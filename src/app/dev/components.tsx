/**
 * Etapa 2 native QA surface. Every fixture is hand-built here: no session/services,
 * provider calls or real makeup output. The approved brand icon stands in for photos.
 * Waiting/error examples remain visible while retries, choices and edits are exercised.
 */
import { Link, Redirect } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { Image as NativeImage, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { ChoiceChips } from '@/components/ChoiceChips';
import { CompareSlider } from '@/components/CompareSlider';
import { EditorialHeading } from '@/components/EditorialHeading';
import { InlineNotice } from '@/components/InlineNotice';
import { KitSelector } from '@/components/KitSelector';
import { LookProgressCard } from '@/components/LookProgressCard';
import { LookVariantCard } from '@/components/LookVariantCard';
import { PressableScale } from '@/components/PressableScale';
import { ResultRecipe } from '@/components/ResultRecipe';
import { Screen } from '@/components/Screen';
import { SimulationSeal } from '@/components/SimulationSeal';
import { shadeLabel } from '@/components/Swatch';
import { ZoneEditor, type ZoneEditorProps } from '@/components/ZoneEditor';
import {
  FINISHES_BY_ZONE,
  KIT_MAX_PER_ZONE,
  VARIANTS,
  ZONES,
  type Constraint,
  type Kit,
  type KitItem,
  type LookRecipe,
  type RecipeStep,
  type RenderJob,
  type RenderStatus,
  type VariantKey,
  type Zone,
} from '@/domain/types';
import { useI18n, useT } from '@/i18n';
import { colors, layout, radius, space } from '@/theme';

const TEST_IMAGE = require('../../../assets/brand/icon.png');
const TEST_URI = NativeImage.resolveAssetSource(TEST_IMAGE)?.uri;
const PROGRESS_STATES = ['interpreting', 'pending', 'processing', 'success', 'error'] as const;
const CONSTRAINTS: Constraint[] = ['noShadow', 'noShine', 'discreetLips'];
const SKIPPED_KIT: Kit = { status: 'skipped', items: { eyes: [], lips: [], cheeks: [] } };
const DECLARED_KIT: Kit = {
  status: 'declared',
  items: {
    eyes: [{ shadeId: 'eye-taupe', finish: 'matte' }],
    lips: [
      { shadeId: 'lip-mauve', finish: 'matte' },
      { shadeId: 'lip-cherry', finish: 'satin' },
    ],
    cheeks: [],
  },
};

function fixtures(t: ReturnType<typeof useT>): LookRecipe[] {
  const steps: RecipeStep[] = [
    { zone: 'prep', text: t('selfie.prepare.tipFilterBody'), minutes: 1 },
    ...ZONES.map((zone) => ({
      zone,
      text: `${t(`kit.zoneProduct.${zone}`)} · ${shadeLabel(t, zone === 'eyes' ? 'eye-taupe' : zone === 'lips' ? 'lip-mauve' : 'cheek-petal')} · ${t('finishes.matte')}`,
      minutes: 2,
    })),
    { zone: 'finish', text: t('result.approximation'), minutes: 1 },
  ];
  return VARIANTS.map((variant, index) => ({
    id: `dev-${variant}`,
    variant,
    eyes: {
      enabled: true,
      shadeId: ['eye-taupe', 'eye-mauve', 'eye-smoky-plum'][index],
      finish: 'matte',
      intensity: index === 0 ? 1 : index === 1 ? 3 : 5,
      source: 'guide',
    },
    lips: {
      enabled: true,
      shadeId: ['lip-mauve', 'lip-cherry', 'lip-wine'][index],
      finish: index === 0 ? 'matte' : 'satin',
      intensity: index === 0 ? 2 : index === 1 ? 3 : 5,
      source: 'guide',
    },
    cheeks: {
      enabled: true,
      shadeId: ['cheek-petal', 'cheek-peach', 'cheek-coral'][index],
      finish: 'matte',
      intensity: index === 2 ? 5 : 2,
      source: 'guide',
    },
    tagline: t(`variantIntent.${variant}`),
    explanation: t('looks.subtitle'),
    steps: steps.map((step) => {
      if (step.zone === 'prep' || step.zone === 'finish') return step;
      const shadeId =
        step.zone === 'eyes'
          ? ['eye-taupe', 'eye-mauve', 'eye-smoky-plum'][index]
          : step.zone === 'lips'
            ? ['lip-mauve', 'lip-cherry', 'lip-wine'][index]
            : ['cheek-petal', 'cheek-peach', 'cheek-coral'][index];
      return {
        ...step,
        text: `${t(`kit.zoneProduct.${step.zone}`)} · ${shadeLabel(t, shadeId)} · ${t(step.zone === 'lips' && index > 0 ? 'finishes.satin' : 'finishes.matte')}`,
      };
    }),
    paletteSource: 'guide',
    kitShortfall: false,
    origin: 'simulated',
  }));
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <AppText variant="h2">{title}</AppText>
      {children}
    </View>
  );
}

function PhotoCaption() {
  const t = useT();
  // Requested: dev.testImage = "imagen de prueba" / "test image". No dictionary edits allowed.
  return (
    <AppText variant="label" color={colors.ink}>
      {t('dev.testImage')}
    </AppText>
  );
}

function EditorExample({ value: initial, rendered, expanded: initialExpanded, ...props }: ZoneEditorProps) {
  const [value, setValue] = useState(initial);
  const [expanded, setExpanded] = useState(initialExpanded);
  return (
    <ZoneEditor
      {...props}
      value={value}
      rendered={rendered}
      expanded={expanded}
      onToggle={() => setExpanded((current) => !current)}
      onChange={setValue}
      onCopyFrom={(variant) => {
        const source = props.otherVariants.find((other) => other.variant === variant);
        if (source) setValue({ ...source.zone });
      }}
    />
  );
}

function KitExample({ zone, initial, constraints }: { zone: Zone; initial: KitItem[]; constraints: Constraint[] }) {
  const [items, setItems] = useState(initial);
  return (
    <KitSelector
      zone={zone}
      items={items}
      constraints={constraints}
      onToggleShade={(shadeId) =>
        setItems((current) =>
          current.some((item) => item.shadeId === shadeId)
            ? current.filter((item) => item.shadeId !== shadeId)
            : current.length < KIT_MAX_PER_ZONE
              ? [...current, { shadeId, finish: FINISHES_BY_ZONE[zone][0] }]
              : current,
        )
      }
      onSetFinish={(shadeId, finish) =>
        setItems((current) => current.map((item) => (item.shadeId === shadeId ? { ...item, finish } : item)))
      }
    />
  );
}

function Showcase() {
  const { t, locale, setLocale } = useI18n();
  const recipes = fixtures(t);
  const [selectedCard, setSelectedCard] = useState('dev-balance');
  const [retryStatus, setRetryStatus] = useState<RenderStatus>('error');
  const [progressRetry, setProgressRetry] = useState<RenderStatus>('error');
  const [omitted, setOmitted] = useState(false);
  const [locked, setLocked] = useState(true);
  const [compareVariant, setCompareVariant] = useState<VariantKey>('balance');
  const [constraints, setConstraints] = useState<Constraint[]>([]);
  const job = (recipe: LookRecipe, status: RenderStatus): RenderJob => ({
    recipeId: recipe.id,
    status,
    simulated: true,
    imageUri: status === 'success' ? TEST_URI : undefined,
    error: status === 'error' ? { code: 'provider', retriable: true } : undefined,
  });
  const base = recipes[0];
  const retryRecipe: LookRecipe = { ...recipes[2], id: 'dev-retry' };
  const editor = (zone: Zone, value = base[zone]): ZoneEditorProps => ({
    zone,
    value,
    rendered: base[zone],
    expanded: zone !== 'eyes',
    constraints: [],
    kit: SKIPPED_KIT,
    otherVariants: recipes.slice(1).map((recipe) => ({ variant: recipe.variant, zone: recipe[zone] })),
    onToggle: () => undefined,
    onChange: () => undefined,
    onCopyFrom: () => undefined,
  });
  const kitRecipe: LookRecipe = {
    ...base,
    id: 'dev-kit',
    paletteSource: 'kit',
    kitShortfall: true,
    eyes: { ...base.eyes, source: 'kit' },
    lips: { ...base.lips, source: 'kit' },
    cheeks: { ...base.cheeks, enabled: false, disabledReason: 'notInKit', source: 'kit' },
    steps: base.steps.filter((step) => step.zone !== 'cheeks'),
  };

  return (
    <Screen header={false} contentStyle={styles.page}>
      <EditorialHeading title={t('menu.devGallery')} subtitle={t('common.simulatedSeal')} />
      <Link href="/dev/gallery" asChild>
        <PressableScale
          accessibilityRole="link"
          accessibilityLabel={`${t('common.back')} · ${t('menu.devGallery')}`}
          accessibilityState={{ disabled: false }}
          style={styles.back}
          pressedStyle={styles.pressed}
        >
          <AppText variant="button" align="center">
            {t('common.back')} · {t('menu.devGallery')}
          </AppText>
        </PressableScale>
      </Link>
      <ChoiceChips
        label={t('menu.language')}
        value={locale}
        onChange={setLocale}
        options={[
          { value: 'es', label: t('menu.spanish') },
          { value: 'en', label: t('menu.english') },
        ]}
      />

      <Section title={t('compare.label')}>
        <CompareSlider
          beforeUri={TEST_IMAGE}
          afterUri={TEST_IMAGE}
          afterSimulated
          beforeAlt={t('selfie.review.photoAlt')}
          afterAlt={t('looks.lookAlt', { variant: t(`variants.${compareVariant}`) })}
        />
        <PhotoCaption />
        <ChoiceChips
          label={t('looks.compare')}
          value={compareVariant}
          onChange={setCompareVariant}
          options={VARIANTS.map((variant) => ({ value: variant, label: t(`variants.${variant}`) }))}
        />
        <AppText variant="labelStrong">{t('compare.before')}</AppText>
        <CompareSlider
          initial={0}
          aspectRatio={1}
          beforeUri={TEST_IMAGE}
          afterUri={TEST_IMAGE}
          beforeAlt={t('selfie.review.photoAlt')}
          afterAlt={t('common.simulatedSeal')}
        />
        <PhotoCaption />
        <AppText variant="labelStrong">{t('compare.after')}</AppText>
        <CompareSlider
          initial={1}
          aspectRatio={1}
          beforeUri={TEST_IMAGE}
          afterUri={TEST_IMAGE}
          afterSimulated
          beforeAlt={t('selfie.review.photoAlt')}
          afterAlt={t('common.simulatedSeal')}
        />
        <PhotoCaption />
      </Section>

      <Section title={t('creating.title')}>
        {PROGRESS_STATES.map((status, index) => (
          <LookProgressCard
            key={status}
            variant={VARIANTS[index % VARIANTS.length]}
            recipe={status === 'interpreting' ? undefined : recipes[index % recipes.length]}
            status={status}
            onRetry={() => setProgressRetry('pending')}
          />
        ))}
        {progressRetry !== 'error' && (
          <>
            <LookProgressCard variant="statement" recipe={recipes[2]} status={progressRetry} />
            <Button
              label={t(
                progressRetry === 'pending'
                  ? 'creating.statusProcessing'
                  : progressRetry === 'processing'
                    ? 'creating.statusSuccess'
                    : 'common.undo',
              )}
              onPress={() =>
                setProgressRetry(
                  progressRetry === 'pending' ? 'processing' : progressRetry === 'processing' ? 'success' : 'error',
                )
              }
            />
          </>
        )}
      </Section>

      <Section title={t('looks.title')}>
        {recipes.map((recipe) => (
          <View key={recipe.id} style={styles.example}>
            <LookVariantCard
              recipe={recipe}
              job={job(recipe, 'success')}
              selected={selectedCard === recipe.id}
              onSelect={() => setSelectedCard(recipe.id)}
              onRetry={() => undefined}
              onCompare={() => setCompareVariant(recipe.variant)}
            />
            <PhotoCaption />
          </View>
        ))}
        <LookVariantCard
          recipe={kitRecipe}
          job={job(kitRecipe, 'success')}
          selected={selectedCard === kitRecipe.id}
          onSelect={() => setSelectedCard(kitRecipe.id)}
          onRetry={() => undefined}
        />
        <PhotoCaption />
        <LookVariantCard recipe={base} selected={false} onSelect={() => undefined} onRetry={() => undefined} />
        {(['pending', 'processing'] as const).map((status) => (
          <LookVariantCard
            key={status}
            recipe={recipes[1]}
            job={job(recipes[1], status)}
            selected={false}
            onSelect={() => undefined}
            onRetry={() => undefined}
          />
        ))}
        <LookVariantCard
          recipe={retryRecipe}
          job={job(retryRecipe, retryStatus)}
          selected={selectedCard === retryRecipe.id && retryStatus === 'success'}
          onSelect={() => setSelectedCard(retryRecipe.id)}
          onRetry={() => setRetryStatus('pending')}
        />
        {retryStatus !== 'error' && (
          <>
            <Button
              label={t(
                retryStatus === 'pending'
                  ? 'creating.statusProcessing'
                  : retryStatus === 'processing'
                    ? 'creating.statusSuccess'
                    : 'common.undo',
              )}
              onPress={() =>
                setRetryStatus(
                  retryStatus === 'pending' ? 'processing' : retryStatus === 'processing' ? 'success' : 'error',
                )
              }
            />
            {retryStatus === 'success' && <PhotoCaption />}
          </>
        )}
        <AppText variant="label">
          {t('looks.compare')} · {t(`variants.${compareVariant}`)}
        </AppText>
        <CompareSlider
          key={compareVariant}
          beforeUri={TEST_IMAGE}
          afterUri={TEST_IMAGE}
          afterSimulated
          beforeAlt={t('selfie.review.photoAlt')}
          afterAlt={t('looks.lookAlt', { variant: t(`variants.${compareVariant}`) })}
        />
        <PhotoCaption />
      </Section>

      <Section title={t('kit.title')}>
        <ChoiceChips<Constraint>
          multiple
          label={t('intent.constraintsLabel')}
          value={constraints}
          onChange={(constraint) =>
            setConstraints((current) =>
              current.includes(constraint) ? current.filter((item) => item !== constraint) : [...current, constraint],
            )
          }
          options={CONSTRAINTS.map((constraint) => ({
            value: constraint,
            label: t(`intent.constraints.${constraint}`),
          }))}
        />
        <KitExample zone="eyes" initial={[]} constraints={constraints} />
        <KitExample zone="lips" initial={[{ shadeId: 'lip-mauve', finish: 'matte' }]} constraints={constraints} />
        <KitExample
          zone="cheeks"
          initial={[
            { shadeId: 'cheek-petal', finish: 'matte' },
            { shadeId: 'cheek-peach', finish: 'satin' },
          ]}
          constraints={constraints}
        />
        <KitExample zone="eyes" initial={[]} constraints={['noShadow']} />
        <KitExample zone="lips" initial={DECLARED_KIT.items.lips} constraints={['noShine']} />
        <Button
          label={t(omitted ? 'common.undo' : 'kit.skip')}
          variant="secondary"
          onPress={() => setOmitted((current) => !current)}
        />
        {omitted ? (
          <InlineNotice message={t('result.guideLabel')} />
        ) : (
          <KitExample zone="lips" initial={[]} constraints={[]} />
        )}
        <AppText variant="label">{t('kit.approximation')}</AppText>
      </Section>

      <Section title={t('edit.title')}>
        {/* Collapsed/kept and expanded/changed; all editors keep independent local drafts. */}
        <EditorExample {...editor('eyes')} />
        <EditorExample {...editor('lips', { ...base.lips, intensity: 3 })} />
        <EditorExample {...editor('cheeks', { ...base.cheeks, intensity: 5 })} />
        {/* Lower bound, discreet-lips cap, and no-shine finish explanations. */}
        <EditorExample {...editor('lips', { ...base.lips, intensity: 1 })} constraints={['discreetLips', 'noShine']} />
        <EditorExample {...editor('lips')} constraints={['discreetLips']} />
        {/* Disabled by constraint, absent from declared kit, and simply off. */}
        <EditorExample
          {...editor('eyes', { ...base.eyes, enabled: false, disabledReason: 'constraint' })}
          expanded
          constraints={['noShadow']}
        />
        <EditorExample
          {...editor('cheeks', { ...base.cheeks, enabled: false, disabledReason: 'notInKit' })}
          kit={DECLARED_KIT}
        />
        <EditorExample {...editor('eyes', { ...base.eyes, enabled: false })} expanded />
        {/* Kit-only shades and finishes; disabled copy source included. */}
        <EditorExample
          {...editor('lips', { ...base.lips, source: 'kit' })}
          kit={DECLARED_KIT}
          otherVariants={[
            { variant: 'balance', zone: { ...recipes[1].lips, source: 'kit' } },
            { variant: 'statement', zone: { ...recipes[2].lips, enabled: false } },
          ]}
        />
        <Button
          variant="secondary"
          label={t(locked ? 'edit.applying' : 'edit.seeChange')}
          onPress={() => setLocked((current) => !current)}
        />
        <EditorExample {...editor('lips')} locked={locked} />
      </Section>

      <Section title={t('result.howTo')}>
        <SimulationSeal />
        <ResultRecipe steps={base.steps} imageUri={TEST_IMAGE} paletteSource="guide" />
        <PhotoCaption />
        <ResultRecipe steps={kitRecipe.steps.filter((step) => step.zone !== 'finish')} paletteSource="kit" />
        <ResultRecipe
          steps={base.steps.filter((step) => step.zone !== 'prep' && step.zone !== 'finish')}
          paletteSource="guide"
        />
      </Section>
    </Screen>
  );
}

export default function ComponentsGallery() {
  return __DEV__ ? <Showcase /> : <Redirect href="/" />;
}

const styles = StyleSheet.create({
  page: { paddingBottom: space[8], gap: space[8] },
  section: { gap: space[4] },
  example: { gap: space[2] },
  back: {
    minHeight: layout.minTouch,
    paddingVertical: space[3],
    paddingHorizontal: space[4],
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.ink,
    backgroundColor: colors.white,
    justifyContent: 'center',
  },
  pressed: { backgroundColor: colors.creamDeep },
});
