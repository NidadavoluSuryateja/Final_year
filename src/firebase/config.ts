/**
 * Firebase Configuration and Initialization
 * Initialize Firebase on app startup
 */

import { initializeApp, getApp } from '@react-native-firebase/app';
import { initializeFirestore, getFirestore } from '@react-native-firebase/firestore';
import Config from 'react-native-config';

/**
 * Firebase configuration object
 * Uses environment variables for flexibility
 */
const firebaseConfig = {
  apiKey: Config.FIREBASE_API_KEY || '',
  authDomain: Config.FIREBASE_AUTH_DOMAIN || '',
  projectId: Config.FIREBASE_PROJECT_ID || '',
  storageBucket: Config.FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: Config.FIREBASE_MESSAGING_SENDER_ID || '',
  appId: Config.FIREBASE_APP_ID || '',
};

/**
 * Initialize Firebase with configuration
 * Supports both google-services.json (Android) and environment variables
 */
export const initializeFirebase = () => {
  try {
    let app;
    
    // Try to get existing app first
    try {
      app = getApp();
      console.log('Using existing Firebase app instance');
    } catch (e) {
      // App not initialized, initialize with config
      if (firebaseConfig.apiKey && firebaseConfig.projectId) {
        app = initializeApp(firebaseConfig);
        console.log('Firebase initialized with environment configuration');
      } else {
        // Fallback to default initialization (uses google-services.json on Android)
        app = initializeApp();
        console.log('Firebase initialized with default configuration (google-services.json)');
      }
    }
    
    // Initialize Firestore with app
    let firestore;
    try {
      firestore = getFirestore(app);
    } catch {
      firestore = initializeFirestore(app, {
        experimentalForceLongPolling: true, // Use long polling for better reliability
      });
    }
    
    console.log('✅ Firebase and Firestore initialized successfully');
    console.log(`📍 Project ID: ${firebaseConfig.projectId}`);
    return { app, firestore };
  } catch (error) {
    console.error('❌ Firebase initialization error:', error);
    return null;
  }
};

/**
 * Check if Firebase is properly configured
 */
export const isFirebaseConfigured = (): boolean => {
  try {
    getApp();
    return true;
  } catch (error) {
    return false;
  }
};
