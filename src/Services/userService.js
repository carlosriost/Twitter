// src/Services/userService.js
import { db } from '../Config/firebaseConfig';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

/**
 * 🔹 Obtener el perfil del usuario desde Firestore
 * @param {string} uid - ID del usuario autenticado
 */
export const getUserProfile = async (uid) => {
  try {
    const ref = doc(db, 'users', uid);
    const snapshot = await getDoc(ref);
    if (snapshot.exists()) {
      console.log("✅ Perfil obtenido:", snapshot.data());
      return snapshot.data();
    } else {
      console.log("⚠️ No existe el perfil del usuario.");
      return null;
    }
  } catch (error) {
    console.error("❌ Error al obtener el perfil:", error.message);
    throw error;
  }
};

/**
 * 🔹 Actualizar perfil del usuario (nombre, bio, foto, etc.)
 * @param {string} uid - ID del usuario
 * @param {object} data - Campos a actualizar (ej: { fullname, bio, photoURL })
 */
export const updateUserProfile = async (uid, data) => {
  try {
    const ref = doc(db, 'users', uid);
    await updateDoc(ref, data);
    console.log("✅ Perfil actualizado correctamente");
  } catch (error) {
    console.error("❌ Error al actualizar perfil:", error.message);
    throw error;
  }
};
