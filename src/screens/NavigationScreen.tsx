/**
 * NavigationScreen
 * Real-time AR-like navigation guidance with camera view
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Animated,
  Alert,
  PermissionsAndroid,
  Modal,
} from 'react-native';
import { useRoutePath } from '../hooks/useRoutePath';
import { useNavigationEngine } from '../hooks/useNavigationEngine';
import type { ScreenProps } from '../types/navigation';

type NavigationScreenProps = ScreenProps<'Navigation'>;

/**
 * Navigation screen for turn-by-turn AR guidance
 */
const NavigationScreen: React.FC<NavigationScreenProps> = ({
  route,
  navigation,
}) => {
  const { buildingId, buildingName } = route.params;
  const [navigationActive, setNavigationActive] = useState(true);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [showFinalArrivalModal, setShowFinalArrivalModal] = useState(false);
  const [hasTriggeredFinalArrival, setHasTriggeredFinalArrival] =
    useState(false);

  // Fetch route path nodes
  // Note: In a real app, we would resolve the route first using navigationService.resolveRoute()
  // For now, we'll use the buildingId as a placeholder routeId
  const {
    coordinates: pathCoordinates,
    loading: pathLoading,
    error: pathError,
  } = useRoutePath(buildingId);

  // Get navigation engine output
  const navigationEngine = useNavigationEngine(
    pathCoordinates.map((coord, index) => ({
      id: `node-${index}`,
      routeId: buildingId,
      coordinates: {
        latitude: coord.latitude,
        longitude: coord.longitude,
      },
      order: coord.order,
      type: 'waypoint' as const,
      description: '',
      isIndoor: coord.isIndoor,
      floor: coord.floor,
      createdAt: new Date(),
      updatedAt: new Date(),
    })),
    navigationActive && permissionGranted,
  );

  /**
   * Request location permission on mount
   */
  useEffect(() => {
    const requestPermissions = async () => {
      try {
        const results = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          PermissionsAndroid.PERMISSIONS.CAMERA,
        ]);

        const grantedLocation =
          results[PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION] ===
          PermissionsAndroid.RESULTS.GRANTED;
        const grantedCamera =
          results[PermissionsAndroid.PERMISSIONS.CAMERA] ===
          PermissionsAndroid.RESULTS.GRANTED;

        if (grantedLocation && grantedCamera) {
          setPermissionGranted(true);
        } else {
          Alert.alert(
            'Permissions Required',
            'Location and Camera permissions are required for navigation features',
          );
          setPermissionGranted(false);
        }
      } catch (err) {
        console.error('Permission request error:', err);
        setPermissionGranted(false);
      }
    };

    requestPermissions();
  }, []);

  /**
   * Handle arrival at destination
   */
  useEffect(() => {
    if (navigationEngine.arriveAtDestination) {
      Alert.alert(
        'Destination Reached',
        `You have arrived at ${buildingName}`,
        [
          {
            text: 'Done',
            onPress: () => navigation.goBack(),
          },
        ],
      );
      setNavigationActive(false);
    }
  }, [navigationEngine.arriveAtDestination, buildingName, navigation]);

  /**
   * Detect final node arrival (5 meter threshold)
   * Show modal for entering building
   */
  useEffect(() => {
    const FINAL_ARRIVAL_THRESHOLD = 5; // meters

    // Check if we're at the final node
    if (
      navigationEngine.nearestNodeIndex === pathCoordinates.length - 1 &&
      navigationEngine.distance <= FINAL_ARRIVAL_THRESHOLD &&
      !hasTriggeredFinalArrival
    ) {
      setShowFinalArrivalModal(true);
      setHasTriggeredFinalArrival(true);
      setNavigationActive(false); // Pause navigation
    }
  }, [
    navigationEngine.nearestNodeIndex,
    navigationEngine.distance,
    pathCoordinates.length,
    hasTriggeredFinalArrival,
  ]);

  /**
   * Handle entering building from final node
   */
  const handleEnterBuilding = () => {
    setShowFinalArrivalModal(false);

    // Trigger indoor navigation callback
    console.log(`Entering building: ${buildingName} (${buildingId})`);

    // In a real app, this would trigger indoor navigation
    // For now, show an alert and navigate back
    Alert.alert(
      'Indoor Navigation',
      'Indoor navigation would start here for ' + buildingName,
      [
        {
          text: 'Done',
          onPress: () => navigation.goBack(),
        },
      ],
    );
  };

  if (pathLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading route...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (pathError || pathCoordinates.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            {pathError || 'No route available'}
          </Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!permissionGranted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionText}>
            Location permission is required for navigation
          </Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Camera View Placeholder */}
      <View style={styles.cameraViewContainer}>
        <View style={styles.cameraPlaceholder}>
          <Text style={styles.cameraPlaceholderText}>📷 Camera View</Text>
          <Text style={styles.cameraPlaceholderSubtext}>
            (AR would render here)
          </Text>
        </View>

        {/* Arrow Overlay */}
        <ArrowOverlay
          relativeBearing={navigationEngine.relativeBearing}
          isArrivingAtNode={navigationEngine.arrivednextNode}
        />

        {/* Navigation Info Panel */}
        <View
          style={[
            styles.infoPanel,
            navigationEngine.arriveAtDestination && styles.infoPanelArrived,
          ]}
        >
          {/* Distance Display */}
          <View style={styles.distanceContainer}>
            <Text style={styles.distanceLabel}>Distance</Text>
            <Text style={styles.distanceValue}>
              {navigationEngine.distance > 1000
                ? `${(navigationEngine.distance / 1000).toFixed(2)} km`
                : `${Math.round(navigationEngine.distance)} m`}
            </Text>
          </View>

          {/* Movement Instruction */}
          <View style={styles.instructionContainer}>
            <Text style={styles.instructionText} numberOfLines={3}>
              {navigationEngine.movementInstruction}
            </Text>
          </View>

          {/* Arrival Indicator */}
          {navigationEngine.arrivednextNode && (
            <View style={styles.arrivalIndicator}>
              <Text style={styles.arrivalText}>✓ Node Reached</Text>
            </View>
          )}

          {navigationEngine.arriveAtDestination && (
            <View style={styles.destinationIndicator}>
              <Text style={styles.destinationText}>🎉 Arrived!</Text>
            </View>
          )}
        </View>

        {/* Destination Header */}
        <View style={styles.headerContainer}>
          <Text style={styles.destinationName}>{buildingName}</Text>
        </View>

        {/* Navigation Controls */}
        <View style={styles.controlsContainer}>
          <TouchableOpacity
            style={styles.pauseButton}
            onPress={() => setNavigationActive(!navigationActive)}
          >
            <Text style={styles.pauseButtonText}>
              {navigationActive ? '⏸ Pause' : '▶ Resume'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.stopButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.stopButtonText}>✕ Exit</Text>
          </TouchableOpacity>
        </View>

        {/* Debug Info (Development Only) */}
        {__DEV__ && (
          <View style={styles.debugInfo}>
            <Text style={styles.debugText}>
              Bearing: {navigationEngine.userHeading?.toFixed(0) || 'N/A'}°
            </Text>
            <Text style={styles.debugText}>
              Rel: {navigationEngine.relativeBearing.toFixed(0)}°
            </Text>
            <Text style={styles.debugText}>
              Node: {navigationEngine.nearestNodeIndex ?? 'N/A'} /
              {pathCoordinates.length - 1}
            </Text>
          </View>
        )}
      </View>

      {/* Final Arrival Modal */}
      <Modal
        visible={showFinalArrivalModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowFinalArrivalModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalIcon}>✓</Text>
              <Text style={styles.modalTitle}>Destination Reached</Text>
            </View>

            <Text style={styles.modalDescription}>
              You have arrived at the entrance of{'\n'}
              <Text style={styles.buildingNameHighlight}>{buildingName}</Text>
            </Text>

            <View style={styles.modalInfo}>
              <Text style={styles.modalInfoText}>
                {navigationEngine.distance.toFixed(1)}m from entrance
              </Text>
            </View>

            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={styles.enterBuildingButton}
                onPress={handleEnterBuilding}
              >
                <Text style={styles.enterBuildingButtonText}>
                  → Enter Building
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.dismissButton}
                onPress={() => {
                  setShowFinalArrivalModal(false);
                  setNavigationActive(false);
                }}
              >
                <Text style={styles.dismissButtonText}>Exit Navigation</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

/**
 * Arrow overlay component that rotates based on relative bearing
 */
interface ArrowOverlayProps {
  relativeBearing: number;
  isArrivingAtNode: boolean;
}

const ArrowOverlay: React.FC<ArrowOverlayProps> = ({
  relativeBearing,
  isArrivingAtNode,
}) => {
  const [rotationValue] = useState(new Animated.Value(0));

  /**
   * Animate arrow rotation
   */
  useEffect(() => {
    Animated.timing(rotationValue, {
      toValue: relativeBearing,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [relativeBearing, rotationValue]);

  const rotationInterpolate = rotationValue.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.arrowContainer}>
      <Animated.View
        style={[
          styles.arrowWrapper,
          {
            transform: [{ rotate: rotationInterpolate }],
          },
        ]}
      >
        <Text style={[styles.arrow, isArrivingAtNode && styles.arrowArrived]}>
          ↑
        </Text>
      </Animated.View>

      {/* Bearing Indicator */}
      <View style={styles.bearingContainer}>
        <Text style={styles.bearingText}>
          {Math.abs(relativeBearing) > 45
            ? relativeBearing < 0
              ? '⬅ LEFT'
              : 'RIGHT ➡'
            : relativeBearing < -15
            ? '↖ L'
            : relativeBearing > 15
            ? 'R ↗'
            : '↑ STRAIGHT'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  cameraViewContainer: {
    flex: 1,
    position: 'relative',
  },
  cameraPlaceholder: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#333333',
  },
  cameraPlaceholderText: {
    fontSize: 18,
    color: '#888888',
    marginBottom: 8,
  },
  cameraPlaceholderSubtext: {
    fontSize: 12,
    color: '#666666',
  },
  // Arrow Overlay Styles
  arrowContainer: {
    position: 'absolute',
    top: '35%',
    left: '50%',
    marginLeft: -60,
    marginTop: -60,
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  arrowWrapper: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrow: {
    fontSize: 60,
    color: '#FFD700',
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 3,
  },
  arrowArrived: {
    color: '#00FF00',
  },
  bearingContainer: {
    marginTop: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  bearingText: {
    color: '#FFD700',
    fontSize: 12,
    fontWeight: 'bold',
  },
  // Header Styles
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    zIndex: 5,
  },
  destinationName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  // Info Panel Styles
  infoPanel: {
    position: 'absolute',
    bottom: 80,
    left: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    borderRadius: 8,
    padding: 14,
    borderLeftWidth: 3,
    borderLeftColor: '#FFD700',
    zIndex: 5,
  },
  infoPanelArrived: {
    borderLeftColor: '#00FF00',
    backgroundColor: 'rgba(0, 100, 0, 0.5)',
  },
  distanceContainer: {
    marginBottom: 10,
  },
  distanceLabel: {
    fontSize: 11,
    color: '#AAAAAA',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  distanceValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFD700',
    marginTop: 2,
  },
  instructionContainer: {
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    lineHeight: 20,
  },
  arrivalIndicator: {
    backgroundColor: 'rgba(0, 255, 0, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  arrivalText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#00FF00',
  },
  destinationIndicator: {
    backgroundColor: 'rgba(100, 0, 0, 0.6)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  destinationText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#00FF00',
  },
  // Controls Styles
  controlsContainer: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    gap: 8,
    zIndex: 5,
  },
  pauseButton: {
    flex: 1,
    backgroundColor: '#FF8C00',
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  pauseButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  stopButton: {
    flex: 1,
    backgroundColor: '#FF4444',
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  stopButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  // Error/Loading States
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#FF4444',
    textAlign: 'center',
    marginBottom: 16,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  permissionText: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
  },
  backButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 6,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  // Debug Info
  debugInfo: {
    position: 'absolute',
    bottom: 80,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 4,
    zIndex: 5,
  },
  debugText: {
    fontSize: 10,
    color: '#00FF00',
    fontFamily: 'monospace',
    marginVertical: 1,
  },
  // Final Arrival Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    marginHorizontal: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  modalIcon: {
    fontSize: 48,
    color: '#00AA00',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#000000',
  },
  modalDescription: {
    fontSize: 16,
    color: '#333333',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 22,
  },
  buildingNameHighlight: {
    fontSize: 18,
    fontWeight: '700',
    color: '#007AFF',
  },
  modalInfo: {
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  modalInfoText: {
    fontSize: 13,
    color: '#666666',
  },
  modalButtonContainer: {
    gap: 10,
  },
  enterBuildingButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  enterBuildingButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  dismissButton: {
    backgroundColor: '#E8E8E8',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  dismissButtonText: {
    color: '#333333',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default NavigationScreen;
