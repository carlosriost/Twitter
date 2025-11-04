import React, { useMemo, useState, useEffect, useCallback } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { colors, spacing, radii, typography } from '../Styles/theme';
import { auth } from '../Config/firebaseConfig';
import { subscribeToTweets, toggleLike, toggleRetweet } from '../Services/tweetService';
import { profileStore } from '../Services/profileStore';

/* ────────────────────────────────
 * 🔹 Íconos inferiores
 * ──────────────────────────────── */
const bottomNavItems = [
  { id: 'home', label: 'Home', icon: '🏠', route: 'Home' },
  { id: 'search', label: 'Search', icon: '🔍', route: 'Home' },
  { id: 'post', label: 'Post', icon: '✍️', route: 'Tweet' },
  { id: 'messages', label: 'Inbox', icon: '✉️', route: 'Home' },
];

/* ────────────────────────────────
 * 🔹 Íconos del compositor
 * ──────────────────────────────── */
const composerIcons = ['🖼️', '🎞️', '📊', '😊'];

export default function HomeScreen({ navigation, route }) {
  const [profile, setProfile] = useState(profileStore.getProfile());
  const username = profile?.username || route.params?.username || 'user';
  const [activeTab, setActiveTab] = useState('forYou');
  const [tweets, setTweets] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(auth.currentUser?.uid ?? null);
  const [loading, setLoading] = useState(true);

  /* ────────────────────────────────
   * 👤 Mantener sesión y perfil global actualizados
   * ──────────────────────────────── */
  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      setCurrentUserId(user?.uid ?? null);
    });
    const unsubscribeProfile = profileStore.subscribe(setProfile);
    return () => {
      unsubscribeAuth();
      unsubscribeProfile();
    };
  }, []);

  /* ────────────────────────────────
 * 🕒 Escuchar tweets en tiempo real
 * ──────────────────────────────── */
useEffect(() => {
  setLoading(true);
  const unsubscribe = subscribeToTweets({
    currentUserId,
    onUpdate: (data) => {
      setTweets(data);
      setLoading(false);
    },
  });

  return () => {
    if (unsubscribe) unsubscribe();
  };
}, [currentUserId]);


  /* ────────────────────────────────
   * 🔒 Validar autenticación antes de acciones
   * ──────────────────────────────── */
  const ensureAuthenticated = useCallback(() => {
    if (!currentUserId) {
      Alert.alert('Autenticación requerida', 'Inicia sesión para interactuar con los tweets.');
      return false;
    }
    return true;
  }, [currentUserId]);

  /* ❤️ Like */
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

  /* 🔁 Retweet */
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

  /* ⚡ Accesos rápidos */
  const quickActions = useMemo(
    () => [
      { id: 'tweet', label: 'Compose', onPress: () => navigation.navigate('Tweet') },
      { id: 'followers', label: 'Followers', onPress: () => navigation.navigate('Followers') },
      { id: 'following', label: 'Following', onPress: () => navigation.navigate('Following') },
      { id: 'userTweets', label: 'Profile', onPress: () => navigation.navigate('UserTweets') },
    ],
    [navigation]
  );

  /* 🧩 Render de cada tweet */
  const renderTweet = ({ item }) => (
    <View style={styles.tweetRow}>
      <View style={styles.avatar}>
        {item.photoURL ? (
          <Image source={{ uri: item.photoURL }} style={styles.avatarImage} />
        ) : (
          <Text style={styles.avatarInitial}>
            {(item.fullname?.[0] || item.username?.[0] || 'U').toUpperCase()}
          </Text>
        )}
      </View>

      <View style={styles.tweetBody}>
        <View style={styles.tweetHeader}>
          <View style={styles.headerText}>
            <Text style={styles.tweetName}>{item.fullname || 'Usuario'}</Text>
            <Text style={styles.tweetMeta}>@{item.username || 'user'}</Text>
          </View>
          <Text style={styles.moreIcon}>⋯</Text>
        </View>

        {!!(item.text || item.content) && (
          <Text style={styles.tweetContent}>{item.text || item.content}</Text>
        )}

        {/* 🖼️ Soporte de imágenes */}
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

        {/* 💬 Acciones */}
        <View style={styles.tweetActions}>
          <ActionStat icon="💬" value={item.repliesCount} />
          <ActionStat
            icon="🔁"
            value={item.retweetsCount}
            highlight={item.retweeted}
            onPress={() => handleToggleRetweet(item.id)}
          />
          <ActionStat
            icon="❤️"
            value={item.likesCount}
            highlight={item.liked}
            onPress={() => handleToggleLike(item.id)}
          />
          <ActionStat icon="📤" />
        </View>
      </View>
    </View>
  );

  /* 🌀 Pantalla */
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={tweets}
          keyExtractor={(item) => item.id}
          renderItem={renderTweet}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <>
              {/* 🧭 Barra superior */}
              <View style={styles.topBar}>
                <TouchableOpacity
                  style={styles.profileButton}
                  onPress={() => navigation.navigate('Profile')}
                >
                  {profile?.photoURL ? (
                    <Image source={{ uri: profile.photoURL }} style={styles.avatarImage} />
                  ) : (
                    <Text style={styles.profileInitial}>
                      {username[0]?.toUpperCase()}
                    </Text>
                  )}
                </TouchableOpacity>
                <Text style={styles.brandMark}>𝕏</Text>
                <Text style={styles.sparkle}>✨</Text>
              </View>

              {/* Tabs */}
              <View style={styles.tabs}>
                {['forYou', 'following'].map((tab) => (
                  <TouchableOpacity
                    key={tab}
                    style={styles.tabItem}
                    onPress={() => setActiveTab(tab)}
                  >
                    <Text
                      style={[
                        styles.tabLabel,
                        activeTab === tab && styles.tabLabelActive,
                      ]}
                    >
                      {tab === 'forYou' ? 'For you' : 'Following'}
                    </Text>
                    {activeTab === tab && <View style={styles.tabIndicator} />}
                  </TouchableOpacity>
                ))}
              </View>

              {/* Composer */}
              <View style={styles.composer}>
                <View style={styles.avatarSmall}>
                  {profile?.photoURL ? (
                    <Image source={{ uri: profile.photoURL }} style={styles.avatarImage} />
                  ) : (
                    <Text style={styles.avatarInitial}>
                      {username[0]?.toUpperCase()}
                    </Text>
                  )}
                </View>
                <View style={styles.composerBody}>
                  <TextInput
                    style={styles.composerInput}
                    placeholder="What is happening?!"
                    placeholderTextColor={colors.textLight}
                    multiline
                  />
                  <View style={styles.composerActions}>
                    <View style={styles.composerIcons}>
                      {composerIcons.map((symbol, index) => (
                        <Text
                          key={symbol}
                          style={[
                            styles.icon,
                            index !== composerIcons.length - 1 && styles.iconSpacing,
                          ]}
                        >
                          {symbol}
                        </Text>
                      ))}
                    </View>
                    <TouchableOpacity
                      style={styles.tweetButton}
                      onPress={() => navigation.navigate('Tweet')}
                    >
                      <Text style={styles.tweetButtonText}>Post</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              {/* Quick Actions */}
              <View style={styles.quickActions}>
                {quickActions.map((action) => (
                  <TouchableOpacity
                    key={action.id}
                    style={styles.actionChip}
                    onPress={action.onPress}
                  >
                    <Text style={styles.actionChipText}>{action.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.divider} />
            </>
          }
        />
      )}

      {/* 📱 Bottom Navigation */}
      <View style={styles.bottomBar}>
        {bottomNavItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.bottomItem}
            onPress={() => navigation.navigate(item.route)}
          >
            <Text style={styles.bottomItemIcon}>{item.icon}</Text>
            <Text style={styles.bottomItemLabel}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

/* ────────────────────────────────
 * 💬 ActionStat Component
 * ──────────────────────────────── */
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

/* ────────────────────────────────
 * 🎨 Styles
 * ──────────────────────────────── */
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  listContent: { paddingBottom: spacing.xl * 2 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
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
  brandMark: { fontSize: 24, fontWeight: '900', color: colors.text },
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
  tweetButtonText: { color: colors.background, fontWeight: '700' },
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
  mediaImageSingle: { width: '100%', aspectRatio: 16 / 9, borderRadius: radii.lg },
  mediaImageMultiple: {
    flexBasis: '48%',
    flexGrow: 1,
    aspectRatio: 1,
    borderRadius: radii.md,
    marginBottom: spacing.xs,
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
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: colors.background,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  bottomItem: { alignItems: 'center', flex: 1 },
  bottomItemIcon: { fontSize: 20 },
  bottomItemLabel: { fontSize: typography.label, color: colors.textLight },
});
