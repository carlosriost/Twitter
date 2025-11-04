import React, { useEffect, useState, useCallback } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { colors, spacing, radii, typography } from '../Styles/theme';
import { auth } from '../Config/firebaseConfig';
import {
  getTweetsByUser,
  subscribeToTweetsByUser,
} from '../Services/tweetService';
import { toggleLike, toggleRetweet } from '../Services/engagementService';

const profileTabs = ['Posts', 'Replies', 'Media', 'Likes'];

export default function UserTweetsScreen({ route, navigation }) {
  const [tweets, setTweets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(auth.currentUser?.uid ?? null);

  const username = route.params?.username || 'user';
  const fullname = route.params?.fullname || 'Usuario';

  // 🔹 Mantener autenticación actualizada
  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      setCurrentUserId(user?.uid ?? null);
    });
    return () => unsubscribeAuth();
  }, []);

  // 🔹 Escuchar tweets en tiempo real
  useEffect(() => {
    let unsubscribe;
    try {
      unsubscribe = subscribeToTweetsByUser({
        username,
        currentUserId,
        onUpdate: (data) => setTweets(data),
      });
    } catch (error) {
      console.error('Error loading user tweets:', error);
      Alert.alert('Error', 'No se pudieron cargar los tweets.');
    } finally {
      setLoading(false);
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [username, currentUserId]);

  // 🔒 Validar autenticación antes de interactuar
  const ensureAuthenticated = useCallback(() => {
    if (!currentUserId) {
      Alert.alert('Autenticación requerida', 'Inicia sesión para interactuar con los tweets.');
      return false;
    }
    return true;
  }, [currentUserId]);

  // ❤️ Like
  const handleToggleLike = useCallback(
    async (tweetId) => {
      if (!ensureAuthenticated()) return;
      try {
        await toggleLike(tweetId, currentUserId);
      } catch (error) {
        console.error('Error toggling like:', error);
      }
    },
    [currentUserId, ensureAuthenticated]
  );

  // 🔁 Retweet
  const handleToggleRetweet = useCallback(
    async (tweetId) => {
      if (!ensureAuthenticated()) return;
      try {
        await toggleRetweet(tweetId, currentUserId);
      } catch (error) {
        console.error('Error toggling retweet:', error);
      }
    },
    [currentUserId, ensureAuthenticated]
  );

  // 🧩 Render de cada tweet
  const renderTweet = ({ item }) => (
    <View style={styles.tweetRow}>
      {/* Avatar */}
      <View style={styles.avatar}>
        <Text style={styles.avatarInitial}>
          {(item.fullname?.[0] || item.username?.[0] || 'U').toUpperCase()}
        </Text>
      </View>

      {/* Contenido del tweet */}
      <View style={styles.tweetBody}>
        <View style={styles.tweetHeader}>
          <Text style={styles.tweetName}>{item.fullname}</Text>
          <Text style={styles.tweetMeta}>@{item.username}</Text>
          <Text style={styles.moreIcon}>⋯</Text>
        </View>

        {!!(item.text || item.content) && (
          <Text style={styles.tweetContent}>{item.text || item.content}</Text>
        )}

        {/* 🖼️ Mostrar imágenes adjuntas */}
        {Array.isArray(item.media) && item.media.length > 0 && (
          <View
            style={[
              styles.mediaGrid,
              item.media.length === 1 && styles.mediaGridSingle,
            ]}
          >
            {item.media.map((mediaItem, index) => (
              <Image
                key={`${mediaItem.url}-${index}`}
                source={{ uri: mediaItem.url }}
                style={[
                  item.media.length === 1
                    ? styles.mediaImageSingle
                    : styles.mediaImageMultiple,
                ]}
                resizeMode="cover"
              />
            ))}
          </View>
        )}

        {/* Acciones */}
        <View style={styles.tweetActions}>
          <ActionStat icon="💬" value={item.repliesCount} />
          <ActionStat
            icon="🔁"
            value={item.retweetsCount}
            highlight={item.retweeted}
            onPress={() => handleToggleRetweet(item.id)}
            disabled={!currentUserId}
          />
          <ActionStat
            icon="❤️"
            value={item.likesCount}
            highlight={item.liked}
            onPress={() => handleToggleLike(item.id)}
            disabled={!currentUserId}
          />
          <ActionStat icon="📤" />
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ActivityIndicator
          size="large"
          color={colors.primary}
          style={{ marginTop: 50 }}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      <FlatList
        data={tweets}
        keyExtractor={(item) => item.id}
        renderItem={renderTweet}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <>
            {/* Header superior */}
            <View style={styles.topBar}>
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Text style={styles.backArrow}>‹</Text>
              </TouchableOpacity>
              <View>
                <Text style={styles.topBarName}>{fullname}</Text>
                <Text style={styles.topBarCount}>{tweets.length} posts</Text>
              </View>
            </View>

            {/* Banner */}
            <View style={styles.banner} />

            {/* Perfil */}
            <View style={styles.profileCard}>
              <View style={styles.profileAvatar}>
                <Text style={styles.profileAvatarInitial}>
                  {fullname[0]?.toUpperCase() || 'U'}
                </Text>
              </View>
              <TouchableOpacity style={styles.editButton}>
                <Text style={styles.editButtonText}>Edit profile</Text>
              </TouchableOpacity>

              <Text style={styles.profileName}>{fullname}</Text>
              <Text style={styles.profileUsername}>@{username}</Text>

              <Text style={styles.profileBio}>
                Product designer · Pixel perfectionist · Rebuilding X in React Native 💙
              </Text>

              <View style={styles.profileMetaRow}>
                <Text style={styles.profileMeta}>📍 Medellín, Colombia</Text>
                <Text style={styles.dot}>·</Text>
                <Text style={styles.profileMeta}>Joined May 2024</Text>
              </View>

              <View style={styles.profileStats}>
                <Text style={styles.profileStat}>
                  <Text style={styles.profileStatNumber}>180</Text> Following
                </Text>
                <Text style={styles.profileStat}>
                  <Text style={styles.profileStatNumber}>3,245</Text> Followers
                </Text>
              </View>
            </View>

            {/* Tabs */}
            <View style={styles.tabRow}>
              {profileTabs.map((tab, index) => (
                <View
                  key={tab}
                  style={[styles.tabItem, index === 0 && styles.tabItemActive]}
                >
                  <Text
                    style={[
                      styles.tabLabel,
                      index === 0 && styles.tabLabelActive,
                    ]}
                  >
                    {tab}
                  </Text>
                  {index === 0 && <View style={styles.tabIndicator} />}
                </View>
              ))}
            </View>
          </>
        }
      />
    </SafeAreaView>
  );
}

/* 💬 Componente ActionStat */
function ActionStat({ icon, value, highlight = false, onPress, disabled }) {
  const content = (
    <>
      <Text
        style={[
          styles.actionIcon,
          highlight && styles.actionIconHighlight,
          disabled && styles.actionIconDisabled,
        ]}
      >
        {icon}
      </Text>
      {!!value && (
        <Text
          style={[
            styles.actionValue,
            highlight && styles.actionValueHighlight,
            disabled && styles.actionValueDisabled,
          ]}
        >
          {value}
        </Text>
      )}
    </>
  );

  if (!onPress) return <View style={styles.actionStat}>{content}</View>;

  return (
    <TouchableOpacity
      style={[styles.actionStat, styles.actionStatPressable]}
      onPress={onPress}
      disabled={disabled}
    >
      {content}
    </TouchableOpacity>
  );
}

/* 🎨 Estilos */
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  listContent: { paddingBottom: spacing.xl },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  backArrow: { fontSize: 28, color: colors.text },
  topBarName: {
    fontSize: typography.subtitle,
    color: colors.text,
    fontWeight: '700',
  },
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
  profileName: {
    fontSize: typography.title + 2,
    fontWeight: '800',
    color: colors.text,
  },
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
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
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
  tweetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  tweetName: { fontWeight: '700', color: colors.text },
  tweetMeta: { color: colors.textLight, fontSize: typography.caption },
  moreIcon: { color: colors.textLight, fontSize: typography.subtitle, marginLeft: 'auto' },
  tweetContent: { color: colors.text, fontSize: typography.body, lineHeight: 22 },

  /* 🖼️ Estilos de imágenes */
  mediaGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  mediaGridSingle: { width: '100%', borderRadius: radii.lg, overflow: 'hidden' },
  mediaImageSingle: { width: '100%', aspectRatio: 16 / 9, borderRadius: radii.lg },
  mediaImageMultiple: {
    flexBasis: '48%',
    flexGrow: 1,
    aspectRatio: 1,
    borderRadius: radii.md,
  },

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
