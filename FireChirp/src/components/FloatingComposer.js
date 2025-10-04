import React from 'react';
import {StyleSheet} from 'react-native';
import {FAB} from 'react-native-paper';
import {palette} from '../theme/colors';

const FloatingComposer = ({onPress}) => {
  return <FAB icon="feather" style={styles.fab} onPress={onPress} color="#fff" />;
};

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: palette.primary,
  },
});

export default FloatingComposer;
