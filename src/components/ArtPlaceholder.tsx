/**
 * ArtPlaceholder (DESIGN §0): reserves the exact frame of an artwork the graphics team will
 * deliver. Shows its id and a discreet "Arte pendiente" label; it must never look finished.
 *
 * When the final file lands in `assets/art/`, register it in `ART_REGISTRY` and the same
 * component renders it with no layout change. Every id here must exist in ARTES_REQUERIDOS.md.
 */
import { Image, type ImageContentFit } from 'expo-image';
import { ImageOff } from 'lucide-react-native';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { useT } from '@/i18n';
import { colors, radius, space } from '@/theme';

import { AppText } from './AppText';

export type ArtId =
  | 'vl_intencion_escena_jazz_v01'
  | 'vl_intencion_escena_sakura_v01'
  | 'vl_intencion_escena_reunion_v01'
  | 'vl_selfie_guia_encuadre_v01'
  | 'vl_creacion_textura_susurro_v01'
  | 'vl_creacion_textura_equilibrio_v01'
  | 'vl_creacion_textura_declaracion_v01'
  | 'vl_cintas_pie_v01';

/** Approved final files. Empty until the graphics team delivers (ARTES_REQUERIDOS.md). */
const ART_REGISTRY: Partial<Record<ArtId, number>> = {};

export interface ArtPlaceholderProps {
  id: ArtId;
  /** width / height of the final artwork. */
  aspectRatio: number;
  /** Text alternative once the art carries information; omit for decorative art. */
  alt?: string;
  decorative?: boolean;
  contentFit?: ImageContentFit;
  style?: StyleProp<ViewStyle>;
  /** Hide the id/label (e.g. very small slots); the dashed frame still marks it as pending. */
  compact?: boolean;
}

export function ArtPlaceholder({
  id,
  aspectRatio,
  alt,
  decorative,
  contentFit = 'cover',
  style,
  compact,
}: ArtPlaceholderProps) {
  const t = useT();
  const final = ART_REGISTRY[id];

  if (final) {
    return (
      <Image
        source={final}
        contentFit={contentFit}
        style={[{ aspectRatio }, style as object]}
        accessible={!decorative}
        accessibilityLabel={decorative ? undefined : alt}
      />
    );
  }

  return (
    <View
      style={[styles.box, { aspectRatio }, style]}
      accessible={!decorative}
      accessibilityLabel={decorative ? undefined : `${t('common.artPending')}: ${id}`}
      importantForAccessibility={decorative ? 'no-hide-descendants' : 'yes'}
    >
      {!compact && (
        <View style={styles.label}>
          <ImageOff color={colors.muted} size={18} strokeWidth={1.5} />
          <AppText variant="labelStrong" color={colors.muted} align="center">
            {t('common.artPending')}
          </AppText>
          <AppText variant="eyebrow" align="center" style={styles.id} numberOfLines={2}>
            {id}
          </AppText>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    width: '100%',
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.sand,
    backgroundColor: colors.creamDeep,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  label: { alignItems: 'center', gap: space[1], padding: space[3] },
  id: { letterSpacing: 0.4, textTransform: 'none' },
});
