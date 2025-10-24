import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Search, Filter, List, Map as MapIcon, Navigation } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';
import PropertyMap from '@/components/PropertyMap';
import PropertyCard from '@/components/PropertyCard';
import { MOCK_PROPERTIES } from '@/mocks/properties';
import { useApp } from '@/contexts/AppContext';
import type { Property } from '@/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function MapScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { isSaved, toggleSaveProperty } = useApp();
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [properties, setProperties] = useState<Property[]>(MOCK_PROPERTIES);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      }
    } catch (error) {
      console.error('Error getting location:', error);
    }
  };

  const handlePropertySelect = useCallback((property: Property | null) => {
    Haptics.selectionAsync();
    setSelectedProperty(property);
  }, []);

  const handleViewModeToggle = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setViewMode(prev => prev === 'map' ? 'list' : 'map');
  }, []);

  const handleSearch = useCallback(() => {
    Haptics.selectionAsync();
    router.push('/search');
  }, [router]);

  const handleFilter = useCallback(() => {
    Haptics.selectionAsync();
    // TODO: Open filter modal
    console.log('Open filters');
  }, []);

  const handlePropertyPress = useCallback((property: Property) => {
    Haptics.selectionAsync();
    router.push(`/property/${property.id}`);
  }, [router]);

  const handleDirections = useCallback((property: Property) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // TODO: Open directions in maps app
    console.log('Open directions to:', property.title);
  }, []);

  const renderMapView = () => (
    <PropertyMap
      properties={properties}
      selectedProperty={selectedProperty}
      onPropertySelect={handlePropertySelect}
      showNeighborhoodInfo={true}
      showDistance={true}
      userLocation={userLocation}
    />
  );

  const renderListView = () => (
    <ScrollView style={styles.listContainer} showsVerticalScrollIndicator={false}>
      <View style={styles.listContent}>
        {properties.map((property) => (
          <PropertyCard
            key={property.id}
            property={property}
            onPress={() => handlePropertyPress(property)}
            onSwipeLeft={() => {}}
            onSwipeRight={() => {}}
            onSwipeUp={() => {}}
            onSwipeDown={() => {}}
            onDoubleTap={() => toggleSaveProperty(property.id)}
            onToggleSave={() => toggleSaveProperty(property.id)}
            isSaved={isSaved(property.id)}
            onLongPress={() => {}}
          />
        ))}
      </View>
    </ScrollView>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.title}>Map View</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerButton} onPress={handleSearch}>
            <Search size={20} color="#3B82F6" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton} onPress={handleFilter}>
            <Filter size={20} color="#3B82F6" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.viewModeToggle}>
        <TouchableOpacity
          style={[styles.toggleButton, viewMode === 'map' && styles.toggleButtonActive]}
          onPress={() => setViewMode('map')}
        >
          <MapIcon size={20} color={viewMode === 'map' ? '#FFFFFF' : '#6B7280'} />
          <Text style={[styles.toggleText, viewMode === 'map' && styles.toggleTextActive]}>
            Map
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleButton, viewMode === 'list' && styles.toggleButtonActive]}
          onPress={() => setViewMode('list')}
        >
          <List size={20} color={viewMode === 'list' ? '#FFFFFF' : '#6B7280'} />
          <Text style={[styles.toggleText, viewMode === 'list' && styles.toggleTextActive]}>
            List
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {viewMode === 'map' ? renderMapView() : renderListView()}
      </View>

      {selectedProperty && viewMode === 'map' && (
        <View style={styles.selectedPropertyCard}>
          <View style={styles.selectedPropertyHeader}>
            <Text style={styles.selectedPropertyTitle}>{selectedProperty.title}</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setSelectedProperty(null)}
            >
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
          </View>
          
          <Text style={styles.selectedPropertyPrice}>
            KES {selectedProperty.price.toLocaleString()}/month
          </Text>
          
          <Text style={styles.selectedPropertyLocation}>
            {selectedProperty.area}, {selectedProperty.location}
          </Text>
          
          <View style={styles.selectedPropertyActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handlePropertyPress(selectedProperty)}
            >
              <Text style={styles.actionButtonText}>View Details</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.directionsButton]}
              onPress={() => handleDirections(selectedProperty)}
            >
              <Navigation size={16} color="#FFFFFF" />
              <Text style={styles.directionsButtonText}>Directions</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 4,
    marginRight: 12,
  },
  title: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  headerRight: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    padding: 8,
  },
  viewModeToggle: {
    flexDirection: 'row',
    margin: 20,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 8,
  },
  toggleButtonActive: {
    backgroundColor: '#3B82F6',
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  toggleTextActive: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    padding: 20,
  },
  selectedPropertyCard: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  selectedPropertyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  selectedPropertyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
  },
  closeButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#6B7280',
  },
  selectedPropertyPrice: {
    fontSize: 18,
    fontWeight: '800',
    color: '#3B82F6',
    marginBottom: 4,
  },
  selectedPropertyLocation: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  selectedPropertyActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#EFF6FF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
  },
  directionsButton: {
    backgroundColor: '#3B82F6',
    flexDirection: 'row',
    gap: 6,
  },
  directionsButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
