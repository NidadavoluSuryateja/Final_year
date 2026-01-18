/**
 * Firestore Read-Only Service
 * Handles all read operations for campus navigation data
 */

import firestore, {
  FirebaseFirestoreTypes,
} from '@react-native-firebase/firestore';
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

/**
 * Convert Firestore timestamp to JavaScript Date
 */
const convertFirestoreTimestamp = (
  timestamp: FirebaseFirestoreTypes.Timestamp | undefined
): Date => {
  if (!timestamp) {
    return new Date();
  }
  return timestamp.toDate();
};

/**
 * Convert Firestore GeoPoint to coordinates object
 */
const convertFirestoreGeoPoint = (
  geoPoint: FirebaseFirestoreTypes.GeoPoint | undefined
) => {
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
 */
const transformBuilding = (
  doc: FirebaseFirestoreTypes.DocumentSnapshot
): Building | null => {
  const data = doc.data();
  if (!data) return null;

  try {
    const building: Building = {
      id: doc.id,
      name: data.name || '',
      description: data.description || '',
      location: convertFirestoreGeoPoint(data.location),
      floors: data.floors || 1,
      imageUrl: data.imageUrl,
      code: data.code,
      facilities: Array.isArray(data.facilities) ? data.facilities : [],
      createdAt: convertFirestoreTimestamp(data.createdAt),
      updatedAt: convertFirestoreTimestamp(data.updatedAt),
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
const transformRoute = (
  doc: FirebaseFirestoreTypes.DocumentSnapshot
): Route | null => {
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
const transformPathNode = (
  doc: FirebaseFirestoreTypes.DocumentSnapshot
): PathNode | null => {
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
  try {
    const snapshot = await firestore()
      .collection(BUILDINGS_COLLECTION)
      .get();

    if (snapshot.empty) {
      console.warn('No buildings found in Firestore');
      return [];
    }

    const buildings: Building[] = [];
    snapshot.forEach((doc) => {
      const building = transformBuilding(doc);
      if (building) {
        buildings.push(building);
      }
    });

    return buildings;
  } catch (error) {
    console.error('Error fetching buildings:', error);
    return [];
  }
};

/**
 * Fetch all routes from Firestore
 * @returns Array of Route objects, empty array if no routes found
 */
export const getRoutes = async (): Promise<Route[]> => {
  try {
    const snapshot = await firestore().collection(ROUTES_COLLECTION).get();

    if (snapshot.empty) {
      console.warn('No routes found in Firestore');
      return [];
    }

    const routes: Route[] = [];
    snapshot.forEach((doc) => {
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
  routeId: string
): Promise<PathNode[]> => {
  if (!routeId || routeId.trim() === '') {
    console.warn('Invalid routeId provided to getPathNodesByRouteId');
    return [];
  }

  try {
    const snapshot = await firestore()
      .collection(PATH_NODES_COLLECTION)
      .where('routeId', '==', routeId)
      .orderBy('order', 'asc')
      .get();

    if (snapshot.empty) {
      console.warn(`No path nodes found for route ${routeId}`);
      return [];
    }

    const pathNodes: PathNode[] = [];
    snapshot.forEach((doc) => {
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
  buildingId: string
): Promise<Building | null> => {
  if (!buildingId || buildingId.trim() === '') {
    console.warn('Invalid buildingId provided to getBuildingById');
    return null;
  }

  try {
    const doc = await firestore()
      .collection(BUILDINGS_COLLECTION)
      .doc(buildingId)
      .get();

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

  try {
    const doc = await firestore()
      .collection(ROUTES_COLLECTION)
      .doc(routeId)
      .get();

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
  buildingId: string
): Promise<Entrance[]> => {
  if (!buildingId || buildingId.trim() === '') {
    console.warn('Invalid buildingId provided to getEntrancesByBuildingId');
    return [];
  }

  try {
    const snapshot = await firestore()
      .collection(ENTRANCES_COLLECTION)
      .where('buildingId', '==', buildingId)
      .get();

    if (snapshot.empty) {
      console.warn(`No entrances found for building ${buildingId}`);
      return [];
    }

    const entrances: Entrance[] = [];
    snapshot.forEach((doc) => {
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
      error
    );
    return [];
  }
};
