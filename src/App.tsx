/**
 * ARCampusNavigator
 * AR-based campus navigation application
 */

import React, { useState, useEffect } from 'react';
import {
  StatusBar,
  TouchableOpacity,
  Text,
  View,
  ActivityIndicator,
  Button,
} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import DestinationSelectionScreen from './screens/DestinationSelectionScreen';
import NavigationScreen from './screens/NavigationScreen';

import type { RootStackParamList } from './types/navigation';
import DebugLogsScreen from './screens/DebugLogsScreen';
import errorLogger from './utils/errorLogger';

type ScreenName = keyof RootStackParamList;

interface NavigationState {
  currentScreen: ScreenName;
  params?: any;
}

function App() {
  // initialize console capture in dev
  if (__DEV__) {
    try {
      errorLogger.captureConsole();
    } catch {}
  }
  // We're running in mock-data-only mode; don't initialize Firebase.
  const [firebaseInitializing] = useState(false);
  const [firebaseReady] = useState(true);
  const [navigationState, setNavigationState] = useState<NavigationState>({
    currentScreen: 'DestinationSelection',
  });

  const [showDebug, setShowDebug] = useState(false);

  const navigate = <K extends ScreenName>(
    screen: K,
    params?: RootStackParamList[K],
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

        {(() => {
          if (firebaseInitializing) {
            return (
              <View
                style={{
                  flex: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <ActivityIndicator size="large" />
                <Text style={{ marginTop: 12, color: '#fff' }}>
                  Initializing Firebase...
                </Text>
              </View>
            );
          }
          if (!firebaseReady) {
            return (
              <View
                style={{
                  flex: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                  padding: 24,
                }}
              >
                <Text
                  style={{
                    color: '#fff',
                    fontSize: 16,
                    marginBottom: 12,
                    textAlign: 'center',
                  }}
                >
                  Firebase initialization failed. Provide
                  android/app/google-services.json or set FIREBASE_API_KEY,
                  FIREBASE_PROJECT_ID, and FIREBASE_APP_ID in environment (or
                  place a .env file in device assets/document dir).
                </Text>
                <Button
                  title="Retry Initialization"
                  onPress={() => {
                    setFirebaseInitializing(true);
                    setFirebaseReady(false);
                    (async () => {
                      const ok = await checkFirebaseConnection();
                      setFirebaseReady(ok);
                      setFirebaseInitializing(false);
                    })();
                  }}
                />
              </View>
            );
          }

          return navigationState.currentScreen === 'DestinationSelection' ? (
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
          );
        })()}

        {__DEV__ && (
          <>
            <TouchableOpacity
              onPress={() => setShowDebug(s => !s)}
              style={{
                position: 'absolute',
                right: 12,
                bottom: 36,
                backgroundColor: '#FF3B30',
                padding: 10,
                borderRadius: 24,
              }}
            >
              <Text style={{ color: '#fff', fontWeight: '700' }}>DBG</Text>
            </TouchableOpacity>
            {showDebug && (
              <View
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  right: 0,
                  bottom: 0,
                }}
              >
                <DebugLogsScreen />
              </View>
            )}
          </>
        )}
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export default App;
