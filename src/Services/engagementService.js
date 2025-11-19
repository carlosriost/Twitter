import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  startAfter,
} from 'firebase/firestore';
import { db } from '../Config/firebaseConfig';

/*Referencias base*/
const getTweetRef = (tweetId) => doc(db, 'tweets', tweetId);
const likesCollection = (tweetId) => collection(db, 'tweets', tweetId, 'likes');
const retweetsCollection = (tweetId) => collection(db, 'tweets', tweetId, 'retweets');
const repliesCollection = (tweetId) => collection(db, 'tweets', tweetId, 'replies');

// Ajuste de contador sin lecturas tardías: siempre calcula a partir de un snapshot leído antes
const applyCounterUpdate = (transaction, tweetRef, field, baseValue, amount) => {
  const next = Math.max(Number(baseValue ?? 0) + amount, 0);
  transaction.update(tweetRef, { [field]: next });
};

/*Toggle Like*/
export const toggleLike = async (tweetId, userId) => {
  if (!userId) throw new Error('User ID is required to like a tweet');

  const tweetRef = getTweetRef(tweetId);
  const likeRef = doc(likesCollection(tweetId), userId);

  return runTransaction(db, async (transaction) => {
    // Todas las lecturas primero
    const [tweetSnap, likeSnap] = await Promise.all([
      transaction.get(tweetRef),
      transaction.get(likeRef),
    ]);

    if (!tweetSnap.exists()) throw new Error('Tweet not found');
    const current = Number(tweetSnap.data()?.likesCount ?? 0);
    const isLiked = likeSnap.exists();

    if (isLiked) {
      transaction.delete(likeRef);
      applyCounterUpdate(transaction, tweetRef, 'likesCount', current, -1);
      return false;
    } else {
      transaction.set(likeRef, { userId, createdAt: serverTimestamp() });
      applyCounterUpdate(transaction, tweetRef, 'likesCount', current, 1);
      return true;
    }
  });
};

/*Toggle Retweet*/
export const toggleRetweet = async (tweetId, userId) => {
  if (!userId) throw new Error('User ID is required to retweet');

  const tweetRef = getTweetRef(tweetId);
  const retweetRef = doc(retweetsCollection(tweetId), userId);

  return runTransaction(db, async (transaction) => {
    // Lecturas antes de escrituras
    const [tweetSnap, retweetSnap] = await Promise.all([
      transaction.get(tweetRef),
      transaction.get(retweetRef),
    ]);

    if (!tweetSnap.exists()) throw new Error('Tweet not found');
    const current = Number(tweetSnap.data()?.retweetsCount ?? 0);
    const isRetweeted = retweetSnap.exists();

    if (isRetweeted) {
      transaction.delete(retweetRef);
      applyCounterUpdate(transaction, tweetRef, 'retweetsCount', current, -1);
      return false;
    } else {
      transaction.set(retweetRef, { userId, createdAt: serverTimestamp() });
      applyCounterUpdate(transaction, tweetRef, 'retweetsCount', current, 1);
      return true;
    }
  });
};

export const addReply = async (tweetId, { userId, username, fullname, text, photoURL = null, media = [] }) => {
  if (!userId) throw new Error('User ID is required to reply');
  if (!text?.trim() && media.length === 0) throw new Error('Reply text or media is required');

  const tweetRef = getTweetRef(tweetId);

  const replyData = {
    userId,
    username,
    fullname,
    photoURL,
    text: text?.trim() || '',
    media, // [{ url, type, altText }]
    createdAt: serverTimestamp(),
    metadata: {
      platform: 'mobile',
      clientTimestamp: Date.now(),
    },
  };

  const replyRef = await addDoc(repliesCollection(tweetId), replyData);

  await runTransaction(db, (transaction) =>
    incrementField(transaction, tweetRef, 'repliesCount', 1)
  );

  const replySnap = await getDoc(replyRef);
  return { id: replySnap.id, ...replySnap.data() };
};

/*Obtener respuestas*/
export const getRepliesPaginated = async (tweetId, { pageSize = 20, cursor } = {}) => {
  const repliesRef = repliesCollection(tweetId);
  const constraints = [orderBy('createdAt', 'desc'), limit(pageSize)];
  if (cursor) constraints.push(startAfter(cursor));

  const repliesQuery = query(repliesRef, ...constraints);
  const snapshot = await getDocs(repliesQuery);
  const replies = snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));

  const nextCursor =
    snapshot.docs.length === pageSize ? snapshot.docs[snapshot.docs.length - 1] : null;

  return { replies, nextCursor };
};
