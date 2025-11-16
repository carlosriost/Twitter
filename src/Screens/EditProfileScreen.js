import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  Image,
  StatusBar,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { launchImageLibrary } from 'react-native-image-picker';
import { colors } from '../Styles/theme';
import styles from '../Styles/EditProfileScreen.styles';
import { auth, db, storage } from '../Config/firebaseConfig';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { profileStore } from '../Services/profileStore';
import Tap from '../Components/Tap';

export default function EditProfileScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const user = auth.currentUser;
  const [fullname, setFullname] = useState('');
  const [bio, setBio] = useState('');
  const [photoURL, setPhotoURL] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Cargar datos actuales del usuario
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(userRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setFullname(data.fullname || '');
          setBio(data.bio || '');
          setPhotoURL(data.photoURL || null);
          // Mantén el store sincronizado sin perder campos previos
          const current = profileStore.getProfile() || {};
          profileStore.setProfile({ ...current, uid: user.uid, ...data });
        }
      } catch (error) {
        console.error('Error al cargar el perfil:', error);
        Alert.alert('Error', 'No se pudieron cargar los datos del perfil.');
      } finally {
        setLoading(false);
      }
    };
    loadUserData();
  }, [user?.uid]);

  // Escoger nueva foto
  const handlePickImage = async () => {
    const options = { mediaType: 'photo', quality: 0.8, includeBase64: false };
    launchImageLibrary(options, (response) => {
      if (response.didCancel) return;
      if (response.errorCode) {
        console.log('Error:', response.errorMessage);
        Alert.alert('Error', 'No se pudo acceder a la galería.');
        return;
      }
      const uri = response.assets?.[0]?.uri;
      if (uri) setPhotoURL(uri);
    });
  };

  // Guardar cambios
  const handleSave = async () => {
    if (!fullname.trim()) {
      Alert.alert('Campo obligatorio', 'El nombre no puede estar vacío.');
      return;
    }

    setSaving(true);
    try {
      let newPhotoURL = photoURL;

      // Subir imagen si es nueva
      if (photoURL && !photoURL.startsWith('https://')) {
        const response = await fetch(photoURL);
        const blob = await response.blob();
        const storageRef = ref(storage, `profilePictures/${user.uid}.jpg`);
        await uploadBytes(storageRef, blob);
        newPhotoURL = await getDownloadURL(storageRef);
      }

      // Actualizar Firestore
      const userRef = doc(db, 'users', user.uid);
      const updates = {
        fullname: fullname.trim(),
        bio: bio.trim(),
        photoURL: newPhotoURL || '',
        updatedAt: new Date(),
      };
      await updateDoc(userRef, updates);

      // Actualizar estado local + global 
      const current = profileStore.getProfile() || {};
      const refreshed = { ...current, uid: user.uid, ...updates };
      profileStore.setProfile(refreshed);
      setFullname(refreshed.fullname);
      setBio(refreshed.bio);
      setPhotoURL(refreshed.photoURL);

      Alert.alert('Perfil actualizado', 'Los cambios se guardaron correctamente.');
      navigation.goBack();
    } catch (error) {
      console.error('Error al guardar perfil:', error);
      Alert.alert('Error', 'No se pudo guardar el perfil.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* Header arriba con Cancel y Save */}
      <View style={[styles.header, { paddingTop: Math.max(16, insets.top) }]}>
        <Tap onPress={() => navigation.goBack()}>
          <Text style={styles.cancelText}>Cancel</Text>
        </Tap>

        <Tap
          style={styles.saveButton}
          onPress={handleSave}
          disabled={saving}
          accessibilityRole="button"
        >
          {saving ? (
            <ActivityIndicator color={colors.onPrimary} />
          ) : (
            <Text style={styles.saveText}>Save</Text>
          )}
        </Tap>
      </View>

      {/*Contenido*/}
      <ScrollView
        contentContainerStyle={{ paddingBottom: 24 }}
        keyboardShouldPersistTaps="handled"
      >
        <Tap onPress={handlePickImage} style={{ alignSelf: 'center' }}>
          <Image
            source={
              photoURL ? { uri: photoURL } : require('../assets/default-avatar.png')
            }
            style={styles.avatar}
          />
          <Text style={styles.changePhoto}>Change photo</Text>
        </Tap>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            value={fullname}
            onChangeText={setFullname}
            placeholder="Your name"
            placeholderTextColor={colors.textLight}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Bio</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={bio}
            onChangeText={setBio}
            placeholder="Write a short bio..."
            placeholderTextColor={colors.textLight}
            multiline
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}