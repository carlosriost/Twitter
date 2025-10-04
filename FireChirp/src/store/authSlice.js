import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import auth from '@react-native-firebase/auth';
import {
  fetchUserProfile,
  registerWithEmail,
  signInWithEmail,
  signOut,
  updateProfileDocument,
} from '../services/auth';

const initialState = {
  status: 'idle',
  profile: null,
};

export const signInThunk = createAsyncThunk('auth/signIn', async ({email, password}) => {
  await signInWithEmail(email, password);
  const user = auth().currentUser;
  if (!user) {
    throw new Error('No se pudo iniciar sesión');
  }
  const profile = await fetchUserProfile(user.uid);
  return profile;
});

export const signUpThunk = createAsyncThunk(
  'auth/signUp',
  async ({email, password, displayName, handle}) => {
    const profile = await registerWithEmail(email, password, displayName, handle);
    return profile;
  },
);

export const loadProfileThunk = createAsyncThunk('auth/loadProfile', async uid => {
  const profile = await fetchUserProfile(uid);
  return profile;
});

export const updateProfileThunk = createAsyncThunk('auth/updateProfile', async ({uid, data}) => {
  await updateProfileDocument(uid, data);
  const updated = await fetchUserProfile(uid);
  return updated;
});

export const signOutThunk = createAsyncThunk('auth/signOut', async () => {
  await signOut();
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setProfile(state, action) {
      state.profile = action.payload;
      state.status = 'idle';
      state.error = undefined;
    },
    clearAuth(state) {
      state.profile = null;
      state.status = 'idle';
    },
  },
  extraReducers: builder => {
    builder
      .addCase(signInThunk.pending, state => {
        state.status = 'loading';
        state.error = undefined;
      })
      .addCase(signInThunk.fulfilled, (state, action) => {
        state.status = 'idle';
        state.profile = action.payload ?? null;
      })
      .addCase(signInThunk.rejected, (state, action) => {
        state.status = 'error';
        state.error = action.error.message;
      })
      .addCase(signUpThunk.pending, state => {
        state.status = 'loading';
        state.error = undefined;
      })
      .addCase(signUpThunk.fulfilled, (state, action) => {
        state.status = 'idle';
        state.profile = action.payload ?? null;
      })
      .addCase(signUpThunk.rejected, (state, action) => {
        state.status = 'error';
        state.error = action.error.message;
      })
      .addCase(signOutThunk.fulfilled, state => {
        state.profile = null;
        state.status = 'idle';
      })
      .addCase(loadProfileThunk.fulfilled, (state, action) => {
        state.profile = action.payload ?? state.profile;
      })
      .addCase(updateProfileThunk.fulfilled, (state, action) => {
        state.profile = action.payload ?? state.profile;
      });
  },
});

export const {setProfile, clearAuth} = authSlice.actions;
export default authSlice.reducer;
