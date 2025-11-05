import React from 'react';
import { Pressable } from 'react-native';
import { colors } from '../Styles/theme';

export default function Tap({
  style,
  pressedStyle,
  disabled,
  hitSlop = 8,
  androidRipple = { color: colors.primary + '22', borderless: false },
  children,
  ...rest
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      hitSlop={hitSlop}
      android_ripple={androidRipple}
      style={({ pressed }) => [
        style,
        pressed && !disabled && (pressedStyle || { opacity: 0.85 }),
      ]}
      {...rest}
    >
      {children}
    </Pressable>
  );
}