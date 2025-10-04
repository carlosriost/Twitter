import React, {useEffect} from 'react';
import {FlatList, RefreshControl, StyleSheet, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {Text} from 'react-native-paper';
import FloatingComposer from '../components/FloatingComposer';
import PostCard from '../components/PostCard';
import {useAppDispatch, useAppSelector} from '../hooks';
import {listenTimeline} from '../services/posts';
import {setTimeline, toggleReactionThunk, retweetThunk} from '../store/postsSlice';
import {palette} from '../theme/colors';

const FeedScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const profile = useAppSelector(state => state.auth.profile);
  const {timeline, createStatus} = useAppSelector(state => state.posts);

  useEffect(() => {
    if (!profile) {
      return;
    }
    const unsubscribe = listenTimeline(posts => {
      dispatch(setTimeline(posts));
    }, profile.uid);
    return () => unsubscribe();
  }, [dispatch, profile]);

  const handleReaction = (postId: string, emoji: string) => {
    if (!profile) {
      return;
    }
    dispatch(toggleReactionThunk({payload: {postId, reaction: emoji}, userId: profile.uid}));
  };

  const handleRetweet = (postId: string) => {
    if (!profile) {
      return;
    }
    dispatch(
      retweetThunk({
        postId,
        userId: profile.uid,
        displayName: profile.displayName,
        handle: profile.handle,
        photoURL: profile.photoURL,
      }),
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={timeline}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={createStatus === 'loading'} onRefresh={() => {}} />}
        renderItem={({item}) => (
          <PostCard
            post={item}
            onReaction={emoji => handleReaction(item.id, emoji)}
            onRetweet={() => handleRetweet(item.id)}
          />
        )}
        ListEmptyComponent={() => (
          <Text style={styles.empty}>Todavía no hay publicaciones. ¡Crea la primera!</Text>
        )}
      />
      <FloatingComposer onPress={() => navigation.navigate('CreatePost' as never)} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.background,
  },
  listContent: {
    padding: 16,
  },
  empty: {
    textAlign: 'center',
    marginTop: 48,
    color: palette.muted,
  },
});

export default FeedScreen;
