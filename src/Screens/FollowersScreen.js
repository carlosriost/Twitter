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
import styles from '../Styles/FollowersScreen.styles';
import { getFollowers } from '../Services/tweetService'; // 🔹 Importa el servicio de Firestore

export default function FollowersScreen({ route, navigation }) {
  const [followers, setFollowers] = useState([]);
  const [loading, setLoading] = useState(true);

  const username = route.params?.username || 'carletto'; // usuario actual

  useEffect(() => {
    const fetchFollowers = async () => {
      try {
        const data = await getFollowers(username);
        setFollowers(data);
      } catch (error) {
        console.error('Error al obtener seguidores:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchFollowers();
  }, [username]);

  const renderFollower = ({ item }) => {
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
          <View style={styles.badgeRow}>
            <View style={styles.badgePill}>
              <Text style={styles.badgeText}>Follows you</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.followButton}>
          <Text style={styles.followText}>Follow</Text>
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
          <Text style={styles.headerTitle}>Followers</Text>
          <Text style={styles.headerSubtitle}>@{username}</Text>
        </View>
      </View>

      {/* Segmento superior */}
      <View style={styles.segment}>
        <TouchableOpacity style={[styles.segmentItem, styles.segmentActive]}>
          <Text style={[styles.segmentLabel, styles.segmentLabelActive]}>Followers</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.segmentItem}
          onPress={() => navigation.navigate('Following', { username })}
        >
          <Text style={styles.segmentLabel}>Following</Text>
        </TouchableOpacity>
      </View>

      {/* Lista de seguidores */}
      <FlatList
        data={followers}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderFollower}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}