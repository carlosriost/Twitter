// src/Screens/FollowingScreen.js
import React, { useEffect, useMemo, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  StatusBar,
  ActivityIndicator,
  StyleSheet,
  Image,
} from 'react-native';
import { colors } from '../Styles/theme';
import styles from '../Styles/FollowingScreen.styles';
import Tap from '../Components/Tap';
import FollowButton from '../Components/FollowButton';

import { auth, db } from '../Config/firebaseConfig'; // Alineado con el resto del proyecto
import {
  followUser,
  unfollowUser,
  subscribeFollowers,
  subscribeFollowing,
  fetchUsersByUids,
  getUserByUsername,
  getUserByUid,
} from '../Services/followService';

export default function FollowingScreen({ route, navigation }) {
  // Params de navegación (normalmente llega username, opcional uid y fullname)
  const { username: paramUsername, uid: paramUid, fullname: paramFullname } = route.params || {};

  // Usuario logueado (para botón Seguir y badges)
  const currentUid = auth.currentUser?.uid || null;

  // Usuario que estamos viendo (perfil del header)
  const [viewedUser, setViewedUser] = useState(null); // { uid, username, fullname, bio, photoURL }
  const [loadingUser, setLoadingUser] = useState(true);

  // UIDs de seguidos (a quién sigue el usuario visto) y seguidores (para contadores)
  const [followingUids, setFollowingUids] = useState([]);
  const [followersUids, setFollowersUids] = useState([]);

  // Perfiles resueltos de la lista
  const [followingProfiles, setFollowingProfiles] = useState([]);

  // Mis sets para pintar botón y badge “Te sigue”/“Os seguís”
  const [myFollowingSet, setMyFollowingSet] = useState(new Set()); // a quién sigo YO
  const [myFollowersSet, setMyFollowersSet] = useState(new Set()); // quién me sigue a mí

  // Cargar perfil del usuario visto por uid o username
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadingUser(true);
      try {
        let user = null;
        if (paramUid) user = await getUserByUid(db, paramUid);
        else if (paramUsername) user = await getUserByUsername(db, paramUsername);
        if (!cancelled) setViewedUser(user);
      } catch (e) {
        console.warn('Error cargando usuario visto', e);
      } finally {
        if (!cancelled) setLoadingUser(false);
      }
    })();
    return () => { cancelled = true; };
  }, [paramUid, paramUsername]);

  // Suscripciones del usuario visto: following (lista principal) y followers (para contadores)
  useEffect(() => {
    if (!viewedUser?.uid) return;
    const unsubs = [];
    unsubs.push(subscribeFollowing(db, viewedUser.uid, (uids) => setFollowingUids(uids)));
    unsubs.push(subscribeFollowers(db, viewedUser.uid, (uids) => setFollowersUids(uids)));
    return () => unsubs.forEach((u) => u && u());
  }, [viewedUser?.uid]);

  // Resolver perfiles de los seguidos
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const profiles = await fetchUsersByUids(db, followingUids);
        if (!cancelled) setFollowingProfiles(profiles);
      } catch (e) {
        console.warn('Error obteniendo perfiles de seguidos', e);
      }
    })();
    return () => { cancelled = true; };
  }, [followingUids.join('|')]);

  // Nuestros sets (para estado de botón y badges)
  useEffect(() => {
    if (!currentUid) return;
    const unsub1 = subscribeFollowing(db, currentUid, (uids) => setMyFollowingSet(new Set(uids)));
    const unsub2 = subscribeFollowers(db, currentUid, (uids) => setMyFollowersSet(new Set(uids)));
    return () => { unsub1 && unsub1(); unsub2 && unsub2(); };
  }, [currentUid]);

  const followerCount = followersUids.length;
  const followingCount = followingUids.length;

  const displayName = (u) => u?.fullname || u?.displayName || u?.username || 'Usuario';

  const initials = useMemo(() => {
    const name = displayName(viewedUser) || paramFullname || paramUsername || '';
    return name
      .split(' ')
      .map((p) => p?.[0])
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }, [viewedUser, paramFullname, paramUsername]);

  const handleToggleFollow = async (targetUser) => {
    if (!currentUid || !targetUser?.uid) return;
    if (targetUser.uid === currentUid) return; // no te sigues a ti mismo
    const iFollow = myFollowingSet.has(targetUser.uid);
    try {
      if (iFollow) {
        await unfollowUser(db, currentUid, targetUser.uid);
      } else {
        await followUser(db, currentUid, targetUser.uid);
      }
    } catch (e) {
      console.warn('Error al cambiar follow', e);
    }
  };

  const goBack = () => navigation.goBack();

  const navigateToUser = (user) => {
    if (!user?.username) return;
    navigation.push('UserTweets', {
      username: user.username,
      fullname: user.fullname || user.displayName || '',
      uid: user.uid,
    });
  };

  const renderFollowing = ({ item }) => {
    if (!item) return null;
    const isMe = item.uid === currentUid;
    const iFollow = myFollowingSet.has(item.uid);
    const followsMe = myFollowersSet.has(item.uid);

   
    let auxText = '';
    if (iFollow && followsMe) auxText = 'Os seguís';
    else if (followsMe) auxText = 'Te sigue';
    else if (iFollow) auxText = 'Sigues';

    return (
      <View style={styles.row}>
        <Tap onPress={() => navigateToUser(item)} style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
          {/* Avatar (foto o inicial) */}
          {item.photoURL ? (
            <Image source={{ uri: item.photoURL }} style={styles.avatar} />
          ) : (
            <View style={styles.avatar}>
              <Text style={styles.avatarInitial}>{displayName(item)[0]?.toUpperCase() || 'U'}</Text>
            </View>
          )}

          {/* Info */}
          <View style={styles.info}>
            <Text style={styles.name} numberOfLines={1}>{displayName(item)}</Text>
            {!!item.username && <Text style={styles.username} numberOfLines={1}>@{item.username}</Text>}
            {!!auxText && <Text style={styles.bio} numberOfLines={1}>{auxText}</Text>}
          </View>
        </Tap>

        {/* Botón Seguir/Siguiendo*/}
        {!isMe && (
          <FollowButton
            following={iFollow}
            onPress={() => handleToggleFollow(item)}
            size="sm"
          />
        )}
      </View>
    );
  };

  if (loadingUser) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/*Header*/}
      <View style={styles.header}>
        <Tap onPress={goBack}>
          <Text style={styles.backArrow}>‹</Text>
        </Tap>
        <View>
          <Text style={styles.headerTitle}>Following</Text>
          <Text style={styles.headerSubtitle}>
            @{viewedUser?.username || paramUsername || 'user'}
          </Text>
        </View>
      </View>

   {/*Tarjeta de perfil*/}
    <View style={styles.card}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {viewedUser?.photoURL ? (
          <Image source={{ uri: viewedUser.photoURL }} style={styles.cardAvatar} />
    ) : (
      <View style={[styles.cardAvatar, styles.avatarFallback]}>
        <Text style={styles.avatarInitials}>{initials || '?'}</Text>
      </View>
    )}
    <View style={{ flex: 1 }}>
      <Text style={styles.cardName} numberOfLines={1}>
        {displayName(viewedUser) || paramFullname || 'Usuario'}
      </Text>
      {!!viewedUser?.username && (
        <Text style={styles.cardUsername} numberOfLines={1}>@{viewedUser.username}</Text>
      )}
    </View>
  </View>

  {!!viewedUser?.bio && <Text style={styles.bio}>{viewedUser.bio}</Text>}

  <View style={styles.stats}>
    <Tap style={styles.statItem} onPress={() => navigation.navigate('Following', {
      username: viewedUser?.username || paramUsername,
      uid: viewedUser?.uid,
      fullname: displayName(viewedUser),
    })}>
      <Text style={styles.statNumber}>{followingCount}</Text>
      <Text style={styles.statLabel}>Siguiendo</Text>
    </Tap>
    <Tap style={styles.statItem} onPress={() => navigation.navigate('Followers', {
      username: viewedUser?.username || paramUsername,
      uid: viewedUser?.uid,
      fullname: displayName(viewedUser),
    })}>
      <Text style={styles.statNumber}>{followerCount}</Text>
      <Text style={styles.statLabel}>Seguidores</Text>
    </Tap>
    </View>
  </View>

      {/* Segmento superior */}
      <View style={styles.segment}>
        <Tap
          style={styles.segmentItem}
          onPress={() =>
            navigation.navigate('Followers', {
              username: viewedUser?.username || paramUsername,
              uid: viewedUser?.uid,
              fullname: displayName(viewedUser),
            })
          }
        >
          <Text style={styles.segmentLabel}>Followers</Text>
        </Tap>

        <Tap style={[styles.segmentItem, styles.segmentActive]}>
          <Text style={[styles.segmentLabel, styles.segmentLabelActive]}>Following</Text>
        </Tap>
      </View>

      {/* Lista de seguidos */}
      <FlatList
        data={followingProfiles}
        keyExtractor={(item) => item.uid}
        renderItem={renderFollowing}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

