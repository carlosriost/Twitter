import React, {useEffect, useState} from 'react';
import {FlatList, StyleSheet, View} from 'react-native';
import {Button, List, Text} from 'react-native-paper';
import Avatar from '../components/Avatar';
import {useAppDispatch, useAppSelector} from '../hooks';
import {loadFollowersThunk, loadFollowingThunk} from '../store/socialSlice';
import {palette} from '../theme/colors';

const FollowersScreen = () => {
  const dispatch = useAppDispatch();
  const profile = useAppSelector(state => state.auth.profile);
  const {followers, following} = useAppSelector(state => state.social);
  const [tab, setTab] = useState('followers');

  useEffect(() => {
    if (!profile) {
      return;
    }
    dispatch(loadFollowersThunk(profile.uid));
    dispatch(loadFollowingThunk(profile.uid));
  }, [dispatch, profile]);

  const data = tab === 'followers' ? followers : following;

  return (
    <View style={styles.container}>
      <View style={styles.tabs}>
        <Button
          mode={tab === 'followers' ? 'contained' : 'outlined'}
          onPress={() => setTab('followers')}>
          Seguidores
        </Button>
        <Button
          mode={tab === 'following' ? 'contained' : 'outlined'}
          onPress={() => setTab('following')}>
          Siguiendo
        </Button>
      </View>
      <FlatList
        data={data}
        keyExtractor={item => item.uid}
        renderItem={({item}) => (
          <List.Item
            title={item.displayName}
            description={`${item.handle} • ${item.followersCount} seguidores`}
            left={() => <Avatar label={item.displayName} uri={item.photoURL} />}
          />
        )}
        ListEmptyComponent={() => (
          <Text style={styles.empty}>No hay usuarios en esta lista todavía.</Text>
        )}
        contentContainerStyle={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.background,
  },
  tabs: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
  },
  list: {
    paddingHorizontal: 8,
  },
  empty: {
    textAlign: 'center',
    marginTop: 32,
    color: palette.muted,
  },
});

export default FollowersScreen;
