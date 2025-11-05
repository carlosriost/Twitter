// src/Styles/TweetScreen.styles.js
import { StyleSheet } from 'react-native';
import { colors, spacing, radii, typography } from '../Styles/theme';

export default StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },

  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingTop: 35, 
  },

  cancelText: {
    color: colors.primary,
    fontSize: typography.subtitle,
    fontWeight: '500',
  },

  // Botón principal: verde por defecto
  postButton: {
    backgroundColor: colors.primary,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },

  
  postButtonDisabled: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },

 
  postButtonText: {
    color: colors.onPrimary,
    fontWeight: '700',
    fontSize: typography.subtitle,
  },

  
  postButtonTextDisabled: {
    color: colors.textLight,
  },

  scrollContent: { paddingBottom: spacing.xl },

  container: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    gap: spacing.md,
  },

  avatar: {
    width: 44,
    height: 44,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  avatarInitial: { color: colors.text, fontWeight: '700' },

  composerBody: { flex: 1 },

  input: {
    minHeight: 120,
    fontSize: typography.subtitle,
    color: colors.text,
    textAlignVertical: 'top',
    paddingBottom: spacing.md,
  },

  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
  },

  iconRow: { flexDirection: 'row', gap: spacing.sm },
  icon: { fontSize: 20 },

  counter: { fontSize: typography.caption, color: colors.textLight },
  counterWarning: { color: colors.danger },

  threadCard: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.background,
    gap: spacing.sm,
  },
  threadHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  threadAvatar: {
    width: 40,
    height: 40,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  threadAvatarInitial: { color: colors.text, fontWeight: '700' },
  threadHeaderText: { flex: 1, gap: spacing.xs },
  threadName: { fontWeight: '700', color: colors.text },
  threadMeta: { color: colors.textLight, fontSize: typography.caption },
  threadContent: { color: colors.text, fontSize: typography.subtitle, lineHeight: 22 },

  repliesSection: { paddingHorizontal: spacing.md, paddingTop: spacing.lg, gap: spacing.md },
  repliesTitle: { fontSize: typography.subtitle, fontWeight: '700', color: colors.text },
  emptyReplies: { color: colors.textLight },

  replyRow: { flexDirection: 'row', gap: spacing.sm },
  replyAvatar: {
    width: 36,
    height: 36,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  replyAvatarInitial: { color: colors.text, fontWeight: '700' },
  replyBody: { flex: 1, gap: spacing.xs },
  replyHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  replyName: { fontWeight: '600', color: colors.text },
  replyMeta: { color: colors.textLight, fontSize: typography.caption },
  replyContent: { color: colors.text, fontSize: typography.body, lineHeight: 20 },
});