import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Agrico from './components/Agrico';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Agrico">
        <Stack.Screen name="Agrico" component={Agrico} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
