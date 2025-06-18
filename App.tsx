/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SplashScreen from './src/screens/SplashScreen';
import VerifyFaceScreen from './src/screens/VerifyFaceScreen';
import UserDataScreen from './src/screens/UserDataScreen';

export type RootStackParamList = {
  Splash: undefined;
  VerifyFace: undefined;
  UserData: { user: { matricula: string } };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="VerifyFace" component={VerifyFaceScreen} />
        <Stack.Screen name="UserData" component={UserDataScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
