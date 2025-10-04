import {initializeApp} from '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';

let firebaseApp = null;

export const getFirebaseApp = () => {
  if (!firebaseApp) {
    firebaseApp = initializeApp();
  }
  return firebaseApp;
};

export const getAuth = () => {
  getFirebaseApp();
  return auth();
};

export const getFirestore = () => {
  getFirebaseApp();
  return firestore();
};

export const getStorage = () => {
  getFirebaseApp();
  return storage();
};
