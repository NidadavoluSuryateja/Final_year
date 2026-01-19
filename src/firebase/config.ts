/**
 * Firebase Configuration and Initialization
 * React Native Firebase Configuration
 * 
 * IMPORTANT: In React Native Firebase, the native Android module automatically
 * initializes Firebase when the app starts by reading google-services.json.
 * We do NOT call initializeApp() manually - that's a Web SDK pattern.
 * 
 * Instead, we:
 * 1. Import firestore() - returns the already-initialized default instance
 * 2. Import getApp() - for verification only, not initialization
 * 3. Configure settings if needed
 * 
 * The native Firebase SDK handles all initialization automatically via google-services.json
 */

import firestore from '@react-native-firebase/firestore';

let firebaseReady = false;

/**
 * Initialize Firestore settings and verify Firebase is ready
 * Firebase app is auto-initialized by React Native Firebase native module
 */
export const initializeFirebase = () => {
  try {
    if (firebaseReady) {
      console.log('✅ Firebase already initialized');
      return { firestore: firestore() };
    }

    console.log('🔄 Configuring Firestore...');
    
    // Get the auto-initialized Firestore instance
    // No initializeApp() needed - React Native Firebase native module handles it
    const db = firestore();
    
    // Configure Firestore settings for optimal performance
    try {
      db.settings({
        persistence: true,
        experimentalForceLongPolling: true,
      });
      console.log('✅ Firestore settings configured');
    } catch (settingsError) {
      console.warn('⚠️ Firestore settings error (non-critical):', settingsError);
    }
    
    firebaseReady = true;
    console.log('✅ Firestore ready for queries');
    
    return { firestore: db };
  } catch (error) {
    console.error('❌ Firestore configuration failed:', error);
    console.error('   Ensure google-services.json is in android/app/');
    console.error('   And that @react-native-firebase modules are properly installed');
    return null;
  }
};

/**
 * Check if Firestore is ready
 */
export const isFirebaseConfigured = (): boolean => {
  return firebaseReady;
}
