import {createAsyncThunk, createSlice, PayloadAction} from '@reduxjs/toolkit';
import {createPost, deletePost, retweetPost, toggleReaction} from '../services/posts';
import {Post, ReactionPayload, TimelineEntry} from '../types';

interface CreatePostPayload {
  authorId: string;
  authorHandle: string;
  authorDisplayName: string;
  authorPhotoURL?: string;
  text: string;
  media?: Post['media'];
  mediaFileUri?: string | null;
  retweetParentId?: string | null;
}

interface PostsState {
  timeline: TimelineEntry[];
  status: 'idle' | 'loading' | 'error';
  createStatus: 'idle' | 'loading' | 'error';
  error?: string;
}

const initialState: PostsState = {
  timeline: [],
  status: 'idle',
  createStatus: 'idle',
};

export const createPostThunk = createAsyncThunk(
  'posts/create',
  async (payload: CreatePostPayload) => {
    const id = await createPost({
      ...payload,
      media: payload.media ?? null,
    });
    return id;
  },
);

export const toggleReactionThunk = createAsyncThunk(
  'posts/toggleReaction',
  async ({payload, userId}: {payload: ReactionPayload; userId: string}) => {
    await toggleReaction(payload, userId);
    return payload;
  },
);

export const retweetThunk = createAsyncThunk(
  'posts/retweet',
  async ({
    postId,
    userId,
    displayName,
    handle,
    photoURL,
  }: {
    postId: string;
    userId: string;
    displayName: string;
    handle: string;
    photoURL?: string;
  }) => {
    await retweetPost(postId, {uid: userId, displayName, handle, photoURL});
    return {postId, userId};
  },
);

export const deletePostThunk = createAsyncThunk(
  'posts/delete',
  async (postId: string) => {
    await deletePost(postId);
    return postId;
  },
);

const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    setTimeline(state, action: PayloadAction<TimelineEntry[]>) {
      state.timeline = action.payload;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(createPostThunk.pending, state => {
        state.createStatus = 'loading';
        state.error = undefined;
      })
      .addCase(createPostThunk.fulfilled, state => {
        state.createStatus = 'idle';
      })
      .addCase(createPostThunk.rejected, (state, action) => {
        state.createStatus = 'error';
        state.error = action.error.message;
      })
      .addCase(toggleReactionThunk.rejected, (state, action) => {
        state.error = action.error.message;
      })
      .addCase(retweetThunk.rejected, (state, action) => {
        state.error = action.error.message;
      })
      .addCase(deletePostThunk.rejected, (state, action) => {
        state.error = action.error.message;
      });
  },
});

export const {setTimeline} = postsSlice.actions;
export default postsSlice.reducer;
