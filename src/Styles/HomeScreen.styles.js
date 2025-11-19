// src/Screens/HomeScreen.styles.js
import { StyleSheet } from 'react-native';
import { colors, spacing, radii, typography } from '../Styles/theme';

export default StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },

  listContent: { paddingBottom: spacing.xl * 2 },

  topBar: {
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    paddingTop: 35,
  },

  profileButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  profileInitial: { color: colors.text, fontWeight: '700' },

  brandMark: { fontSize: 24, fontWeight: '900', color: colors.primary },
  sparkle: { fontSize: 18 },

  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tabItem: { flex: 1, alignItems: 'center', paddingVertical: spacing.sm },
  tabLabel: {
    fontSize: typography.subtitle,
    color: colors.textLight,
    fontWeight: '600',
  },
  tabLabelActive: { color: colors.text },
  tabIndicator: {
    width: '60%',
    height: 3,
    backgroundColor: colors.primary,
    borderRadius: radii.pill,
  },

  composer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.md,
  },
  avatarSmall: {
    width: 40,
    height: 40,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: { color: colors.text, fontWeight: '700' },
  composerBody: { flex: 1, gap: spacing.sm },
  composerInput: {
    fontSize: typography.subtitle,
    color: colors.text,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  composerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  composerIcons: { flexDirection: 'row', alignItems: 'center' },
  icon: { fontSize: 18 },
  iconSpacing: { marginRight: spacing.sm },

  tweetButton: {
    backgroundColor: colors.primary,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  
  tweetButtonText: { color: colors.onPrimary, fontWeight: '700' },

  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  actionChip: {
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  actionChipText: { color: colors.text, fontWeight: '600' },

  divider: { height: 8, backgroundColor: colors.surface, width: '100%' },

  // Search (from bottom bar toggle)
  searchForm: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    backgroundColor: '#F3F4F6',
    borderRadius: radii.md,
    padding: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    color: colors.text,
  },
  searchSubmit: {
    marginLeft: 8,
    backgroundColor: colors.primary,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  searchSubmitDisabled: { backgroundColor: '#D1D5DB' },
  searchSubmitText: { color: colors.onPrimary, fontWeight: '700' },

  searchPreviewCard: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    padding: spacing.md,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  previewAvatar: {
    width: 48,
    height: 48,
    borderRadius: radii.pill,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewAvatarImg: { width: '100%', height: '100%', borderRadius: radii.pill },
  previewName: { fontSize: typography.subtitle, fontWeight: '700', color: colors.text },
  previewUsername: { fontSize: typography.caption, color: colors.textLight },

  tweetRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.md,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: { width: '100%', height: '100%', borderRadius: radii.pill },

  tweetBody: { flex: 1, gap: spacing.sm },

  tweetHeader: { flexDirection: 'row', alignItems: 'center' },
  headerText: { flex: 1 },

  tweetName: { fontWeight: '700', color: colors.text },
  tweetMeta: { color: colors.textLight },

  tweetContent: { color: colors.text, fontSize: typography.body, lineHeight: 22 },

  mediaGrid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: spacing.xs },
  mediaGridSingle: { width: '100%', borderRadius: radii.lg, overflow: 'hidden' },
  mediaImageSingle: { width: '100%', aspectRatio: 16 / 9, borderRadius: radii.lg, minHeight: 180, backgroundColor: '#F3F4F6' },
  mediaImageMultiple: {
    flexBasis: '48%',
    flexGrow: 1,
    aspectRatio: 1,
    borderRadius: radii.md,
    marginBottom: spacing.xs,
    backgroundColor: '#F3F4F6',
  },

  moreIcon: { color: colors.textLight, fontSize: 18 },

  tweetActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
    paddingRight: spacing.lg,
  },

  actionStat: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  actionStatPressable: { paddingVertical: spacing.xs },

  actionIcon: { color: colors.textLight, fontSize: typography.subtitle },
  actionIconHighlight: { color: colors.danger },
  actionIconDisabled: { color: colors.border },

  actionValue: { color: colors.textLight, fontSize: typography.caption },
  actionValueHighlight: { color: colors.danger },
  actionValueDisabled: { color: colors.border },

  bottomBar: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-around',
  paddingVertical: 10,
  borderTopWidth: 1,
  borderTopColor: colors.border,
  backgroundColor: colors.background,
},
  bottomItem: { alignItems: 'center', flex: 1 },
  bottomItemIcon: { fontSize: 20 },
  
  bottomItemLabel: { fontSize: typography.caption, color: colors.textLight },
});