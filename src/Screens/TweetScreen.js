import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { colors, spacing, radii, typography } from '../Styles/theme';
import { auth } from '../Config/firebaseConfig';
import {
  postTweet,
  createReply,
  listenToTweet,
  listenToReplies,
} from '../Services/tweetService';

export default function TweetScreen({ navigation, route }) {
  const [tweet, setTweet] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentTweet, setCurrentTweet] = useState(route.params?.tweet || null);
  const [replies, setReplies] = useState([]);

  // 🔹 Usuario autenticado
  const currentUser = auth.currentUser;
  const uid = currentUser?.uid || null;
  const username = currentUser?.displayName || route.params?.username || 'user';
  const fullname = route.params?.fullname || username || 'Usuario';

  // 🔹 Modo respuesta
  const isReplyMode = route.params?.mode === 'reply' && route.params?.tweetId;
  const tweetId = route.params?.tweetId;

  // 🔹 Escuchar tweet y respuestas
  useEffect(() => {
    if (!isReplyMode || !tweetId) return;

    const unsubscribeTweet = listenToTweet(tweetId, setCurrentTweet);
    const unsubscribeReplies = listenToReplies(tweetId, setReplies);

    return () => {
      if (unsubscribeTweet) unsubscribeTweet();
      if (unsubscribeReplies) unsubscribeReplies();
    };
  }, [isReplyMode, tweetId]);

  // 🔹 Publicar tweet o respuesta
  const handlePost = async () => {
    if (!tweet.trim()) return;
    if (!uid) {
      alert('Debes iniciar sesión para publicar un tweet.');
      return;
    }

    setLoading(true);
    try {
      if (isReplyMode && tweetId) {
        await createReply(tweetId, {
          uid,
          username,
          fullname,
          text: tweet.trim(),
        });
      } else {
        await postTweet(uid, username, fullname, tweet.trim());
      }

      setTweet('');
      navigation.goBack();
    } catch (error) {
      console.error('❌ Error al publicar el tweet:', error);
      alert('Error al publicar el tweet 😢');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* 🔹 Header */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.postButton,
            (!tweet.trim() || loading) && styles.postButtonDisabled,
          ]}
          onPress={handlePost}
          disabled={!tweet.trim() || loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color={colors.background} />
          ) : (
            <Text style={styles.postButtonText}>
              {isReplyMode ? 'Reply' : 'Post'}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* 🔹 Si está en modo respuesta, muestra el tweet original */}
        {isReplyMode && currentTweet && (
          <View style={styles.threadCard}>
            <View style={styles.threadHeader}>
              <View style={styles.threadAvatar}>
                <Text style={styles.threadAvatarInitial}>
                  {(currentTweet.fullname?.[0] ||
                    currentTweet.username?.[0] ||
                    'U').toUpperCase()}
                </Text>
              </View>
              <View style={styles.threadHeaderText}>
                <Text style={styles.threadName}>
                  {currentTweet.fullname || currentTweet.username}
                </Text>
                <Text style={styles.threadMeta}>
                  @{currentTweet.username || 'user'}
                </Text>
              </View>
            </View>
            <Text style={styles.threadContent}>
              {currentTweet.text || currentTweet.content}
            </Text>
          </View>
        )}

        {/* 🔹 Área para escribir tweet o respuesta */}
        <View style={styles.container}>
          <View style={styles.avatar}>
            <Text style={styles.avatarInitial}>
              {fullname[0]?.toUpperCase() || 'U'}
            </Text>
          </View>

          <View style={styles.composerBody}>
            <TextInput
              style={styles.input}
              placeholder={
                isReplyMode ? 'Tweet your reply' : 'What is happening?!'
              }
              placeholderTextColor={colors.textLight}
              multiline
              maxLength={280}
              value={tweet}
              onChangeText={setTweet}
            />

            {/* 🔹 Barra inferior */}
            <View style={styles.toolbar}>
              <View style={styles.iconRow}>
                {['🖼️', '📍', '😊'].map((icon) => (
                  <Text key={icon} style={styles.icon}>
                    {icon}
                  </Text>
                ))}
              </View>
              <Text
                style={[
                  styles.counter,
                  tweet.length > 240 && styles.counterWarning,
                ]}
              >
                {tweet.length}/280
              </Text>
            </View>
          </View>
        </View>

        {/* 🔹 Respuestas */}
        {isReplyMode && (
          <View style={styles.repliesSection}>
            <Text style={styles.repliesTitle}>Replies</Text>
            {replies.length === 0 ? (
              <Text style={styles.emptyReplies}>No replies yet.</Text>
            ) : (
              replies.map((reply) => (
                <View key={reply.id} style={styles.replyRow}>
                  <View style={styles.replyAvatar}>
                    <Text style={styles.replyAvatarInitial}>
                      {(reply.fullname?.[0] ||
                        reply.username?.[0] ||
                        'U').toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.replyBody}>
                    <View style={styles.replyHeader}>
                      <Text style={styles.replyName}>
                        {reply.fullname || reply.username || 'User'}
                      </Text>
                      <Text style={styles.replyMeta}>
                        @{reply.username || 'user'}
                      </Text>
                    </View>
                    <Text style={styles.replyContent}>{reply.text || ''}</Text>
                  </View>
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

/* 🎨 Estilos */
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  cancelText: { color: colors.textLight, fontSize: typography.subtitle, fontWeight: '500' },
  postButton: {
    backgroundColor: colors.primary,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  postButtonDisabled: { backgroundColor: colors.border },
  postButtonText: { color: colors.background, fontWeight: '700', fontSize: typography.subtitle },
  scrollContent: { paddingBottom: spacing.xl },
  container: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    gap: spacing.md,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  avatarInitial: { color: colors.text, fontWeight: '700' },
  composerBody: { flex: 1 },
  input: {
    minHeight: 120,
    fontSize: typography.subtitle,
    color: colors.text,
    textAlignVertical: 'top',
    paddingBottom: spacing.md,
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
  },
  iconRow: { flexDirection: 'row', gap: spacing.sm },
  icon: { fontSize: 20 },
  counter: { fontSize: typography.caption, color: colors.textLight },
  counterWarning: { color: colors.danger },
  threadCard: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.background,
    gap: spacing.sm,
  },
  threadHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  threadAvatar: {
    width: 40,
    height: 40,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  threadAvatarInitial: { color: colors.text, fontWeight: '700' },
  threadHeaderText: { flex: 1, gap: spacing.xs },
  threadName: { fontWeight: '700', color: colors.text },
  threadMeta: { color: colors.textLight, fontSize: typography.caption },
  threadContent: { color: colors.text, fontSize: typography.subtitle, lineHeight: 22 },
  repliesSection: { paddingHorizontal: spacing.md, paddingTop: spacing.lg, gap: spacing.md },
  repliesTitle: { fontSize: typography.subtitle, fontWeight: '700', color: colors.text },
  emptyReplies: { color: colors.textLight },
  replyRow: { flexDirection: 'row', gap: spacing.sm },
  replyAvatar: {
    width: 36,
    height: 36,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  replyAvatarInitial: { color: colors.text, fontWeight: '700' },
  replyBody: { flex: 1, gap: spacing.xs },
  replyHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  replyName: { fontWeight: '600', color: colors.text },
  replyMeta: { color: colors.textLight, fontSize: typography.caption },
  replyContent: { color: colors.text, fontSize: typography.body, lineHeight: 20 },
});
