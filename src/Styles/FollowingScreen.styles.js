// src/Styles/FollowingScreen.styles.js
import { StyleSheet } from 'react-native';
import { colors } from './theme';

export default StyleSheet.create({
  // Layout base
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: 35,
  },

  // Header superior
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    backgroundColor: colors.background,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border || '#E5E7EB',
  },
  backArrow: {
    fontSize: 28,
    color: colors.text,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: 12,
    color: colors.textLight,
  },

  // Segmento superior
  segment: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
    borderRadius: 999,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border || '#E5E7EB',
    overflow: 'hidden',
  },
  segmentItem: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentActive: {
    backgroundColor: '#E2F7EC',
  },
  segmentLabel: {
    fontSize: 13,
    color: colors.textLight,
    fontWeight: '600',
  },
  segmentLabelActive: {
    color: colors.primary,
  },

  // Tarjeta de perfil (antes `local.*`)
  card: {
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E5E7EB',
  },
  cardAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginRight: 12,
    backgroundColor: '#fff',
  },
  avatarFallback: {
    backgroundColor: '#E2F7EC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    color: colors.primary,
    fontWeight: '700',
  },
  cardName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  cardUsername: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  bio: {
    fontSize: 14,
    color: '#111827',
    marginTop: 8,
  },
  stats: {
    flexDirection: 'row',
    gap: 24,
    marginTop: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
  },
  statNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
  },

  // Lista y filas
  listContent: {
    paddingBottom: 16,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border || '#E5E7EB',
    marginLeft: 68, // para que no atraviese el avatar
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: colors.background,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    color: colors.primary,
    fontWeight: '700',
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
  },
  username: {
    fontSize: 12,
    color: colors.textLight,
    marginTop: 2,
  },
});