// src/Screens/FollowersScreen.js
import React, { useEffect, useMemo, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  StatusBar,
  ActivityIndicator,
  Image,
  TextInput,
  Alert,
} from 'react-native';
import { colors } from '../Styles/theme';
import styles from '../Styles/FollowersScreen.styles';
import Tap from '../Components/Tap';
import FollowButton from '../Components/FollowButton';

import { auth, db } from '../Config/firebaseConfig'; 

import {
  followUser,
  unfollowUser,
  subscribeFollowers,
  subscribeFollowing,
  fetchUsersByUids,
  getUserByUsername,
  getUserByUid,
} from '../Services/followService';

export default function FollowersScreen({ route, navigation }) {
  // Parámetros de navegación
  const { username: paramUsername, uid: paramUid, fullname: paramFullname, initialTab } = route.params || {};

  // Usuario autenticado
  const currentUid = auth.currentUser?.uid || null;

  // Estado de la pestaña
  const [tab, setTab] = useState(initialTab === 'following' ? 'following' : 'followers');

  // Perfil del usuario visto
  const [viewedUser, setViewedUser] = useState(null); // { uid, username, fullname, bio, photoURL }
  const [loadingUser, setLoadingUser] = useState(true);

  // Listas de UIDs
  const [followersUids, setFollowersUids] = useState([]); // quiénes siguen a viewedUser
  const [followingUids, setFollowingUids] = useState([]); // a quién sigue viewedUser

  // Perfiles resueltos
  const [followersProfiles, setFollowersProfiles] = useState([]);
  const [followingProfiles, setFollowingProfiles] = useState([]);

  // Nuestros sets para pintar botones/badges
  const [myFollowingSet, setMyFollowingSet] = useState(new Set()); // a quién sigo yo
  const [myFollowersSet, setMyFollowersSet] = useState(new Set()); // quién me sigue a mí

  // Formulario seguir por @usuario
  const [usernameToFollow, setUsernameToFollow] = useState('');
  const [submittingFollow, setSubmittingFollow] = useState(false); // searching
  const [previewUser, setPreviewUser] = useState(null); // resultado de búsqueda
  const [confirmingFollow, setConfirmingFollow] = useState(false); // confirmando follow

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

  // Suscribirse a seguidores/seguidos del usuario visto
  useEffect(() => {
    if (!viewedUser?.uid) return;
    const unsubs = [];
    unsubs.push(subscribeFollowers(db, viewedUser.uid, (uids) => setFollowersUids(uids)));
    unsubs.push(subscribeFollowing(db, viewedUser.uid, (uids) => setFollowingUids(uids)));
    return () => unsubs.forEach((u) => u && u());
  }, [viewedUser?.uid]);

  // Resolver perfiles de seguidores
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const profiles = await fetchUsersByUids(db, followersUids);
        if (!cancelled) setFollowersProfiles(profiles);
      } catch (e) {
        console.warn('Error obteniendo perfiles de seguidores', e);
      }
    })();
    return () => { cancelled = true; };
  }, [followersUids.join('|')]);

  // Resolver perfiles de seguidos
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

  
  useEffect(() => {
    if (!currentUid) return;
    const unsub1 = subscribeFollowing(db, currentUid, (uids) => setMyFollowingSet(new Set(uids)));
    const unsub2 = subscribeFollowers(db, currentUid, (uids) => setMyFollowersSet(new Set(uids)));
    return () => { unsub1 && unsub1(); unsub2 && unsub2(); };
  }, [currentUid]);

  const followerCount = followersUids.length;
  const followingCount = followingUids.length;
  const listData = tab === 'followers' ? followersProfiles : followingProfiles;

  const displayName = (u) => u?.fullname || u?.displayName || u?.username || 'Usuario';

  const initials = useMemo(() => {
    const name = displayName(viewedUser);
    return name
      .split(' ')
      .map((p) => p?.[0])
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }, [viewedUser]);

  const handleToggleFollow = async (targetUser) => {
    if (!currentUid || !targetUser?.uid) return;
    if (targetUser.uid === currentUid) return; // no se sigue a uno mismo 
    const isFollowing = myFollowingSet.has(targetUser.uid);
    try {
      if (isFollowing) {
        await unfollowUser(db, currentUid, targetUser.uid);
      } else {
        await followUser(db, currentUid, targetUser.uid);
      }
    } catch (e) {
      console.warn('Error al cambiar follow', e);
    }
  };

  const handleFollowByUsername = async () => {
    if (!currentUid) return;
    const raw = (usernameToFollow || '').trim();
    const normalized = raw.replace(/^@/, '').toLowerCase();
    if (!normalized) {
      Alert.alert('Ingresa un usuario', 'Escribe el nombre de usuario, por ejemplo: @juan');
      return;
    }
    try {
      setSubmittingFollow(true);
      const target = await getUserByUsername(db, normalized);
      if (!target) {
        Alert.alert('Usuario no encontrado', `No existe @${normalized}.`);
        setPreviewUser(null);
        return;
      }
      // Notificaciones de validación, pero mostramos preview igualmente
      if (target.uid === currentUid) {
        Alert.alert('Acción inválida', 'No puedes seguirte a ti mismo.');
      } else if (myFollowingSet.has(target.uid)) {
        Alert.alert('Ya lo sigues', `Ya sigues a @${normalized}.`);
      }
      setPreviewUser(target);
    } catch (e) {
      console.warn('Error al seguir por username', e);
      Alert.alert('Error', 'No se pudo completar la acción. Intenta de nuevo.');
    } finally {
      setSubmittingFollow(false);
    }
  };

  const handleConfirmFollowPreview = async () => {
    if (!currentUid || !previewUser?.uid) return;
    if (previewUser.uid === currentUid) return;
    if (myFollowingSet.has(previewUser.uid)) return;
    try {
      setConfirmingFollow(true);
      await followUser(db, currentUid, previewUser.uid);
      Alert.alert('¡Listo!', `Ahora sigues a @${previewUser.username}.`);
      setUsernameToFollow('');
      setPreviewUser(null);
    } catch (e) {
      console.warn('Error confirmando follow', e);
      Alert.alert('Error', 'No se pudo completar la acción. Intenta de nuevo.');
    } finally {
      setConfirmingFollow(false);
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

  const renderFollower = ({ item }) => {
    if (!item) return null;
    const isMe = item.uid === currentUid;
    const iFollow = myFollowingSet.has(item.uid);
    const followsMe = myFollowersSet.has(item.uid);

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
            {followsMe && (
              <View style={styles.badgeRow}>
                <View style={styles.badgePill}>
                  <Text style={styles.badgeText}>Te sigue</Text>
                </View>
              </View>
            )}
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

      {/* Header superior */}
      <View style={styles.header}>
        <Tap onPress={goBack}>
          <Text style={styles.backArrow}>‹</Text>
        </Tap>
        <View>
          <Text style={styles.headerTitle}>
            {tab === 'followers' ? 'Followers' : 'Following'}
          </Text>
          <Text style={styles.headerSubtitle}>
            @{viewedUser?.username || paramUsername || 'user'}
          </Text>
        </View>
      </View>

      {/* Formulario: buscar @usuario para seguir */}
      <View style={styles.followForm}>
        <TextInput
          style={styles.followInput}
          placeholder="Seguir por @usuario"
          placeholderTextColor="#9CA3AF"
          value={usernameToFollow}
          onChangeText={setUsernameToFollow}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="done"
          onSubmitEditing={!submittingFollow ? handleFollowByUsername : undefined}
        />
        <Tap
          onPress={!submittingFollow ? handleFollowByUsername : undefined}
          style={[styles.followSubmit, (submittingFollow || !usernameToFollow.trim()) && styles.followSubmitDisabled]}
        >
          <Text style={styles.followSubmitText}>{submittingFollow ? '...' : 'Buscar'}</Text>
        </Tap>
      </View>

      {/* Vista previa de usuario buscado */}
      {!!previewUser && (
        <View style={styles.card}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {previewUser.photoURL ? (
              <Image source={{ uri: previewUser.photoURL }} style={styles.cardAvatar} />
            ) : (
              <View style={[styles.cardAvatar, styles.avatarFallback]}>
                <Text style={styles.avatarInitials}>
                  {(previewUser.fullname || previewUser.displayName || previewUser.username || 'U')
                    .slice(0, 2)
                    .toUpperCase()}
                </Text>
              </View>
            )}
            <View style={{ flex: 1 }}>
              <Text style={styles.cardName} numberOfLines={1}>
                {displayName(previewUser)}
              </Text>
              {!!previewUser.username && (
                <Text style={styles.cardUsername} numberOfLines={1}>@{previewUser.username}</Text>
              )}
            </View>
            <FollowButton
              following={myFollowingSet.has(previewUser.uid)}
              onPress={handleConfirmFollowPreview}
              disabled={previewUser.uid === currentUid || myFollowingSet.has(previewUser.uid)}
              loading={confirmingFollow}
              size="sm"
            />
          </View>
        </View>
      )}

      {/* Tarjeta de perfil*/}
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
          <Tap onPress={() => setTab('following')} style={styles.statItem}>
            <Text style={styles.statNumber}>{followingCount}</Text>
            <Text style={styles.statLabel}>Siguiendo</Text>
          </Tap>
          <Tap onPress={() => setTab('followers')} style={styles.statItem}>
            <Text style={styles.statNumber}>{followerCount}</Text>
            <Text style={styles.statLabel}>Seguidores</Text>
          </Tap>
        </View>
      </View>

      {/*Segmento superior*/}
      <View style={styles.segment}>
        <Tap
          style={[styles.segmentItem, tab === 'followers' && styles.segmentActive]}
          onPress={() => setTab('followers')}
        >
          <Text style={[styles.segmentLabel, tab === 'followers' && styles.segmentLabelActive]}>
            Followers
          </Text>
        </Tap>

        <Tap
          style={[styles.segmentItem, tab === 'following' && styles.segmentActive]}
          onPress={() => setTab('following')}
        >
          <Text style={[styles.segmentLabel, tab === 'following' && styles.segmentLabelActive]}>
            Following
          </Text>
        </Tap>
      </View>

      {/* Lista */}
      <FlatList
        data={listData}
        keyExtractor={(item) => item.uid}
        renderItem={renderFollower}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}