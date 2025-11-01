import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { colors, spacing, radii, typography } from '../Styles/theme';

export default function TweetCard({ tweet, onPress, style, showActions = true }) {
  if (!tweet) {
    return null;
  }

  const displayName = tweet.fullname || tweet.name || tweet.authorName || 'Usuario';
  const username = tweet.username || tweet.authorUsername || 'user';
  const content = tweet.content || tweet.text || tweet.body || '';
  const avatarInitial = (displayName[0] || username[0] || 'U').toUpperCase();
  const media = tweet.media || tweet.mediaUrls || tweet.mediaUrl;

  return (
    <TouchableOpacity activeOpacity={0.7} onPress={onPress} style={[styles.container, style]}>
      <View style={styles.avatar}>
        {tweet.photoURL ? (
          <Image source={{ uri: tweet.photoURL }} style={styles.avatarImage} />
        ) : (
          <Text style={styles.avatarInitial}>{avatarInitial}</Text>
        )}
      </View>
      <View style={styles.body}>
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.displayName}>{displayName}</Text>
            <Text style={styles.username}>@{username}</Text>
          </View>
          <Text style={styles.moreIcon}>⋯</Text>
        </View>
        <Text style={styles.content}>{content}</Text>
        {Array.isArray(media) && media.length > 0 && (
          <View style={styles.mediaPreview}>
            <Text style={styles.mediaPlaceholder}>🖼️ {media.length} media items</Text>
          </View>
        )}
        {typeof media === 'string' && media.length > 0 && (
          <View style={styles.mediaPreview}>
            <Text style={styles.mediaPlaceholder}>🖼️ Media attachment</Text>
          </View>
        )}
        {showActions && (
          <View style={styles.actions}>
            <ActionStat icon="💬" value={tweet.replyCount} />
            <ActionStat icon="🔁" value={tweet.retweetCount} />
            <ActionStat icon="❤️" value={tweet.likeCount} highlight />
            <ActionStat icon="📤" />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

function ActionStat({ icon, value, highlight = false }) {
  return (
    <View style={styles.actionStat}>
      <Text style={[styles.actionIcon, highlight && styles.actionIconHighlight]}>{icon}</Text>
      {!!value && (
        <Text style={[styles.actionValue, highlight && styles.actionValueHighlight]}>
          {value}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: radii.pill,
  },
  avatarInitial: {
    color: colors.text,
    fontWeight: '700',
  },
  body: {
    flex: 1,
    gap: spacing.xs,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerText: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  displayName: {
    color: colors.text,
    fontWeight: '700',
  },
  username: {
    color: colors.textLight,
  },
  moreIcon: {
    color: colors.textLight,
    fontSize: typography.subtitle,
  },
  content: {
    color: colors.text,
    fontSize: typography.body,
    lineHeight: 20,
  },
  mediaPreview: {
    marginTop: spacing.xs,
    padding: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
  },
  mediaPlaceholder: {
    color: colors.textLight,
    fontSize: typography.caption,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
    paddingRight: spacing.xl,
  },
  actionStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  actionIcon: {
    color: colors.textLight,
  },
  actionValue: {
    color: colors.textLight,
    fontSize: typography.caption,
  },
  actionIconHighlight: {
    color: colors.danger,
  },
  actionValueHighlight: {
    color: colors.danger,
  },
});