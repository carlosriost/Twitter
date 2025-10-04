import React, {useState} from 'react';
import {ScrollView, StyleSheet, View} from 'react-native';
import {Button, HelperText, Text, TextInput} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';
import {launchImageLibrary} from 'react-native-image-picker';
import MediaPreview from '../components/MediaPreview';
import {useAppDispatch, useAppSelector} from '../hooks';
import {createPostThunk} from '../store/postsSlice';
import {palette} from '../theme/colors';
import {MediaAttachment} from '../types';

const CreatePostModal: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const profile = useAppSelector(state => state.auth.profile);
  const {createStatus, error} = useAppSelector(state => state.posts);
  const [text, setText] = useState('');
  const [media, setMedia] = useState<MediaAttachment | null>(null);
  const [localUri, setLocalUri] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  if (!profile) {
    return null;
  }

  const pickMedia = async () => {
    const result = await launchImageLibrary({
      mediaType: 'mixed',
      quality: 0.8,
      videoQuality: 'high',
      durationLimit: 10,
      selectionLimit: 1,
    });
    if (result.didCancel) {
      return;
    }
    const asset = result.assets?.[0];
    if (!asset) {
      return;
    }
    if (asset.duration && asset.duration > 10) {
      setLocalError('El video debe durar menos de 10 segundos.');
      return;
    }
    setLocalError(null);
    const type = asset.type?.startsWith('video') ? 'video' : 'image';
    setMedia({
      type,
      downloadURL: asset.uri ?? '',
      storagePath: '',
      duration: asset.duration ?? undefined,
    });
    setLocalUri(asset.uri ?? null);
  };

  const clearMedia = () => {
    setMedia(null);
    setLocalUri(null);
  };

  const handleSubmit = async () => {
    if (!text.trim()) {
      setLocalError('La publicación debe contener texto.');
      return;
    }
    await dispatch(
      createPostThunk({
        authorId: profile.uid,
        authorHandle: profile.handle,
        authorDisplayName: profile.displayName,
        authorPhotoURL: profile.photoURL,
        text: text.trim(),
        media,
        mediaFileUri: localUri,
      }),
    );
    navigation.goBack();
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text variant="titleLarge" style={styles.title}>
        Comparte algo con la bandada
      </Text>
      <TextInput
        label="¿Qué está pasando?"
        value={text}
        onChangeText={setText}
        multiline
        mode="outlined"
        style={styles.input}
      />
      {media ? (
        <View style={styles.preview}>
          <MediaPreview media={media} />
          <Button onPress={clearMedia} style={styles.remove}>
            Quitar adjunto
          </Button>
        </View>
      ) : null}
      <View style={styles.actions}>
        <Button mode="outlined" onPress={pickMedia}>
          Adjuntar imagen o video
        </Button>
        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={createStatus === 'loading'}
          disabled={createStatus === 'loading'}>
          Publicar
        </Button>
      </View>
      {localError ? <HelperText type="error">{localError}</HelperText> : null}
      {error ? <HelperText type="error">{error}</HelperText> : null}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: palette.background,
    flexGrow: 1,
  },
  title: {
    marginBottom: 16,
    color: palette.primary,
  },
  input: {
    minHeight: 120,
    marginBottom: 16,
  },
  preview: {
    marginBottom: 16,
  },
  remove: {
    marginTop: 8,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
});

export default CreatePostModal;
