# Firestore Database Structure - Sample Data Format

## Your Actual Building Document Structure

Here's exactly how to add buildings matching your document format to Firebase Firestore:

### Collection: `buildings`

**Sample Document 1: Engineering Building**

```
Document ID: 1
Fields:
├── building_id: "1" (string)
├── category: "Entrance/Exit" (string)
├── entrances: (array)
│   └── 0: (map)
│       ├── entrance_id: "1_MAIN" (string)
│       ├── latitude: 16.567605 (number)
│       ├── longitude: 81.520563 (number)
│       ├── name: "Main Gate" (string)
│       └── floors: 1 (number)
├── gps: (map)
│   ├── latitude: 16.567605 (number)
│   ├── longitude: 81.520563 (number)
│   └── name: "Canal Gate" (string)
├── name: "Engineering Building" (string) [optional]
├── floors: 5 (number) [optional]
└── facilities: (array) [optional]
    ├── 0: "Laboratory" (string)
    ├── 1: "Classes" (string)
    └── 2: "Computer Lab" (string)
```

**Sample Document 2: Library**

```
Document ID: 2
Fields:
├── building_id: "2" (string)
├── category: "Entrance/Exit" (string)
├── entrances: (array)
│   ├── 0: (map)
│   │   ├── entrance_id: "2_MAIN" (string)
│   │   ├── latitude: 16.568000 (number)
│   │   ├── longitude: 81.521000 (number)
│   │   ├── name: "Main Entrance" (string)
│   │   └── floors: 1 (number)
│   └── 1: (map)
│       ├── entrance_id: "2_BACK" (string)
│       ├── latitude: 16.568200 (number)
│       ├── longitude: 81.520900 (number)
│       ├── name: "Back Entrance" (string)
│       └── floors: 1 (number)
├── gps: (map)
│   ├── latitude: 16.568100 (number)
│   ├── longitude: 81.520950 (number)
│   └── name: "Central Library" (string)
├── name: "Main Library" (string) [optional]
├── floors: 4 (number) [optional]
└── facilities: (array) [optional]
    ├── 0: "Reading Room" (string)
    ├── 1: "Computer Lab" (string)
    └── 2: "Cafeteria" (string)
```

---

## How to Add This to Firestore

### Step-by-Step:

1. **Go to Firebase Console**: https://console.firebase.google.com
2. **Select Project**: `arcampusnavigator-986c9`
3. **Go to Firestore Database**
4. **Create Collection**: Click "+ Start collection" → Name: `buildings`

### For Document 1 (Engineering Building):

1. **Click "+ Add document"**
2. **Set Document ID**: `1`
3. **Add Fields**:
   - `building_id`: Type "string", Value: `"1"`
   - `category`: Type "string", Value: `"Entrance/Exit"`
   - `name`: Type "string", Value: `"Engineering Building"`
   - `floors`: Type "number", Value: `5`
   - `facilities`: Type "array" → Click "Add element" 3 times:
     - `"Laboratory"`
     - `"Classes"`
     - `"Computer Lab"`

4. **Add `entrances` Array**:
   - Click "Add field"
   - Field name: `entrances`
   - Type: "array"
   - Click "Add element"
   - Type: "map"
   - Add these fields to the map:
     - `entrance_id`: string → `"1_MAIN"`
     - `name`: string → `"Main Gate"`
     - `latitude`: number → `16.567605`
     - `longitude`: number → `81.520563`
     - `floors`: number → `1`

5. **Add `gps` Map**:
   - Click "Add field"
   - Field name: `gps`
   - Type: "map"
   - Add these fields:
     - `latitude`: number → `16.567605`
     - `longitude`: number → `81.520563`
     - `name`: string → `"Canal Gate"`

### For Document 2 (Library):

Repeat the process with Document ID: `2` and the values above.

---

## What the App Will Display

When you add these documents, your app will:

1. **Fetch all buildings** from the `buildings` collection
2. **Display list** with:
   - Building Category: "Entrance/Exit"
   - Building Name: "Engineering Building" (or "Main Library")
   - Description: "3 entrances • 5 floors"
   - Facilities: "Laboratory, Classes, Computer Lab..."

3. **When you tap a building**, it will navigate to GPS navigation using the main `gps` coordinates

---

## Sample JSON for Quick Copy-Paste

If Firestore allows JSON import, use this format:

```json
{
  "buildings": {
    "1": {
      "building_id": "1",
      "category": "Entrance/Exit",
      "name": "Engineering Building",
      "floors": 5,
      "facilities": ["Laboratory", "Classes", "Computer Lab"],
      "entrances": [
        {
          "entrance_id": "1_MAIN",
          "name": "Main Gate",
          "latitude": 16.567605,
          "longitude": 81.520563,
          "floors": 1
        }
      ],
      "gps": {
        "latitude": 16.567605,
        "longitude": 81.520563,
        "name": "Canal Gate"
      }
    },
    "2": {
      "building_id": "2",
      "category": "Entrance/Exit",
      "name": "Main Library",
      "floors": 4,
      "facilities": ["Reading Room", "Computer Lab", "Cafeteria"],
      "entrances": [
        {
          "entrance_id": "2_MAIN",
          "name": "Main Entrance",
          "latitude": 16.568000,
          "longitude": 81.521000,
          "floors": 1
        },
        {
          "entrance_id": "2_BACK",
          "name": "Back Entrance",
          "latitude": 16.568200,
          "longitude": 81.520900,
          "floors": 1
        }
      ],
      "gps": {
        "latitude": 16.568100,
        "longitude": 81.520950,
        "name": "Central Library"
      }
    }
  }
}
```

---

## ✅ After Adding Data

1. **Rebuild app** or **hot reload**:
   - In Metro terminal, press `r`
   
2. **Check app logs** for:
   ```
   📚 Fetching buildings from Firestore...
   ✅ Successfully fetched 2 buildings
   ```

3. **Building list should now show**:
   - Engineering Building (3 entrances • 5 floors)
   - Main Library (2 entrances • 4 floors)

That's it! The app is now configured to match your building document structure!
