// src/Services/followService.js
import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  where,
  setDoc,
  deleteDoc,
  serverTimestamp,
  limit,
  documentId,
} from 'firebase/firestore';

export const followDocId = (followerUid, followingUid) => `${followerUid}_${followingUid}`;

export async function followUser(db, followerUid, followingUid) {
  const id = followDocId(followerUid, followingUid);
  await setDoc(doc(db, 'follows', id), {
    followerUid,
    followingUid,
    createdAt: serverTimestamp(),
  });
}

export async function unfollowUser(db, followerUid, followingUid) {
  const id = followDocId(followerUid, followingUid);
  await deleteDoc(doc(db, 'follows', id));
}

// Quiénes siguen a {uid}
export function subscribeFollowers(db, uid, callback) {
  const q = query(collection(db, 'follows'), where('followingUid', '==', uid));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => d.data().followerUid));
  });
}

// A quién sigue {uid}
export function subscribeFollowing(db, uid, callback) {
  const q = query(collection(db, 'follows'), where('followerUid', '==', uid));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => d.data().followingUid));
  });
}

export async function getUserByUsername(db, username) {
  const q = query(collection(db, 'users'), where('username', '==', username), limit(1));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const docSnap = snap.docs[0];
  return { uid: docSnap.id, ...docSnap.data() };
}

export async function getUserByUid(db, uid) {
  const ref = doc(db, 'users', uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { uid: snap.id, ...snap.data() };
}

export async function fetchUsersByUids(db, uids) {
  if (!uids?.length) return [];
  const out = [];
  for (let i = 0; i < uids.length; i += 10) {
    const chunk = uids.slice(i, i + 10);
    const q = query(collection(db, 'users'), where(documentId(), 'in', chunk));
    const snap = await getDocs(q);
    snap.forEach((d) => out.push({ uid: d.id, ...d.data() }));
  }
  return out;
}