import React, { useMemo, useState, useEffect, useCallback, useRef } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  TextInput,
  StatusBar,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { FAB, Portal } from 'react-native-paper';
import Tap from '../Components/Tap';
import styles from '../Styles/HomeScreen.styles';
import { colors } from '../Styles/theme';
import { auth, db } from '../Config/firebaseConfig';
import { logoutUser } from '../Services/authService';
import { subscribeToTweets } from '../Services/tweetService';
import { toggleLike, toggleRetweet } from '../Services/engagementService';
import { profileStore } from '../Services/profileStore';
import { subscribeFollowing } from '../Services/followService';
import FollowButton from '../Components/FollowButton';
import { getUserByUsername, followUser } from '../Services/followService';

/*Íconos inferiores*/
const bottomNavItems = [
  { id: 'home', label: 'Home', icon: '🏠', route: 'Home' },
  { id: 'search', label: 'Search', icon: '🔍', route: 'Home' },
  { id: 'post', label: 'Post', icon: '✍️', route: 'Tweet' },
];

/*Íconos del compositor*/
const composerIcons = ['🖼️', '🎞️', '📊', '😊'];

export default function HomeScreen({ navigation, route }) {
  const [profile, setProfile] = useState(profileStore.getProfile());
  const [activeTab, setActiveTab] = useState('forYou');
  const [tweets, setTweets] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(auth.currentUser?.uid ?? null);
  const [loading, setLoading] = useState(true);
  const [myFollowingSet, setMyFollowingSet] = useState(new Set());
  const listRef = useRef(null);

  // Search UI state (search users like in Followers)
  const [searchMode, setSearchMode] = useState(false);
  const [searchUsername, setSearchUsername] = useState('');
  const [searchBusy, setSearchBusy] = useState(false);
  const [searchResult, setSearchResult] = useState(null);
  const [followBusy, setFollowBusy] = useState(false);

  //Derivar usuario/nombre visibles
  const userUsername =
    profile?.username ||
    route.params?.username ||
    auth.currentUser?.displayName ||
    'user';

  const displayName =
    profile?.fullname ||
    route.params?.fullname ||
    userUsername;

  /*Mantener sesión y perfil global actualizados*/
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

  /* Tweets en tiempo real */
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

  /* Mi lista de seguidos (para filtrar pestaña Following) */
  useEffect(() => {
    if (!currentUserId) {
      setMyFollowingSet(new Set());
      return;
    }
    const unsub = subscribeFollowing(db, currentUserId, (uids) => setMyFollowingSet(new Set(uids)));
    return () => unsub && unsub();
  }, [currentUserId]);

  const visibleTweets = useMemo(() => {
    // If searching and a user is selected, show only that user's tweets
    if (searchMode && searchResult) {
      const targetUid = searchResult.uid;
      const targetUsername = searchResult.username;
      return tweets.filter((t) => (t?.uid && t.uid === targetUid) || (t?.username && t.username === targetUsername));
    }
    // Otherwise, apply Following filter when on that tab
    if (activeTab === 'following') {
      if (!myFollowingSet || myFollowingSet.size === 0) return [];
      return tweets.filter((t) => t?.uid && myFollowingSet.has(t.uid));
    }
    // Default: all tweets
    return tweets;
  }, [tweets, activeTab, myFollowingSet, searchMode, searchResult]);

  /*Validar autenticación antes de acciones*/
  const ensureAuthenticated = useCallback(() => {
    if (!currentUserId) {
      Alert.alert('Autenticación requerida', 'Inicia sesión para interactuar con los tweets.');
      return false;
    }
    return true;
  }, [currentUserId]);

  /* Like */
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

  /* Retweet */
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

  /* Accesos rápidos: pasar username/fullname/uid */
  const quickActions = useMemo(
    () => [
      { id: 'tweet', label: 'Compose', onPress: () => navigation.navigate('Tweet') },

      // Abrir Seguidores del usuario actual
      {
        id: 'followers',
        label: 'Followers',
        onPress: () =>
          navigation.navigate('Followers', {
            username: userUsername,
            fullname: displayName,
            uid: currentUserId || undefined,
          }),
      },

      // Abrir Seguidos del usuario actual
      {
        id: 'following',
        label: 'Following',
        onPress: () =>
          navigation.navigate('Following', {
            username: userUsername,
            fullname: displayName,
            uid: currentUserId || undefined,
          }),
      },

      // Abrir perfil del usuario actual
      {
        id: 'userTweets',
        label: 'Profile',
        onPress: () =>
          navigation.navigate('UserTweets', {
            username: userUsername,
            fullname: displayName,
            uid: currentUserId || undefined,
          }),
      },
    ],
    [navigation, userUsername, displayName, currentUserId]
  );

  // Abrir perfil del autor del tweet
  const openUserProfile = useCallback((tweet) => {
    if (!tweet) return;
    const username = tweet.username || 'user';
    const fullname = tweet.fullname || username;
    // intenta varias claves comunes por si tu servicio ya incluye el uid del autor
    const uid =
      tweet.authorUid ||
      tweet.userUid ||
      tweet.userId ||
      tweet.uid ||
      undefined;

    navigation.push('UserTweets', { username, fullname, uid });
  }, [navigation]);

  const listPaddingBottom = 56 + 24;

  const handleLogout = useCallback(async () => {
    try {
      await logoutUser();
      navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
    } catch (e) {
      console.warn('Error al cerrar sesión', e?.message || e);
      Alert.alert('Cerrar sesión', 'No se pudo cerrar sesión. Intenta de nuevo.');
    }
  }, [navigation]);

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

  /* Render de cada tweet */
  const renderTweet = ({ item }) => (
    <View style={styles.tweetRow}>
      {/* Avatar que navega al perfil */}
      <Tap style={styles.avatar} onPress={() => openUserProfile(item)}>
        {item.photoURL ? (
          <Image source={{ uri: item.photoURL }} style={styles.avatarImage} />
        ) : (
          <Text style={styles.avatarInitial}>
            {(item.fullname?.[0] || item.username?.[0] || 'U').toUpperCase()}
          </Text>
        )}
      </Tap>

      <View style={styles.tweetBody}>
        {/* Cabecera (nombre/@) que navega al perfil */}
        <Tap style={styles.tweetHeader} onPress={() => openUserProfile(item)}>
          <View style={styles.headerText}>
            <Text style={styles.tweetName}>{item.fullname || item.username || 'User'}</Text>
            <Text style={styles.tweetMeta}>
              @{item.username || 'user'}
              {(() => {
                const t = formatTweetTime(item);
                return t ? ` · ${t}` : '';
              })()}
            </Text>
          </View>
        </Tap>

        {!!(item.text || item.content) && (
          <Text style={styles.tweetContent}>{item.text || item.content}</Text>
        )}

        {/* Soporte de imágenes */}
        {Array.isArray(item.media) && item.media.length > 0 && (
          <View
            style={[
              styles.mediaGrid,
              item.media.length === 1 && styles.mediaGridSingle,
            ]}
          >
               {item.media.map((mediaItem, index) => {
                 const rawUrl = mediaItem?.url || mediaItem?.downloadURL || mediaItem?.uri;
                 const key = `${rawUrl || 'blank'}-${index}`;
                 const styleRef = item.media.length === 1 ? styles.mediaImageSingle : styles.mediaImageMultiple;
                 if (!rawUrl) {
                   return (
                     <View key={key} style={[styleRef, { backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' }]}>
                       <Text style={{ color: '#9CA3AF', fontSize: 12 }}>Sin URL</Text>
                     </View>
                   );
                 }
                 return (
                   <Image
                     key={key}
                     source={{ uri: rawUrl }}
                     style={styleRef}
                     resizeMode="cover"
                     onError={(e) => console.warn('Imagen feed error', rawUrl, e.nativeEvent)}
                     onLoadStart={() => console.log('Imagen feed cargando', rawUrl)}
                     onLoadEnd={() => console.log('Imagen feed OK', rawUrl)}
                   />
                 );
               })}
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

  const handleBottomPress = useCallback((id) => {
    if (id === 'home') {
      if (listRef.current) {
        try { listRef.current.scrollToOffset({ offset: 0, animated: true }); } catch {}
      }
      return;
    }
    if (id === 'search') {
      setSearchMode((v) => {
        const next = !v;
        if (next && listRef.current) {
          try { listRef.current.scrollToOffset({ offset: 0, animated: true }); } catch {}
        }
       
        if (!next) {
          setSearchUsername('');
          setSearchResult(null);
        }
        return next;
      });
      return;
    }
    if (id === 'post') {
      navigation.navigate('Tweet');
      return;
    }
  }, [navigation]);

  const handleSearchUser = useCallback(async () => {
    const raw = (searchUsername || '').trim();
    const normalized = raw.replace(/^@/, '').toLowerCase();
    if (!normalized) {
      Alert.alert('Ingresa un usuario', 'Escribe el nombre de usuario, por ejemplo: @juan');
      return;
    }
    try {
      setSearchBusy(true);
      const user = await getUserByUsername(db, normalized);
      if (!user) {
        setSearchResult(null);
        Alert.alert('Usuario no encontrado', `No existe @${normalized}.`);
        return;
      }
      if (user.uid === currentUserId) {
        Alert.alert('Acción inválida', 'No puedes seguirte a ti mismo.');
      } else if (myFollowingSet.has(user.uid)) {
        Alert.alert('Ya lo sigues', `Ya sigues a @${normalized}.`);
      }
      setSearchResult(user);
    } catch (e) {
      console.warn('Error buscando usuario', e);
      Alert.alert('Error', 'No se pudo buscar el usuario.');
    } finally {
      setSearchBusy(false);
    }
  }, [searchUsername, currentUserId, myFollowingSet]);

  const handleConfirmFollowFromSearch = useCallback(async () => {
    if (!currentUserId || !searchResult?.uid) return;
    if (searchResult.uid === currentUserId) return;
    if (myFollowingSet.has(searchResult.uid)) return;
    try {
      setFollowBusy(true);
      await followUser(db, currentUserId, searchResult.uid);
      Alert.alert('¡Listo!', `Ahora sigues a @${searchResult.username}.`);
      setSearchUsername('');
      setSearchResult(null);
    } catch (e) {
      console.warn('Error al seguir desde búsqueda', e);
      Alert.alert('Error', 'No se pudo completar la acción.');
    } finally {
      setFollowBusy(false);
    }
  }, [currentUserId, searchResult, myFollowingSet]);

  /*Pantalla*/
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={visibleTweets}
          keyExtractor={(item) => item.id}
          renderItem={renderTweet}
          showsVerticalScrollIndicator={false}
          ref={listRef}
          contentContainerStyle={[styles.listContent, { paddingBottom: listPaddingBottom }]}
          ListHeaderComponent={
            <>
              {/* Barra superior */}
              <View style={styles.topBar}>
                <Text style={styles.brandMark}>∃ꊼ∃ꊼ</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <Text style={{ color: colors.textLight, fontWeight: '600' }}>
                    {currentUserId ? (displayName || userUsername) : 'Invitado'}
                  </Text>
                  {currentUserId && (
                    <Tap onPress={handleLogout} accessibilityRole="button">
                      <Text style={{ color: colors.danger, fontWeight: '700' }}>Cerrar sesión</Text>
                    </Tap>
                  )}
                </View>
              </View>

              
              {searchMode && (
                <View style={styles.searchForm}>
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Buscar usuario @username"
                    placeholderTextColor={colors.textLight}
                    value={searchUsername}
                    onChangeText={setSearchUsername}
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="search"
                    onSubmitEditing={!searchBusy ? handleSearchUser : undefined}
                  />
                  <Tap
                    onPress={!searchBusy ? handleSearchUser : undefined}
                    style={[styles.searchSubmit, (searchBusy || !searchUsername.trim()) && styles.searchSubmitDisabled]}
                  >
                    <Text style={styles.searchSubmitText}>{searchBusy ? '...' : 'Buscar'}</Text>
                  </Tap>
                </View>
              )}

              {!!searchMode && !!searchResult && (
                <View style={styles.searchPreviewCard}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <View style={styles.previewAvatar}>
                      {searchResult.photoURL ? (
                        <Image source={{ uri: searchResult.photoURL }} style={styles.previewAvatarImg} />
                      ) : (
                        <Text style={styles.avatarInitial}>
                          {(searchResult.fullname?.[0] || searchResult.username?.[0] || 'U').toUpperCase()}
                        </Text>
                      )}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.previewName} numberOfLines={1}>
                        {searchResult.fullname || searchResult.username}
                      </Text>
                      <Text style={styles.previewUsername} numberOfLines={1}>@{searchResult.username}</Text>
                    </View>
                    <FollowButton
                      following={myFollowingSet.has(searchResult.uid)}
                      onPress={handleConfirmFollowFromSearch}
                      disabled={searchResult.uid === currentUserId || myFollowingSet.has(searchResult.uid)}
                      loading={followBusy}
                      size="sm"
                    />
                  </View>
                </View>
              )}

              {/* Tabs */}
              <View style={styles.tabs}>
                {['forYou', 'following'].map((tab) => (
                  <Tap
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
                  </Tap>
                ))}
              </View>

              {/* Composer */}
              <View style={styles.composer}>
                <View style={styles.avatarSmall}>
                  {profile?.photoURL ? (
                    <Image source={{ uri: profile.photoURL }} style={styles.avatarImage} />
                  ) : (
                    <Text style={styles.avatarInitial}>
                      {(displayName?.[0] || userUsername?.[0] || 'U').toUpperCase()}
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
                    <Tap style={styles.tweetButton} onPress={() => navigation.navigate('Tweet')}>
                      <Text style={styles.tweetButtonText}>Post</Text>
                    </Tap>
                  </View>
                </View>
              </View>

              {/* Quick Actions */}
              <View style={styles.quickActions}>
                {quickActions.map((action) => (
                  <Tap key={action.id} style={styles.actionChip} onPress={action.onPress}>
                    <Text style={styles.actionChipText}>{action.label}</Text>
                  </Tap>
                ))}
              </View>

              <View style={styles.divider} />
            </>
          }
        />
      )}

      {/*Bottom Navigation*/}
      <View style={[styles.bottomBar, { marginBottom: 16 }]}>
        {bottomNavItems.map((item) => (
          <Tap key={item.id} style={styles.bottomItem} onPress={() => handleBottomPress(item.id)}>
            <Text style={styles.bottomItemIcon}>{item.icon}</Text>
            <Text style={styles.bottomItemLabel}>{item.label}</Text>
          </Tap>
        ))}
      </View>

    
      <Portal>
        <FAB
          icon={(props) => (
            <Text style={{ color: props.color, fontSize: props.size, lineHeight: props.size, fontWeight: '700' }}>
              +
            </Text>
          )}
          onPress={() => navigation.navigate('Tweet')}
          style={{
            position: 'absolute',
            right: 16,
            bottom: 88,
            backgroundColor: colors.primary,
          }}
          color={colors.onPrimary}
          accessibilityLabel="Compose"
        />
      </Portal>
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
    <Tap style={[styles.actionStat, styles.actionStatPressable]} onPress={onPress} disabled={disabled}>
      {content}
    </Tap>
  );
}