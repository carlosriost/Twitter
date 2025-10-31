import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { colors, spacing, radii, typography } from '../Styles/theme';
import {db} from '../Config/firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function TweetScreen({ navigation, route }) {
  const [tweet, setTweet] = useState('');
  const [loading, setLoading] = useState(false);

  // 🔹 Datos del usuario (por ahora se usa username genérico)
  const username = route.params?.username || 'user';
  const fullname = route.params?.fullname || 'Usuario';

  // 🐦 Guardar tweet en Firebase
  const handlePost = async () => {
    if (!tweet.trim()) return;

    setLoading(true);
    try {
      await addDoc(collection(db, 'tweets'), {
        fullname,
        username,
        content: tweet.trim(),
        createdAt: serverTimestamp(),
      });

      setTweet('');
      navigation.goBack(); // 🔙 Regresa al HomeScreen
    } catch (error) {
      console.error('Error al publicar el tweet:', error);
      alert('Error al publicar el tweet 😢');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* Header superior */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.postButton,
            (!tweet.trim() || loading) && styles.postButtonDisabled,
          ]}
          onPress={handlePost}
          disabled={!tweet.trim() || loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color={colors.background} />
          ) : (
            <Text style={styles.postButtonText}>Post</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Contenedor principal */}
      <View style={styles.container}>
        {/* Avatar */}
        <View style={styles.avatar}>
          <Text style={styles.avatarInitial}>
            {fullname[0]?.toUpperCase() || 'U'}
          </Text>
        </View>

        {/* Área de texto */}
        <View style={styles.composerBody}>
          <TextInput
            style={styles.input}
            placeholder="What is happening?!"
            placeholderTextColor={colors.textLight}
            multiline
            maxLength={280}
            value={tweet}
            onChangeText={setTweet}
          />

          {/* Barra inferior: contador + opciones */}
          <View style={styles.toolbar}>
            <View style={styles.iconRow}>
              {['🖼️', '📍', '😊'].map((icon) => (
                <Text key={icon} style={styles.icon}>
                  {icon}
                </Text>
              ))}
            </View>

            <Text
              style={[
                styles.counter,
                tweet.length > 240 && styles.counterWarning,
              ]}
            >
              {tweet.length}/280
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topBar: {
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
    fontSize: typography.subtitle,
    fontWeight: '500',
  },
  postButton: {
    backgroundColor: colors.primary,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  postButtonDisabled: {
    backgroundColor: colors.border,
  },
  postButtonText: {
    color: colors.background,
    fontWeight: '700',
    fontSize: typography.subtitle,
  },
  container: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  avatarInitial: {
    color: colors.text,
    fontWeight: '700',
  },
  composerBody: {
    flex: 1,
  },
  input: {
    minHeight: 120,
    fontSize: typography.subtitle,
    color: colors.text,
    textAlignVertical: 'top',
    paddingBottom: spacing.md,
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
  },
  iconRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  icon: {
    fontSize: 20,
  },
  counter: {
    fontSize: typography.caption,
    color: colors.textLight,
  },
  counterWarning: {
    color: colors.danger,
    fontWeight: '700',
  },
});
