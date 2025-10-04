import {getAuth, getFirestore} from './firebase';

const USERS_COLLECTION = 'users';

export const signInWithEmail = async (email, password) => {
  await getAuth().signInWithEmailAndPassword(email.trim(), password);
};

export const registerWithEmail = async (email, password, displayName, handle) => {
  const authInstance = getAuth();
  const normalizedHandle = handle.replace(/[^a-zA-Z0-9_]/g, '').toLowerCase();
  const handleSnapshot = await getFirestore()
    .collection(USERS_COLLECTION)
    .where('handle', '==', normalizedHandle)
    .limit(1)
    .get();
  if (!handleSnapshot.empty) {
    throw new Error('El @handle ya está en uso');
  }
  const {user} = await authInstance.createUserWithEmailAndPassword(
    email.trim(),
    password,
  );
  await user.updateProfile({displayName});
  const profile = {
    uid: user.uid,
    displayName,
    handle: `@${normalizedHandle}`,
    followersCount: 0,
    followingCount: 0,
    createdAt: Date.now(),
    bio: '',
    photoURL: user.photoURL ?? undefined,
  };
  await getFirestore().collection(USERS_COLLECTION).doc(user.uid).set(profile);
  return profile;
};

export const signOut = () => getAuth().signOut();

export const listenToAuthChanges = callback => getAuth().onAuthStateChanged(callback);

export const fetchUserProfile = async uid => {
  const snap = await getFirestore().collection(USERS_COLLECTION).doc(uid).get();
  return snap.data() ?? null;
};

export const updateProfileDocument = async (uid, data) => {
  await getFirestore().collection(USERS_COLLECTION).doc(uid).update(data);
};
