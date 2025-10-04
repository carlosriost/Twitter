import React from 'react';
import {StyleSheet, TouchableOpacity} from 'react-native';
import {Card, Text} from 'react-native-paper';
import {palette} from '../theme/colors';
import {TimelineEntry} from '../types';
import Avatar from './Avatar';
import MediaPreview from './MediaPreview';
import ReactionBar from './ReactionBar';

interface PostCardProps {
  post: TimelineEntry;
  onReaction: (reaction: string) => void;
  onRetweet: () => void;
  onPress?: () => void;
}

const PostCard: React.FC<PostCardProps> = ({post, onReaction, onRetweet, onPress}) => {
  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress}>
      <Card style={styles.card}>
        <Card.Title
          title={post.authorDisplayName}
          subtitle={`${post.authorHandle} • ${new Date(post.createdAt).toLocaleString()}`}
          left={() => <Avatar uri={post.authorPhotoURL} label={post.authorDisplayName} />}
        />
        {post.retweetParentId ? (
          <Text style={styles.retweeted}>ReChirp de {post.retweetedBy ?? 'otro usuario'}</Text>
        ) : null}
        <Card.Content>
          <Text style={styles.text}>{post.text}</Text>
          <MediaPreview media={post.media} />
        </Card.Content>
        <Card.Content>
          <ReactionBar
            reactions={post.reactions ?? {}}
            onReact={onReaction}
            onRetweet={onRetweet}
          />
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    backgroundColor: palette.card,
    borderRadius: 24,
  },
  retweeted: {
    marginHorizontal: 16,
    marginBottom: 8,
    color: palette.secondary,
    fontSize: 12,
  },
  text: {
    fontSize: 16,
    color: palette.text,
    marginBottom: 12,
  },
});

export default PostCard;
