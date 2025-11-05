import React, { useEffect, useState, useCallback } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  StatusBar,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { colors } from '../Styles/theme';
import styles from '../Styles/UserTweetsScreen.styles';
import { auth, db } from '../Config/firebaseConfig';
import { subscribeToTweetsByUser } from '../Services/tweetService';
import { toggleLike, toggleRetweet } from '../Services/engagementService';
import { profileStore } from '../Services/profileStore';
import { collection, query, where, limit, getDocs } from 'firebase/firestore';
import Tap from '../Components/Tap';

const profileTabs = ['Posts', 'Replies', 'Media', 'Likes'];

export default function UserTweetsScreen({ route, navigation }) {
  const [tweets, setTweets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(auth.currentUser?.uid ?? null);

  // Perfil propio (store)
  const [profile, setProfile] = useState(profileStore.getProfile());

  // Perfil que se está viendo (si es otro usuario)
  const [viewedProfile, setViewedProfile] = useState(null);

  const usernameParam = route.params?.username || null;
  const fullnameParam = route.params?.fullname || null;

  // Username que se está mostrando en la pantalla
  const screenUsername =
    usernameParam ||
    profile?.username ||
    auth.currentUser?.displayName ||
    'user';

  // ¿Es mi propio perfil?
  const isOwnProfile = !usernameParam || profile?.username === usernameParam;

  // Nombre a mostrar en header y tarjeta
  const displayName =
    fullnameParam ||
    (isOwnProfile ? (profile?.fullname || profile?.username) : (viewedProfile?.fullname || screenUsername)) ||
    screenUsername;

  // Bio a mostrar en la tarjeta
  const bioText = isOwnProfile ? profile?.bio : viewedProfile?.bio;

  // Mantener autenticación actualizada y perfil global
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

  // Si es perfil ajeno, traer su perfil (fullname/bio) por username
  useEffect(() => {
    let cancelled = false;
    const fetchViewedProfile = async () => {
      if (isOwnProfile || !screenUsername) {
        setViewedProfile(null);
        return;
      }
      try {
        const q = query(
          collection(db, 'users'),
          where('username', '==', screenUsername),
          limit(1)
        );
        const snap = await getDocs(q);
        if (!cancelled) {
          if (!snap.empty) {
            setViewedProfile(snap.docs[0].data());
          } else {
            setViewedProfile(null);
          }
        }
      } catch (e) {
        console.warn('Error cargando perfil de usuario:', e);
        if (!cancelled) setViewedProfile(null);
      }
    };
    fetchViewedProfile();
    return () => {
      cancelled = true;
    };
  }, [isOwnProfile, screenUsername]);

  //tweets en tiempo real
  useEffect(() => {
    let unsubscribe;
    try {
      unsubscribe = subscribeToTweetsByUser({
        username: screenUsername,
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
  }, [screenUsername, currentUserId]);

  // Validar autenticación antes de interactuar
  const ensureAuthenticated = useCallback(() => {
    if (!currentUserId) {
      Alert.alert('Autenticación requerida', 'Inicia sesión para interactuar con los tweets.');
      return false;
    }
    return true;
  }, [currentUserId]);

  // Like
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

  // Retweet
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

  // Render de cada tweet
  const renderTweet = ({ item }) => (
    <View style={styles.tweetRow}>
      {/*Avatar*/}
      <View style={styles.avatar}>
        <Text style={styles.avatarInitial}>
          {(item.fullname?.[0] || item.username?.[0] || 'U').toUpperCase()}
        </Text>
      </View>

      {/*Contenido del tweet*/}
      <View style={styles.tweetBody}>
        <View style={styles.tweetHeader}>
          <Text style={styles.tweetName}>{item.fullname || item.username}</Text>
          <Text style={styles.tweetMeta}>@{item.username}</Text>
          <Text style={styles.moreIcon}>⋯</Text>
        </View>

        {!!(item.text || item.content) && (
          <Text style={styles.tweetContent}>{item.text || item.content}</Text>
        )}

        {/*Mostrar imágenes adjuntas*/}
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

        {/*Acciones*/}
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
            {/*Header superior*/}
            <View style={styles.topBar}>
              <Tap onPress={() => navigation.goBack()}>
                <Text style={styles.backArrow}>‹</Text>
              </Tap>
              <View>
                <Text style={styles.topBarName}>{displayName}</Text>
                <Text style={styles.topBarCount}>{tweets.length} posts</Text>
              </View>
            </View>

            {/*Banner*/}
            <View style={styles.banner} />

            {/*Perfil*/}
            <View style={styles.profileCard}>
              <View style={styles.profileAvatar}>
                <Text style={styles.profileAvatarInitial}>
                  {(displayName?.[0] || screenUsername?.[0] || 'U').toUpperCase()}
                </Text>
              </View>

              {isOwnProfile && (
                <Tap
                  style={styles.editButton}
                  onPress={() => navigation.navigate('EditProfile')}
                  accessibilityRole="button"
                >
                  <Text style={styles.editButtonText}>Edit profile</Text>
                </Tap>
              )}

              <Text style={styles.profileName}>{displayName}</Text>
              <Text style={styles.profileUsername}>@{screenUsername}</Text>

              {bioText ? (
                <Text style={styles.profileBio}>{bioText}</Text>
              ) : (
                <Text style={styles.profileMeta}>No bio yet</Text>
              )}

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
    <Tap
      style={[styles.actionStat, styles.actionStatPressable]}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
    >
      {content}
    </Tap>
  );
}