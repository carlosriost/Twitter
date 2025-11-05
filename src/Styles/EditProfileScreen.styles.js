// src/Styles/EditProfileScreen.styles.js
import { StyleSheet } from 'react-native';
import { colors, spacing, radii, typography } from './theme';

export default StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  cancelText: {
    color: colors.textLight,
    fontWeight: '500',
    fontSize: typography.subtitle,
  },

  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
  },
  saveButtonDisabled: { backgroundColor: colors.border },
  // Texto blanco sobre botón verde
  saveText: { color: colors.onPrimary, fontWeight: '700', fontSize: typography.subtitle },

  container: { padding: spacing.lg },

  avatar: {
    width: 100,
    height: 100,
    borderRadius: radii.pill, // círculo
    alignSelf: 'center',
  },

  changePhoto: {
    textAlign: 'center',
    color: colors.primary,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },

  formGroup: { marginBottom: spacing.lg },

  label: { color: colors.textLight, fontSize: typography.caption, marginBottom: spacing.xs },

  input: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.body,
    color: colors.text,
  },

  textArea: { minHeight: 100, textAlignVertical: 'top' },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});