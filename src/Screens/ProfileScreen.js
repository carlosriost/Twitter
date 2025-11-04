import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { colors, spacing, radii, typography } from '../Styles/theme';
import { auth, db } from '../Config/firebaseConfig';
import {
  doc,
  onSnapshot,
  collection,
  query,
  where,
  orderBy,
  getDoc,
} from 'firebase/firestore';
import { profileStore } from '../Services/profileStore';
import { useNavigation } from '@react-navigation/native';

const profileTabs = ['Posts', 'Replies', 'Media', 'Likes'];

export default function ProfileScreen() {
  const user = auth.currentUser;
  const [userData, setUserData] = useState(profileStore.getProfile());
  const [tweets, setTweets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tabLoading, setTabLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('Posts');
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();

  // 🔹 Escuchar perfil y tweets en tiempo real
  useEffect(() => {
    if (!user?.uid || !userData?.username) return;

    let unsubscribeUser = null;
    let unsubscribeTweets = null;
    setLoading(true);

    try {
      // 👤 Escucha perfil del usuario
      const userRef = doc(db, 'users', user.uid);
      unsubscribeUser = onSnapshot(
        userRef,
        (snapshot) => {
          if (!snapshot.exists()) {
            setUserData(null);
            setTweets([]);
            profileStore.clearProfile();
            setError('Perfil no encontrado.');
            setLoading(false);
            return;
          }

          const data = snapshot.data();
          setUserData(data);
          profileStore.setProfile({ uid: user.uid, ...data });
          setError(null);
          setLoading(false);
        },
        (err) => {
          console.error('❌ Error en perfil:', err);
          setError('No se pudo cargar el perfil.');
          setLoading(false);
        }
      );

      // 🐦 Escucha los tweets del usuario
      const tweetsRef = collection(db, 'tweets');
      const tweetsQuery = query(
        tweetsRef,
        where('username', '==', userData?.username),
        orderBy('createdAt', 'desc')
      );

      unsubscribeTweets = onSnapshot(
        tweetsQuery,
        (snapshot) => {
          const loaded = snapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...docSnap.data(),
          }));
          setTweets(loaded);
        },
        (err) => {
          console.error('❌ Error al escuchar tweets:', err);
          setTweets([]);
        }
      );
    } catch (err) {
      console.error('Error inicial:', err);
      setError('Error al cargar el perfil.');
    }

    // 🔁 Refrescar datos reales al volver desde EditProfile
    const unsubscribeFocus = navigation.addListener('focus', async () => {
      setRefreshing(true);
      try {
        const updatedDoc = await getDoc(doc(db, 'users', user.uid));
        if (updatedDoc.exists()) {
          const updatedData = updatedDoc.data();
          setUserData(updatedData);
          profileStore.setProfile({ uid: user.uid, ...updatedData });
        }
      } catch (err) {
        console.warn('⚠️ Error refrescando perfil:', err);
      } finally {
        setTimeout(() => setRefreshing(false), 600);
      }
    });

    return () => {
      if (unsubscribeUser) unsubscribeUser();
      if (unsubscribeTweets) unsubscribeTweets();
      unsubscribeFocus();
    };
  }, [navigation, user?.uid, userData?.username]);

  // 🔁 Tabs simuladas
  const handleSelectTab = (tab) => {
    setActiveTab(tab);
    if (tab !== 'Posts') {
      setTabLoading(true);
      setTweets([]);
      setTimeout(() => setTabLoading(false), 500);
    }
  };

  // 🐦 Render de cada tweet
  const renderTweet = ({ item }) => (
    <TouchableOpacity
      style={styles.tweetRow}
      onPress={() => navigation.navigate('TweetDetail', { tweetId: item.id, tweet: item })}
    >
      <View style={styles.avatarSmall}>
        {userData?.photoURL ? (
          <Image source={{ uri: userData.photoURL }} style={styles.avatarImg} />
        ) : (
          <Text style={styles.avatarInitial}>
            {(userData?.fullname?.[0] || '?').toUpperCase()}
          </Text>
        )}
      </View>
      <View style={styles.tweetBody}>
        <Text style={styles.tweetHeader}>
          <Text style={styles.tweetName}>{userData?.fullname}</Text>{' '}
          <Text style={styles.tweetMeta}>@{userData?.username}</Text>
        </Text>
        <Text style={styles.tweetContent}>{item.content || item.text}</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  if (error || !userData) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={{ color: colors.textLight }}>{error || 'No se pudo cargar el perfil.'}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* Header */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.topBarName}>{userData.fullname}</Text>
          <Text style={styles.topBarCount}>{tweets.length} posts</Text>
        </View>
      </View>

      {refreshing && (
        <View style={styles.refreshBanner}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={styles.refreshText}>Actualizando perfil…</Text>
        </View>
      )}

      {/* Banner */}
      <View style={styles.banner} />

      {/* Perfil */}
      <View style={styles.profileCard}>
        <View style={styles.profileAvatarWrapper}>
          <Image
            source={
              userData.photoURL
                ? { uri: userData.photoURL }
                : require('../assets/default-avatar.png')
            }
            style={styles.profileAvatar}
          />
        </View>

        <TouchableOpacity
          style={styles.editButton}
          onPress={() => navigation.navigate('EditProfile')}
        >
          <Text style={styles.editButtonText}>Edit profile</Text>
        </TouchableOpacity>

        <Text style={styles.profileName}>{userData.fullname}</Text>
        <Text style={styles.profileUsername}>@{userData.username}</Text>

        {userData.bio ? (
          <Text style={styles.profileBio}>{userData.bio}</Text>
        ) : (
          <Text style={styles.profileBioMuted}>No bio yet</Text>
        )}
      </View>

      {/* Tabs */}
      <View style={styles.tabRow}>
        {profileTabs.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <TouchableOpacity
              key={tab}
              style={styles.tabItem}
              onPress={() => handleSelectTab(tab)}
            >
              <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>{tab}</Text>
              {isActive && <View style={styles.tabIndicator} />}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Tweets */}
      {tabLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={tweets}
          keyExtractor={(item) => item.id}
          renderItem={renderTweet}
          contentContainerStyle={{ paddingBottom: spacing.xl }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No hay publicaciones aún</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  backArrow: { fontSize: 28, color: colors.text },
  topBarName: { fontSize: typography.subtitle, fontWeight: '700', color: colors.text },
  topBarCount: { color: colors.textLight, fontSize: typography.caption },
  banner: { height: 150, backgroundColor: colors.primary + '33' }, // 🌈 visual mejorado
  profileCard: {
    paddingHorizontal: spacing.md,
    marginTop: -36,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  profileAvatarWrapper: {
    borderRadius: radii.pill,
    alignSelf: 'flex-start',
    borderWidth: 3,
    borderColor: colors.background,
  },
  profileAvatar: { width: 84, height: 84, borderRadius: radii.pill },
  refreshBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  refreshText: { color: colors.textLight, fontSize: typography.caption },
  editButton: {
    alignSelf: 'flex-end',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
  },
  editButtonText: { color: colors.text, fontWeight: '600' },
  profileName: { fontSize: typography.title + 2, fontWeight: '800', color: colors.text },
  profileUsername: { color: colors.textLight, fontSize: typography.body },
  profileBio: { color: colors.text, fontSize: typography.body, lineHeight: 22 },
  profileBioMuted: { color: colors.textLight, fontStyle: 'italic' },
  tabRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: spacing.xs,
  },
  tabItem: { alignItems: 'center' },
  tabLabel: { color: colors.textLight, fontSize: typography.subtitle },
  tabLabelActive: { color: colors.text, fontWeight: '700' },
  tabIndicator: { height: 3, backgroundColor: colors.primary, marginTop: 4, width: '100%' },
  tweetRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  avatarSmall: {
    width: 48,
    height: 48,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  avatarImg: { width: 48, height: 48, borderRadius: radii.pill },
  avatarInitial: { color: colors.text, fontWeight: '700' },
  tweetBody: { flex: 1 },
  tweetHeader: { marginBottom: spacing.xs },
  tweetName: { fontWeight: '700', color: colors.text },
  tweetMeta: { color: colors.textLight, fontSize: typography.caption },
  tweetContent: { color: colors.text, fontSize: typography.body, lineHeight: 22 },
  emptyState: { paddingVertical: spacing.lg, alignItems: 'center' },
  emptyText: { color: colors.textLight, fontSize: typography.caption },
});
