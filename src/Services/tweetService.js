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

/* ────────────────────────────────
 * 📌 Colección global de tweets
 * ──────────────────────────────── */
const tweetsCollection = collection(db, 'tweets');

/* ────────────────────────────────
 * 👤 Obtener perfil del usuario
 * ──────────────────────────────── */
const getUserProfile = async (uid) => {
  try {
    const ref = doc(db, 'users', uid);
    const snap = await getDoc(ref);
    return snap.exists() ? snap.data() : {};
  } catch (error) {
    console.error('❌ Error al obtener perfil:', error);
    return {};
  }
};

/* ────────────────────────────────
 * 🐦 Crear tweet (soporta media[], photoURL y metadata)
 * ──────────────────────────────── */
export const postTweet = async (uid, username, fullname, text, media = []) => {
  try {
    const profile = await getUserProfile(uid);

    await addDoc(tweetsCollection, {
      uid,
      username: username || profile.username || 'user',
      fullname: fullname || profile.fullname || 'Usuario',
      photoURL: profile.photoURL || null,
      text,
      content: text,
      media, // imágenes o videos [{url, type, altText}]
      metadata: {
        clientTimestamp: Date.now(),
        platform: 'mobile',
      },
      createdAt: serverTimestamp(),
      likesCount: 0,
      retweetsCount: 0,
      repliesCount: 0,
      sharesCount: 0,
    });

    console.log('✅ Tweet publicado correctamente');
  } catch (error) {
    console.error('❌ Error al publicar el tweet:', error);
    throw error;
  }
};

/* ────────────────────────────────
 * 🧩 Mapeo avanzado de tweets
 * Incluye estado liked/retweeted por usuario actual
 * ──────────────────────────────── */
const mapTweetSnapshot = async (docSnap, currentUserId) => {
  const data = docSnap.data();
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

  const [likeSnap, retweetSnap] = await Promise.all([
    getDoc(doc(db, 'tweets', docSnap.id, 'likes', currentUserId)),
    getDoc(doc(db, 'tweets', docSnap.id, 'retweets', currentUserId)),
  ]);

  return {
    ...tweet,
    liked: likeSnap.exists(),
    retweeted: retweetSnap.exists(),
  };
};

/* ────────────────────────────────
 * 📋 Obtener tweets (Home)
 * ──────────────────────────────── */
export const getTweets = async (currentUserId) => {
  const tweetsQuery = query(tweetsCollection, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(tweetsQuery);
  return Promise.all(snapshot.docs.map((docSnap) => mapTweetSnapshot(docSnap, currentUserId)));
};

/* ────────────────────────────────
 * 👤 Tweets por usuario
 * ──────────────────────────────── */
export const getTweetsByUser = async (username, currentUserId) => {
  const tweetsQuery = query(
    tweetsCollection,
    where('username', '==', username),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(tweetsQuery);
  return Promise.all(snapshot.docs.map((docSnap) => mapTweetSnapshot(docSnap, currentUserId)));
};

/* ────────────────────────────────
 * 📑 Paginación
 * ──────────────────────────────── */
export const getTweetsPaginated = async ({
  pageSize = 20,
  cursor,
  username,
  currentUserId,
}) => {
  const constraints = [orderBy('createdAt', 'desc'), limit(pageSize)];
  if (username) constraints.unshift(where('username', '==', username));
  if (cursor) constraints.push(startAfter(cursor));

  const tweetsQuery = query(tweetsCollection, ...constraints);
  const snapshot = await getDocs(tweetsQuery);

  const tweets = await Promise.all(
    snapshot.docs.map((docSnap) => mapTweetSnapshot(docSnap, currentUserId))
  );

  const nextCursor =
    snapshot.docs.length === pageSize ? snapshot.docs[snapshot.docs.length - 1] : null;

  return { tweets, nextCursor };
};

/* ────────────────────────────────
 * 🔁 Subscripción en tiempo real (general o por usuario)
 * ──────────────────────────────── */
const subscribeToQuery = ({ tweetsQuery, currentUserId, onUpdate }) =>
  onSnapshot(tweetsQuery, async (snapshot) => {
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
  const tweetsQuery = query(tweetsCollection, orderBy('createdAt', 'desc'));
  return subscribeToQuery({ tweetsQuery, currentUserId, onUpdate });
};

export const subscribeToTweetsByUser = ({ username, currentUserId, onUpdate }) => {
  const tweetsQuery = query(
    tweetsCollection,
    where('username', '==', username),
    orderBy('createdAt', 'desc')
  );
  return subscribeToQuery({ tweetsQuery, currentUserId, onUpdate });
};

/* ────────────────────────────────
 * ❤️ / 🔁 Like y Retweet (transaccional)
 * ──────────────────────────────── */
const toggleAction = async (tweetId, uid, subcollection, counterField) => {
  const tweetRef = doc(db, 'tweets', tweetId);
  const actionRef = doc(collection(tweetRef, subcollection), uid);

  await runTransaction(db, async (transaction) => {
    const tweetSnap = await transaction.get(tweetRef);
    if (!tweetSnap.exists()) throw new Error('Tweet no encontrado');

    const currentCount = tweetSnap.data()?.[counterField] || 0;
    const actionSnap = await transaction.get(actionRef);

    if (actionSnap.exists()) {
      transaction.delete(actionRef);
      transaction.update(tweetRef, { [counterField]: Math.max(currentCount - 1, 0) });
    } else {
      transaction.set(actionRef, { uid, createdAt: serverTimestamp() });
      transaction.update(tweetRef, { [counterField]: currentCount + 1 });
    }
  });
};

export const toggleLike = (tweetId, uid) => toggleAction(tweetId, uid, 'likes', 'likesCount');
export const toggleRetweet = (tweetId, uid) =>
  toggleAction(tweetId, uid, 'retweets', 'retweetsCount');

/* ────────────────────────────────
 * 💬 Crear respuesta
 * ──────────────────────────────── */
export const createReply = async (tweetId, { uid, username, fullname, text }) => {
  const profile = await getUserProfile(uid);
  const tweetRef = doc(db, 'tweets', tweetId);

  await addDoc(collection(tweetRef, 'replies'), {
    uid,
    username: username || profile.username || 'user',
    fullname: fullname || profile.fullname || 'Usuario',
    photoURL: profile.photoURL || null,
    text,
    createdAt: serverTimestamp(),
  });

  await updateDoc(tweetRef, { repliesCount: increment(1) });
};

/* ────────────────────────────────
 * 📤 Compartir tweet
 * ──────────────────────────────── */
export const shareTweet = async (tweetId, uid) => {
  const tweetRef = doc(db, 'tweets', tweetId);
  await addDoc(collection(tweetRef, 'shares'), { uid, createdAt: serverTimestamp() });
  await updateDoc(tweetRef, { sharesCount: increment(1) });
};

/* ────────────────────────────────
 * 🔍 Estado de acciones (like/retweet)
 * ──────────────────────────────── */
export const getTweetActionState = async (tweetId, uid) => {
  const tweetRef = doc(db, 'tweets', tweetId);
  const [likeSnap, retweetSnap] = await Promise.all([
    getDoc(doc(collection(tweetRef, 'likes'), uid)),
    getDoc(doc(collection(tweetRef, 'retweets'), uid)),
  ]);
  return { liked: likeSnap.exists(), retweeted: retweetSnap.exists() };
};

/* ────────────────────────────────
 * 🔊 Escuchar un tweet y sus respuestas
 * ──────────────────────────────── */
export const listenToTweet = (tweetId, callback) => {
  const tweetRef = doc(db, 'tweets', tweetId);
  return onSnapshot(tweetRef, (snapshot) => {
    if (!snapshot.exists()) {
      callback(null);
      return;
    }
    callback({ id: snapshot.id, ...snapshot.data() });
  });
};

export const listenToReplies = (tweetId, callback) => {
  const repliesRef = collection(doc(db, 'tweets', tweetId), 'replies');
  const q = query(repliesRef, orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const replies = snapshot.docs.map((docSnapshot) => ({
      id: docSnapshot.id,
      ...docSnapshot.data(),
    }));
    callback(replies);
  });
};

/* ────────────────────────────────
 * 👥 Followers / Following
 * ──────────────────────────────── */
export const getFollowers = async (username) => {
  const q = query(collection(db, 'follows'), where('following', '==', username));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => doc.data().follower);
};

export const getFollowing = async (username) => {
  const q = query(collection(db, 'follows'), where('follower', '==', username));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => doc.data().following);
};


/* ────────────────────────────────
 * 💬 Tweets con respuestas, media o likes
 * (Opcional para pestañas en ProfileScreen)
 * ──────────────────────────────── */

export const getRepliesByUser = async (username) => {
  try {
    const tweets = await getTweetsByUser(username);
    return tweets.filter((tweet) => tweet.replyTo || tweet.isReply);
  } catch (error) {
    console.error('Error al obtener replies del usuario:', error);
    return [];
  }
};

export const getMediaTweets = async (username) => {
  try {
    const tweets = await getTweetsByUser(username);
    return tweets.filter((tweet) => {
      const media = tweet.media || tweet.mediaUrls || tweet.mediaUrl;
      return Array.isArray(media) ? media.length > 0 : Boolean(media);
    });
  } catch (error) {
    console.error('Error al obtener tweets con media:', error);
    return [];
  }
};

export const getLikedTweets = async (username) => {
  try {
    const likesRef = collection(db, 'likes');
    const q = query(likesRef, where('username', '==', username), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);

    if (snapshot.empty) return [];

    const tweetIds = snapshot.docs
      .map((likeDoc) => likeDoc.data()?.tweetId)
      .filter(Boolean);

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
