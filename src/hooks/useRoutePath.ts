/**
 * useRoutePath Hook
 * Fetches and manages path nodes for a given route
 */

import { useState, useEffect, useCallback } from 'react';
import { PathNode } from '../types/firestore';
import { getPathNodesByRouteId } from '../services/firestoreService';

/**
 * Coordinate representation
 */
export interface RouteCoordinate {
  latitude: number;
  longitude: number;
  order: number;
  floor?: number;
  isIndoor: boolean;
}

/**
 * Navigation instruction
 */
export interface RouteInstruction {
  order: number;
  text: string;
  type: 'waypoint' | 'turn' | 'landmark' | 'transition';
  heading?: number;
  landmark?: {
    name: string;
    description: string;
  };
}

/**
 * Return type for useRoutePath hook
 */
export interface UseRoutePathReturn {
  pathNodes: PathNode[];
  coordinates: RouteCoordinate[];
  instructions: RouteInstruction[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Custom hook to fetch and manage route path nodes
 *
 * @param routeId - The ID of the route to fetch path nodes for
 * @returns Object containing path nodes, coordinates, instructions, loading state, and error
 *
 * @example
 * const { coordinates, instructions, loading, error } = useRoutePath(routeId);
 * if (loading) return <Loading />;
 * if (error) return <Error message={error} />;
 * // Use coordinates and instructions for navigation
 */
export const useRoutePath = (routeId: string | null | undefined): UseRoutePathReturn => {
  const [pathNodes, setPathNodes] = useState<PathNode[]>([]);
  const [coordinates, setCoordinates] = useState<RouteCoordinate[]>([]);
  const [instructions, setInstructions] = useState<RouteInstruction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Transform PathNode array into coordinates array
   */
  const transformToCoordinates = useCallback((nodes: PathNode[]): RouteCoordinate[] => {
    return nodes.map((node) => ({
      latitude: node.coordinates.latitude,
      longitude: node.coordinates.longitude,
      order: node.order,
      floor: node.floor,
      isIndoor: node.isIndoor,
    }));
  }, []);

  /**
   * Transform PathNode array into instructions array
   */
  const transformToInstructions = useCallback((nodes: PathNode[]): RouteInstruction[] => {
    return nodes
      .filter((node) => node.type === 'turn' || node.instructionText)
      .map((node) => ({
        order: node.order,
        text: node.instructionText || node.description,
        type: node.type,
        heading: node.heading,
        landmark: node.landmark,
      }));
  }, []);

  /**
   * Fetch path nodes for the route
   */
  const fetchPathNodes = useCallback(async () => {
    if (!routeId || routeId.trim() === '') {
      setError('Invalid route ID');
      setPathNodes([]);
      setCoordinates([]);
      setInstructions([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const fetchedNodes = await getPathNodesByRouteId(routeId);

      if (fetchedNodes.length === 0) {
        setError(`No path nodes found for route ${routeId}`);
        setPathNodes([]);
        setCoordinates([]);
        setInstructions([]);
        return;
      }

      // Path nodes should already be sorted by order from the service
      const sortedNodes = fetchedNodes.sort((a, b) => a.order - b.order);

      setPathNodes(sortedNodes);
      setCoordinates(transformToCoordinates(sortedNodes));
      setInstructions(transformToInstructions(sortedNodes));
      setError(null);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch path nodes';
      console.error(`Error fetching path nodes for route ${routeId}:`, err);
      setError(errorMessage);
      setPathNodes([]);
      setCoordinates([]);
      setInstructions([]);
    } finally {
      setLoading(false);
    }
  }, [routeId, transformToCoordinates, transformToInstructions]);

  /**
   * Fetch path nodes when route ID changes
   */
  useEffect(() => {
    fetchPathNodes();
  }, [fetchPathNodes]);

  /**
   * Public refetch method
   */
  const refetch = useCallback(async () => {
    await fetchPathNodes();
  }, [fetchPathNodes]);

  return {
    pathNodes,
    coordinates,
    instructions,
    loading,
    error,
    refetch,
  };
};
