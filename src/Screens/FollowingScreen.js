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
const mockFollowing = [
  { id: '1', name: 'Elena Martinez', username: 'elenamartinez' },
  { id: '2', name: 'Carlos Gomez', username: 'carlosgomez' },
  { id: '3', name: 'Design Weekly', username: 'designweekly' },
];

export default function FollowingScreen() {
  const renderFollowing = ({ item }) => (
    <View style={styles.row}>
      <View style={styles.avatar}>
        <Text style={styles.avatarInitial}>{item.name[0]}</Text>
      </View>

      <View style={styles.info}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.username}>@{item.username}</Text>
        <Text style={styles.bio}>You follow each other</Text>
      </View>

      <TouchableOpacity style={styles.followingButton}>
        <Text style={styles.followingText}>Following</Text>
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
          <Text style={styles.headerTitle}>Following</Text>
          <Text style={styles.headerSubtitle}>@carletto</Text>
        </View>
      </View>

      {/* Segmento superior */}
      <View style={styles.segment}>
        <TouchableOpacity style={styles.segmentItem}>
          <Text style={styles.segmentLabel}>Followers</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.segmentItem, styles.segmentActive]}>
          <Text style={[styles.segmentLabel, styles.segmentLabelActive]}>
            Following
          </Text>
        </TouchableOpacity>
      </View>

      {/* Lista */}
      <FlatList
        data={mockFollowing}
        keyExtractor={(item) => item.id}
        renderItem={renderFollowing}
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
  bio: {
    color: colors.textLight,
    fontSize: typography.caption,
    marginTop: spacing.xs,
  },
  followingButton: {
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
  },
  followingText: {
    color: colors.text,
    fontWeight: '700',
  },
  separator: {
    height: 1,
    backgroundColor: colors.border,
    marginLeft: spacing.md + 50,
  },
});
