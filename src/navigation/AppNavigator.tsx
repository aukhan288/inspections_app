import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AuthNavigator from './AuthNavigator';
import DrawerNavigator from './DrawerNavigator';
import { useSelector } from 'react-redux';

const AppNavigator = () => {
  // Access the username from Redux (instead of isLoggedIn)
  const username = useSelector((state: any) => state.auth.username);

  return (
    
    <NavigationContainer>
      {/* If username is not null, we assume the user is logged in */}
      {username ? <DrawerNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};

export default AppNavigator;
