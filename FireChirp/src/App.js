import React, {useEffect, useState} from 'react';
import {ActivityIndicator, View} from 'react-native';
import {Provider as ReduxProvider} from 'react-redux';
import {Provider as PaperProvider} from 'react-native-paper';
import AppNavigator from './navigation/AppNavigator';
import {store} from './store';
import {useAppDispatch} from './hooks';
import {listenToAuthChanges} from './services/auth';
import {clearAuth, loadProfileThunk, setProfile} from './store/authSlice';
import {palette} from './theme/colors';
import {theme} from './theme';

const Bootstrapper = () => {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = listenToAuthChanges(async user => {
      if (user) {
        const profile = await dispatch(loadProfileThunk(user.uid)).unwrap().catch(() => null);
        if (!profile) {
          const fallbackHandle = user.email
            ? `@${user.email.split('@')[0]}`
            : '@firechirper';
          dispatch(
            setProfile({
              uid: user.uid,
              displayName: user.displayName ?? 'FireChirper',
              handle: fallbackHandle,
              followersCount: 0,
              followingCount: 0,
              createdAt: Date.now(),
              bio: '',
              photoURL: user.photoURL ?? undefined,
            }),
          );
        }
      } else {
        dispatch(clearAuth());
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [dispatch]);

  if (loading) {
    return (
      <View style={{flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.background}}>
        <ActivityIndicator color={palette.primary} size="large" />
      </View>
    );
  }

  return <AppNavigator />;
};

const App = () => (
  <ReduxProvider store={store}>
    <PaperProvider theme={theme}>
      <Bootstrapper />
    </PaperProvider>
  </ReduxProvider>
);

export default App;
