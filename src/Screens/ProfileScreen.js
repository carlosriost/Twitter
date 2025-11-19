import React, { useEffect, useState, useMemo } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  Image,
  FlatList,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { colors } from '../Styles/theme';
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
import styles from '../Styles/ProfileScreen.styles';
import { profileStore } from '../Services/profileStore';
import { useNavigation } from '@react-navigation/native';
import Tap from '../Components/Tap';

// Suscripciones a seguidores/seguidos
import {
  subscribeFollowers,
  subscribeFollowing,
} from '../Services/followService';

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
  // Se eliminó funcionalidad de zoom / onPress en imágenes

  // Follows del usuario (recuento en tiempo real)
  const [followersUids, setFollowersUids] = useState([]);
  const [followingUids, setFollowingUids] = useState([]);

  const followerCount = followersUids.length;
  const followingCount = followingUids.length;

  //perfil y tweets en tiempo real
  useEffect(() => {
    if (!user?.uid || !userData?.username) return;

    let unsubscribeUser = null;
    let unsubscribeTweets = null;
    setLoading(true);

    try {
      //perfil del usuario
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
          console.error('Error en perfil:', err);
          setError('No se pudo cargar el perfil.');
          setLoading(false);
        }
      );

      //los tweets del usuario
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

    //Refrescar datos reales al volver desde EditProfile
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

  // Suscripción a seguidores/seguidos (para contadores)
  useEffect(() => {
    if (!user?.uid) return;
    const unsub1 = subscribeFollowers(db, user.uid, (uids) => setFollowersUids(uids));
    const unsub2 = subscribeFollowing(db, user.uid, (uids) => setFollowingUids(uids));
    return () => {
      unsub1 && unsub1();
      unsub2 && unsub2();
    };
  }, [user?.uid]);

  //Tabs simuladas
  const handleSelectTab = (tab) => {
    setActiveTab(tab);
    if (tab !== 'Posts') {
      setTabLoading(true);
      setTweets([]);
      setTimeout(() => setTabLoading(false), 500);
    }
  };

  // Navegaciones a Followers/Following con params completos
  const goToFollowers = () => {
    if (!userData) return;
    navigation.navigate('Followers', {
      username: userData.username,
      fullname: userData.fullname,
      uid: user?.uid,
      initialTab: 'followers', // si usas pantalla unificada, útil; si mantienes dos pantallas, no pasa nada
    });
  };

  const goToFollowing = () => {
    if (!userData) return;
    navigation.navigate('Following', {
      username: userData.username,
      fullname: userData.fullname,
      uid: user?.uid,
      // si usas pantalla unificada podrías navegar a 'Followers' con initialTab: 'following'
    });
  };

  //Render de cada tweet con media (sin interacción)
  const renderTweet = ({ item }) => {
    const mediaArr = Array.isArray(item.media) ? item.media : [];
    return (
      <View style={styles.tweetRow}>
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
          <View style={styles.tweetHeader}>
            <Text style={styles.tweetName}>{userData?.fullname}</Text>
            <Text style={styles.tweetMeta}> @{userData?.username}</Text>
          </View>
          {!!(item.content || item.text) && (
            <Text style={styles.tweetContent}>{item.content || item.text}</Text>
          )}
          {mediaArr.length > 0 && (
            <View
              style={[
                styles.mediaGrid,
                mediaArr.length === 1 && styles.mediaGridSingle,
              ]}
            >
              {mediaArr.map((m, idx) => {
                const rawUrl = m?.url || m?.downloadURL || m?.uri;
                const key = `${rawUrl || 'blank'}-${idx}`;
                const styleRef = mediaArr.length === 1 ? styles.mediaImageSingle : styles.mediaImageMultiple;
                if (!rawUrl) {
                  return (
                    <View key={key} style={[styleRef, { alignItems: 'center', justifyContent: 'center' }]}> 
                      <Text style={{ color: colors.textLight, fontSize: 12 }}>Sin URL</Text>
                    </View>
                  );
                }
                const safeUrl = typeof rawUrl === 'string' ? rawUrl.trim() : rawUrl;
                return (
                  <Image
                    key={key}
                    source={{ uri: safeUrl }}
                    style={styleRef}
                    resizeMode="cover"
                    onLoadStart={() => console.log('[Media] loadStart', safeUrl)}
                    onLoad={() => console.log('[Media] load OK', safeUrl)}
                    onError={(e) => console.warn('Perfil media error', safeUrl, e.nativeEvent)}
                  />
                );
              })}
            </View>
          )}
        </View>
      </View>
    );
  };

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

      {/*Header*/}
      <View style={styles.topBar}>
        <Tap onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>‹</Text>
        </Tap>
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

      {/*Banner*/}
      <View style={styles.banner} />

      {/*Perfil*/}
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

        <Tap
          style={styles.editButton}
          onPress={() => navigation.navigate('EditProfile')}
        >
          <Text style={styles.editButtonText}>Edit profile</Text>
        </Tap>

        <Text style={styles.profileName}>{userData.fullname}</Text>
        <Text style={styles.profileUsername}>@{userData.username}</Text>

        {userData.bio ? (
          <Text style={styles.profileBio}>{userData.bio}</Text>
        ) : (
          <Text style={styles.profileBioMuted}>No bio yet</Text>
        )}

        {/*Siguiendo / Seguidores */}
        <View style={styles.profileStatsRow}>
          <Tap style={styles.profileStatTap} onPress={goToFollowing}>
            <Text style={styles.profileStatNumber}>{followingCount}</Text>
            <Text style={styles.profileStatLabel}> Siguiendo</Text>
          </Tap>
          <Tap style={styles.profileStatTap} onPress={goToFollowers}>
            <Text style={styles.profileStatNumber}>{followerCount}</Text>
            <Text style={styles.profileStatLabel}> Seguidores</Text>
          </Tap>
        </View>
      </View>

      {/*Tabs*/}
      <View style={styles.tabRow}>
        {profileTabs.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <Tap
              key={tab}
              style={styles.tabItem}
              onPress={() => handleSelectTab(tab)}
            >
              <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>{tab}</Text>
              {isActive && <View style={styles.tabIndicator} />}
            </Tap>
          );
        })}
      </View>

      {/*Tweets*/}
      {tabLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={tweets}
          keyExtractor={(item) => item.id}
          renderItem={renderTweet}
          contentContainerStyle={styles.listContent}
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



