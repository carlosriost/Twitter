import { db } from '../Config/firebaseConfig';
import {
  addDoc,
  collection,
  serverTimestamp,
  query,
  orderBy,
  getDocs,
  where,
  doc,
  updateDoc,
  getDoc,
  onSnapshot,
  runTransaction,
  increment,
  limit,
  startAfter,
} from 'firebase/firestore';

/*Colección principal de tweets*/
const tweetsCollection = collection(db, 'tweets');

/*Obtener perfil del usuario*/
export const getUserProfile = async (uid) => {
  if (!uid) {
    console.warn('⚠️ getUserProfile llamado sin UID válido');
    return {};
  }

  try {
    const ref = doc(db, 'users', uid);
    const snap = await getDoc(ref);
    return snap.exists() ? snap.data() : {};
  } catch (error) {
    console.error('❌ Error al obtener perfil:', error);
    return {};
  }
};

/*Crear tweet )*/
export const postTweet = async (uid, username, fullname, text, media = []) => {
  if (!uid || !text?.trim()) {
    throw new Error('❌ Faltan datos obligatorios: uid o texto.');
  }

  try {
    const profile = await getUserProfile(uid);

    const newTweet = {
      uid,
      username: username || profile.username || 'user',
      fullname: fullname || profile.fullname || 'Usuario',
      photoURL: profile.photoURL || null,
      text: text.trim(),
      content: text.trim(),
      media: Array.isArray(media) ? media : [],
      metadata: {
        clientTimestamp: Date.now(),
        platform: 'mobile',
      },
      createdAt: serverTimestamp(),
      likesCount: 0,
      retweetsCount: 0,
      repliesCount: 0,
      sharesCount: 0,
    };

    await addDoc(tweetsCollection, newTweet);
    console.log('Tweet publicado correctamente');
  } catch (error) {
    console.error('Error al publicar el tweet:', error);
    throw error;
  }
};

/*Crear respuesta*/
export const createReply = async (tweetId, { uid, username, fullname, text }) => {
  if (!tweetId || !uid || !text?.trim()) return;
  const profile = await getUserProfile(uid);
  const tweetRef = doc(db, 'tweets', tweetId);

  await addDoc(collection(tweetRef, 'replies'), {
    uid,
    username: username || profile.username || 'user',
    fullname: fullname || profile.fullname || 'Usuario',
    photoURL: profile.photoURL || null,
    text: text.trim(),
    createdAt: serverTimestamp(),
  });

  await updateDoc(tweetRef, { repliesCount: increment(1) });
};

/*Mapeo de tweet (con estado del usuario actual)*/
const mapTweetSnapshot = async (docSnap, currentUserId) => {
  const data = docSnap.data() || {};
  const tweet = {
    id: docSnap.id,
    ...data,
    likesCount: data?.likesCount ?? 0,
    retweetsCount: data?.retweetsCount ?? 0,
    repliesCount: data?.repliesCount ?? 0,
    sharesCount: data?.sharesCount ?? 0,
    liked: false,
    retweeted: false,
  };

  if (!currentUserId) return tweet;

  try {
    const [likeSnap, retweetSnap] = await Promise.all([
      getDoc(doc(db, 'tweets', docSnap.id, 'likes', currentUserId)),
      getDoc(doc(db, 'tweets', docSnap.id, 'retweets', currentUserId)),
    ]);

    return {
      ...tweet,
      liked: likeSnap.exists(),
      retweeted: retweetSnap.exists(),
    };
  } catch (err) {
    console.warn('Error al mapear acciones de tweet:', err);
    return tweet;
  }
};

/*Obtener tweets */
export const getTweets = async (currentUserId) => {
  const q = query(tweetsCollection, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return Promise.all(snapshot.docs.map((doc) => mapTweetSnapshot(doc, currentUserId)));
};

/*Tweets por usuario */
export const getTweetsByUser = async (username, currentUserId) => {
  if (!username) return [];
  const q = query(
    tweetsCollection,
    where('username', '==', username),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return Promise.all(snapshot.docs.map((doc) => mapTweetSnapshot(doc, currentUserId)));
};

/*Paginación de tweets */
export const getTweetsPaginated = async ({
  pageSize = 20,
  cursor,
  username,
  currentUserId,
}) => {
  const constraints = [orderBy('createdAt', 'desc'), limit(pageSize)];
  if (username) constraints.unshift(where('username', '==', username));
  if (cursor) constraints.push(startAfter(cursor));

  const q = query(tweetsCollection, ...constraints);
  const snapshot = await getDocs(q);

  const tweets = await Promise.all(
    snapshot.docs.map((docSnap) => mapTweetSnapshot(docSnap, currentUserId))
  );

  const nextCursor =
    snapshot.docs.length === pageSize ? snapshot.docs[snapshot.docs.length - 1] : null;

  return { tweets, nextCursor };
};

/*Subscripciones en tiempo real */
const subscribeToQuery = ({ q, currentUserId, onUpdate }) =>
  onSnapshot(q, async (snapshot) => {
    try {
      const tweets = await Promise.all(
        snapshot.docs.map((docSnap) => mapTweetSnapshot(docSnap, currentUserId))
      );
      onUpdate(tweets);
    } catch (error) {
      console.error('Error procesando tweets en tiempo real:', error);
    }
  });

export const subscribeToTweets = ({ currentUserId, onUpdate }) => {
  const q = query(tweetsCollection, orderBy('createdAt', 'desc'));
  return subscribeToQuery({ q, currentUserId, onUpdate });
};

export const subscribeToTweetsByUser = ({ username, currentUserId, onUpdate }) => {
  const q = query(
    tweetsCollection,
    where('username', '==', username),
    orderBy('createdAt', 'desc')
  );
  return subscribeToQuery({ q, currentUserId, onUpdate });
};

/*Like y Retweet */
const toggleAction = async (tweetId, uid, subcollection, counterField) => {
  if (!tweetId || !uid) return;

  const tweetRef = doc(db, 'tweets', tweetId);
  const actionRef = doc(collection(tweetRef, subcollection), uid);

  await runTransaction(db, async (t) => {
    // 🔹 Lee primero todo lo necesario
    const [tweetSnap, actionSnap] = await Promise.all([
      t.get(tweetRef),
      t.get(actionRef),
    ]);

    if (!tweetSnap.exists()) throw new Error('Tweet no encontrado');

    const count = tweetSnap.data()?.[counterField] || 0;
    let newCount = count;

    // Aplica los cambios
    if (actionSnap.exists()) {
      t.delete(actionRef);
      newCount = Math.max(count - 1, 0);
    } else {
      t.set(actionRef, { uid, createdAt: serverTimestamp() });
      newCount = count + 1;
    }

    // Actualiza el contador
    t.update(tweetRef, { [counterField]: newCount });
  });
};

export const toggleLike = (tweetId, uid) => toggleAction(tweetId, uid, 'likes', 'likesCount');
export const toggleRetweet = (tweetId, uid) => toggleAction(tweetId, uid, 'retweets', 'retweetsCount');

/*Compartir tweet */
export const shareTweet = async (tweetId, uid) => {
  if (!tweetId || !uid) return;
  const tweetRef = doc(db, 'tweets', tweetId);
  await addDoc(collection(tweetRef, 'shares'), { uid, createdAt: serverTimestamp() });
  await updateDoc(tweetRef, { sharesCount: increment(1) });
};

/*Estado de like / retweet */
export const getTweetActionState = async (tweetId, uid) => {
  if (!tweetId || !uid) return { liked: false, retweeted: false };
  const tweetRef = doc(db, 'tweets', tweetId);
  const [likeSnap, retweetSnap] = await Promise.all([
    getDoc(doc(collection(tweetRef, 'likes'), uid)),
    getDoc(doc(collection(tweetRef, 'retweets'), uid)),
  ]);
  return { liked: likeSnap.exists(), retweeted: retweetSnap.exists() };
};

/*Escuchar tweet y respuestas */
export const listenToTweet = (tweetId, callback) => {
  const tweetRef = doc(db, 'tweets', tweetId);
  return onSnapshot(tweetRef, (snap) =>
    callback(snap.exists() ? { id: snap.id, ...snap.data() } : null)
  );
};

export const listenToReplies = (tweetId, callback) => {
  const repliesRef = collection(doc(db, 'tweets', tweetId), 'replies');
  const q = query(repliesRef, orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const replies = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    }));
    callback(replies);
  });
};

/*Seguidores / Seguidos (corrigido) */
export const getFollowers = async (username) => {
  try {
    const q = query(collection(db, 'follows'), where('following', '==', username));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => doc.data().follower).filter(Boolean);
  } catch (error) {
    console.error('Error al obtener seguidores:', error);
    return [];
  }
};

export const getFollowing = async (username) => {
  try {
    const q = query(collection(db, 'follows'), where('follower', '==', username));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => doc.data().following).filter(Boolean);
  } catch (error) {
    console.error('Error al obtener seguidos:', error);
    return [];
  }
};

/*Tweets con media / likes / replies */
export const getRepliesByUser = async (username) => {
  try {
    const tweets = await getTweetsByUser(username);
    return tweets.filter((t) => t.replyTo || t.isReply);
  } catch (e) {
    console.error('Error al obtener replies del usuario:', e);
    return [];
  }
};

export const getMediaTweets = async (username) => {
  try {
    const tweets = await getTweetsByUser(username);
    return tweets.filter((t) => {
      const media = t.media || t.mediaUrls || t.mediaUrl;
      return Array.isArray(media) ? media.length > 0 : Boolean(media);
    });
  } catch (e) {
    console.error('Error al obtener tweets con media:', e);
    return [];
  }
};

export const getLikedTweets = async (username) => {
  try {
    const likesRef = collection(db, 'likes');
    const q = query(likesRef, where('username', '==', username), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);

    if (snapshot.empty) return [];

    const tweetIds = snapshot.docs.map((likeDoc) => likeDoc.data()?.tweetId).filter(Boolean);

    const results = await Promise.all(
      tweetIds.map(async (tweetId) => {
        const tweetDoc = await getDoc(doc(db, 'tweets', tweetId));
        return tweetDoc.exists() ? { id: tweetDoc.id, ...tweetDoc.data() } : null;
      })
    );

    return results.filter(Boolean);
  } catch (error) {
    console.error('Error al obtener tweets con like:', error);
    return [];
  }
};
