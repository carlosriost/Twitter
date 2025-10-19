import React, { useMemo, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  StatusBar,
} from 'react-native';
import { colors, spacing, radii, typography } from '../Styles/theme';

// 🐦 Tweets de ejemplo
const mockTweets = [
  {
    id: '1',
    name: 'X Designer',
    username: 'design_team',
    time: '1h',
    content:
      'Crafting pixel perfect clones keeps your UI instincts sharp. Ship fast, polish faster. #Design',
    replies: 23,
    retweets: 18,
    likes: 240,
  },
  {
    id: '2',
    name: 'React Native',
    username: 'reactnative',
    time: '3h',
    content:
      'Use FlatList for long feeds, memoize heavy rows, and keep re-rendering to a minimum for the best performance.',
    replies: 110,
    retweets: 92,
    likes: 1040,
  },
  {
    id: '3',
    name: 'Carletto',
    username: 'carletto_dev',
    time: '6h',
    content:
      'This Twitter clone is almost indistinguishable from the real thing. Love the polish! ✨',
    replies: 8,
    retweets: 15,
    likes: 180,
  },
];

// 🔹 Íconos inferiores
const bottomNavItems = [
  { id: 'home', label: 'Home', icon: '🏠', route: 'Home' },
  { id: 'search', label: 'Search', icon: '🔍', route: 'Home' },
  { id: 'post', label: 'Post', icon: '✍️', route: 'Tweet' },
  { id: 'messages', label: 'Inbox', icon: '✉️', route: 'Home' },
];

// 🔹 Íconos del compositor
const composerIcons = ['🖼️', '🎞️', '📊', '😊'];

export default function HomeScreen({ navigation, route }) {
  const username = route.params?.username || 'user';
  const [activeTab, setActiveTab] = useState('forYou');

  const quickActions = useMemo(
    () => [
      { id: 'tweet', label: 'Compose', onPress: () => navigation.navigate('Tweet') },
      { id: 'followers', label: 'Followers', onPress: () => navigation.navigate('Followers') },
      { id: 'following', label: 'Following', onPress: () => navigation.navigate('Following') },
      { id: 'userTweets', label: 'Profile', onPress: () => navigation.navigate('UserTweets') },
    ],
    [navigation]
  );

  // 🧩 Render de cada tweet
  const renderTweet = ({ item }) => (
    <View style={styles.tweetRow}>
      <View style={styles.avatar}>
        <Text style={styles.avatarInitial}>{item.name[0]}</Text>
      </View>
      <View style={styles.tweetBody}>
        <View style={styles.tweetHeader}>
          <View style={styles.headerText}>
            <Text style={styles.tweetName}>{item.name}</Text>
            <Text style={styles.tweetMeta}>
              @{item.username} · {item.time}
            </Text>
          </View>
          <Text style={styles.moreIcon}>⋯</Text>
        </View>
        <Text style={styles.tweetContent}>{item.content}</Text>
        <View style={styles.tweetActions}>
          <ActionStat icon="💬" value={item.replies} />
          <ActionStat icon="🔁" value={item.retweets} />
          <ActionStat icon="❤️" value={item.likes} highlight />
          <ActionStat icon="📤" />
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <FlatList
        data={mockTweets}
        keyExtractor={(item) => item.id}
        renderItem={renderTweet}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <>
            {/* Header */}
            <View style={styles.topBar}>
              <TouchableOpacity style={styles.headerAvatar}>
                <Text style={styles.headerAvatarInitial}>
                  {username[0]?.toUpperCase()}
                </Text>
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
                <Text style={styles.avatarInitial}>
                  {username[0]?.toUpperCase()}
                </Text>
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

      {/* Bottom Navigation */}
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

// 🔹 Componente auxiliar para los íconos de interacción
function ActionStat({ icon, value, highlight = false }) {
  return (
    <View style={styles.actionStat}>
      <Text style={[styles.actionIcon, highlight && styles.actionIconHighlight]}>
        {icon}
      </Text>
      {!!value && (
        <Text
          style={[styles.actionValue, highlight && styles.actionValueHighlight]}
        >
          {value}
        </Text>
      )}
    </View>
  );
}

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
  headerAvatar: {
    width: 34,
    height: 34,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  headerAvatarInitial: {
    color: colors.text,
    fontWeight: '700',
  },
  brandMark: { fontSize: 24, fontWeight: '900', color: colors.text },
  sparkle: { fontSize: 18 },

  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
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
  tweetBody: { flex: 1, gap: spacing.sm },
  tweetHeader: { flexDirection: 'row', alignItems: 'center' },
  headerText: { flex: 1 },
  tweetName: { fontWeight: '700', color: colors.text },
  tweetMeta: { color: colors.textLight },
  tweetContent: {
    color: colors.text,
    fontSize: typography.body,
    lineHeight: 22,
  },
  moreIcon: { color: colors.textLight, fontSize: 18 },
  tweetActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
    paddingRight: spacing.lg,
  },
  actionStat: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  actionIcon: { color: colors.textLight, fontSize: typography.subtitle },
  actionIconHighlight: { color: colors.danger },
  actionValue: { color: colors.textLight, fontSize: typography.caption },
  actionValueHighlight: { color: colors.danger },

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
