/**
 * DestinationSelectionScreen
 * Displays available buildings for route navigation
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Building } from '../types/firestore';
import { getBuildings } from '../services/firestoreService';
import type { ScreenProps, RootStackParamList } from '../types/navigation';

type DestinationSelectionScreenProps = ScreenProps<'DestinationSelection'>;

interface BuildingItem extends Building {
  category?: string;
}

/**
 * Screen for selecting a destination building
 */
const DestinationSelectionScreen: React.FC<DestinationSelectionScreenProps> = ({
  navigation,
}) => {
  const [buildings, setBuildings] = useState<BuildingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch buildings on component mount
  useEffect(() => {
    const loadBuildings = async () => {
      try {
        setLoading(true);
        setError(null);
        const fetchedBuildings = await getBuildings();

        if (fetchedBuildings.length === 0) {
          setError('No buildings found. Please check your data.');
          setBuildings([]);
        } else {
          // Add category based on building code or name
          const buildingsWithCategory = fetchedBuildings.map((building) => ({
            ...building,
            category: building.code || building.name.split(' ')[0],
          }));
          setBuildings(buildingsWithCategory);
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to load buildings';
        setError(errorMessage);
        console.error('Error loading buildings:', err);
      } finally {
        setLoading(false);
      }
    };

    loadBuildings();
  }, []);

  /**
   * Handle building selection and navigation
   */
  const handleSelectBuilding = useCallback(
    (building: BuildingItem) => {
      if (!building.id || !building.location) {
        Alert.alert('Invalid Building', 'This building has missing location data');
        return;
      }

      // Navigate to NavigationScreen with building info
      navigation.navigate('Navigation', {
        buildingId: building.id,
        buildingName: building.name,
        coordinates: {
          latitude: building.location.latitude,
          longitude: building.location.longitude,
        },
      });
    },
    [navigation]
  );

  /**
   * Render individual building item
   */
  const renderBuildingItem = ({ item }: { item: BuildingItem }) => (
    <TouchableOpacity
      style={styles.buildingCard}
      onPress={() => handleSelectBuilding(item)}
      activeOpacity={0.7}
    >
      <View style={styles.cardContent}>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{item.category}</Text>
        </View>
        <Text style={styles.buildingName} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={styles.buildingDescription} numberOfLines={2}>
          {item.description || 'No description available'}
        </Text>
        {item.facilities && item.facilities.length > 0 && (
          <Text style={styles.facilities}>
            {item.facilities.join(', ')}
          </Text>
        )}
      </View>
      <View style={styles.arrow}>
        <Text style={styles.arrowText}>›</Text>
      </View>
    </TouchableOpacity>
  );

  /**
   * Render empty state
   */
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>
        {error || 'No buildings available'}
      </Text>
      {error && (
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => {
            // Trigger refetch by re-running effect
            setLoading(true);
            getBuildings()
              .then((fetchedBuildings) => {
                if (fetchedBuildings.length === 0) {
                  setError('No buildings found.');
                } else {
                  const buildingsWithCategory = fetchedBuildings.map(
                    (building) => ({
                      ...building,
                      category: building.code || building.name.split(' ')[0],
                    })
                  );
                  setBuildings(buildingsWithCategory);
                  setError(null);
                }
              })
              .catch((err) => {
                setError(
                  err instanceof Error ? err.message : 'Failed to load buildings'
                );
              })
              .finally(() => setLoading(false));
          }}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Select Destination</Text>
        <Text style={styles.headerSubtitle}>
          Choose a building to navigate to
        </Text>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading buildings...</Text>
        </View>
      ) : buildings.length > 0 ? (
        <FlatList
          data={buildings}
          renderItem={renderBuildingItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={true}
        />
      ) : (
        renderEmptyState()
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666666',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666666',
  },
  listContent: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  buildingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginVertical: 6,
    marginHorizontal: 4,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8E8E8',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardContent: {
    flex: 1,
  },
  categoryBadge: {
    backgroundColor: '#007AFF',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  buildingName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  buildingDescription: {
    fontSize: 13,
    color: '#666666',
    marginBottom: 4,
    lineHeight: 18,
  },
  facilities: {
    fontSize: 12,
    color: '#999999',
    fontStyle: 'italic',
  },
  arrow: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 12,
  },
  arrowText: {
    fontSize: 24,
    color: '#007AFF',
    fontWeight: '300',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 6,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default DestinationSelectionScreen;
