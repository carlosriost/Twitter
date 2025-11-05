// src/Styles/theme.js

// Paleta clara con acento verde (friendly para una red social)
export const colors = {
  // Acentos
  primary: '#16A34A',     // emerald-600
  primaryDark: '#15803D', // emerald-700

  // Superficies claras
  background: '#FFFFFF',
  surface: '#F8FAFC',     // slate-50

  // Texto
  text: '#111827',        // gray-900
  textLight: '#6B7280',   // gray-500

  // Bordes y estados
  border: '#E5E7EB',      // gray-200
  danger: '#EF4444',      // red-500
  warning: '#F59E0B',     // amber-500
  success: '#10B981',     // emerald-500

  // Contrastes útiles
  onPrimary: '#FFFFFF',   // texto sobre botón verde
  onBackground: '#111827' // texto principal sobre fondo claro
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const radii = {
  sm: 6,
  md: 10,
  lg: 14,
  pill: 999,
};

export const typography = {
  caption: 12,
  body: 14,
  subtitle: 16,
  title: 18,
  heading: 22,
};

const theme = { colors, spacing, radii, typography };
export default theme;