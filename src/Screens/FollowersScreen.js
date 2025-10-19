import React from 'react';
import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { colors, spacing, radii, typography } from '../Styles/theme';

// 👥 Datos de ejemplo
const mockFollowers = [
  { id: '1', name: 'John Doe', username: 'johndoe' },
  { id: '2', name: 'Jane Smith', username: 'janesmith' },
  { id: '3', name: 'Alex Turner', username: 'alexturner' },
  { id: '4', name: 'Lena Rivers', username: 'lenarivers' },
];

export default function FollowersScreen() {
  const renderFollower = ({ item }) => (
    <View style={styles.row}>
      <View style={styles.avatar}>
        <Text style={styles.avatarInitial}>{item.name[0]}</Text>
      </View>

      <View style={styles.info}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.username}>@{item.username}</Text>

        <View style={styles.badgeRow}>
          <View style={styles.badgePill}>
            <Text style={styles.badgeText}>Follows you</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.followButton}>
        <Text style={styles.followText}>Follow</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.backArrow}>‹</Text>
        <View>
          <Text style={styles.headerTitle}>Followers</Text>
          <Text style={styles.headerSubtitle}>@carletto</Text>
        </View>
      </View>

      {/* Segmento superior */}
      <View style={styles.segment}>
        <TouchableOpacity style={[styles.segmentItem, styles.segmentActive]}>
          <Text style={[styles.segmentLabel, styles.segmentLabelActive]}>
            Followers
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.segmentItem}>
          <Text style={styles.segmentLabel}>Following</Text>
        </TouchableOpacity>
      </View>

      {/* Lista de seguidores */}
      <FlatList
        data={mockFollowers}
        keyExtractor={(item) => item.id}
        renderItem={renderFollower}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backArrow: {
    fontSize: 26,
    color: colors.text,
  },
  headerTitle: {
    fontSize: typography.title,
    fontWeight: '700',
    color: colors.text,
  },
  headerSubtitle: {
    color: colors.textLight,
    fontSize: typography.caption,
  },
  segment: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  segmentItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  segmentActive: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  segmentLabel: {
    fontSize: typography.subtitle,
    color: colors.textLight,
    fontWeight: '600',
  },
  segmentLabelActive: {
    color: colors.text,
  },
  listContent: {
    paddingVertical: spacing.sm,
  },
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
  info: {
    flex: 1,
  },
  name: {
    fontWeight: '700',
    color: colors.text,
    fontSize: typography.body,
  },
  username: {
    color: colors.muted,
    fontSize: typography.caption,
    marginTop: spacing.xs,
  },
  badgeRow: {
    flexDirection: 'row',
    marginTop: spacing.xs,
  },
  badgePill: {
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  badgeText: {
    color: colors.textLight,
    fontSize: typography.caption,
  },
  followButton: {
    backgroundColor: colors.text,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
  },
  followText: {
    color: colors.background,
    fontWeight: '700',
  },
  separator: {
    height: 1,
    backgroundColor: colors.border,
    marginLeft: spacing.md + 50,
  },
});
