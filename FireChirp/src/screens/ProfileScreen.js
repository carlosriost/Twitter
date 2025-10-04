import React, {useState} from 'react';
import {ScrollView, StyleSheet, View} from 'react-native';
import {Button, Text, TextInput} from 'react-native-paper';
import Avatar from '../components/Avatar';
import {useAppDispatch, useAppSelector} from '../hooks';
import {signOutThunk, updateProfileThunk} from '../store/authSlice';
import {palette} from '../theme/colors';

const ProfileScreen = () => {
  const dispatch = useAppDispatch();
  const profile = useAppSelector(state => state.auth.profile);
  const [bio, setBio] = useState(profile?.bio ?? '');

  if (!profile) {
    return null;
  }

  const handleSave = () => {
    if (!profile) {
      return;
    }
    dispatch(updateProfileThunk({uid: profile.uid, data: {bio}}));
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Avatar size={72} uri={profile.photoURL} label={profile.displayName} />
        <Text variant="headlineSmall" style={styles.name}>
          {profile.displayName}
        </Text>
        <Text style={styles.handle}>{profile.handle}</Text>
      </View>
      <View style={styles.metrics}>
        <View style={styles.metric}>
          <Text style={styles.metricValue}>{profile.followersCount}</Text>
          <Text style={styles.metricLabel}>Seguidores</Text>
        </View>
        <View style={styles.metric}>
          <Text style={styles.metricValue}>{profile.followingCount}</Text>
          <Text style={styles.metricLabel}>Siguiendo</Text>
        </View>
      </View>
      <TextInput
        label="Biografía"
        mode="outlined"
        value={bio}
        onChangeText={setBio}
        multiline
        numberOfLines={4}
        style={styles.bio}
      />
      <Button mode="contained" onPress={handleSave} style={styles.button}>
        Guardar cambios
      </Button>
      <Button mode="outlined" onPress={() => dispatch(signOutThunk())}>
        Cerrar sesión
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: palette.background,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  name: {
    marginTop: 16,
    color: palette.text,
  },
  handle: {
    color: palette.secondary,
  },
  metrics: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
  },
  metric: {
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '700',
    color: palette.primary,
  },
  metricLabel: {
    color: palette.text,
  },
  bio: {
    marginBottom: 16,
  },
  button: {
    marginBottom: 12,
  },
});

export default ProfileScreen;
