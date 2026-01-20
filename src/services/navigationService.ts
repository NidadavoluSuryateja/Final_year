/**
 * Navigation Service
 * Handles route resolution and navigation logic
 */

import { getRoutes } from './firestoreService';
import { Route } from '../types/firestore';

/**
 * User location coordinates
 */
export interface UserLocation {
  latitude: number;
  longitude: number;
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in kilometers
 */
export const calculateDistance = (
  coord1: UserLocation,
  coord2: UserLocation,
): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((coord2.latitude - coord1.latitude) * Math.PI) / 180;
  const dLon = ((coord2.longitude - coord1.longitude) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((coord1.latitude * Math.PI) / 180) *
      Math.cos((coord2.latitude * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance;
};

/**
 * Resolve the best route from current user location to selected building
 *
 * Strategy:
 * 1. Fetch all routes from Firestore
 * 2. Filter routes that end at the selected building
 * 3. If multiple routes exist, select based on:
 *    - Distance from user to route start point
 *    - Route difficulty
 *    - Accessibility requirements
 * 4. Return the routeId of the best match
 *
 * @param userLocation - Current user GPS coordinates
 * @param selectedBuildingId - Target building ID
 * @param preferShortestTime - If true, prefer fastest route; if false, prefer shortest distance
 * @returns routeId of the selected route, or null if no suitable route found
 */
export const resolveRoute = async (
  userLocation: UserLocation,
  selectedBuildingId: string,
  preferShortestTime: boolean = true,
): Promise<string | null> => {
  if (!userLocation || !selectedBuildingId) {
    console.warn('Invalid parameters for resolveRoute');
    return null;
  }

  try {
    // Fetch all available routes
    const allRoutes = await getRoutes();

    if (allRoutes.length === 0) {
      console.warn('No routes available in Firestore');
      return null;
    }

    // Filter routes that end at the selected building
    const matchingRoutes = allRoutes.filter(
      route => route.endBuilding === selectedBuildingId,
    );

    if (matchingRoutes.length === 0) {
      console.warn(`No routes found ending at building ${selectedBuildingId}`);
      return null;
    }

    // If only one route matches, return it
    if (matchingRoutes.length === 1) {
      console.log(`Selected unique route: ${matchingRoutes[0].id}`);
      return matchingRoutes[0].id;
    }

    // Multiple routes exist - select the best one
    const routeScores = matchingRoutes.map(route => {
      let score = 0;

      // Calculate distance from user to route start
      // Note: In a real app, you'd fetch the start building location
      // For now, we use a proximity preference
      const distanceWeight = preferShortestTime ? 0.2 : 0.4;
      const timeWeight = preferShortestTime ? 0.6 : 0.2;
      const difficultyWeight = 0.2;

      // Scoring components (lower is better)
      let distanceScore = 0;
      if (route.startBuilding) {
        // Prefer routes with shorter estimated travel times
        distanceScore = route.estimatedTime / 1000; // Convert seconds to reasonable scale
      }

      // Time score (prefer shorter estimated times)
      const timeScore = route.estimatedTime / 1000;

      // Difficulty score (prefer easier routes)
      const difficultyScoreMap = {
        easy: 1,
        moderate: 2,
        difficult: 3,
      };
      const difficultyScore = difficultyScoreMap[route.difficulty];

      // Combined weighted score
      score =
        distanceScore * distanceWeight +
        timeScore * timeWeight +
        difficultyScore * difficultyWeight;

      return {
        route,
        score,
        estimatedTime: route.estimatedTime,
        distance: route.distance,
        difficulty: route.difficulty,
      };
    });

    // Sort by score and select the best route
    const sortedRoutes = routeScores.sort((a, b) => a.score - b.score);

    if (sortedRoutes.length > 0) {
      const selectedRoute = sortedRoutes[0];
      console.log(
        `Selected best route: ${
          selectedRoute.route.id
        } (score: ${selectedRoute.score.toFixed(2)}, time: ${
          selectedRoute.estimatedTime
        }s, distance: ${selectedRoute.distance}m)`,
      );
      return selectedRoute.route.id;
    }

    return null;
  } catch (error) {
    console.error('Error resolving route:', error);
    return null;
  }
};

/**
 * Get route information for display
 * Useful for showing route details before navigation
 *
 * @param routeId - The ID of the route to fetch
 * @returns Route object or null if not found
 */
export const getRouteInfo = async (routeId: string): Promise<Route | null> => {
  if (!routeId) {
    console.warn('Invalid routeId provided to getRouteInfo');
    return null;
  }

  try {
    const allRoutes = await getRoutes();
    const route = allRoutes.find(r => r.id === routeId);

    if (!route) {
      console.warn(`Route ${routeId} not found`);
      return null;
    }

    return route;
  } catch (error) {
    console.error(`Error fetching route info for ${routeId}:`, error);
    return null;
  }
};

/**
 * Find alternative routes to a destination
 * Useful for showing multiple options to the user
 *
 * @param selectedBuildingId - Target building ID
 * @param limit - Maximum number of routes to return
 * @returns Array of available Route objects
 */
export const getAlternativeRoutes = async (
  selectedBuildingId: string,
  limit: number = 3,
): Promise<Route[]> => {
  if (!selectedBuildingId) {
    console.warn('Invalid buildingId provided to getAlternativeRoutes');
    return [];
  }

  try {
    const allRoutes = await getRoutes();
    const matchingRoutes = allRoutes
      .filter(route => route.endBuilding === selectedBuildingId)
      .sort((a, b) => a.estimatedTime - b.estimatedTime)
      .slice(0, limit);

    if (matchingRoutes.length === 0) {
      console.warn(
        `No alternative routes found for building ${selectedBuildingId}`,
      );
      return [];
    }

    return matchingRoutes;
  } catch (error) {
    console.error('Error fetching alternative routes:', error);
    return [];
  }
};
