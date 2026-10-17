/**
 * Press feedback for every pressable (animate-expo "Press feedback" recipe + DESIGN §6:
 * scale 1 → 0.97 → 1). Feedback on press-in, commit on press-out. With reduced motion the
 * scale is dropped; the surface change of each component still shows the press.
 */
import { useState, type ReactNode } from 'react';
import { Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useReducedMotion } from 'react-native-reanimated';

export interface PressableScaleProps extends Omit<PressableProps, 'children' | 'style'> {
  children: ReactNode | ((state: { pressed: boolean }) => ReactNode);
  style?: StyleProp<ViewStyle>;
  /** Style applied to the outer Pressable (layout: flex, alignSelf, margins). */
  containerStyle?: StyleProp<ViewStyle>;
  pressedStyle?: StyleProp<ViewStyle>;
  scaleTo?: number;
}

export function PressableScale({
  children,
  style,
  containerStyle,
  pressedStyle,
  scaleTo = 0.97,
  disabled,
  onPressIn,
  onPressOut,
  ...rest
}: PressableScaleProps) {
  const [pressed, setPressed] = useState(false);
  const reduceMotion = useReducedMotion();
  const active = pressed && !disabled;
  return (
    <Pressable
      disabled={disabled}
      hitSlop={8}
      pressRetentionOffset={16}
      onPressIn={(e) => {
        setPressed(true);
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        setPressed(false);
        onPressOut?.(e);
      }}
      style={containerStyle}
      {...rest}
    >
      <Animated.View
        style={[
          {
            transform: [{ scale: active && !reduceMotion ? scaleTo : 1 }],
            transitionProperty: 'transform',
            transitionDuration: '120ms',
            transitionTimingFunction: 'cubic-bezier(0.23, 1, 0.32, 1)',
          },
          style,
          active && pressedStyle,
        ]}
      >
        {typeof children === 'function' ? children({ pressed: active }) : children}
      </Animated.View>
    </Pressable>
  );
}
