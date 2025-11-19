// src/Styles/ProfileScreen.styles.js
import { StyleSheet } from 'react-native';
import { colors, spacing, radii, typography } from './theme';

export default StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },

  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,

  },
  backArrow: { fontSize: 28, color: colors.text },
  topBarName: { fontSize: typography.subtitle, fontWeight: '700', color: colors.text },
  topBarCount: { color: colors.textLight, fontSize: typography.caption },

  banner: { height: 150, backgroundColor: colors.primary + '33' }, // sutil acento verde

  profileCard: {
    paddingHorizontal: spacing.md,
    marginTop: -36,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  profileAvatarWrapper: {
    borderRadius: radii.pill,
    alignSelf: 'flex-start',
    borderWidth: 3,
    borderColor: colors.background,
  },
  profileAvatar: { width: 84, height: 84, borderRadius: radii.pill },

  refreshBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  refreshText: { color: colors.textLight, fontSize: typography.caption },

  editButton: {
    alignSelf: 'flex-end',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
  },
  editButtonText: { color: colors.text, fontWeight: '600' },

  profileName: { fontSize: typography.title + 2, fontWeight: '800', color: colors.text },
  profileUsername: { color: colors.textLight, fontSize: typography.body },
  profileBio: { color: colors.text, fontSize: typography.body, lineHeight: 22 },
  profileBioMuted: { color: colors.textLight, fontStyle: 'italic' },

  tabRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: spacing.xs,
  },
  tabItem: { alignItems: 'center' },
  tabLabel: { color: colors.textLight, fontSize: typography.subtitle },
  tabLabelActive: { color: colors.text, fontWeight: '700' },
  tabIndicator: { height: 3, backgroundColor: colors.primary, marginTop: 4, width: '100%' },

  listContent: { paddingBottom: spacing.xl },

  tweetRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  avatarSmall: {
    width: 48,
    height: 48,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  avatarImg: { width: 48, height: 48, borderRadius: radii.pill },
  avatarInitial: { color: colors.text, fontWeight: '700' },

  tweetBody: { flex: 1 },
  tweetHeader: { marginBottom: spacing.xs },
  tweetName: { fontWeight: '700', color: colors.text },
  tweetMeta: { color: colors.textLight, fontSize: typography.caption },
  tweetContent: { color: colors.text, fontSize: typography.body, lineHeight: 22 },

  /* Media en tweets del perfil */
  mediaGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginTop: spacing.xs },
  mediaGridSingle: { width: '100%', borderRadius: radii.lg, overflow: 'hidden' },
  mediaImageSingle: { width: '100%', aspectRatio: 16 / 9, borderRadius: radii.lg, minHeight: 180, backgroundColor: colors.surface },
  mediaImageMultiple: { flexBasis: '48%', flexGrow: 1, aspectRatio: 1, minHeight: 140, borderRadius: radii.md, backgroundColor: colors.surface },

  /* Stats row (seguidores / siguiendo) */
  profileStatsRow: { flexDirection: 'row', gap: spacing.lg, marginTop: spacing.xs },
  profileStatTap: { flexDirection: 'row', alignItems: 'center' },
  profileStatNumber: { fontWeight: '700', color: colors.text },
  profileStatLabel: { color: colors.textLight },


  emptyState: { paddingVertical: spacing.lg, alignItems: 'center' },
  emptyText: { color: colors.textLight, fontSize: typography.caption },
});