import React from 'react';
import {Image, StyleSheet, Text, View} from 'react-native';
import {palette} from '../theme/colors';

interface AvatarProps {
  size?: number;
  uri?: string | null;
  label: string;
}

const Avatar: React.FC<AvatarProps> = ({size = 40, uri, label}) => {
  const initials = label
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase();
  return uri ? (
    <Image source={{uri}} style={[styles.image, {width: size, height: size}]} />
  ) : (
    <View style={[styles.placeholder, {width: size, height: size, borderRadius: size / 2}]}> 
      <Text style={styles.placeholderText}>{initials}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  image: {
    borderRadius: 999,
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.primary,
  },
  placeholderText: {
    color: '#fff',
    fontWeight: '700',
  },
});

export default Avatar;
