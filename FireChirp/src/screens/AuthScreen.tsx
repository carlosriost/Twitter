import React, {useMemo, useState} from 'react';
import {KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View} from 'react-native';
import {Button, HelperText, Text, TextInput} from 'react-native-paper';
import {palette} from '../theme/colors';
import {useAppDispatch, useAppSelector} from '../hooks';
import {signInThunk, signUpThunk} from '../store/authSlice';
import Logo from '../../assets/logo.svg';

const AuthScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const {status, error} = useAppSelector(state => state.auth);
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [handle, setHandle] = useState('');

  const isLoading = status === 'loading';
  const isRegister = mode === 'register';
  const disabled = useMemo(() => {
    if (mode === 'login') {
      return !email || !password;
    }
    return !email || !password || !displayName || !handle;
  }, [email, password, displayName, handle, mode]);

  const onSubmit = () => {
    if (mode === 'login') {
      dispatch(signInThunk({email, password}));
    } else {
      dispatch(signUpThunk({email, password, displayName, handle}));
    }
  };

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.logoContainer}>
          <Logo width={120} height={120} />
          <Text variant="headlineMedium" style={styles.title}>
            Bienvenido a FireChirp
          </Text>
          <Text style={styles.subtitle}>Tu comunidad ligera para microblogging cálido.</Text>
        </View>
        <View style={styles.form}>
          <TextInput
            label="Correo"
            mode="outlined"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
          />
          <TextInput
            label="Contraseña"
            mode="outlined"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={styles.input}
          />
          {isRegister && (
            <>
              <TextInput
                label="Nombre"
                mode="outlined"
                value={displayName}
                onChangeText={setDisplayName}
                style={styles.input}
              />
              <TextInput
                label="Usuario (@)"
                mode="outlined"
                value={handle}
                onChangeText={setHandle}
                style={styles.input}
                autoCapitalize="none"
              />
            </>
          )}
          {error ? <HelperText type="error">{error}</HelperText> : null}
          <Button
            mode="contained"
            onPress={onSubmit}
            loading={isLoading}
            disabled={disabled}
            style={styles.submit}>
            {mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
          </Button>
          <Button
            mode="text"
            onPress={() => setMode(isRegister ? 'login' : 'register')}>
            {isRegister ? '¿Ya tienes cuenta? Inicia sesión' : '¿Nuevo? Regístrate aquí'}
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: palette.background,
  },
  scroll: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    color: palette.primary,
    marginBottom: 6,
  },
  subtitle: {
    color: palette.text,
    textAlign: 'center',
  },
  form: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: palette.card,
    padding: 24,
    borderRadius: 24,
    elevation: 2,
  },
  input: {
    marginBottom: 12,
  },
  submit: {
    marginTop: 8,
    marginBottom: 12,
  },
});

export default AuthScreen;
