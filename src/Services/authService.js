// src/Services/authService.js
import { auth, db } from '../Config/firebaseConfig';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { setDoc, doc } from 'firebase/firestore';
import { profileStore } from './profileStore';


/*Registrar usuario nuevo (Auth + Firestore)*/
export const registerUser = async (email, password, username, fullname) => {
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await setDoc(doc(db, 'users', cred.user.uid), {
      fullname,
      username,
      email,
      followers: [],
      following: [],
      createdAt: new Date()
    });
    console.log("Usuario registrado y perfil creado:", cred.user.uid);
    return cred.user;
  } catch (error) {
    console.error("Error en registerUser:", error.message);
    throw error;
  }
};

/*Iniciar sesión */
export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log("Sesión iniciada:", userCredential.user.uid);
    return userCredential.user;
  } catch (error) {
    console.error("Error en loginUser:", error.message);
    throw error;
  }
};

/*Cerrar sesión */
export const logoutUser = async () => {
  try {
    await signOut(auth);
    profileStore.clearProfile();
    console.log("Sesión cerrada correctamente");
  } catch (error) {
    console.error("Error cerrando sesión:", error.message);
    throw error;
  }
};

/*Enviar email de restablecimiento de contraseña */
export const resetPassword = async (email) => {
  if (!email) throw new Error('Ingresa un correo válido.');
  try {
    await sendPasswordResetEmail(auth, email);
    return true;
  } catch (error) {
    console.error('Error enviando restablecimiento:', error.message);
    throw error;
  }
};
