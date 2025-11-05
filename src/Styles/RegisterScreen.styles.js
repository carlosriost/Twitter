// src/Styles/RegisterScreen.styles.js
import { StyleSheet } from 'react-native';
import { colors, spacing, radii, typography } from './theme';

export default StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },

  scroll: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl },

  logoRow: { alignItems: 'center', marginTop: spacing.xl, marginBottom: spacing.lg },
  logo: { fontSize: 46, fontWeight: '900', color: colors.primary },

  title: {
    fontSize: typography.title + 2,
    fontWeight: '800',
    color: colors.text,
    marginBottom: spacing.xl,
  },
    brand: { color: colors.primary, fontWeight: '800' },


  formCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
  },

  input: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + spacing.xs,
    fontSize: typography.body,
    color: colors.text,
  },

  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: radii.pill,
    paddingVertical: spacing.sm + spacing.xs,
    alignItems: 'center',
  },
 
  primaryButtonText: { color: colors.onPrimary, fontSize: typography.subtitle, fontWeight: '700' },
 
  primaryButtonDisabled: { backgroundColor: colors.border },

  footerPrompt: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.lg,
  },
  footerText: { color: colors.textLight, fontSize: typography.caption },
  footerLink: { color: colors.primary, fontSize: typography.caption, fontWeight: '700' },
});