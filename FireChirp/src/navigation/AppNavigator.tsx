import React from 'react';
import {NavigationContainer, DefaultTheme} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Feather';
import AuthScreen from '../screens/AuthScreen';
import FeedScreen from '../screens/FeedScreen';
import FollowersScreen from '../screens/FollowersScreen';
import ProfileScreen from '../screens/ProfileScreen';
import CreatePostModal from '../screens/CreatePostModal';
import {palette} from '../theme/colors';
import {useAppSelector} from '../hooks';

const RootStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const AppTabs = () => (
  <Tab.Navigator
    screenOptions={({route}) => ({
      headerShown: false,
      tabBarStyle: {backgroundColor: palette.card},
      tabBarActiveTintColor: palette.primary,
      tabBarIcon: ({color, size}) => {
        const icons: Record<string, string> = {
          Feed: 'home',
          Seguidores: 'users',
          Perfil: 'user',
        };
        return <Icon name={icons[route.name] ?? 'circle'} size={size} color={color} />;
      },
    })}>
    <Tab.Screen name="Feed" component={FeedScreen} />
    <Tab.Screen name="Seguidores" component={FollowersScreen} />
    <Tab.Screen name="Perfil" component={ProfileScreen} />
  </Tab.Navigator>
);

const AppNavigator = () => {
  const profile = useAppSelector(state => state.auth.profile);
  return (
    <NavigationContainer
      theme={{
        ...DefaultTheme,
        colors: {
          ...DefaultTheme.colors,
          background: palette.background,
          primary: palette.primary,
          card: palette.card,
          text: palette.text,
          border: palette.muted,
        },
      }}>
      <RootStack.Navigator>
        {profile ? (
          <RootStack.Group>
            <RootStack.Screen
              name="AppTabs"
              component={AppTabs}
              options={{headerShown: false}}
            />
            <RootStack.Screen
              name="CreatePost"
              component={CreatePostModal}
              options={{presentation: 'modal', title: 'Nueva publicación'}}
            />
          </RootStack.Group>
        ) : (
          <RootStack.Screen
            name="Auth"
            component={AuthScreen}
            options={{headerShown: false}}
          />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
