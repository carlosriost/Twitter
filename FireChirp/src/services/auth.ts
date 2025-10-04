import auth from '@react-native-firebase/auth';
import {UserProfile} from '../types';
import {getAuth, getFirestore} from './firebase';

const USERS_COLLECTION = 'users';

export const signInWithEmail = async (email: string, password: string) => {
  await getAuth().signInWithEmailAndPassword(email.trim(), password);
};

export const registerWithEmail = async (
  email: string,
  password: string,
  displayName: string,
  handle: string,
) => {
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
  const profile: UserProfile = {
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

export const listenToAuthChanges = (
  callback: (user: auth.FirebaseAuthTypes.User | null) => void,
) => getAuth().onAuthStateChanged(callback);

export const fetchUserProfile = async (uid: string) => {
  const snap = await getFirestore().collection(USERS_COLLECTION).doc(uid).get();
  return (snap.data() as UserProfile | undefined) ?? null;
};

export const updateProfileDocument = async (
  uid: string,
  data: Partial<UserProfile>,
) => {
  await getFirestore().collection(USERS_COLLECTION).doc(uid).update(data);
};
