import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import { MapPin, Navigation, Layers, Info } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import type { Property } from '@/types';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface PropertyMapProps {
  properties: Property[];
  selectedProperty?: Property | null;
  onPropertySelect: (property: Property) => void;
  onRegionChange?: (region: Region) => void;
  showNeighborhoodInfo?: boolean;
  showDistance?: boolean;
  userLocation?: {
    latitude: number;
    longitude: number;
  };
}

export default function PropertyMap({
  properties,
  selectedProperty,
  onPropertySelect,
  onRegionChange,
  showNeighborhoodInfo = true,
  showDistance = true,
  userLocation,
}: PropertyMapProps) {
  const [mapType, setMapType] = useState<'standard' | 'satellite' | 'hybrid'>('standard');
  const [showTraffic, setShowTraffic] = useState(false);
  const mapRef = useRef<MapView>(null);

  const defaultRegion: Region = {
    latitude: -1.2921, // Nairobi coordinates
    longitude: 36.8219,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  const handleMarkerPress = useCallback((property: Property) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPropertySelect(property);
  }, [onPropertySelect]);

  const handleMapPress = useCallback(() => {
    Haptics.selectionAsync();
    onPropertySelect(null);
  }, [onPropertySelect]);

  const handleRegionChangeComplete = useCallback((region: Region) => {
    onRegionChange?.(region);
  }, [onRegionChange]);

  const toggleMapType = useCallback(() => {
    Haptics.selectionAsync();
    setMapType(prev => {
      switch (prev) {
        case 'standard':
          return 'satellite';
        case 'satellite':
          return 'hybrid';
        case 'hybrid':
          return 'standard';
        default:
          return 'standard';
      }
    });
  }, []);

  const toggleTraffic = useCallback(() => {
    Haptics.selectionAsync();
    setShowTraffic(!showTraffic);
  }, [showTraffic]);

  const centerOnUser = useCallback(() => {
    if (userLocation && mapRef.current) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      mapRef.current.animateToRegion({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 1000);
    }
  }, [userLocation]);

  const getMarkerColor = (property: Property) => {
    if (selectedProperty?.id === property.id) {
      return '#3B82F6';
    }
    switch (property.status) {
      case 'available':
        return '#10B981';
      case 'occupied':
        return '#6B7280';
      case 'maintenance':
        return '#F59E0B';
      default:
        return '#3B82F6';
    }
  };

  const calculateDistance = (property: Property) => {
    if (!userLocation) return null;
    
    const R = 6371; // Earth's radius in kilometers
    const dLat = (property.latitude - userLocation.latitude) * Math.PI / 180;
    const dLon = (property.longitude - userLocation.longitude) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(userLocation.latitude * Math.PI / 180) * Math.cos(property.latitude * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    
    return distance.toFixed(1);
  };

  const getNeighborhoodInfo = (region: Region) => {
    // Mock neighborhood data - in real app, this would come from an API
    const neighborhoods = [
      { name: 'Westlands', type: 'Business District', avgPrice: 45000 },
      { name: 'Kilimani', type: 'Residential', avgPrice: 38000 },
      { name: 'Karen', type: 'Upscale', avgPrice: 65000 },
      { name: 'CBD', type: 'Commercial', avgPrice: 55000 },
    ];
    
    return neighborhoods[Math.floor(Math.random() * neighborhoods.length)];
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={defaultRegion}
        onPress={handleMapPress}
        onRegionChangeComplete={handleRegionChangeComplete}
        mapType={mapType}
        showsTraffic={showTraffic}
        showsUserLocation={!!userLocation}
        showsMyLocationButton={false}
        showsCompass={true}
        showsScale={true}
      >
        {properties.map((property) => (
          <Marker
            key={property.id}
            coordinate={{
              latitude: property.latitude,
              longitude: property.longitude,
            }}
            onPress={() => handleMarkerPress(property)}
            pinColor={getMarkerColor(property)}
          >
            <View style={styles.markerContainer}>
              <View style={[styles.marker, { backgroundColor: getMarkerColor(property) }]}>
                <Text style={styles.markerPrice}>
                  KES {Math.floor(property.price / 1000)}K
                </Text>
              </View>
              {selectedProperty?.id === property.id && (
                <View style={styles.selectedMarker}>
                  <MapPin size={16} color="#FFFFFF" />
                </View>
              )}
            </View>
          </Marker>
        ))}
      </MapView>

      <View style={styles.controls}>
        <TouchableOpacity style={styles.controlButton} onPress={toggleMapType}>
          <Layers size={20} color="#FFFFFF" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.controlButton} onPress={toggleTraffic}>
          <Navigation size={20} color="#FFFFFF" />
        </TouchableOpacity>
        
        {userLocation && (
          <TouchableOpacity style={styles.controlButton} onPress={centerOnUser}>
            <MapPin size={20} color="#FFFFFF" />
          </TouchableOpacity>
        )}
      </View>

      {selectedProperty && (
        <View style={styles.propertyInfo}>
          <View style={styles.propertyHeader}>
            <Text style={styles.propertyTitle}>{selectedProperty.title}</Text>
            <Text style={styles.propertyPrice}>
              KES {selectedProperty.price.toLocaleString()}/month
            </Text>
          </View>
          
          <View style={styles.propertyDetails}>
            <Text style={styles.propertyLocation}>
              {selectedProperty.area}, {selectedProperty.location}
            </Text>
            
            {showDistance && userLocation && (
              <Text style={styles.distance}>
                {calculateDistance(selectedProperty)} km away
              </Text>
            )}
          </View>
          
          <View style={styles.propertyActions}>
            <TouchableOpacity style={styles.actionButton}>
              <Navigation size={16} color="#3B82F6" />
              <Text style={styles.actionText}>Directions</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Info size={16} color="#3B82F6" />
              <Text style={styles.actionText}>Details</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {showNeighborhoodInfo && (
        <View style={styles.neighborhoodInfo}>
          <Text style={styles.neighborhoodTitle}>Neighborhood</Text>
          <Text style={styles.neighborhoodName}>Westlands</Text>
          <Text style={styles.neighborhoodType}>Business District</Text>
          <Text style={styles.neighborhoodPrice}>Avg: KES 45,000/month</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  controls: {
    position: 'absolute',
    top: 20,
    right: 20,
    gap: 8,
  },
  controlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  markerContainer: {
    alignItems: 'center',
  },
  marker: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 60,
    alignItems: 'center',
  },
  markerPrice: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  selectedMarker: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  propertyInfo: {
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
  propertyHeader: {
    marginBottom: 8,
  },
  propertyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  propertyPrice: {
    fontSize: 18,
    fontWeight: '800',
    color: '#3B82F6',
  },
  propertyDetails: {
    marginBottom: 12,
  },
  propertyLocation: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  distance: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  propertyActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#EFF6FF',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
  },
  neighborhoodInfo: {
    position: 'absolute',
    top: 20,
    left: 20,
    backgroundColor: 'rgba(0,0,0,0.8)',
    padding: 12,
    borderRadius: 12,
    minWidth: 150,
  },
  neighborhoodTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  neighborhoodName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  neighborhoodType: {
    fontSize: 12,
    color: '#CCCCCC',
    marginBottom: 4,
  },
  neighborhoodPrice: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600',
  },
});
