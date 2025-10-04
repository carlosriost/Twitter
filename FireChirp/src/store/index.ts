import {configureStore} from '@reduxjs/toolkit';
import authReducer from './authSlice';
import postsReducer from './postsSlice';
import socialReducer from './socialSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    posts: postsReducer,
    social: socialReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
