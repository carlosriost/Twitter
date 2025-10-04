import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import {fetchFollowers, fetchFollowing, followUser, unfollowUser} from '../services/social';

const initialState = {
  followers: [],
  following: [],
  status: 'idle',
};

export const followThunk = createAsyncThunk(
  'social/follow',
  async ({currentUid, targetUid}) => {
    await followUser(currentUid, targetUid);
    return {currentUid, targetUid};
  },
);

export const unfollowThunk = createAsyncThunk(
  'social/unfollow',
  async ({currentUid, targetUid}) => {
    await unfollowUser(currentUid, targetUid);
    return {currentUid, targetUid};
  },
);

export const loadFollowersThunk = createAsyncThunk(
  'social/loadFollowers',
  async uid => fetchFollowers(uid),
);

export const loadFollowingThunk = createAsyncThunk(
  'social/loadFollowing',
  async uid => fetchFollowing(uid),
);

const socialSlice = createSlice({
  name: 'social',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(loadFollowersThunk.pending, state => {
        state.status = 'loading';
      })
      .addCase(loadFollowersThunk.fulfilled, (state, action) => {
        state.followers = action.payload;
        state.status = 'idle';
      })
      .addCase(loadFollowersThunk.rejected, (state, action) => {
        state.status = 'error';
        state.error = action.error.message;
      })
      .addCase(loadFollowingThunk.pending, state => {
        state.status = 'loading';
      })
      .addCase(loadFollowingThunk.fulfilled, (state, action) => {
        state.following = action.payload;
        state.status = 'idle';
      })
      .addCase(loadFollowingThunk.rejected, (state, action) => {
        state.status = 'error';
        state.error = action.error.message;
      });
  },
});

export default socialSlice.reducer;
