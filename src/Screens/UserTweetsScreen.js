import React, { useEffect, useState, useCallback, useMemo } from 'react';
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
import { subscribeToTweetsByUser, getLikedTweets } from '../Services/tweetService';
import { toggleLike, toggleRetweet } from '../Services/engagementService';
import { profileStore } from '../Services/profileStore';
import { collection, query, where, limit, getDocs } from 'firebase/firestore';
import Tap from '../Components/Tap';
import FollowButton from '../Components/FollowButton';

// Follow service (suscripciones y follow/unfollow)
import {
  subscribeFollowers,
  subscribeFollowing,
  followUser,
  unfollowUser,
} from '../Services/followService';

const profileTabs = ['Posts', 'Media', 'Likes'];

export default function UserTweetsScreen({ route, navigation }) {
  const [tweets, setTweets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(auth.currentUser?.uid ?? null);
  const [activeTab, setActiveTab] = useState('Posts');
  const [likedTweets, setLikedTweets] = useState([]);
  const [loadingLikes, setLoadingLikes] = useState(false);

  // Perfil propio (store)
  const [profile, setProfile] = useState(profileStore.getProfile());

  // Perfil que se está viendo (si es otro usuario)
  const [viewedProfile, setViewedProfile] = useState(null);

  // Follows del usuario mostrado (en tiempo real)
  const [followersUids, setFollowersUids] = useState([]);
  const [followingUids, setFollowingUids] = useState([]);

  // A quién sigo YO (para botón Seguir/Siguiendo en perfil ajeno)
  const [myFollowingSet, setMyFollowingSet] = useState(new Set());

  // Busy del botón seguir (evitar taps dobles)
  const [followBusy, setFollowBusy] = useState(false);

  const followerCount = followersUids.length;
  const followingCount = followingUids.length;

  // Params de navegación
  const usernameParam = route.params?.username || null;
  const fullnameParam = route.params?.fullname || null;
  const uidParam = route.params?.uid || null;

  // Username que se está mostrando en la pantalla
  const screenUsername =
    usernameParam ||
    profile?.username ||
    auth.currentUser?.displayName ||
    'user';

  // ¿Es mi propio perfil?
  const isOwnProfile = !usernameParam || profile?.username === usernameParam;

  // UID del perfil mostrado (si es propio, el mío; si es ajeno, del usuario visto)
  const viewedUid = isOwnProfile ? currentUserId : (viewedProfile?.uid || uidParam || null);

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

  // Si es perfil ajeno, traer su perfil (fullname/bio/foto y uid) por username cuando no viene uid
  useEffect(() => {
    let cancelled = false;
    const fetchViewedProfile = async () => {
      if (isOwnProfile || !screenUsername || uidParam) {
        // Si es propio o ya tenemos uid por params, no necesitamos pedir más
        if (uidParam && !isOwnProfile) {
          // Si vino uid por params pero no tenemos datos, al menos inicializa con username/fullnameParam
          setViewedProfile((prev) => prev || { uid: uidParam, username: screenUsername, fullname: fullnameParam || screenUsername });
        } else if (isOwnProfile) {
          setViewedProfile(null);
        }
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
            const docSnap = snap.docs[0];
            setViewedProfile({ uid: docSnap.id, ...docSnap.data() });
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
  }, [isOwnProfile, screenUsername, uidParam, fullnameParam]);

  // Tweets en tiempo real del usuario mostrado
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

  // Cargar Likes on-demand cuando se activa la pestaña Likes
  useEffect(() => {
    let cancelled = false;
    const fetchLikes = async () => {
      if (activeTab !== 'Likes') return;
      setLoadingLikes(true);
      try {
        const data = await getLikedTweets(screenUsername);
        if (!cancelled) setLikedTweets(data);
      } catch (e) {
        console.warn('Error cargando likes:', e);
        if (!cancelled) setLikedTweets([]);
      } finally {
        if (!cancelled) setLoadingLikes(false);
      }
    };
    fetchLikes();
    return () => {
      cancelled = true;
    };
  }, [activeTab, screenUsername]);

  // Suscripciones a seguidores/seguidos del usuario mostrado (para contadores)
  useEffect(() => {
    if (!viewedUid) return;
    const unsub1 = subscribeFollowers(db, viewedUid, (uids) => setFollowersUids(uids));
    const unsub2 = subscribeFollowing(db, viewedUid, (uids) => setFollowingUids(uids));
    return () => {
      unsub1 && unsub1();
      unsub2 && unsub2();
    };
  }, [viewedUid]);

  // Mi set de seguidos (para saber si muestro "Seguir" o "Siguiendo" en perfil ajeno)
  useEffect(() => {
    if (!currentUserId) return;
    const unsub = subscribeFollowing(db, currentUserId, (uids) => setMyFollowingSet(new Set(uids)));
    return () => unsub && unsub();
  }, [currentUserId]);

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

  const formatTweetTime = useCallback((tweet) => {
    try {
      const ts = tweet?.createdAt;
      let date = null;
      if (ts?.toDate) {
        date = ts.toDate();
      } else if (typeof ts === 'number') {
        date = new Date(ts);
      } else if (ts && typeof ts === 'object' && typeof ts._seconds === 'number') {
        date = new Date(ts._seconds * 1000);
      } else if (tweet?.metadata?.clientTimestamp) {
        date = new Date(tweet.metadata.clientTimestamp);
      }
      if (!date) return '';
      const day = date.getDate().toString().padStart(2, '0');
      const monthNames = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
      const month = monthNames[date.getMonth()];
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return `${day} ${month} ${hours}:${minutes}`;
    } catch {
      return '';
    }
  }, []);

  // Seguir/Dejar de seguir al usuario mostrado (en perfil ajeno)
  const isFollowingViewed = useMemo(() => {
    if (!viewedUid) return false;
    return myFollowingSet.has(viewedUid);
  }, [myFollowingSet, viewedUid]);

  const handleToggleFollowViewed = async () => {
    if (isOwnProfile) return;

    if (!viewedUid) {
      console.warn('No hay UID del perfil visto.');
      return;
    }

    if (!currentUserId) {
      Alert.alert('Autenticación requerida', 'Inicia sesión para seguir a usuarios.');
      return;
    }

    try {
      setFollowBusy(true);
      if (isFollowingViewed) {
        await unfollowUser(db, currentUserId, viewedUid);
      } else {
        await followUser(db, currentUserId, viewedUid);
      }
    } catch (e) {
      console.warn('Error al cambiar follow del perfil visto:', e);
    } finally {
      setFollowBusy(false);
    }
  };

  // Navegación a Followers / Following del perfil mostrado
  const goToFollowers = () => {
    if (!screenUsername) return;
    navigation.push('Followers', {
      username: screenUsername,
      fullname: displayName,
      uid: viewedUid || undefined,
      initialTab: 'followers', 
    });
  };

  const goToFollowing = () => {
    if (!screenUsername) return;

    navigation.push('Following', {
      username: screenUsername,
      fullname: displayName,
      uid: viewedUid || undefined,
    });
  };

  // Render de cada tweet
  const renderTweet = ({ item }) => (
    <View style={styles.tweetRow}>
      {/*Avatar*/}
      <View style={styles.avatar}>
        {item.photoURL ? (
          <Image source={{ uri: item.photoURL }} style={styles.avatarImage} />
        ) : (
          <Text style={styles.avatarInitial}>
            {(item.fullname?.[0] || item.username?.[0] || 'U').toUpperCase()}
          </Text>
        )}
      </View>

      {/*Contenido del tweet*/}
      <View style={styles.tweetBody}>
        <View style={styles.tweetHeader}>
          <Text style={styles.tweetName}>{item.fullname || item.username}</Text>
          <Text style={styles.tweetMeta}>@{item.username}</Text>
          {(() => {
            const t = formatTweetTime(item);
            return t ? <Text style={styles.tweetMeta}>· {t}</Text> : null;
          })()}
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

  const profileAvatarSource = isOwnProfile
    ? (profile?.photoURL ? { uri: profile.photoURL } : null)
    : (viewedProfile?.photoURL ? { uri: viewedProfile.photoURL } : null);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      <FlatList
        data={activeTab === 'Posts' ? tweets : activeTab === 'Media' ? (
          (tweets || []).filter((t) => {
            const media = t.media || t.mediaUrls || t.mediaUrl;
            return Array.isArray(media) ? media.length > 0 : Boolean(media);
          })
        ) : likedTweets}
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
                {profileAvatarSource ? (
                  <Image source={profileAvatarSource} style={styles.profileAvatarImg} />
                ) : (
                  <Text style={styles.profileAvatarInitial}>
                    {(displayName?.[0] || screenUsername?.[0] || 'U').toUpperCase()}
                  </Text>
                )}
              </View>

              {isOwnProfile ? (
                <Tap
                  style={styles.editButton}
                  onPress={() => navigation.navigate('EditProfile')}
                  accessibilityRole="button"
                >
                  <Text style={styles.editButtonText}>Edit profile</Text>
                </Tap>
              ) : (
                <FollowButton
                  following={isFollowingViewed}
                  onPress={handleToggleFollowViewed}
                  size="md"
                  style={styles.editButton}
                  loading={followBusy}
                  disabled={followBusy}
                />
              )}

              <Text style={styles.profileName}>{displayName}</Text>
              <Text style={styles.profileUsername}>@{screenUsername}</Text>

              {bioText ? (
                <Text style={styles.profileBio}>{bioText}</Text>
              ) : (
                <Text style={styles.profileMeta}>No bio yet</Text>
              )}

              {/* Datos extra(estáticos de ejemplo)*/}
              <View style={styles.profileMetaRow}>
                <Text style={styles.profileMeta}>📍 Medellín, Colombia</Text>
                <Text style={styles.dot}>·</Text>
                <Text style={styles.profileMeta}>Joined May 2024</Text>
              </View>

              {/*Stats con navegación*/}
              <View style={styles.profileStats}>
                <Tap style={styles.profileStat} onPress={goToFollowing}>
                  <Text style={styles.profileStatNumber}>{followingCount}</Text>
                  <Text> Following</Text>
                </Tap>
                <Tap style={styles.profileStat} onPress={goToFollowers}>
                  <Text style={styles.profileStatNumber}>{followerCount}</Text>
                  <Text> Followers</Text>
                </Tap>
              </View>
            </View>

            {/* Tabs */}
            <View style={styles.tabRow}>
              {profileTabs.map((tab) => (
                <Tap
                  key={tab}
                  style={[styles.tabItem, activeTab === tab && styles.tabItemActive]}
                  onPress={() => setActiveTab(tab)}
                  accessibilityRole="button"
                >
                  <Text
                    style={[
                      styles.tabLabel,
                      activeTab === tab && styles.tabLabelActive,
                    ]}
                  >
                    {tab}
                  </Text>
                  {activeTab === tab && <View style={styles.tabIndicator} />}
                </Tap>
              ))}
            </View>
            {activeTab === 'Likes' && loadingLikes && (
              <ActivityIndicator size="small" color={colors.primary} style={{ marginVertical: 8, marginLeft: 16 }} />
            )}
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