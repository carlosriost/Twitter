import React, { useMemo, useState, useEffect, useCallback } from 'react';
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
import { auth } from '../Config/firebaseConfig';
import { subscribeToTweets, toggleLike, toggleRetweet } from '../Services/tweetService';
import { profileStore } from '../Services/profileStore';

/*Íconos inferiores*/
const bottomNavItems = [
  { id: 'home', label: 'Home', icon: '🏠', route: 'Home' },
  { id: 'search', label: 'Search', icon: '🔍', route: 'Home' },
  { id: 'post', label: 'Post', icon: '✍️', route: 'Tweet' },
  { id: 'messages', label: 'Inbox', icon: '✉️', route: 'Home' },
];

/* Íconos del compositor */
const composerIcons = ['🖼️', '🎞️', '📊', '😊'];

export default function HomeScreen({ navigation, route }) {
  const [profile, setProfile] = useState(profileStore.getProfile());
  const username = profile?.username || route.params?.username || 'user';
  const [activeTab, setActiveTab] = useState('forYou');
  const [tweets, setTweets] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(auth.currentUser?.uid ?? null);
  const [loading, setLoading] = useState(true);

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

  /*tweets en tiempo real*/
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

  /*Validar autenticación antes de acciones*/
  const ensureAuthenticated = useCallback(() => {
    if (!currentUserId) {
      Alert.alert('Autenticación requerida', 'Inicia sesión para interactuar con los tweets.');
      return false;
    }
    return true;
  }, [currentUserId]);

  /*Like */
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

  /*Retweet */
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

  /*Accesos rápidos*/
  const quickActions = useMemo(
    () => [
      { id: 'tweet', label: 'Compose', onPress: () => navigation.navigate('Tweet') },
      { id: 'followers', label: 'Followers', onPress: () => navigation.navigate('Followers') },
      { id: 'following', label: 'Following', onPress: () => navigation.navigate('Following') },
      { id: 'userTweets', label: 'Profile', onPress: () => navigation.navigate('UserTweets') },
    ],
    [navigation]
  );

  const listPaddingBottom = 56 + 24;

  /*Render de cada tweet */
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
        </View>

        {!!(item.text || item.content) && (
          <Text style={styles.tweetContent}>{item.text || item.content}</Text>
        )}

        {/*Soporte de imágenes */}
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

        {/*Acciones */}
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

  /*Pantalla */
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
          contentContainerStyle={[styles.listContent, { paddingBottom: listPaddingBottom }]}
          ListHeaderComponent={
            <>
              {/*Barra superior */}
              <View style={styles.topBar}>
                <Tap style={styles.profileButton} onPress={() => navigation.navigate('Profile')}>
                  {profile?.photoURL ? (
                    <Image source={{ uri: profile.photoURL }} style={styles.avatarImage} />
                  ) : (
                    <Text style={styles.profileInitial}>
                      {username[0]?.toUpperCase()}
                    </Text>
                  )}
                </Tap>
                <Text style={styles.brandMark}>∃ꊼ∃ꊼ</Text>
                <Text style={styles.sparkle}>✨</Text>
              </View>

              {/*Tabs */}
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

              {/*Composer*/}
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
                    <Tap style={styles.tweetButton} onPress={() => navigation.navigate('Tweet')}>
                      <Text style={styles.tweetButtonText}>Post</Text>
                    </Tap>
                  </View>
                </View>
              </View>

              {/*Quick Actions*/}
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
          <Tap key={item.id} style={styles.bottomItem} onPress={() => navigation.navigate(item.route)}>
            <Text style={styles.bottomItemIcon}>{item.icon}</Text>
            <Text style={styles.bottomItemLabel}>{item.label}</Text>
          </Tap>
        ))}
      </View>

      {/*FAB compose*/}
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

/*ActionStat Component*/
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