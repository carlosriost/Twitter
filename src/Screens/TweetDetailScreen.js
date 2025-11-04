import React, { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, StatusBar, ActivityIndicator, View, Text } from 'react-native';
import { colors, typography } from '../Styles/theme';
import TweetCard from '../Components/TweetCard';
import { getTweetById } from '../Services/tweetService';

export default function TweetDetailScreen({ route }) {
  const { tweetId, tweet: initialTweet } = route.params || {};
  const [tweet, setTweet] = useState(initialTweet || null);
  const [loading, setLoading] = useState(!initialTweet && !!tweetId);

  useEffect(() => {
    let isMounted = true;
    const loadTweet = async () => {
      if (initialTweet || !tweetId) {
        return;
      }
      try {
        setLoading(true);
        const fetched = await getTweetById(tweetId);
        if (isMounted) {
          setTweet(fetched);
        }
      } catch (error) {
        console.error('Error loading tweet detail:', error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadTweet();
    return () => {
      isMounted = false;
    };
  }, [tweetId, initialTweet]);

  const showContent = !loading && tweet;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      {loading && (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}
      {!loading && !tweet && (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>Tweet not found</Text>
        </View>
      )}
      {showContent && <TweetCard tweet={tweet} showActions={false} />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: colors.textLight,
    fontSize: typography.subtitle,
  },
});