/**
 * Firebase Access Layer
 * React Native Firebase auto-initializes using google-services.json
 * No manual initialization is required or allowed.
 */

import firestore from '@react-native-firebase/firestore';

/**
 * Get Firestore instance
 * Firebase is already initialized natively
 */
export const getFirestore = () => {
  return firestore();
};

/**
 * Health check to verify Firebase connectivity
 */
export const checkFirebaseConnection = async (): Promise<boolean> => {
  try {
    await firestore().collection('buildings').limit(1).get();
    console.log('✅ Firebase Firestore connected successfully');
    return true;
  } catch (error) {
    console.error('❌ Firebase Firestore connection failed:', error);
    return false;
  }
};
