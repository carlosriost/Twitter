import { db } from '../Config/firebaseConfig';
import { addDoc, collection, serverTimestamp, query, orderBy, getDocs, where, query } from 'firebase/firestore';


export const postTweet = async (uid, username, fullname, text) => {
  await addDoc(collection(db, 'tweets'), {
    uid,
    username,
    fullname,
    text,
    createdAt: serverTimestamp(),
  });
};

export const getTweets = async () => { //esta es de la Screen HomeScreen
  const q = query(collection(db, 'tweets'), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const getTweetsByUser = async (username) => { //esta es de la Screen tweetService
  const q = query(collection(db, 'tweets'), where('username', '==', username));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getFollowers = async (username) => {
  const q = query(collection(db, 'follows'), where('following', '==', username));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data().follower); 
};

export const getFollowing = async (username) => {
  const q = query(collection(db, 'follows'), where('follower', '==', username));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data().following);
};


