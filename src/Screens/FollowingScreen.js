import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { colors, spacing, radii, typography } from '../Styles/theme';
import { getFollowing } from '../Services/tweetService';
 // 🔹 Importa el servicio real

export default function FollowingScreen({ route, navigation }) {
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);

  const username = route.params?.username || 'carletto';

  useEffect(() => {
    const fetchFollowing = async () => {
      try {
        const data = await getFollowing(username);
        setFollowing(data);
      } catch (error) {
        console.error('Error al obtener los seguidos:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchFollowing();
  }, [username]);

const renderFollowing = ({ item }) => {
  if (!item) return null;
  const display = String(item).trim();

  return (
    <View style={styles.row}>
      <View style={styles.avatar}>
        <Text style={styles.avatarInitial}>{display[0]?.toUpperCase() || 'U'}</Text>
      </View>

      <View style={styles.info}>
        <Text style={styles.name}>{display}</Text>
        <Text style={styles.username}>@{display}</Text>
        <Text style={styles.bio}>You follow each other</Text>
      </View>

      <TouchableOpacity style={styles.followingButton}>
        <Text style={styles.followingText}>Following</Text>
      </TouchableOpacity>
    </View>
  );
};


  if (loading)
    return (
      <SafeAreaView style={styles.safeArea}>
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
      </SafeAreaView>
    );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Following</Text>
          <Text style={styles.headerSubtitle}>@{username}</Text>
        </View>
      </View>

      {/* Segmento superior */}
      <View style={styles.segment}>
        <TouchableOpacity
          style={styles.segmentItem}
          onPress={() => navigation.navigate('Followers', { username })}
        >
          <Text style={styles.segmentLabel}>Followers</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.segmentItem, styles.segmentActive]}>
          <Text style={[styles.segmentLabel, styles.segmentLabelActive]}>Following</Text>
        </TouchableOpacity>
      </View>

      {/* Lista */}
      <FlatList
        data={following}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderFollowing}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
    color: colors.muted,
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
