import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/appNavigator';
import { ApplicationProvider } from './src/contexts/ApplicationContext/ApplicationContext';
import { ConfigProvider } from './src/contexts/ConfigContext/configContext';

export default function App() {
  return (
    <ApplicationProvider>
      <ConfigProvider>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </ConfigProvider>
    </ApplicationProvider>
  );
}