// src/Styles/theme.js


export const colors = {
  // Colores principales
  primary: '#16A34A',     
  primaryDark: '#15803D', 

  // Superficies claras
  background: '#FFFFFF',
  surface: '#F8FAFC',     

  // Texto
  text: '#111827',        
  textLight: '#6B7280',   

  // Bordes y estados
  border: '#E5E7EB',      
  danger: '#EF4444',      
  warning: '#F59E0B',    
  success: '#10B981',     

  // Contrastes útiles
  onPrimary: '#FFFFFF',   
  onBackground: '#111827' 
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