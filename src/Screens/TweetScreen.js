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
  Image,
  Alert,
} from 'react-native';
import { colors } from '../Styles/theme';
import { auth } from '../Config/firebaseConfig';
import { pickImageAndUpload, calcAspectRatio } from '../Services/storageService';
import {
  postTweet,
  createReply,
  listenToTweet,
  listenToReplies,
} from '../Services/tweetService';
import { profileStore } from '../Services/profileStore';
import Tap from '../Components/Tap';

export default function TweetScreen({ navigation, route }) {
  const [tweet, setTweet] = useState('');
  const [media, setMedia] = useState([]); // [{ url, ratio }]
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentTweet, setCurrentTweet] = useState(route.params?.tweet || null);
  const [replies, setReplies] = useState([]);

  //Perfil del usuario logueado
  const [profile, setProfile] = useState(profileStore.getProfile());
  useEffect(() => {
    const unsubscribe = profileStore.subscribe(setProfile);
    return () => unsubscribe();
  }, []);

  //Identidad mostrada en el composer (prioriza profileStore)
  const username =
    profile?.username ||
    auth.currentUser?.displayName ||
    route.params?.username ||
    'user';

  const fullname =
    profile?.fullname ||
    route.params?.fullname ||
    username ||
    'Usuario';

  //Modo respuesta
  const isReplyMode = route.params?.mode === 'reply' && route.params?.tweetId;
  const tweetId = route.params?.tweetId;

  //Escuchar tweet y respuestas cuando es reply
  useEffect(() => {
    if (!isReplyMode || !tweetId) return;

    const unsubscribeTweet = listenToTweet(tweetId, setCurrentTweet);
    const unsubscribeReplies = listenToReplies(tweetId, setReplies);

    return () => {
      if (unsubscribeTweet) unsubscribeTweet();
      if (unsubscribeReplies) unsubscribeReplies();
    };
  }, [isReplyMode, tweetId]);

  //Publicar tweet o respuesta
  const handlePost = async () => {
    if (!tweet.trim()) return;
    const uid = auth.currentUser?.uid || null;
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
        const mediaPayload = media.map((m) => ({ url: m.url, ratio: m.ratio }));
        await postTweet(uid, username, fullname, tweet.trim(), mediaPayload);
      }

      setTweet('');
      setMedia([]);
      Alert.alert(
        'Publicado',
        isReplyMode ? 'Tu respuesta se publicó exitosamente.' : 'Tu tweet se publicó exitosamente.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ],
        { cancelable: false }
      );
    } catch (error) {
      console.error('Error al publicar el tweet:', error);
      alert('Error al publicar el tweet');
    } finally {
      setLoading(false);
    }
  };

  const handleAddImage = async () => {
    if (uploadingMedia) return;
    const uid = auth.currentUser?.uid;
    if (!uid) {
      Alert.alert('Sesión requerida', 'Inicia sesión para subir imágenes.');
      return;
    }
    try {
      setUploadingMedia(true);
      const res = await pickImageAndUpload({ folder: 'tweetMedia', userId: uid, prefix: 'tweet' });
      if (!res) return; // cancelado
      const ratio = calcAspectRatio(res.width, res.height);
      setMedia((prev) => [...prev, { url: res.downloadURL, ratio }]);
    } catch (e) {
      console.error('Error subiendo imagen del tweet', e);
      Alert.alert('Error', 'No se pudo subir la imagen.');
    } finally {
      setUploadingMedia(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* Header */}
      <View style={styles.topBar}>
        <Tap onPress={() => navigation.goBack()}>
          <Text style={styles.cancelText}>Cancel</Text>
        </Tap>

        <Tap
          style={[
            styles.postButton,
            !tweet.trim() && styles.postButtonDisabled, // solo “apagado” si está vacío
          ]}
          onPress={handlePost}
          disabled={loading || !tweet.trim()} // deshabilita para evitar doble envío
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
        {/* Tweet original si estás respondiendo */}
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

        {/* Composer */}
        <View style={styles.container}>
          <View style={styles.avatar}>
            <Text style={styles.avatarInitial}>
              {fullname?.[0]?.toUpperCase() || username?.[0]?.toUpperCase() || 'U'}
            </Text>
          </View>

          <View style={styles.composerBody}>
            <TextInput
              style={styles.input}
              placeholder={isReplyMode ? 'Tweet your reply' : 'What is happening?!'}
              placeholderTextColor={colors.textLight}
              multiline
              maxLength={280}
              value={tweet}
              onChangeText={setTweet}
            />

           
            
            {media.length > 0 && (
              <View style={styles.mediaPreviewContainer}>
                {media.map((m, idx) => (
                  <View key={m.url} style={styles.mediaItemWrapper}>
                    <Image
                      source={{ uri: m.url }}
                      style={[styles.mediaItem, { aspectRatio: m.ratio }]}
                      resizeMode="cover"
                    />
                    <Tap
                      style={styles.removeMediaButton}
                      onPress={() =>
                        setMedia((prev) => prev.filter((x) => x.url !== m.url))
                      }
                    >
                      <Text style={styles.removeMediaText}>×</Text>
                    </Tap>
                  </View>
                ))}
              </View>
            )}

            <View style={styles.toolbar}>
              <View style={styles.iconRow}>
                <Tap onPress={handleAddImage} disabled={uploadingMedia}>
                  <Text style={styles.icon}>{uploadingMedia ? '⏳' : '🖼️'}</Text>
                </Tap>
                <Text style={styles.icon}>📍</Text>
                <Text style={styles.icon}>😊</Text>
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

        {/* Respuestas */}
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