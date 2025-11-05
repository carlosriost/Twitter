import React, { useState, useEffect } from 'react';
import styles from '../Styles/TweetScreen.styles';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  StatusBar,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { colors } from '../Styles/theme';
import { auth } from '../Config/firebaseConfig';
import {
  postTweet,
  createReply,
  listenToTweet,
  listenToReplies,
} from '../Services/tweetService';
import Tap from '../Components/Tap';

export default function TweetScreen({ navigation, route }) {
  const [tweet, setTweet] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentTweet, setCurrentTweet] = useState(route.params?.tweet || null);
  const [replies, setReplies] = useState([]);

  // Usuario autenticado
  const currentUser = auth.currentUser;
  const uid = currentUser?.uid || null;
  const username = currentUser?.displayName || route.params?.username || 'user';
  const fullname = route.params?.fullname || username || 'Usuario';

  // Modo respuesta
  const isReplyMode = route.params?.mode === 'reply' && route.params?.tweetId;
  const tweetId = route.params?.tweetId;

  // tweet y respuestas
  useEffect(() => {
    if (!isReplyMode || !tweetId) return;

    const unsubscribeTweet = listenToTweet(tweetId, setCurrentTweet);
    const unsubscribeReplies = listenToReplies(tweetId, setReplies);

    return () => {
      if (unsubscribeTweet) unsubscribeTweet();
      if (unsubscribeReplies) unsubscribeReplies();
    };
  }, [isReplyMode, tweetId]);

  // Publicar tweet o respuesta
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

      {/*Header*/}
      <View style={styles.topBar}>
        <Tap onPress={() => navigation.goBack()}>
          <Text style={styles.cancelText}>Cancel</Text>
        </Tap>

      <Tap
        style={[
        styles.postButton,
        !tweet.trim() && styles.postButtonDisabled, // solo gris si está vacío
        ]}
        onPress={handlePost}
        disabled={loading || !tweet.trim()} // deshabilitado para evitar doble envío, pero sin cambiar color
        accessibilityRole="button"
        >
        {loading ? (
        <ActivityIndicator size="small" color={colors.onPrimary} />
        ) : (
        <Text style={styles.postButtonText}>
        {isReplyMode ? 'Reply' : 'Post'}
        </Text>
        )}
      </Tap>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/*Si está en modo respuesta, muestra el tweet original*/}
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

        {/*Área para escribir tweet o respuesta*/}
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

            {/*Barra inferior*/}
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


