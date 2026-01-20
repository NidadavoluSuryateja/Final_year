/**
 * Firebase Access Layer
 * This module ensures the `@react-native-firebase/app` is initialized.
 * It supports two modes:
 *  - Native auto-initialization via google-services.json (Android)
 *  - Manual JS initialization using env variables (FIREBASE_API_KEY, FIREBASE_PROJECT_ID, FIREBASE_APP_ID, etc.)
 *
 * The code lazy-requires native modules to avoid errors at bundle-eval time.
 */

// Firebase removed for mock-only development. Expose harmless stubs so
// other modules importing `getFirestore` / `checkFirebaseConnection` work.

export const getFirestore = async () => {
  // Return a minimal stub object. Real Firestore calls are disabled.
  return {
    collection: () => ({
      get: async () => ({ empty: true, forEach: () => {} }),
      doc: () => ({ get: async () => ({ exists: false, data: () => null }) }),
      where: () => ({
        orderBy: () => ({
          get: async () => ({ empty: true, forEach: () => {} }),
        }),
      }),
    }),
  } as any;
};

export const checkFirebaseConnection = async (): Promise<boolean> => {
  // Always return true in mock mode so the app proceeds to UI.
  return true;
};
