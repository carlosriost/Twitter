// src/Styles/FollowersScreen.styles.js
import { StyleSheet } from 'react-native';
import { colors } from './theme';

export default StyleSheet.create({
  // Contenedor
  safeArea: {
    flex: 1,
    backgroundColor: colors?.background || '#FFFFFF',
    paddingTop: 35,
  },

  // Header superior
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomColor: '#E5E7EB',
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 8,
  },
  backArrow: {
    fontSize: 28,
    color: '#111827',
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    lineHeight: 22,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },

  // Segmento (tabs Followers/Following)
  segment: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 4,
  },
  segmentItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 8,
  },
  segmentActive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E7EB',
    borderWidth: StyleSheet.hairlineWidth,
  },
  segmentLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
  },
  segmentLabelActive: {
    color: '#111827',
  },

  // Lista
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#E5E7EB',
  },

  // Fila de usuario
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  username: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    marginTop: 6,
  },
  badgePill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: '#EEFDF3',
    borderColor: '#22C55E',
    borderWidth: StyleSheet.hairlineWidth,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#16A34A',
  },

  // Tarjeta de perfil (antes "local")
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
    backgroundColor: '#FFFFFF',
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
});