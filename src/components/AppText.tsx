import { Text, useWindowDimensions, type TextProps } from 'react-native';

import { h1Size, textStyles, type TextVariant } from '@/theme';

export interface AppTextProps extends TextProps {
  variant?: TextVariant;
  color?: string;
  align?: 'left' | 'center' | 'right';
}

/**
 * The only text primitive. Keeps OS font scaling on (capped at 2× so layouts survive),
 * and sets the heading role on h1/h2 for screen readers.
 */
export function AppText({ variant = 'body', color, align, style, ...rest }: AppTextProps) {
  const { width } = useWindowDimensions();
  const base = textStyles[variant];
  const responsive =
    variant === 'h1' ? { fontSize: h1Size(width), lineHeight: Math.round(h1Size(width) * 1.1) } : null;
  const isHeading = variant === 'h1' || variant === 'h2';
  return (
    <Text
      accessibilityRole={isHeading ? 'header' : undefined}
      maxFontSizeMultiplier={2}
      style={[base, responsive, color ? { color } : null, align ? { textAlign: align } : null, style]}
      {...rest}
    />
  );
}
