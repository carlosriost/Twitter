import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import LoginScreen from './src/Screens/LoginScreen';
import RegisterScreen from './src/Screens/RegisterScreen';
import HomeScreen from './src/Screens/HomeScreen';
import TweetScreen from './src/Screens/TweetScreen';
import FollowersScreen from './src/Screens/FollowersScreen';
import FollowingScreen from './src/Screens/FollowingScreen';
import UserTweetsScreen from './src/Screens/UserTweetsScreen';
import ProfileScreen from './src/Screens/ProfileScreen';
import EditProfileScreen from './src/Screens/EditProfileScreen';
import TweetDetailScreen from './src/Screens/TweetDetailScreen';
const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Tweet" component={TweetScreen} />
        <Stack.Screen name="Followers" component={FollowersScreen} />
        <Stack.Screen name="Following" component={FollowingScreen} />
        <Stack.Screen name="UserTweets" component={UserTweetsScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="EditProfile" component={EditProfileScreen} />

      </Stack.Navigator>
    </NavigationContainer>
  );
}
