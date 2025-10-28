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
import { auth, db } from '../config/firebase';
import { doc, getDoc, collection, query, where, orderBy, getDocs } from 'firebase/firestore';

export default function ProfileScreen({ navigation }) {
  const user = auth.currentUser;
  const [userData, setUserData] = useState(null);
  const [tweets, setTweets] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔹 Cargar datos del usuario desde Firestore
  useEffect(() => {
  const loadProfileAndTweets = async () => {
    try {
      setLoading(true);

      // 🔹 1️⃣ Cargar datos del usuario
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const data = userSnap.data();
        setUserData(data);

        // 🔹 2️⃣ Cargar tweets de ese usuario (solo si hay username)
        if (data.username) {
          const tweetsRef = collection(db, 'tweets');
          const q = query(
            tweetsRef,
            where('username', '==', data.username),
            orderBy('createdAt', 'desc')
          );
          const querySnap = await getDocs(q);
          const userTweets = querySnap.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setTweets(userTweets);
        } else {
          setTweets([]);
        }
      } else {
        console.warn("No se encontró el perfil del usuario en Firestore.");
        setUserData(null);
      }
    } catch (error) {
      console.error("❌ Error al cargar perfil o tweets:", error);
    } finally {
      setLoading(false);
    }
  };

  // 👇 Escucha cuando la pantalla vuelve a estar activa (después de editar perfil)
  const unsubscribe = navigation.addListener("focus", loadProfileAndTweets);

  // 🔁 También se ejecuta al montar el componente
  loadProfileAndTweets();

  return unsubscribe;
}, [navigation]);


  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  if (!userData) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={{ color: colors.textLight }}>No se pudo cargar el perfil</Text>
      </SafeAreaView>
    );
  }

  const renderTweet = ({ item }) => (
    <View style={styles.tweetRow}>
      <View style={styles.avatarSmall}>
        <Text style={styles.avatarInitial}>{userData.fullname[0]}</Text>
      </View>
      <View style={styles.tweetBody}>
        <Text style={styles.tweetHeader}>
          <Text style={styles.tweetName}>{userData.fullname}</Text>{' '}
          <Text style={styles.tweetMeta}>@{userData.username}</Text>
        </Text>
        <Text style={styles.tweetContent}>{item.content}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* Header */}

      

      <View style={styles.topBar}>
        <Text style={styles.backArrow}>‹</Text>
        <View>
          <Text style={styles.topBarName}>{userData.fullname}</Text>
          <Text style={styles.topBarCount}>{tweets.length} posts</Text>
        </View>
      </View>

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

      {/* Tweets */}
      <FlatList
        data={tweets}
        keyExtractor={(item) => item.id}
        renderItem={renderTweet}
        contentContainerStyle={{ paddingBottom: spacing.xl }}
        showsVerticalScrollIndicator={false}
      />
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
  banner: { height: 150, backgroundColor: colors.surface },
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
  avatarInitial: { color: colors.text, fontWeight: '700' },
  tweetBody: { flex: 1 },
  tweetHeader: { marginBottom: spacing.xs },
  tweetName: { fontWeight: '700', color: colors.text },
  tweetMeta: { color: colors.textLight, fontSize: typography.caption },
  tweetContent: { color: colors.text, fontSize: typography.body, lineHeight: 22 },
});
