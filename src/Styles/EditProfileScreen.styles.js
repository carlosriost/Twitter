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
    paddingTop: 35, // si luego usas insets, puedes mover esto al componente
    backgroundColor: colors.background,
  },

  cancelText: {
    color: colors.textLight,
    fontWeight: '500',
    fontSize: typography.subtitle,
  },

  // Botón Save (lo reutilizamos en la barra inferior)
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm, // un poco más alto para mejor toque
    alignSelf: 'flex-end',
  },
  saveButtonDisabled: { backgroundColor: colors.border },

  // Texto blanco sobre botón verde
  saveText: { color: colors.onPrimary, fontWeight: '700', fontSize: typography.subtitle },

  // Contenedor principal
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

  // Barra inferior fija para el botón Save
  footerBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.md,
    zIndex: 10,
    elevation: 8, // Android
    shadowColor: '#000', // iOS
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: -2 },
  },
});