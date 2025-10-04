# FireChirp 🐦🔥

FireChirp es un clon ligero de Twitter construido con **React Native** (sin Expo) y **Firebase** como backend. Está enfocado en Android y cumple los requisitos solicitados: autenticación por correo, publicaciones con texto obligatorio, adjuntos de imagen/video (videos de menos de 10 segundos), reacciones con emojis, retweets y seguimiento de usuarios.

> 🎯 La paleta evita colores azul y negro predominantes. Elegimos morados y tonos cálidos para diferenciar la marca e incluye un logo propio.

## 🚀 Características principales

- **Inicio de sesión y registro** con email y contraseña usando Firebase Authentication.
- **Perfiles de usuario** con nombre, @handle, biografía editable y contadores de seguidores/siguiendo.
- **Seguimiento**: seguir y dejar de seguir usuarios, con listas separadas de seguidores/siguiendo.
- **Timeline en tiempo real** usando Cloud Firestore para publicar, reaccionar y hacer retweets.
- **Publicaciones enriquecidas** con texto obligatorio y adjuntos opcionales de imagen o video (< 10s) guardados en Firebase Storage.
- **Reacciones con emojis** y contador por tipo.
- **Retweets (ReChirps)** que incrementan el contador del post original y muestran quién lo compartió.
- **Tema cálido** con React Native Paper y navegación bottom tabs.

## 📁 Estructura del proyecto

```
FireChirp/
├── android/                # Proyecto Android nativo configurado para Firebase
├── assets/                 # Logo SVG personalizado
├── src/
│   ├── components/         # UI reutilizable (cards, avatar, reacciones, etc.)
│   ├── navigation/         # Navegación (auth vs app tabs)
│   ├── screens/            # Pantallas principales
│   ├── services/           # Conexión con Firebase (auth, posts, social)
│   ├── store/              # Redux Toolkit slices
│   ├── theme/              # Paleta y Paper theme
│   └── types/              # Tipos compartidos y soporte SVG
├── index.js                # Registro del componente principal
├── package.json
└── README.md
```

## 🔧 Configuración previa

1. **Instala dependencias globales necesarias**
   ```bash
   npm install -g react-native-cli
   ```

2. **Instala las dependencias del proyecto**
   ```bash
   npm install
   # o
   yarn install
   ```

3. **Configura Firebase para Android**
   - Crea un proyecto en [Firebase Console](https://console.firebase.google.com/).
   - Habilita **Authentication (Email/Password)**, **Cloud Firestore** y **Storage**.
   - Añade una app **Android** con el package `com.firechirp`.
   - Descarga el `google-services.json` generado y reemplaza el archivo de `android/app/google-services.json` (el incluido es solo un placeholder).
   - En Firestore crea las reglas básicas necesarias (ver sección de datos más abajo).

4. **Configura los servicios de Firebase en código**
   - Si deseas usar configuración explícita en lugar de auto-detección, edita `src/services/firebase.ts` y pasa tu objeto de configuración a `initializeApp`.

5. **Sincroniza los assets nativos**
   ```bash
   cd android
   ./gradlew clean
   cd ..
   npx react-native-asset
   ```

6. **Ejecuta en Android (emulador o dispositivo)**
   ```bash
   npm run android
   # o
   yarn android
   ```

> ℹ️ El proyecto está preparado únicamente para Android, según la restricción indicada. No se generaron assets ni configuración para iOS/Web.

## 🧪 Usuarios de prueba

El archivo `README` incluye credenciales listas para QA:

| Usuario             | Contraseña     | Notas                         |
|---------------------|----------------|--------------------------------|
| `demo@firechirp.app`| `FireChirp123` | Cuenta demo con seguidores     |
| `luz@firechirp.app` | `FireChirp123` | Cuenta secundaria para pruebas |

> Asegúrate de registrar estos usuarios manualmente en Firebase Authentication o ejecuta la pantalla de registro dentro de la app.

## 🗄️ Modelo de datos en Firestore

- **Colección `users`**: documentos por `uid` con `displayName`, `handle`, `bio`, `followersCount`, `followingCount`, `photoURL`, `createdAt`.
- **Subcolecciones `users/{uid}/followers` y `users/{uid}/following`**: almacenan relaciones con timestamps.
- **Colección `posts`**: cada documento tiene autor, texto, `media`, `reactions`, `userReactions`, contadores y `retweetParentId`/`retweetedBy` cuando aplica.

Reglas recomendadas (simplificadas, ajustar para producción):
```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
      match /followers/{followerId} {
        allow read, write: if request.auth != null && (request.auth.uid == userId || request.auth.uid == followerId);
      }
      match /following/{followingId} {
        allow read, write: if request.auth != null && (request.auth.uid == userId || request.auth.uid == followingId);
      }
    }
    match /posts/{postId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && request.resource.data.text.size() > 0;
      allow update, delete: if request.auth != null && request.auth.uid == resource.data.authorId;
    }
  }
}
```

## 📦 Scripts disponibles

| Script            | Descripción                                      |
|-------------------|--------------------------------------------------|
| `npm start`       | Inicia Metro bundler                             |
| `npm run android` | Compila y lanza la app en Android                |
| `npm test`        | Ejecuta los tests (placeholder, no configurados) |
| `npm run lint`    | Ejecuta ESLint                                   |

## 🖼️ Identidad visual

- **Logo propio** en `assets/logo.svg`.
- **Paleta**: morado (`#8E44AD`), naranja (`#E67E22`) y crema (`#F5EDE0`).
- **Nada de azul/negro predominante**, cumpliendo la restricción solicitada.

## 📱 Permisos de Android

Se solicitaron permisos de lectura para imágenes y videos (`READ_MEDIA_IMAGES`, `READ_MEDIA_VIDEO`) y compatibilidad con versiones previas (`READ/WRITE_EXTERNAL_STORAGE`). Ajusta en producción según tus necesidades.

## 📝 Notas finales

- Agrega tus credenciales reales de Firebase y archivos de configuración antes de compilar.
- Puedes extender el modelo para comentarios o push notifications aprovechando la base construida.
- Revisa `android/app/build.gradle` para modificar versión mínima o activar el nuevo architecture renderer si lo deseas.

¡Listo! Con esto tienes una base funcional de un clon de Twitter pensado para Android usando React Native y Firebase.
