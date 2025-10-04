import firestore from '@react-native-firebase/firestore';
import {Platform} from 'react-native';
import {MediaAttachment, Post, ReactionPayload, TimelineEntry} from '../types';
import {getFirestore, getStorage} from './firebase';

const POSTS_COLLECTION = 'posts';
const TIMELINE_LIMIT = 50;

export const createPost = async (
  post: Omit<Post, 'id' | 'createdAt' | 'reactions' | 'retweetCount' | 'commentCount'> & {
    mediaFileUri?: string | null;
  },
) => {
  const db = getFirestore();
  let mediaAttachment: MediaAttachment | null = post.media ?? null;
  if (post.mediaFileUri && post.media) {
    const {mediaFileUri} = post;
    const extension = post.media.type === 'video' ? 'mp4' : 'jpg';
    const storagePath = `posts/${post.authorId}/${Date.now()}.${extension}`;
    const reference = getStorage().ref(storagePath);
    if (Platform.OS === 'android' && mediaFileUri.startsWith('content://')) {
      await reference.putFile(mediaFileUri);
    } else {
      await reference.putFile(mediaFileUri.replace('file://', ''));
    }
    const downloadURL = await reference.getDownloadURL();
    mediaAttachment = {
      ...post.media,
      downloadURL,
      storagePath,
    } as MediaAttachment;
  }

  const newDoc = await db.collection(POSTS_COLLECTION).add({
    ...post,
    media: mediaAttachment,
    reactions: {},
    retweetCount: 0,
    commentCount: 0,
    createdAt: firestore.FieldValue.serverTimestamp(),
  });
  return newDoc.id;
};

export const listenTimeline = (
  onUpdate: (posts: TimelineEntry[]) => void,
  userId: string,
) => {
  const db = getFirestore();
  return db
    .collection(POSTS_COLLECTION)
    .orderBy('createdAt', 'desc')
    .limit(TIMELINE_LIMIT)
    .onSnapshot(snapshot => {
      const documents = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...(data as Post),
          id: doc.id,
          createdAt: data.createdAt?.toMillis?.() ?? Date.now(),
        } as TimelineEntry;
      });
      onUpdate(documents);
    });
};

export const toggleReaction = async (
  {postId, reaction}: ReactionPayload,
  userId: string,
) => {
  const db = getFirestore();
  const postRef = db.collection(POSTS_COLLECTION).doc(postId);
  await db.runTransaction(async transaction => {
    const snapshot = await transaction.get(postRef);
    const data = snapshot.data() as Post;
    const userReactions = data.userReactions ?? {};
    const currentReaction = userReactions[userId];
    const reactions = {...(data.reactions ?? {})};

    if (currentReaction && currentReaction === reaction) {
      reactions[reaction] = Math.max((reactions[reaction] ?? 1) - 1, 0);
      delete userReactions[userId];
    } else {
      if (currentReaction) {
        reactions[currentReaction] = Math.max(
          (reactions[currentReaction] ?? 1) - 1,
          0,
        );
      }
      reactions[reaction] = (reactions[reaction] ?? 0) + 1;
      userReactions[userId] = reaction;
    }

    transaction.update(postRef, {reactions, userReactions});
  });
};

export const retweetPost = async (
  postId: string,
  retweeter: {
    uid: string;
    displayName: string;
    handle: string;
    photoURL?: string;
  },
) => {
  const db = getFirestore();
  const postRef = db.collection(POSTS_COLLECTION).doc(postId);
  const retweetDoc = db.collection(POSTS_COLLECTION).doc();
  await db.runTransaction(async transaction => {
    const snapshot = await transaction.get(postRef);
    const data = snapshot.data() as Post;
    transaction.update(postRef, {
      retweetCount: firestore.FieldValue.increment(1),
    });
    transaction.set(retweetDoc, {
      ...data,
      id: retweetDoc.id,
      authorId: retweeter.uid,
      authorDisplayName: data.authorDisplayName,
      authorHandle: data.authorHandle,
      authorPhotoURL: data.authorPhotoURL,
      createdAt: firestore.FieldValue.serverTimestamp(),
      retweetParentId: postId,
      retweetedBy: retweeter.displayName,
      retweetedByHandle: retweeter.handle,
    });
  });
};

export const deletePost = async (postId: string) => {
  const db = getFirestore();
  const ref = db.collection(POSTS_COLLECTION).doc(postId);
  const snapshot = await ref.get();
  const data = snapshot.data() as Post | undefined;
  if (data?.media?.storagePath) {
    await getStorage().ref(data.media.storagePath).delete();
  }
  await ref.delete();
};
