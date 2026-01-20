/**
 * ARCampusNavigator
 * AR-based campus navigation application
 */

import React, { useState } from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import DestinationSelectionScreen from './screens/DestinationSelectionScreen';
import NavigationScreen from './screens/NavigationScreen';

import type { RootStackParamList } from './types/navigation';

type ScreenName = keyof RootStackParamList;

interface NavigationState {
  currentScreen: ScreenName;
  params?: any;
}

function App() {
  const [navigationState, setNavigationState] = useState<NavigationState>({
    currentScreen: 'DestinationSelection',
  });

  const navigate = <K extends ScreenName>(
    screen: K,
    params?: RootStackParamList[K]
  ) => {
    setNavigationState({
      currentScreen: screen,
      params,
    });
  };

  const goBack = () => {
    setNavigationState({
      currentScreen: 'DestinationSelection',
    });
  };

  const navigationProps = {
    navigate,
    goBack,
    dispatch: () => {},
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar barStyle="light-content" backgroundColor="#000000" />

        {navigationState.currentScreen === 'DestinationSelection' ? (
          <DestinationSelectionScreen
            route={{
              key: 'DestinationSelection',
              name: 'DestinationSelection',
              params: undefined,
            }}
            navigation={navigationProps}
          />
        ) : (
          <NavigationScreen
            route={{
              key: 'Navigation',
              name: 'Navigation',
              params: navigationState.params,
            }}
            navigation={navigationProps}
          />
        )}

      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export default App;
