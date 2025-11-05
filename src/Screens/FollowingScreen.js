import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { colors } from '../Styles/theme';
import styles from '../Styles/FollowingScreen.styles';
import { getFollowing } from '../Services/tweetService';

export default function FollowingScreen({ route, navigation }) {
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);

  const username = route.params?.username || 'carletto';

  useEffect(() => {
    const fetchFollowing = async () => {
      try {
        const data = await getFollowing(username);
        setFollowing(data);
      } catch (error) {
        console.error('Error al obtener los seguidos:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchFollowing();
  }, [username]);

  const renderFollowing = ({ item }) => {
    if (!item) return null;
    const display = String(item).trim();

    return (
      <View style={styles.row}>
        <View style={styles.avatar}>
          <Text style={styles.avatarInitial}>{display[0]?.toUpperCase() || 'U'}</Text>
        </View>

        <View style={styles.info}>
          <Text style={styles.name}>{display}</Text>
          <Text style={styles.username}>@{display}</Text>
          <Text style={styles.bio}>You follow each other</Text>
        </View>

        <TouchableOpacity style={styles.followingButton}>
          <Text style={styles.followingText}>Following</Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading)
    return (
      <SafeAreaView style={styles.safeArea}>
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
      </SafeAreaView>
    );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Following</Text>
          <Text style={styles.headerSubtitle}>@{username}</Text>
        </View>
      </View>

      {/* Segmento superior */}
      <View style={styles.segment}>
        <TouchableOpacity
          style={styles.segmentItem}
          onPress={() => navigation.navigate('Followers', { username })}
        >
          <Text style={styles.segmentLabel}>Followers</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.segmentItem, styles.segmentActive]}>
          <Text style={[styles.segmentLabel, styles.segmentLabelActive]}>Following</Text>
        </TouchableOpacity>
      </View>

      {/* Lista */}
      <FlatList
        data={following}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderFollowing}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}
