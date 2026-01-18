/**
 * useNavigationEngine Hook
 * Real-time navigation engine that tracks user movement and provides turn-by-turn guidance
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import Geolocation from '@react-native-community/geolocation';
import { PathNode } from '../types/firestore';

/**
 * Current user GPS coordinates
 */
export interface GPSLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

/**
 * Navigation engine output
 */
export interface NavigationOutput {
  currentLocation: GPSLocation | null;
  nearestNodeIndex: number | null;
  nextNodeIndex: number | null;
  distance: number; // meters to next node
  relativeBearing: number; // degrees (-180 to 180), negative = left, positive = right
  userHeading: number | null; // degrees (0-360)
  movementInstruction: string;
  arrivednextNode: boolean;
  arriveAtDestination: boolean;
}

/**
 * Calculate distance between two points using Haversine formula
 * Returns distance in meters
 */
const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371000; // Earth's radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Calculate bearing (compass direction) from point 1 to point 2
 * Returns bearing in degrees (0-360), where:
 * 0° = North, 90° = East, 180° = South, 270° = West
 */
const calculateBearing = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const lat1Rad = (lat1 * Math.PI) / 180;
  const lat2Rad = (lat2 * Math.PI) / 180;

  const y = Math.sin(dLon) * Math.cos(lat2Rad);
  const x =
    Math.cos(lat1Rad) * Math.sin(lat2Rad) -
    Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLon);

  let bearing = Math.atan2(y, x);
  bearing = (bearing * 180) / Math.PI;
  bearing = (bearing + 360) % 360; // Normalize to 0-360

  return bearing;
};

/**
 * Normalize bearing difference to -180 to 180 range
 * Negative = turn left, Positive = turn right
 */
const normalizeBearingDifference = (bearing: number): number => {
  if (bearing > 180) {
    return bearing - 360;
  }
  if (bearing < -180) {
    return bearing + 360;
  }
  return bearing;
};

/**
 * Find the nearest path node to current location
 */
const findNearestNode = (
  location: GPSLocation,
  pathNodes: PathNode[]
): number | null => {
  if (pathNodes.length === 0) return null;

  let nearestIndex = 0;
  let minDistance = calculateDistance(
    location.latitude,
    location.longitude,
    pathNodes[0].coordinates.latitude,
    pathNodes[0].coordinates.longitude
  );

  for (let i = 1; i < pathNodes.length; i++) {
    const distance = calculateDistance(
      location.latitude,
      location.longitude,
      pathNodes[i].coordinates.latitude,
      pathNodes[i].coordinates.longitude
    );

    if (distance < minDistance) {
      minDistance = distance;
      nearestIndex = i;
    }
  }

  return nearestIndex;
};

/**
 * Generate movement instruction based on bearing change
 */
const generateMovementInstruction = (
  relativeBearing: number,
  distance: number,
  nextNode: PathNode | null
): string => {
  // Arrival threshold in meters
  const ARRIVAL_THRESHOLD = 15;

  if (distance < ARRIVAL_THRESHOLD) {
    return 'You have reached the waypoint';
  }

  let instruction = '';

  if (relativeBearing < -45) {
    instruction = 'Turn left';
  } else if (relativeBearing > 45) {
    instruction = 'Turn right';
  } else if (relativeBearing < -15) {
    instruction = 'Slight left';
  } else if (relativeBearing > 15) {
    instruction = 'Slight right';
  } else {
    instruction = 'Continue straight';
  }

  // Add custom instruction if available
  if (nextNode?.instructionText) {
    instruction = nextNode.instructionText;
  }

  // Add landmark information
  if (nextNode?.landmark) {
    instruction += ` toward ${nextNode.landmark.name}`;
  }

  // Add floor information for indoor navigation
  if (nextNode?.floor !== undefined && nextNode.isIndoor) {
    instruction += ` (Floor ${nextNode.floor})`;
  }

  // Add distance
  if (distance > 100) {
    instruction += ` in ${Math.round(distance / 10) * 10}m`;
  } else if (distance > 0) {
    instruction += ` in ${Math.round(distance)}m`;
  }

  return instruction;
};

/**
 * Custom hook for real-time navigation engine
 *
 * @param pathNodes - Ordered array of path nodes from the route
 * @param enabled - Whether to track location (default: true)
 * @param updateInterval - GPS update interval in milliseconds (default: 2000ms)
 * @returns Navigation output with current state and guidance
 *
 * @example
 * const { currentLocation, distance, relativeBearing, movementInstruction } = useNavigationEngine(pathNodes);
 */
export const useNavigationEngine = (
  pathNodes: PathNode[],
  enabled: boolean = true,
  updateInterval: number = 2000
): NavigationOutput => {
  const [currentLocation, setCurrentLocation] = useState<GPSLocation | null>(null);
  const [nearestNodeIndex, setNearestNodeIndex] = useState<number | null>(null);
  const [distance, setDistance] = useState(0);
  const [relativeBearing, setRelativeBearing] = useState(0);
  const [userHeading, setUserHeading] = useState<number | null>(null);
  const [movementInstruction, setMovementInstruction] = useState(
    'Initializing navigation...'
  );
  const [arrivednextNode, setArrivedNextNode] = useState(false);
  const [arriveAtDestination, setArriveAtDestination] = useState(false);

  const watchIdRef = useRef<number | null>(null);

  /**
   * Update navigation state based on current location and path nodes
   */
  const updateNavigationState = useCallback(
    (location: GPSLocation) => {
      if (pathNodes.length === 0) {
        setMovementInstruction('No path nodes available');
        return;
      }

      // Find nearest node
      const nearest = findNearestNode(location, pathNodes);
      setNearestNodeIndex(nearest);

      if (nearest === null) return;

      // Determine next node index
      const nextIndex =
        nearest < pathNodes.length - 1 ? nearest + 1 : nearest;
      const nextNode = pathNodes[nextIndex];

      // Calculate distance to next node
      const distToNext = calculateDistance(
        location.latitude,
        location.longitude,
        nextNode.coordinates.latitude,
        nextNode.coordinates.longitude
      );
      setDistance(distToNext);

      // Calculate bearing to next node
      const bearingToNext = calculateBearing(
        location.latitude,
        location.longitude,
        nextNode.coordinates.latitude,
        nextNode.coordinates.longitude
      );

      // Calculate relative bearing (difference between user heading and target bearing)
      let relBearing = 0;
      if (userHeading !== null) {
        relBearing = normalizeBearingDifference(bearingToNext - userHeading);
      }
      setRelativeBearing(relBearing);

      // Check if arrived at next node
      const ARRIVAL_THRESHOLD = 15; // meters
      const arrivedAtNext = distToNext < ARRIVAL_THRESHOLD;
      setArrivedNextNode(arrivedAtNext);

      // Check if arrived at destination (last node)
      const arrivedAtDest =
        nextIndex === pathNodes.length - 1 && arrivedAtNext;
      setArriveAtDestination(arrivedAtDest);

      // Generate movement instruction
      const instruction = generateMovementInstruction(
        relBearing,
        distToNext,
        nextNode
      );
      setMovementInstruction(instruction);
    },
    [pathNodes, userHeading]
  );

  /**
   * Handle location updates
   */
  const handleLocationUpdate = useCallback(
    (position: any) => {
      const location: GPSLocation = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: position.timestamp,
      };

      setCurrentLocation(location);

      // Extract heading if available
      if (position.coords.heading !== undefined && position.coords.heading >= 0) {
        setUserHeading(position.coords.heading);
      }

      updateNavigationState(location);
    },
    [updateNavigationState]
  );

  /**
   * Handle location errors
   */
  const handleLocationError = useCallback((error: any) => {
    console.warn('Geolocation error:', error);
    setMovementInstruction(`Location error: ${error.message}`);
  }, []);

  /**
   * Start/stop GPS tracking
   */
  useEffect(() => {
    if (!enabled || pathNodes.length === 0) {
      if (watchIdRef.current !== null) {
        Geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      return;
    }

    // Request high-accuracy location updates
    watchIdRef.current = Geolocation.watchPosition(
      handleLocationUpdate,
      handleLocationError,
      {
        enableHighAccuracy: true,
        timeout: updateInterval * 2,
        maximumAge: 0,
      }
    );

    return () => {
      if (watchIdRef.current !== null) {
        Geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [enabled, pathNodes.length, updateInterval, handleLocationUpdate, handleLocationError]);

  return {
    currentLocation,
    nearestNodeIndex,
    nextNodeIndex: nearestNodeIndex !== null && nearestNodeIndex < pathNodes.length - 1
      ? nearestNodeIndex + 1
      : nearestNodeIndex,
    distance,
    relativeBearing,
    userHeading,
    movementInstruction,
    arrivednextNode,
    arriveAtDestination,
  };
};
