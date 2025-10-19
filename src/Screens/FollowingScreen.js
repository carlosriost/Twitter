import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { colors } from '../Styles/theme';

const mockFollowing = [
  { id: '1', name: 'Elena Martinez' },
  { id: '2', name: 'Carlos Gomez' },
];

export default function FollowingScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Following</Text>
      <FlatList
        data={mockFollowing}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <Text style={styles.item}>{item.name}</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: colors.background },
  title: { fontSize: 22, marginBottom: 15, color: colors.text },
  item: { paddingVertical: 8, fontSize: 16 },
});
