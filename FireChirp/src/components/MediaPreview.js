import React from 'react';
import {Image, StyleSheet, View} from 'react-native';
import Video from 'react-native-video';
import {palette} from '../theme/colors';

const MediaPreview = ({media}) => {
  if (!media) {
    return null;
  }
  if (media.type === 'video') {
    return (
      <View style={styles.videoContainer}>
        <Video source={{uri: media.downloadURL}} style={styles.video} muted resizeMode="cover" repeat />
      </View>
    );
  }
  return <Image source={{uri: media.downloadURL}} style={styles.image} />;
};

const styles = StyleSheet.create({
  videoContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: palette.muted,
    height: 220,
  },
  video: {
    width: '100%',
    height: '100%',
  },
  image: {
    borderRadius: 16,
    width: '100%',
    height: 220,
    backgroundColor: palette.muted,
  },
});

export default MediaPreview;
