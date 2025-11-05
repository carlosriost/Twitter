import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  StatusBar,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { colors } from '../Styles/theme';
import styles from '../Styles/RegisterScreen.styles';
import { auth } from '../Config/firebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { createUserProfile } from '../Services/userService';
import Tap from '../Components/Tap';

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
      //Crear usuario en Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log('Usuario creado:', user.uid);

      //Crear perfil en Firestore
      await createUserProfile(user.uid, username, fullname, email);

      Alert.alert('Registro exitoso', 'Tu cuenta fue creada correctamente.');
      navigation.navigate('Login');
    } catch (error) {
      console.error('Error al registrar:', error.message);
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
          <Text style={styles.logo}>∃ꊼ∃ꊼ</Text>
        </View>

        <Text style={styles.title}>
          Create your <Text style={styles.brand}>∃ꊼ∃ꊼ</Text> account
        </Text>

        <View style={styles.formCard}>
          <TextInput
            style={styles.input}
            placeholder="Name"
            placeholderTextColor={colors.textLight}
            value={fullname}
            onChangeText={setFullname}
            returnKeyType="next"
          />

          <TextInput
            style={styles.input}
            placeholder="Username"
            placeholderTextColor={colors.textLight}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            returnKeyType="next"
          />

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
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            returnKeyType="done"
            onSubmitEditing={handleRegister}
          />

        <Tap
        style={styles.primaryButton}
        onPress={handleRegister}
        disabled={loading}
        accessibilityRole="button"
        >
        {loading ? (
         <ActivityIndicator color={colors.onPrimary} />
       ) : (
         <Text style={styles.primaryButtonText}>Next</Text>
       )}
        </Tap>
        </View>

        <View style={styles.footerPrompt}>
          <Text style={styles.footerText}>Already have an account?</Text>
          <Tap onPress={() => navigation.navigate('Login')}>
            <Text style={styles.footerLink}>Sign in</Text>
          </Tap>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}