// src/Services/storageService.js

import { Platform } from 'react-native';
import { getStorage, ref as storageRef, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

// Log rápido de bucket para diagnosticar URLs en blanco (se ejecuta una sola vez)
try {
  const _tmpStorage = getStorage();
  // Evita romper si options no existe
  const bucketConfigured = _tmpStorage?.app?.options?.storageBucket;
  console.log('[StorageConfig] Bucket:', bucketConfigured);
} catch (e) {
  console.warn('[StorageConfig] No se pudo leer bucket', e?.message || e);
}


let rnStorage = null;
try {
  
  rnStorage = require('@react-native-firebase/storage').default;
} catch (e) {
  rnStorage = null;
}

// Utilidad: obtener MIME por extensión simple
function mimeFromFilename(name = '') {
  const ext = name.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'webp':
      return 'image/webp';
    case 'gif':
      return 'image/gif';
    default:
      return 'application/octet-stream';
  }
}

function uniqueName(prefix = 'img', original = '') {
  const ext = original && original.includes('.') ? `.${original.split('.').pop()}` : '';
  const rand = Math.random().toString(36).slice(2, 8);
  return `${prefix}_${Date.now()}_${rand}${ext}`;
}

function buildPath({ folder = 'uploads', userId = 'anonymous', fileName }) {
  const cleanFolder = folder.replace(/\/$/, '');
  return `${cleanFolder}/${userId}/${fileName}`;
}

// Sube un archivo desde una URI local 
export async function uploadFromUri(uri, { folder = 'uploads', userId = 'anonymous', fileName, contentType } = {}) {
  if (!uri) throw new Error('uploadFromUri: uri requerida');

  const finalName = fileName || uniqueName('img');
  const path = buildPath({ folder, userId, fileName: finalName });

  // Preferir RNFirebase en móvil si está disponible 
  if (Platform.OS !== 'web' && rnStorage) {
    const ref = rnStorage().ref(path);
    const meta = { contentType: contentType || mimeFromFilename(finalName) };
    await ref.putFile(uri, meta);
    const downloadURL = await ref.getDownloadURL();
    return { downloadURL, path };
  }

  // Fallback: SDK web con fetch->Blob
  try {
    const storage = getStorage();
    const res = await fetch(uri);
    const blob = await res.blob();
    const ref = storageRef(storage, path);
    const meta = { contentType: contentType || blob.type || mimeFromFilename(finalName) };
    const task = uploadBytesResumable(ref, blob, meta);
    await new Promise((resolve, reject) => {
      task.on('state_changed', () => {}, (err) => reject(err), () => resolve());
    });
    const downloadURL = await getDownloadURL(ref);
    return { downloadURL, path };
  } catch (err) {
    // Mejorar diagnóstico
    const hint =
      Platform.OS === 'android' && String(uri).startsWith('content://')
        ? 'URI content:// en Android. Instala @react-native-firebase/storage para mayor compatibilidad.'
        : 'Verifica reglas de Storage y conexión.';
    const wrapped = new Error(`Fallo al subir imagen: ${err?.message || err}. ${hint}`);
    wrapped.cause = err;
    throw wrapped;
  }
}

// Abre la galería, deja elegir 1 imagen y la sube a Storage; devuelve URL
export async function pickImageAndUpload({ folder = 'uploads', userId = 'anonymous', prefix = 'img' } = {}) {
  // Carga dinámica para no romper el bundle web/otros entornos si no está instaldo
  let launchImageLibrary;
  try {
    // eslint-disable-next-line global-require
    ({ launchImageLibrary } = require('react-native-image-picker'));
  } catch (e) {
    throw new Error('Falta dependencia react-native-image-picker. Instálala para seleccionar imágenes.');
  }

  const result = await launchImageLibrary({
    mediaType: 'photo',
    selectionLimit: 1,
    quality: 0.9,
    includeBase64: false,
  });

  if (result.didCancel) return null;
  if (result.errorCode) throw new Error(result.errorMessage || `ImagePicker error: ${result.errorCode}`);

  const asset = result.assets?.[0];
  if (!asset?.uri) throw new Error('No se obtuvo URI de la imagen seleccionada');

  const nameGuess = asset.fileName || uniqueName(prefix);
  const { downloadURL, path } = await uploadFromUri(asset.uri, {
    folder,
    userId,
    fileName: nameGuess,
    contentType: asset.type,
  });

  // Verificación: intentar acceder a la URL para asegurar que no está en blanco
  try {
    const headResp = await fetch(downloadURL, { method: 'GET' });
    if (!headResp.ok) {
      console.warn('Verificación de imagen fallida', downloadURL, headResp.status);
    } else {
      // Opcional: log de content-type
      const ct = headResp.headers.get('Content-Type');
      console.log('Imagen subida OK', { url: downloadURL, contentType: ct, path });
    }
  } catch (err) {
    console.warn('Error verificando URL de imagen', downloadURL, err?.message || err);
  }

  return { downloadURL, path, width: asset.width, height: asset.height };
}

// Utilidad para calcular aspectRatio y render grande
export function calcAspectRatio(width, height, fallback = 16 / 9) {
  if (width && height && width > 0 && height > 0) return width / height;
  return fallback;
}


