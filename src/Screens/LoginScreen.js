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

} from 'react-native';
import { colors, spacing, radii, typography } from '../Styles/theme';
import { loginUser } from '../Services/authService';
import { getUserProfile } from '../Services/userService';
import { profileStore } from '../Services/profileStore';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);



const handleLogin = async () => {
  if (!email || !password) {
    alert("Por favor, completa ambos campos.");
    return;
  }

  setLoading(true);
  try {
    const user = await loginUser(email, password);
    const profile = await getUserProfile(user.uid);

    console.log("✅ Sesión iniciada. Perfil del usuario:", profile);
    if (profile) {
      profileStore.setProfile({ uid: user.uid, ...profile });
    } else {
      profileStore.setProfile({ uid: user.uid });
    }

    navigation.navigate("Home", {
      uid: user.uid,
      username: profile?.username || "user",
      fullname: profile?.fullname || "Usuario",
    });
  } catch (error) {
    console.error("❌ Error al iniciar sesión:", error);

    // 🧩 Manejo específico de errores de Firebase
    if (error.code === "auth/invalid-email") {
      alert("El correo ingresado no es válido.");
    } else if (error.code === "auth/user-not-found") {
      alert("No existe una cuenta con este correo.");
    } else if (error.code === "auth/wrong-password") {
      alert("La contraseña es incorrecta.");
    } else if (error.code === "auth/email-already-in-use") {
      alert("Este correo ya está registrado. Por favor inicia sesión.");
    } else {
      alert("Error al iniciar sesión: " + error.message);
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

        <Text style={styles.title}>Sign in to X</Text>

        <View style={styles.formCard}>
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
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity style={styles.forgotButton}>
            <Text style={styles.forgotText}>Forgot password?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.primaryButton, (!email || !password) && styles.primaryButtonDisabled]}
            onPress={handleLogin}
            disabled={!email || !password || loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.background} />
            ) : (
              <Text style={styles.primaryButtonText}>Sign in</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.footerPrompt}>
          <Text style={styles.footerText}>Don’t have an account?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.footerLink}>Sign up</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

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
  forgotButton: { alignSelf: 'flex-start' },
  forgotText: { color: colors.primary, fontWeight: '600', fontSize: typography.caption },
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
