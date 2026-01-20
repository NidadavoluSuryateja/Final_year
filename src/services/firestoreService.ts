/**
 * Firestore Read-Only Service
 * Handles all read operations for campus navigation data
 */

// Temporarily disable Firebase imports while using mock data only.
// import type { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
// import { getFirestore } from '../firebase/config';
import {
  Building,
  Entrance,
  Route,
  PathNode,
  isBuilding,
  isRoute,
  isPathNode,
} from '../types/firestore';

const BUILDINGS_COLLECTION = 'buildings';
const ROUTES_COLLECTION = 'routes';
const PATH_NODES_COLLECTION = 'pathNodes';
const ENTRANCES_COLLECTION = 'entrances';

// Temporary switch to provide mock UI data when Firebase is unavailable.
// Set to `true` during local testing; set to `false` to use real Firestore.
const USE_MOCK_DATA = true;

// --- Mock data for local UI testing ---
const now = new Date();

const mockBuildings = [
  {
    building_id: 'b1',
    category: 'Academic',
    entrances: [
      {
        entrance_id: 'e1',
        name: 'Main Entrance',
        latitude: 12.9716,
        longitude: 77.5946,
        floors: 3,
      },
    ],
    gps: { latitude: 12.9716, longitude: 77.5946, name: 'Main Building' },
    name: 'Main Building',
    description:
      'Central academic building used for classes and administration.',
    facilities: ['Restrooms', 'Elevator', 'Cafeteria'],
    floors: 3,
  },
  {
    building_id: 'b2',
    category: 'Library',
    entrances: [
      {
        entrance_id: 'e2',
        name: 'Library Front',
        latitude: 12.9712,
        longitude: 77.595,
        floors: 2,
      },
    ],
    gps: { latitude: 12.9712, longitude: 77.595, name: 'Library' },
    name: 'Central Library',
    description: 'Campus library with study spaces and print services.',
    facilities: ['WiFi', 'Printers'],
    floors: 2,
  },
];

const mockEntrances = [
  {
    id: 'e1',
    buildingId: 'b1',
    name: 'Main Entrance',
    description: 'Ground floor main entrance',
    coordinates: { latitude: 12.9716, longitude: 77.5946 },
    floor: 0,
    accessibility: { wheelchair: true, ramp: true, elevator: true },
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'e2',
    buildingId: 'b2',
    name: 'Library Front',
    description: 'Front entrance to the library',
    coordinates: { latitude: 12.9712, longitude: 77.595 },
    floor: 0,
    accessibility: { wheelchair: true, ramp: false, elevator: true },
    createdAt: now,
    updatedAt: now,
  },
];

const mockRoutes = [
  {
    id: 'r1',
    name: 'Main to Library',
    description: 'A short route from Main Building to Central Library',
    startBuilding: 'b1',
    endBuilding: 'b2',
    startEntrance: 'e1',
    endEntrance: 'e2',
    distance: 250,
    estimatedTime: 180,
    difficulty: 'easy' as const,
    outdoorPercentage: 60,
    pathNodeIds: ['p1', 'p2', 'p3'],
    accessibility: { wheelchair: true, pram: true },
    tags: ['shortest', 'scenic'],
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'r2',
    name: 'Scenic Loop to Library',
    description: 'Longer scenic route with landmarks',
    startBuilding: 'b1',
    endBuilding: 'b2',
    startEntrance: 'e1',
    endEntrance: 'e2',
    distance: 420,
    estimatedTime: 300,
    difficulty: 'moderate' as const,
    outdoorPercentage: 80,
    pathNodeIds: ['p4', 'p5', 'p6'],
    accessibility: { wheelchair: false, pram: false },
    tags: ['scenic', 'longer'],
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'r_indoor',
    name: 'Indoor Entrance Route',
    description: 'Short indoor sequence to reach building interior',
    startBuilding: 'b2',
    endBuilding: 'b2',
    startEntrance: 'e2',
    endEntrance: null,
    distance: 30,
    estimatedTime: 45,
    difficulty: 'easy' as const,
    outdoorPercentage: 0,
    pathNodeIds: ['p7'],
    accessibility: { wheelchair: true, pram: true },
    tags: ['indoor'],
    createdAt: now,
    updatedAt: now,
  },
];

const mockPathNodes = [
  {
    id: 'p1',
    routeId: 'r1',
    coordinates: { latitude: 12.9716, longitude: 77.5946 },
    order: 1,
    type: 'waypoint',
    description: 'Start at Main Entrance',
    heading: 90,
    instructionText: 'Exit building and head east for 50m',
    landmark: { name: 'Large Banyan Tree', description: 'On your right' },
    floor: 0,
    isIndoor: false,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'p2',
    routeId: 'r1',
    coordinates: { latitude: 12.9715, longitude: 77.5948 },
    order: 2,
    type: 'waypoint',
    description: 'Mid point near the fountain',
    instructionText: 'Pass the fountain keeping it to your left',
    isIndoor: false,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'p3',
    routeId: 'r1',
    coordinates: { latitude: 12.9712, longitude: 77.595 },
    order: 3,
    type: 'waypoint',
    description: 'Arrive at Library entrance',
    instructionText: 'Enter the library from the front',
    isIndoor: false,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'p4',
    routeId: 'r2',
    coordinates: { latitude: 12.97155, longitude: 77.5947 },
    order: 1,
    type: 'waypoint',
    description: 'Scenic path start',
    instructionText: 'Walk along the tree-lined path',
    isIndoor: false,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'p5',
    routeId: 'r2',
    coordinates: { latitude: 12.9714, longitude: 77.5949 },
    order: 2,
    type: 'landmark',
    description: 'Fountain landmark',
    instructionText: 'Pass the fountain',
    isIndoor: false,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'p6',
    routeId: 'r2',
    coordinates: { latitude: 12.9712, longitude: 77.595 },
    order: 3,
    type: 'waypoint',
    description: 'Library front',
    instructionText: 'Approach the library from the garden',
    isIndoor: false,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'p7',
    routeId: 'r_indoor',
    coordinates: { latitude: 12.9712, longitude: 77.595 },
    order: 1,
    type: 'transition',
    description: 'Indoor foyer',
    instructionText: 'Enter building and take the stairs to the lobby',
    isIndoor: true,
    floor: 1,
    createdAt: now,
    updatedAt: now,
  },
];

// --- end mock data ---

/**
 * Convert Firestore timestamp to JavaScript Date
 */
const convertFirestoreTimestamp = (timestamp: any | undefined): Date => {
  if (!timestamp) {
    return new Date();
  }
  return timestamp.toDate();
};

/**
 * Convert Firestore GeoPoint to coordinates object
 */
const convertFirestoreGeoPoint = (geoPoint: any | undefined) => {
  if (!geoPoint) {
    return { latitude: 0, longitude: 0 };
  }
  return {
    latitude: geoPoint.latitude,
    longitude: geoPoint.longitude,
  };
};

/**
 * Transform raw Firestore document to Building interface
 * Matches actual document structure from Firestore
 */
const transformBuilding = (doc: any): Building | null => {
  const data = doc.data();
  if (!data) return null;

  try {
    // Transform entrances array
    const entrances = Array.isArray(data.entrances)
      ? data.entrances.map((entrance: any) => ({
          entrance_id: entrance.entrance_id || '',
          name: entrance.name || '',
          latitude: entrance.latitude || 0,
          longitude: entrance.longitude || 0,
          floors: entrance.floors,
        }))
      : [];

    const building: Building = {
      building_id: data.building_id || doc.id,
      category: data.category || '',
      entrances,
      gps: {
        latitude: data.gps?.latitude || 0,
        longitude: data.gps?.longitude || 0,
        name: data.gps?.name,
      },
      name: data.name,
      description: data.description,
      facilities: Array.isArray(data.facilities) ? data.facilities : [],
      floors: data.floors,
    };

    return isBuilding(building) ? building : null;
  } catch (error) {
    console.error(`Error transforming building ${doc.id}:`, error);
    return null;
  }
};

/**
 * Transform raw Firestore document to Route interface
 */
const transformRoute = (doc: any): Route | null => {
  const data = doc.data();
  if (!data) return null;

  try {
    const route: Route = {
      id: doc.id,
      name: data.name || '',
      description: data.description || '',
      startBuilding: data.startBuilding || '',
      endBuilding: data.endBuilding || '',
      startEntrance: data.startEntrance,
      endEntrance: data.endEntrance,
      distance: data.distance || 0,
      estimatedTime: data.estimatedTime || 0,
      difficulty: data.difficulty || 'moderate',
      outdoorPercentage: data.outdoorPercentage || 0,
      pathNodeIds: Array.isArray(data.pathNodeIds) ? data.pathNodeIds : [],
      accessibility: data.accessibility || { wheelchair: false, pram: false },
      tags: Array.isArray(data.tags) ? data.tags : [],
      createdAt: convertFirestoreTimestamp(data.createdAt),
      updatedAt: convertFirestoreTimestamp(data.updatedAt),
    };

    return isRoute(route) ? route : null;
  } catch (error) {
    console.error(`Error transforming route ${doc.id}:`, error);
    return null;
  }
};

/**
 * Transform raw Firestore document to PathNode interface
 */
const transformPathNode = (doc: any): PathNode | null => {
  const data = doc.data();
  if (!data) return null;

  try {
    const pathNode: PathNode = {
      id: doc.id,
      routeId: data.routeId || '',
      coordinates: convertFirestoreGeoPoint(data.coordinates),
      order: data.order || 0,
      type: data.type || 'waypoint',
      description: data.description || '',
      heading: data.heading,
      instructionText: data.instructionText,
      landmark: data.landmark,
      floor: data.floor,
      isIndoor: data.isIndoor || false,
      createdAt: convertFirestoreTimestamp(data.createdAt),
      updatedAt: convertFirestoreTimestamp(data.updatedAt),
    };

    return isPathNode(pathNode) ? pathNode : null;
  } catch (error) {
    console.error(`Error transforming pathNode ${doc.id}:`, error);
    return null;
  }
};

/**
 * Fetch all buildings from Firestore
 * @returns Array of Building objects, empty array if no buildings found
 */
export const getBuildings = async (): Promise<Building[]> => {
  if (USE_MOCK_DATA) {
    return Promise.resolve(mockBuildings as Building[]);
  }

  try {
    console.log('📚 Fetching buildings from Firestore...');

    const fs = await getFirestore();
    const snapshot = await fs.collection(BUILDINGS_COLLECTION).get();

    if (snapshot.empty) {
      console.warn('⚠️  No buildings found in Firestore');
      console.warn(
        '   Please add building documents to the buildings collection',
      );
      return [];
    }

    const buildings: Building[] = [];
    snapshot.forEach((doc: any) => {
      const building = transformBuilding(doc);
      if (building) {
        buildings.push(building);
      }
    });

    console.log(`✅ Successfully fetched ${buildings.length} buildings`);
    return buildings;
  } catch (error) {
    console.error('❌ Error fetching buildings:', error);
    return [];
  }
};

/**
 * Fetch all routes from Firestore
 * @returns Array of Route objects, empty array if no routes found
 */
export const getRoutes = async (): Promise<Route[]> => {
  if (USE_MOCK_DATA) {
    return Promise.resolve(mockRoutes as Route[]);
  }

  try {
    const fs = await getFirestore();
    const snapshot = await fs.collection(ROUTES_COLLECTION).get();

    if (snapshot.empty) {
      console.warn('No routes found in Firestore');
      return [];
    }

    const routes: Route[] = [];
    snapshot.forEach((doc: any) => {
      const route = transformRoute(doc);
      if (route) {
        routes.push(route);
      }
    });

    return routes;
  } catch (error) {
    console.error('Error fetching routes:', error);
    return [];
  }
};

/**
 * Fetch path nodes for a specific route
 * @param routeId - The ID of the route
 * @returns Array of PathNode objects ordered by sequence, empty array if not found
 */
export const getPathNodesByRouteId = async (
  routeId: string,
): Promise<PathNode[]> => {
  if (!routeId || routeId.trim() === '') {
    console.warn('Invalid routeId provided to getPathNodesByRouteId');
    return [];
  }
  if (USE_MOCK_DATA) {
    // Allow routeId to be either a route ID or a building ID (some screens
    // pass buildingId as a placeholder). If no nodes for the provided id,
    // try to find a route that starts/ends at the given building and return
    // its nodes.
    let nodes = mockPathNodes.filter(n => n.routeId === routeId);
    if (nodes.length === 0) {
      const matchingRoute = mockRoutes.find(
        r =>
          r.id === routeId ||
          r.startBuilding === routeId ||
          r.endBuilding === routeId,
      );
      if (matchingRoute) {
        nodes = mockPathNodes.filter(n => n.routeId === matchingRoute.id);
      }
    }
    nodes = nodes.sort((a, b) => a.order - b.order);
    return Promise.resolve(nodes as PathNode[]);
  }

  try {
    const fs = await getFirestore();
    const snapshot = await fs
      .collection(PATH_NODES_COLLECTION)
      .where('routeId', '==', routeId)
      .orderBy('order', 'asc')
      .get();

    if (snapshot.empty) {
      console.warn(`No path nodes found for route ${routeId}`);
      return [];
    }

    const pathNodes: PathNode[] = [];
    snapshot.forEach((doc: any) => {
      const pathNode = transformPathNode(doc);
      if (pathNode) {
        pathNodes.push(pathNode);
      }
    });

    return pathNodes;
  } catch (error) {
    console.error(`Error fetching path nodes for route ${routeId}:`, error);
    return [];
  }
};

/**
 * Fetch a single building by ID
 * @param buildingId - The ID of the building
 * @returns Building object or null if not found
 */
export const getBuildingById = async (
  buildingId: string,
): Promise<Building | null> => {
  if (!buildingId || buildingId.trim() === '') {
    console.warn('Invalid buildingId provided to getBuildingById');
    return null;
  }
  if (USE_MOCK_DATA) {
    const found = mockBuildings.find(b => b.building_id === buildingId);
    return Promise.resolve(found ?? null);
  }

  try {
    const fs = await getFirestore();
    const doc = await fs.collection(BUILDINGS_COLLECTION).doc(buildingId).get();

    if (!doc.exists) {
      console.warn(`Building ${buildingId} not found`);
      return null;
    }

    return transformBuilding(doc);
  } catch (error) {
    console.error(`Error fetching building ${buildingId}:`, error);
    return null;
  }
};

/**
 * Fetch a single route by ID
 * @param routeId - The ID of the route
 * @returns Route object or null if not found
 */
export const getRouteById = async (routeId: string): Promise<Route | null> => {
  if (!routeId || routeId.trim() === '') {
    console.warn('Invalid routeId provided to getRouteById');
    return null;
  }
  if (USE_MOCK_DATA) {
    const found = mockRoutes.find(r => r.id === routeId);
    return Promise.resolve(found ?? null);
  }

  try {
    const fs = await getFirestore();
    const doc = await fs.collection(ROUTES_COLLECTION).doc(routeId).get();

    if (!doc.exists) {
      console.warn(`Route ${routeId} not found`);
      return null;
    }

    return transformRoute(doc);
  } catch (error) {
    console.error(`Error fetching route ${routeId}:`, error);
    return null;
  }
};

/**
 * Fetch entrances for a specific building
 * @param buildingId - The ID of the building
 * @returns Array of Entrance objects, empty array if not found
 */
export const getEntrancesByBuildingId = async (
  buildingId: string,
): Promise<Entrance[]> => {
  if (!buildingId || buildingId.trim() === '') {
    console.warn('Invalid buildingId provided to getEntrancesByBuildingId');
    return [];
  }
  if (USE_MOCK_DATA) {
    const matched = mockEntrances.filter(e => e.buildingId === buildingId);
    return Promise.resolve(matched as Entrance[]);
  }

  try {
    const fs = await getFirestore();
    const snapshot = await fs
      .collection(ENTRANCES_COLLECTION)
      .where('buildingId', '==', buildingId)
      .get();

    if (snapshot.empty) {
      console.warn(`No entrances found for building ${buildingId}`);
      return [];
    }

    const entrances: Entrance[] = [];
    snapshot.forEach((doc: any) => {
      const data = doc.data();
      if (data) {
        const entrance: Entrance = {
          id: doc.id,
          buildingId: data.buildingId || '',
          name: data.name || '',
          description: data.description || '',
          coordinates: convertFirestoreGeoPoint(data.coordinates),
          floor: data.floor,
          accessibility: data.accessibility,
          createdAt: convertFirestoreTimestamp(data.createdAt),
          updatedAt: convertFirestoreTimestamp(data.updatedAt),
        };
        entrances.push(entrance);
      }
    });

    return entrances;
  } catch (error) {
    console.error(
      `Error fetching entrances for building ${buildingId}:`,
      error,
    );
    return [];
  }
};
