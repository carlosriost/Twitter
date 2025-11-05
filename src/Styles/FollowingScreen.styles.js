// src/Styles/FollowingScreen.styles.js
import { StyleSheet } from 'react-native';
import { colors, spacing, radii, typography } from './theme';

export default StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backArrow: { fontSize: 26, color: colors.text },
  headerTitle: { fontSize: typography.title, fontWeight: '700', color: colors.text },
  headerSubtitle: { color: colors.textLight, fontSize: typography.caption },

  segment: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  segmentItem: { flex: 1, alignItems: 'center', paddingVertical: spacing.sm },
  segmentActive: { borderBottomWidth: 2, borderBottomColor: colors.primary },
  segmentLabel: {
    fontSize: typography.subtitle,
    color: colors.textLight,
    fontWeight: '600',
  },
  segmentLabelActive: { color: colors.text },

  listContent: { paddingVertical: spacing.sm },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  avatarInitial: {
    color: colors.text,
    fontWeight: '700',
    fontSize: typography.subtitle,
  },

  info: { flex: 1 },
  name: { fontWeight: '700', color: colors.text, fontSize: typography.body },
  
  username: {
    color: colors.textLight,
    fontSize: typography.caption,
    marginTop: spacing.xs,
  },
  bio: { color: colors.textLight, fontSize: typography.caption, marginTop: spacing.xs },

  followingButton: {
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
  },
  followingText: { color: colors.text, fontWeight: '700' },

  separator: { height: 1, backgroundColor: colors.border, marginLeft: spacing.md + 50 },
});