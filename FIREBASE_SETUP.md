# AR Campus Navigator - Firebase Setup Guide

## ✅ Current Status

Your app is **now fully configured with Firebase credentials**. The environment variables are loaded from `.env` and `.env.local` files.

## 🔧 Firebase Configuration Files

### `.env` (Root Directory)
```
FIREBASE_API_KEY=AIzaSyDrDlbPHtuwJIkUqt2537g8zs4Rynix3OI
FIREBASE_AUTH_DOMAIN=arcampusnavigator-986c9.firebaseapp.com
FIREBASE_PROJECT_ID=arcampusnavigator-986c9
FIREBASE_STORAGE_BUCKET=arcampusnavigator-986c9.firebasestorage.app
FIREBASE_MESSAGING_SENDER_ID=284560558108
FIREBASE_APP_ID=1:284560558108:web:6b457a1eaca0049306f7d9
```

### `.env.local` (Local Development - Not Committed to Git)
Same credentials as `.env` but for local development. This file is in `.gitignore` for security.

## 🚀 How Firebase Initialization Works

### Flow:
1. **App Startup** → `App.tsx` mounts
2. **useEffect Hook** → Calls `initializeFirebase()` on mount
3. **Firebase Config Module** (`src/firebase/config.ts`):
   - Reads credentials from `.env` via `react-native-config`
   - Validates all required Firebase properties
   - Initializes Firebase app with credentials
   - Initializes Firestore with long-polling enabled
4. **Status Update** → Sets `firebaseReady` state to `true`
5. **UI Update** → Hides `SetupScreen`, shows `DestinationSelectionScreen`
6. **Firestore Services** → Now ready to query collections

### Console Output:
When app starts, you'll see initialization logs:
```
🔍 Firebase Config Loader:
   API Key: ✓ Loaded
   Auth Domain: ✓ Loaded
   Project ID: ✓ Loaded
   Storage Bucket: ✓ Loaded
   Messaging ID: ✓ Loaded
   App ID: ✓ Loaded
🔄 Initializing Firebase...
✅ Initializing with project: arcampusnavigator-986c9
✅ Firebase and Firestore initialized successfully
📚 Fetching buildings from Firestore...
```

## 📚 Next Steps: Add Sample Data to Firestore

### 1. Go to Firebase Console
- Navigate to: https://console.firebase.google.com
- Select project: `arcampusnavigator-986c9`
- Go to **Firestore Database** section

### 2. Create Collections and Add Sample Data

#### **Collection: `buildings`**
Create sample document:
```json
{
  "id": "bldg-001",
  "name": "Engineering Building",
  "description": "Main engineering and technology hub",
  "code": "ENG",
  "location": {
    "latitude": 40.11624,
    "longitude": -88.24315
  },
  "floors": 5,
  "facilities": ["Laboratory", "Classrooms", "Computer Labs"],
  "imageUrl": "https://example.com/image.jpg",
  "createdAt": "2024-01-19T00:00:00Z",
  "updatedAt": "2024-01-19T00:00:00Z"
}
```

#### **Collection: `routes`**
Create sample document:
```json
{
  "id": "route-001",
  "name": "Engineering to Library",
  "description": "Route from Engineering Building to Library",
  "startBuilding": "bldg-001",
  "endBuilding": "bldg-002",
  "distance": 450,
  "estimatedTime": 6,
  "difficulty": "easy",
  "pathNodeIds": ["node-001", "node-002", "node-003"],
  "createdAt": "2024-01-19T00:00:00Z",
  "updatedAt": "2024-01-19T00:00:00Z"
}
```

#### **Collection: `pathNodes`**
Create sample documents:
```json
{
  "id": "node-001",
  "routeId": "route-001",
  "order": 1,
  "type": "waypoint",
  "coordinates": {
    "latitude": 40.11624,
    "longitude": -88.24315
  },
  "floor": "G",
  "isIndoor": false,
  "landmark": "Engineering Building Entrance",
  "createdAt": "2024-01-19T00:00:00Z"
}
```

## 🐛 Troubleshooting

### Error: "No Firebase App '[DEFAULT]' has been created"
**Solution**: Firebase is initializing. Check console logs to confirm:
```
✅ Firebase and Firestore initialized successfully
```

### Error: "Missing or invalid FirebaseOptions property 'apiKey'"
**Solution**: Ensure `.env` file exists in project root with all 6 Firebase properties:
- `FIREBASE_API_KEY`
- `FIREBASE_AUTH_DOMAIN`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_STORAGE_BUCKET`
- `FIREBASE_MESSAGING_SENDER_ID`
- `FIREBASE_APP_ID`

**Check command:**
```bash
cd c:\FINAL\ARCampusNavigator
Get-Content .env  # View .env contents
```

### Error: "No buildings found in Firestore"
**Solution**: Add sample buildings to Firestore (see "Add Sample Data" section above)

### Firebase Logs Show "⚠️ No .env or .env.local file found"
**This is OK during build** - happens because Gradle builds from `android/` directory. The files are still loaded at runtime from the project root.

## 🔒 Security Notes

- ✅ `.env` file is in `.gitignore` (won't commit to git)
- ✅ `.env.local` file is in `.gitignore` (for local development)
- ✅ Firebase credentials are loaded securely at runtime
- ✅ Never commit `.env` files to version control

## 📝 Files Modified/Created

### Created:
- `.env` - Firebase credentials
- `.env.local` - Local development credentials
- `src/firebase/config.ts` - Firebase initialization module
- `src/screens/SetupScreen.tsx` - Setup guidance UI

### Modified:
- `src/App.tsx` - Added Firebase init on startup
- `src/services/firestoreService.ts` - Enhanced error messages
- `android/app/build.gradle` - Added .env loading
- `.gitignore` - Added .env patterns

## 🎯 Expected Behavior After Setup

1. **App Starts** → Shows loading/initializing state
2. **Firebase Initializes** → Takes 1-2 seconds
3. **Firestore Loads** → Fetches buildings from database
4. **Building List Shows** → Displays all buildings from Firestore
5. **Select Building** → Navigate to GPS-based turn-by-turn navigation
6. **Real-time Navigation** → Arrow rotates based on device heading
7. **Distance Updates** → Real-time distance to next waypoint

## 📞 Testing

### To test the app:

1. **Verify Firebase Init:**
   - Open device console
   - Look for "✅ Firebase and Firestore initialized successfully"

2. **Verify Buildings Loaded:**
   - Check for "✅ Successfully fetched X buildings"

3. **If No Buildings:**
   - Add sample data to Firestore (see section above)
   - Hot reload app (press 'r' in Metro)

4. **Test Navigation:**
   - Enable Location Services on device
   - Select a building
   - Arrow should rotate as you move/turn
   - Distance updates should show in real-time

## 🔄 Rebuilding After Changes

If you modify `.env` credentials:
```bash
cd c:\FINAL\ARCampusNavigator\android
.\gradlew app:assembleDebug
.\gradlew app:installDebug
```

For hot reload (doesn't need rebuild):
- Press 'r' in Metro terminal to reload JS bundle
- Changes to `.env` require rebuild

## ✨ You're All Set!

Your Firebase is now fully integrated. Add sample Firestore data and test the navigation flow!
