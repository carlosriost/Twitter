import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { colors, spacing, radii, typography } from '../Styles/theme';
import { auth, db, storage } from '../config/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export default function EditProfileScreen({ navigation }) {
  const user = auth.currentUser;
  const [fullname, setFullname] = useState('');
  const [bio, setBio] = useState('');
  const [photoURL, setPhotoURL] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // 🔹 Cargar datos actuales del usuario
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
        }
      } catch (error) {
        console.error('Error al cargar el perfil:', error);
        Alert.alert('Error', 'No se pudieron cargar los datos del perfil.');
      } finally {
        setLoading(false);
      }
    };
    loadUserData();
  }, []);

  // 📸 Escoger nueva foto de perfil
  const handlePickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permiso requerido', 'Se necesita acceso a la galería.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setPhotoURL(result.assets[0].uri);
    }
  };

  // 💾 Guardar cambios
  const handleSave = async () => {
    if (!fullname.trim()) {
      Alert.alert('Campo obligatorio', 'El nombre no puede estar vacío.');
      return;
    }

    setSaving(true);
    try {
      let newPhotoURL = photoURL;

      // 🔹 Subir imagen si es nueva (no URL)
      if (photoURL && !photoURL.startsWith('https://')) {
        const response = await fetch(photoURL);
        const blob = await response.blob();
        const storageRef = ref(storage, `profilePictures/${user.uid}.jpg`);
        await uploadBytes(storageRef, blob);
        newPhotoURL = await getDownloadURL(storageRef);
      }

      // 🔹 Actualizar Firestore
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        fullname,
        bio,
        photoURL: newPhotoURL,
        updatedAt: new Date(),
      });

      Alert.alert('✅ Perfil actualizado', 'Los cambios se guardaron correctamente.');
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

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color={colors.background} />
          ) : (
            <Text style={styles.saveText}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Contenido principal */}
      <View style={styles.container}>
        <TouchableOpacity onPress={handlePickImage}>
          <Image
            source={
              photoURL
                ? { uri: photoURL }
                : require('../assets/default-avatar.png')
            }
            style={styles.avatar}
          />
          <Text style={styles.changePhoto}>Change photo</Text>
        </TouchableOpacity>

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
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  cancelText: {
    color: colors.textLight,
    fontWeight: '500',
    fontSize: typography.subtitle,
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
  },
  saveButtonDisabled: { backgroundColor: colors.border },
  saveText: { color: colors.background, fontWeight: '700', fontSize: typography.subtitle },
  container: { padding: spacing.lg },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: radii.round,
    alignSelf: 'center',
  },
  changePhoto: {
    textAlign: 'center',
    color: colors.primary,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  formGroup: { marginBottom: spacing.lg },
  label: { color: colors.textLight, fontSize: typography.caption, marginBottom: spacing.xs },
  input: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.body,
    color: colors.text,
  },
  textArea: { minHeight: 100, textAlignVertical: 'top' },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});
