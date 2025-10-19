import React from 'react';
import { View, Text, FlatList, Button, StyleSheet } from 'react-native';
import { colors } from '../Styles/theme';

const mockFollowers = [
  { id: '1', name: 'John Doe' },
  { id: '2', name: 'Jane Smith' },
  { id: '3', name: 'Alex Turner' },
];

export default function FollowersScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Followers</Text>
      <FlatList
        data={mockFollowers}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text>{item.name}</Text>
            <Button title="Follow" onPress={() => alert(`Followed ${item.name}`)} />
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: colors.background },
  title: { fontSize: 22, marginBottom: 15, color: colors.text },
  item: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
});
