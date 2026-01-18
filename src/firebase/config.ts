/**
 * Firebase Configuration and Initialization
 * Initialize Firebase on app startup
 */

import { initializeApp } from '@react-native-firebase/app';
import { initializeFirestore } from '@react-native-firebase/firestore';

/**
 * Initialize Firebase with default configuration
 * This reads from google-services.json (Android) or GoogleService-Info.plist (iOS)
 */
export const initializeFirebase = () => {
  try {
    // Initialize default Firebase app
    const app = initializeApp();
    
    // Initialize Firestore with app
    const firestore = initializeFirestore(app, {
      experimentalForceLongPolling: true, // Use long polling for better reliability
    });
    
    console.log('Firebase initialized successfully');
    return { app, firestore };
  } catch (error) {
    console.error('Firebase initialization error:', error);
    return null;
  }
};

/**
 * Check if Firebase is properly configured
 */
export const isFirebaseConfigured = (): boolean => {
  try {
    // Try to get the default app
    const app = initializeApp();
    return !!app;
  } catch (error) {
    return false;
  }
};
