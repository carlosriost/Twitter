import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { colors, spacing, radii, typography } from '../Styles/theme';
import { auth } from '../Config/firebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { createUserProfile } from '../Services/userService';

export default function RegisterScreen({ navigation }) {
  const [fullname, setFullname] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!fullname.trim() || !username.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Campos incompletos', 'Por favor, completa todos los campos.');
      return;
    }

    setLoading(true);
    try {
      // 🔹 Crear usuario en Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log('✅ Usuario creado:', user.uid);

      // 🔹 Crear perfil en Firestore
      await createUserProfile(user.uid, username, fullname, email);

      Alert.alert('✅ Registro exitoso', 'Tu cuenta fue creada correctamente.');
      navigation.navigate('Login');
    } catch (error) {
      console.error('❌ Error al registrar:', error.message);
      if (error.code === 'auth/email-already-in-use') {
        Alert.alert(
          'Correo ya registrado',
          'Este correo ya está en uso. Por favor inicia sesión o usa otro.'
        );
      } else if (error.code === 'auth/invalid-email') {
        Alert.alert('Correo inválido', 'Por favor ingresa un correo válido.');
      } else if (error.code === 'auth/weak-password') {
        Alert.alert('Contraseña débil', 'La contraseña debe tener al menos 6 caracteres.');
      } else {
        Alert.alert('Error al registrar', 'Firebase: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <ScrollView
        bounces={false}
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.logoRow}>
          <Text style={styles.logo}>𝕏</Text>
        </View>

        <Text style={styles.title}>Create your account</Text>

        <View style={styles.formCard}>
          <TextInput
            style={styles.input}
            placeholder="Name"
            placeholderTextColor={colors.textLight}
            value={fullname}
            onChangeText={setFullname}
          />

          <TextInput
            style={styles.input}
            placeholder="Username"
            placeholderTextColor={colors.textLight}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />

          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={colors.textLight}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor={colors.textLight}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity
            style={[
              styles.primaryButton,
              (!fullname || !username || !email || !password) && styles.primaryButtonDisabled,
            ]}
            onPress={handleRegister}
            disabled={!fullname || !username || !email || !password || loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.background} />
            ) : (
              <Text style={styles.primaryButtonText}>Next</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.footerPrompt}>
          <Text style={styles.footerText}>Already have an account?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.footerLink}>Sign in</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// 🎨 Mantiene tus estilos originales
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl },
  logoRow: { alignItems: 'center', marginTop: spacing.xl, marginBottom: spacing.lg },
  logo: { fontSize: 46, fontWeight: '900', color: colors.text },
  title: {
    fontSize: typography.title + 2,
    fontWeight: '800',
    color: colors.text,
    marginBottom: spacing.xl,
  },
  formCard: {
    backgroundColor: colors.elevated,
    borderRadius: radii.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
  },
  input: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + spacing.xs,
    fontSize: typography.body,
    color: colors.text,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: radii.pill,
    paddingVertical: spacing.sm + spacing.xs,
    alignItems: 'center',
  },
  primaryButtonText: { color: colors.background, fontSize: typography.subtitle, fontWeight: '700' },
  primaryButtonDisabled: { backgroundColor: colors.accent },
  footerPrompt: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.lg,
  },
  footerText: { color: colors.textLight, fontSize: typography.caption },
  footerLink: { color: colors.primary, fontSize: typography.caption, fontWeight: '700' },
});
