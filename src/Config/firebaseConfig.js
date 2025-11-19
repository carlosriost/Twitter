import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey:"AIzaSyC_xKgoXdGfD4R-zGjrhT55NnGC8ClqWTw",
  authDomain: "exex.firebaseapp.com",
  projectId: "exex-5171f",
  storageBucket: "exex-5171f.firebasestorage.app",
  messagingSenderId: "180167559435",
  appId: "1:180167559435:android:941806e0197cbd8978ba0e"
};


const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

console.log("Firebase initialized:", app.name);
