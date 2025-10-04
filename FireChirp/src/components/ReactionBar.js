import React from 'react';
import {StyleSheet, View} from 'react-native';
import {Button, Text} from 'react-native-paper';
import {palette} from '../theme/colors';

const REACTION_EMOJIS = ['🔥', '👏', '💜', '😂', '😮'];

const ReactionBar = ({reactions, onReact, onRetweet}) => {
  return (
    <View style={styles.container}>
      {REACTION_EMOJIS.map(emoji => (
        <Button
          key={emoji}
          mode="text"
          compact
          onPress={() => onReact(emoji)}
          textColor={palette.secondary}>
          {emoji} {reactions?.[emoji] ?? 0}
        </Button>
      ))}
      <Button
        mode="text"
        compact
        icon="autorenew"
        textColor={palette.primary}
        onPress={onRetweet}>
        <Text style={styles.retweetText}>ReChirp</Text>
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  retweetText: {
    fontWeight: '600',
  },
});

export default ReactionBar;
