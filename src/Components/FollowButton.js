// src/Components/FollowButton.js
import React from 'react';
import { Text, StyleSheet, ActivityIndicator, ViewStyle } from 'react-native';
import Tap from './Tap';
import { colors, spacing, radii, typography } from '../Styles/theme';

/**
 * Props:
 * - following: boolean → true = "Siguiendo" (outline), false = "Seguir" (primario)
 * - onPress: () => void
 * - disabled?: boolean
 * - loading?: boolean
 * - size?: 'sm' | 'md' (default 'sm')
 * - style?: ViewStyle (ancho/alineación extra, p.ej. para cabecera de perfil)
 * - labelWhenFollow?: string (default 'Siguiendo')
 * - labelWhenNotFollow?: string (default 'Seguir')
 */
export default function FollowButton({
  following,
  onPress,
  disabled = false,
  loading = false,
  size = 'sm',
  style,
  labelWhenFollow = 'Siguiendo',
  labelWhenNotFollow = 'Seguir',
}) {
  const isSm = size === 'sm';

  const containerStyle = [
    styles.base,
    isSm ? styles.sm : styles.md,
    following ? styles.outline : styles.primary,
    disabled && styles.disabled,
    style,
  ];

  const textStyle = [
    styles.label,
    following ? styles.labelOutline : styles.labelPrimary,
    disabled && styles.labelDisabled,
  ];

  return (
    <Tap
      onPress={onPress}
      disabled={disabled || loading}
      style={containerStyle}
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading, selected: following }}
    >
      {loading ? (
        <ActivityIndicator size="small" color={following ? '#111827' : colors.onPrimary} />
      ) : (
        <Text style={textStyle}>
          {following ? labelWhenFollow : labelWhenNotFollow}
        </Text>
      )}
    </Tap>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radii.full,
    borderWidth: 1,
    paddingHorizontal: spacing.m,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  sm: { height: 32, minWidth: 88 },
  md: { height: 40, minWidth: 112 },

  primary: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  outline: {
    backgroundColor: colors.surface,
    borderColor: '#E5E7EB',
  },

  label: { ...typography.button },
  labelPrimary: { color: colors.onPrimary, fontWeight: '600' },
  labelOutline: { color: '#111827', fontWeight: '600' },

  disabled: { opacity: 0.6 },
  labelDisabled: {},
});