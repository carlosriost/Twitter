import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { colors } from '../Styles/theme';

export default function HomeScreen({ navigation, route }) {
  const username = route.params?.username || 'User';

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome @{username}</Text>
      <Button title="Create Tweet" color={colors.primary} onPress={() => navigation.navigate('Tweet')} />
      <Button title="Followers" onPress={() => navigation.navigate('Followers')} />
      <Button title="Following" onPress={() => navigation.navigate('Following')} />
      <Button title="User Tweets" onPress={() => navigation.navigate('UserTweets')} />
      <Button title="Logout" color={colors.accent} onPress={() => navigation.navigate('Login')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: colors.background },
  title: { fontSize: 24, textAlign: 'center', marginBottom: 30, color: colors.text },
});
