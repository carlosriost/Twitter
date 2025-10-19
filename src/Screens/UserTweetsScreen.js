import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { colors } from '../Styles/theme';

const mockTweets = [
  { id: '1', user: 'John Doe', username: 'johndoe', date: '2025-10-19', message: 'Hello from Twitter Clone!' },
  { id: '2', user: 'John Doe', username: 'johndoe', date: '2025-10-18', message: 'Working on my new app!' },
];

export default function UserTweetsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>John Doe's Tweets</Text>
      <FlatList
        data={mockTweets}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.tweet}>
            <Text style={styles.header}>{item.user}, @{item.username} - {item.date}</Text>
            <Text style={styles.message}>{item.message}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: colors.background },
  title: { fontSize: 22, marginBottom: 15, color: colors.text },
  tweet: { borderBottomWidth: 1, borderColor: '#ccc', paddingVertical: 10 },
  header: { fontWeight: 'bold', color: colors.accent },
  message: { marginTop: 5, color: colors.text },
});
