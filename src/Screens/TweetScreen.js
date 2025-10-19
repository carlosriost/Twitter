import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { colors } from '../Styles/theme';

export default function TweetScreen({ navigation }) {
  const [tweet, setTweet] = useState('');

  const handlePost = () => {
    alert('Tweet posted!');
    setTweet('');
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Compose a Tweet</Text>
      <TextInput
        style={styles.textarea}
        placeholder="What's happening?"
        multiline
        maxLength={280}
        value={tweet}
        onChangeText={setTweet}
      />
      <Button title="Publish" onPress={handlePost} color={colors.accent} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: colors.background },
  title: { fontSize: 22, marginBottom: 15, color: colors.text },
  textarea: { height: 150, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginBottom: 15 },
});
