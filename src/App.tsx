/**
 * ARCampusNavigator
 * AR-based campus navigation application
 * @format
 */

import React, { useState, useEffect } from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import DestinationSelectionScreen from './screens/DestinationSelectionScreen';
import NavigationScreen from './screens/NavigationScreen';
import SetupScreen from './screens/SetupScreen';
import { initializeFirebase, isFirebaseConfigured } from './firebase/config';
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
  const [firebaseReady, setFirebaseReady] = useState(false);
  const [firebaseInitialized, setFirebaseInitialized] = useState(false);

  useEffect(() => {
    // Initialize Firebase on app startup
    const initFirebase = async () => {
      try {
        const result = initializeFirebase();
        setFirebaseInitialized(result !== null);
        if (result) {
          console.log('Firebase initialized successfully');
          setFirebaseReady(true);
        } else {
          console.warn('Firebase configuration not found. Please configure Firebase to use the app.');
        }
      } catch (error) {
        console.error('Error initializing Firebase:', error);
      }
    };

    initFirebase();
  }, []);

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
        {!firebaseReady ? (
          <SetupScreen />
        ) : navigationState.currentScreen === 'DestinationSelection' ? (
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
