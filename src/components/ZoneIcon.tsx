/** Functional zone symbols, shared by the kit, editor and recipe. Decorative by default. */
import { Blend, Eye, Smile } from 'lucide-react-native';

import type { Zone } from '@/domain/types';
import { colors, space } from '@/theme';

const ICONS = { eyes: Eye, lips: Smile, cheeks: Blend } as const;

export function ZoneIcon({ zone, size = space[6], color = colors.ink }: { zone: Zone; size?: number; color?: string }) {
  const Icon = ICONS[zone];
  return (
    <Icon
      size={size}
      color={color}
      strokeWidth={1.75}
      accessible={false}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    />
  );
}
