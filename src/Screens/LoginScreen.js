import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { colors } from '../Styles/theme';
import styles from '../Styles/LoginScreen.styles';
import { loginUser } from '../Services/authService';
import { getUserProfile } from '../Services/userService';
import { profileStore } from '../Services/profileStore';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      alert('Por favor, completa ambos campos.');
      return;
    }

    setLoading(true);
    try {
      const user = await loginUser(email, password);
      const profile = await getUserProfile(user.uid);

      console.log('✅ Sesión iniciada. Perfil del usuario:', profile);
      if (profile) {
        profileStore.setProfile({ uid: user.uid, ...profile });
      } else {
        profileStore.setProfile({ uid: user.uid });
      }

      navigation.navigate('Home', {
        uid: user.uid,
        username: profile?.username || 'user',
        fullname: profile?.fullname || 'Usuario',
      });
    } catch (error) {
      console.error('❌ Error al iniciar sesión:', error);

      if (error.code === 'auth/invalid-email') {
        alert('El correo ingresado no es válido.');
      } else if (error.code === 'auth/user-not-found') {
        alert('No existe una cuenta con este correo.');
      } else if (error.code === 'auth/wrong-password') {
        alert('La contraseña es incorrecta.');
      } else if (error.code === 'auth/email-already-in-use') {
        alert('Este correo ya está registrado. Por favor inicia sesión.');
      } else {
        alert('Error al iniciar sesión: ' + error.message);
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
          <Text style={styles.logo}>∃ꊼ∃ꊼ</Text>
        </View>

        <Text style={styles.title}>Sign in to <Text style={styles.brand}>∃ꊼ∃ꊼ</Text></Text>

        <View style={styles.formCard}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={colors.textLight}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            returnKeyType="next"
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor={colors.textLight}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            returnKeyType="done"
            onSubmitEditing={handleLogin}
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
              <ActivityIndicator color={colors.onPrimary} />
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