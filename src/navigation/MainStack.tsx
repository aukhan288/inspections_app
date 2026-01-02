import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DrawerNavigator from './DrawerNavigator';
import InspectionDetailScreen from '../screens/InspectionDetailScreen';
import CameraScreen from '../screens/CameraScreen';

export type MainStackParamList = {
  Drawer: undefined;
  InspectionDetail: { inspection: any };
};

const Stack = createNativeStackNavigator<MainStackParamList>();

const MainStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Drawer"
        component={DrawerNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="InspectionDetail"
        component={InspectionDetailScreen}
        options={{ title: 'Inspection Detail' }}
      />
      <Stack.Screen
        name="CameraScreen"
        component={CameraScreen}
        options={{ title: 'Inspection Detail',headerShown:false  }}
      />
    </Stack.Navigator>
  );
};

export default MainStack;
