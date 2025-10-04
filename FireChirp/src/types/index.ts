export type MediaType = 'image' | 'video' | null;

export interface MediaAttachment {
  type: MediaType;
  downloadURL: string;
  storagePath: string;
  duration?: number;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  handle: string;
  photoURL?: string;
  bio?: string;
  followersCount: number;
  followingCount: number;
  createdAt: number;
}

export interface Post {
  id: string;
  authorId: string;
  authorHandle: string;
  authorDisplayName: string;
  authorPhotoURL?: string;
  text: string;
  media?: MediaAttachment | null;
  reactions: Record<string, number>;
  userReactions?: Record<string, string>;
  retweetParentId?: string | null;
  retweetedBy?: string;
  retweetedByHandle?: string;
  retweetCount: number;
  commentCount: number;
  createdAt: number;
}

export interface TimelineEntry extends Post {
  isRetweet?: boolean;
  retweetedBy?: string;
}

export interface ReactionPayload {
  postId: string;
  reaction: string;
}
