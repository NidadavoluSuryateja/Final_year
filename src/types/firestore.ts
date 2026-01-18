/**
 * Firestore Data Models
 * Strict TypeScript interfaces for campus navigation data
 */

/**
 * Geographic coordinates using GeoPoint format
 */
export interface GeoPoint {
  latitude: number;
  longitude: number;
}

/**
 * Building entity representing a physical structure on campus
 */
export interface Building {
  id: string;
  name: string;
  description: string;
  location: GeoPoint;
  floors: number;
  imageUrl?: string;
  code?: string; // Building code (e.g., "CS" for Computer Science)
  facilities?: string[]; // e.g., ["cafeteria", "restroom", "library"]
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Building entrance for navigation starting/ending points
 */
export interface Entrance {
  id: string;
  buildingId: string; // Reference to Building
  name: string;
  description: string;
  coordinates: GeoPoint;
  floor?: number;
  accessibility?: {
    wheelchair: boolean;
    ramp: boolean;
    elevator: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Route between two locations on campus
 */
export interface Route {
  id: string;
  name: string;
  description: string;
  startBuilding: string; // Building ID
  endBuilding: string; // Building ID
  startEntrance?: string; // Entrance ID (optional - can be derived from building)
  endEntrance?: string; // Entrance ID (optional - can be derived from building)
  distance: number; // in meters
  estimatedTime: number; // in seconds
  difficulty: 'easy' | 'moderate' | 'difficult';
  outdoorPercentage: number; // 0-100, percentage of route that is outdoors
  pathNodeIds: string[]; // References to PathNode documents
  accessibility?: {
    wheelchair: boolean;
    pram: boolean;
  };
  tags?: string[]; // e.g., ["scenic", "shortest", "fastest"]
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Individual waypoint/node along a route
 */
export interface PathNode {
  id: string;
  routeId: string; // Reference to Route
  coordinates: GeoPoint;
  order: number; // Sequence number in the route
  type: 'waypoint' | 'turn' | 'landmark' | 'transition';
  description: string;
  heading?: number; // Compass heading in degrees (0-360)
  instructionText?: string; // Turn-by-turn instruction
  landmark?: {
    name: string;
    description: string;
  };
  floor?: number; // Floor level if indoors
  isIndoor: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Type guards for runtime checking
 */
export const isBuilding = (obj: any): obj is Building => {
  return (
    typeof obj === 'object' &&
    typeof obj.id === 'string' &&
    typeof obj.name === 'string' &&
    typeof obj.location === 'object' &&
    typeof obj.location.latitude === 'number' &&
    typeof obj.location.longitude === 'number'
  );
};

export const isEntrance = (obj: any): obj is Entrance => {
  return (
    typeof obj === 'object' &&
    typeof obj.id === 'string' &&
    typeof obj.buildingId === 'string' &&
    typeof obj.coordinates === 'object' &&
    typeof obj.coordinates.latitude === 'number' &&
    typeof obj.coordinates.longitude === 'number'
  );
};

export const isRoute = (obj: any): obj is Route => {
  return (
    typeof obj === 'object' &&
    typeof obj.id === 'string' &&
    typeof obj.startBuilding === 'string' &&
    typeof obj.endBuilding === 'string' &&
    typeof obj.distance === 'number' &&
    typeof obj.estimatedTime === 'number' &&
    Array.isArray(obj.pathNodeIds)
  );
};

export const isPathNode = (obj: any): obj is PathNode => {
  return (
    typeof obj === 'object' &&
    typeof obj.id === 'string' &&
    typeof obj.routeId === 'string' &&
    typeof obj.coordinates === 'object' &&
    typeof obj.coordinates.latitude === 'number' &&
    typeof obj.coordinates.longitude === 'number' &&
    typeof obj.order === 'number'
  );
};
