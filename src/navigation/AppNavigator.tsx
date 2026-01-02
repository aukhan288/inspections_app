import 'react-native-gesture-handler'; // MUST be at the very top
import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import AuthNavigator from './AuthNavigator';
import MainStack from './MainStack';
import type { RootState } from '../redux/store';

const AppNavigator = () => {
  const token = useSelector((state: RootState) => state.auth.token);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        {token ? <MainStack /> : <AuthNavigator />}
      </NavigationContainer>
    </GestureHandlerRootView>
  );
};

export default AppNavigator;
