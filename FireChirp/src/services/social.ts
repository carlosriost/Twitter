import firestore from '@react-native-firebase/firestore';
import {UserProfile} from '../types';
import {getFirestore} from './firebase';

const USERS_COLLECTION = 'users';
const FOLLOWERS_COLLECTION = 'followers';
const FOLLOWING_COLLECTION = 'following';

export const followUser = async (currentUid: string, targetUid: string) => {
  const db = getFirestore();
  const batch = db.batch();
  const followerRef = db
    .collection(USERS_COLLECTION)
    .doc(targetUid)
    .collection(FOLLOWERS_COLLECTION)
    .doc(currentUid);
  const followingRef = db
    .collection(USERS_COLLECTION)
    .doc(currentUid)
    .collection(FOLLOWING_COLLECTION)
    .doc(targetUid);

  batch.set(followerRef, {createdAt: firestore.FieldValue.serverTimestamp()});
  batch.set(followingRef, {createdAt: firestore.FieldValue.serverTimestamp()});
  batch.update(db.collection(USERS_COLLECTION).doc(targetUid), {
    followersCount: firestore.FieldValue.increment(1),
  });
  batch.update(db.collection(USERS_COLLECTION).doc(currentUid), {
    followingCount: firestore.FieldValue.increment(1),
  });
  await batch.commit();
};

export const unfollowUser = async (currentUid: string, targetUid: string) => {
  const db = getFirestore();
  const batch = db.batch();
  const followerRef = db
    .collection(USERS_COLLECTION)
    .doc(targetUid)
    .collection(FOLLOWERS_COLLECTION)
    .doc(currentUid);
  const followingRef = db
    .collection(USERS_COLLECTION)
    .doc(currentUid)
    .collection(FOLLOWING_COLLECTION)
    .doc(targetUid);

  batch.delete(followerRef);
  batch.delete(followingRef);
  batch.update(db.collection(USERS_COLLECTION).doc(targetUid), {
    followersCount: firestore.FieldValue.increment(-1),
  });
  batch.update(db.collection(USERS_COLLECTION).doc(currentUid), {
    followingCount: firestore.FieldValue.increment(-1),
  });
  await batch.commit();
};

export const fetchFollowers = async (uid: string) => {
  const db = getFirestore();
  const followerSnapshot = await db
    .collection(USERS_COLLECTION)
    .doc(uid)
    .collection(FOLLOWERS_COLLECTION)
    .get();
  const followerIds = followerSnapshot.docs.map(doc => doc.id);
  if (!followerIds.length) {
    return [];
  }
  const users = await db
    .collection(USERS_COLLECTION)
    .where(firestore.FieldPath.documentId(), 'in', followerIds)
    .get();
  return users.docs.map(doc => doc.data() as UserProfile);
};

export const fetchFollowing = async (uid: string) => {
  const db = getFirestore();
  const followingSnapshot = await db
    .collection(USERS_COLLECTION)
    .doc(uid)
    .collection(FOLLOWING_COLLECTION)
    .get();
  const followingIds = followingSnapshot.docs.map(doc => doc.id);
  if (!followingIds.length) {
    return [];
  }
  const users = await db
    .collection(USERS_COLLECTION)
    .where(firestore.FieldPath.documentId(), 'in', followingIds)
    .get();
  return users.docs.map(doc => doc.data() as UserProfile);
};

export const isFollowing = async (currentUid: string, targetUid: string) => {
  const doc = await getFirestore()
    .collection(USERS_COLLECTION)
    .doc(currentUid)
    .collection(FOLLOWING_COLLECTION)
    .doc(targetUid)
    .get();
  return doc.exists;
};
