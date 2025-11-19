// src/Styles/UserTweetsScreen.styles.js
import { StyleSheet } from 'react-native';
import { colors, spacing, radii, typography } from './theme';

export default StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },

  listContent: { paddingBottom: spacing.xl },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    paddingTop: 35,
  },
  backArrow: { fontSize: 28, color: colors.text },
  topBarName: { fontSize: typography.subtitle, color: colors.text, fontWeight: '700' },
  topBarCount: { color: colors.textLight, fontSize: typography.caption },

  banner: { height: 150, backgroundColor: colors.surface },

  profileCard: {
    paddingHorizontal: spacing.md,
    marginTop: -36,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  profileAvatar: {
    width: 84,
    height: 84,
    borderRadius: radii.pill,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: colors.background,
  },
  profileAvatarInitial: { fontSize: 36, fontWeight: '700', color: colors.text },
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

  profileMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  profileMeta: { color: colors.textLight, fontSize: typography.caption },
  dot: { color: colors.textLight, fontSize: typography.caption },

  profileStats: { flexDirection: 'row', gap: spacing.lg },
  profileStat: { color: colors.textLight, fontSize: typography.caption },
  profileStatNumber: { color: colors.text, fontWeight: '700' },

  tabRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
  },
  tabItem: { flex: 1, alignItems: 'center', paddingVertical: spacing.sm },
  tabLabel: { color: colors.textLight, fontWeight: '600' },
  tabLabelActive: { color: colors.text },
  tabIndicator: {
    width: '70%',
    height: 3,
    backgroundColor: colors.primary,
    borderRadius: radii.pill,
    marginTop: spacing.xs,
  },

  tweetRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: { color: colors.text, fontWeight: '700' },

  tweetBody: { flex: 1, gap: spacing.sm },
  tweetHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  tweetName: { fontWeight: '700', color: colors.text },
  tweetMeta: { color: colors.textLight, fontSize: typography.caption },
  moreIcon: { color: colors.textLight, fontSize: typography.subtitle, marginLeft: 'auto' },
  tweetContent: { color: colors.text, fontSize: typography.body, lineHeight: 22 },

  mediaGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  mediaGridSingle: { width: '100%', borderRadius: radii.lg, overflow: 'hidden' },
  mediaImageSingle: { width: '100%', aspectRatio: 16 / 9, borderRadius: radii.lg },
  mediaImageMultiple: { flexBasis: '48%', flexGrow: 1, aspectRatio: 1, borderRadius: radii.md },

  tweetActions: { flexDirection: 'row', justifyContent: 'space-between', paddingRight: spacing.lg },
  actionStat: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  actionStatPressable: { paddingVertical: spacing.xs },
  actionIcon: { color: colors.textLight, fontSize: typography.subtitle },
  actionIconHighlight: { color: colors.danger },
  actionIconDisabled: { color: colors.border },
  actionValue: { color: colors.textLight, fontSize: typography.caption },
  actionValueHighlight: { color: colors.danger },
  actionValueDisabled: { color: colors.border },
});