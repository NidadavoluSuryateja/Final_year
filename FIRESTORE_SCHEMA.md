# Firestore Database Schema

## Collections Structure

### 1. `buildings` Collection

**Document ID**: Any unique identifier (e.g., `bldg-001`)

**Schema**:
```typescript
{
  // Unique building ID
  id: string;                    // "bldg-001"
  
  // Display information
  name: string;                  // "Engineering Building"
  description?: string;          // "Main engineering and technology hub"
  code?: string;                 // "ENG"
  imageUrl?: string;             // "https://..."
  
  // Location (Required - Firestore GeoPoint)
  location: {
    latitude: number;            // 40.11624
    longitude: number;           // -88.24315
  }
  
  // Building info
  floors: number;                // 5
  facilities?: string[];         // ["Laboratory", "Classrooms"]
  
  // Timestamps
  createdAt: Timestamp;          // Auto-set by Firebase
  updatedAt: Timestamp;          // Auto-set by Firebase
}
```

**Example Document**:
```json
{
  "id": "bldg-001",
  "name": "Engineering Building",
  "description": "Main engineering hub",
  "code": "ENG",
  "location": {
    "latitude": 40.11624,
    "longitude": -88.24315
  },
  "floors": 5,
  "facilities": ["Labs", "Classrooms"],
  "imageUrl": "https://example.com/eng.jpg",
  "createdAt": "2024-01-19T10:00:00Z",
  "updatedAt": "2024-01-19T10:00:00Z"
}
```

### 2. `routes` Collection

**Document ID**: Any unique identifier (e.g., `route-001`)

**Schema**:
```typescript
{
  // Unique route ID
  id: string;                    // "route-001"
  
  // Display information
  name: string;                  // "Engineering to Library"
  description?: string;          // "Outdoor route via main quad"
  
  // Building references (MUST match building IDs)
  startBuilding: string;         // "bldg-001"
  endBuilding: string;           // "bldg-002"
  startEntrance?: string;        // "Main Entrance"
  endEntrance?: string;          // "Library Entrance"
  
  // Route metrics
  distance: number;              // meters - 450
  estimatedTime: number;         // seconds - 360 (6 minutes)
  difficulty?: string;           // "easy" | "medium" | "hard"
  
  // Path node references (array of IDs)
  pathNodeIds: string[];         // ["node-001", "node-002", "node-003"]
  
  // Timestamps
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

**Example Document**:
```json
{
  "id": "route-001",
  "name": "Engineering to Library",
  "description": "Via main quad",
  "startBuilding": "bldg-001",
  "endBuilding": "bldg-002",
  "startEntrance": "Main Entrance",
  "endEntrance": "Library Entrance",
  "distance": 450,
  "estimatedTime": 360,
  "difficulty": "easy",
  "pathNodeIds": ["node-001", "node-002", "node-003"],
  "createdAt": "2024-01-19T10:00:00Z",
  "updatedAt": "2024-01-19T10:00:00Z"
}
```

### 3. `pathNodes` Collection

**Document ID**: Any unique identifier (e.g., `node-001`)

**Schema**:
```typescript
{
  // Unique node ID
  id: string;                    // "node-001"
  
  // Route reference
  routeId: string;               // "route-001" (MUST match route ID)
  
  // Node sequence
  order: number;                 // 1, 2, 3... (order in route)
  
  // Location (Required - Firestore GeoPoint)
  coordinates: {
    latitude: number;            // 40.11624
    longitude: number;           // -88.24315
  }
  
  // Node information
  type: string;                  // "waypoint" | "turn" | "landmark" | "transition"
  floor?: string;                // "G" (ground) | "1" | "2" | "B" (basement)
  isIndoor?: boolean;            // true/false - indoor vs outdoor
  landmark?: string;             // "North Quad Intersection"
  
  // Timestamps
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

**Example Documents**:
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
  "landmark": "Engineering Building Exit",
  "createdAt": "2024-01-19T10:00:00Z",
  "updatedAt": "2024-01-19T10:00:00Z"
}
```

```json
{
  "id": "node-002",
  "routeId": "route-001",
  "order": 2,
  "type": "turn",
  "coordinates": {
    "latitude": 40.11650,
    "longitude": -88.24350
  },
  "floor": "G",
  "isIndoor": false,
  "landmark": "Main Quad Path Intersection",
  "createdAt": "2024-01-19T10:00:00Z",
  "updatedAt": "2024-01-19T10:00:00Z"
}
```

```json
{
  "id": "node-003",
  "routeId": "route-001",
  "order": 3,
  "type": "waypoint",
  "coordinates": {
    "latitude": 40.11670,
    "longitude": -88.24400
  },
  "floor": "G",
  "isIndoor": false,
  "landmark": "Library Entrance",
  "createdAt": "2024-01-19T10:00:00Z",
  "updatedAt": "2024-01-19T10:00:00Z"
}
```

### 4. `entrances` Collection (Optional)

**Document ID**: Any unique identifier (e.g., `entrance-001`)

**Schema**:
```typescript
{
  id: string;                    // "entrance-001"
  buildingId: string;            // "bldg-001"
  name: string;                  // "Main Entrance"
  coordinates: {
    latitude: number;
    longitude: number;
  }
  type?: string;                 // "main" | "side" | "service"
  floor?: string;                // "G"
}
```

## 📊 Data Relationships

```
buildings (1) ----< routes (many)
  id                 startBuilding
                     endBuilding

routes (1) ----< pathNodes (many)
  id                 routeId
                     (ordered by 'order' field)

buildings (1) ----< entrances (many)
  id                 buildingId
```

## 🔑 Important Notes

### GeoPoint Format
When adding location data, Firestore uses **GeoPoint** type:
- In console: Use "Geo point" field type
- Enter: latitude and longitude as separate numbers
- Example: latitude: `40.11624`, longitude: `--88.24315`

### Timestamps
- Firestore auto-generates `createdAt` and `updatedAt`
- Or set manually using current server timestamp

### Order Field
- `pathNodes` MUST have sequential `order` field (1, 2, 3...)
- This determines the turn-by-turn sequence
- Used by `getPathNodesByRouteId()` to sort nodes

### IDs
- Can be any unique string
- Recommendation: Use meaningful prefixes (e.g., `bldg-`, `route-`, `node-`)
- Or use Firestore auto-generated IDs

### Required Fields
Minimum required for each collection:
- **buildings**: `id`, `name`, `location` (GeoPoint)
- **routes**: `id`, `startBuilding`, `endBuilding`, `pathNodeIds` (array)
- **pathNodes**: `id`, `routeId`, `order`, `coordinates` (GeoPoint)

## 🧪 Testing with Sample Data

Add these 3 buildings with connected routes to test:

**Building 1**: Engineering Building
**Building 2**: Library  
**Building 3**: Student Center

**Routes**:
- Engineering → Library (6 minutes)
- Library → Student Center (4 minutes)
- Student Center → Engineering (8 minutes)

**Path Nodes**: 3-5 waypoints per route

Then rebuild app:
```bash
cd c:\FINAL\ARCampusNavigator
npx react-native run-android
```

App should now show buildings and allow navigation!
