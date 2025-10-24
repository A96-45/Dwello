import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { MapPin, Bed, Bath, Square, Car, Star, Heart } from 'lucide-react-native';
import type { Property } from '@/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface SearchResultsProps {
  properties: Property[];
  onPropertyPress: (property: Property) => void;
  onToggleSave: (propertyId: string) => void;
  isSaved: (propertyId: string) => boolean;
  loading?: boolean;
}

export default function SearchResults({
  properties,
  onPropertyPress,
  onToggleSave,
  isSaved,
  loading = false,
}: SearchResultsProps) {
  const renderProperty = ({ item }: { item: Property }) => (
    <TouchableOpacity
      style={styles.propertyCard}
      onPress={() => onPropertyPress(item)}
      activeOpacity={0.95}
    >
      <Image source={{ uri: item.images[0] }} style={styles.propertyImage} />
      
      <View style={styles.propertyContent}>
        <View style={styles.propertyHeader}>
          <View style={styles.propertyType}>
            <Text style={styles.propertyTypeText}>
              {item.type.replace('_', ' ').toUpperCase()}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => onToggleSave(item.id)}
            style={styles.saveButton}
          >
            <Heart
              size={20}
              color={isSaved(item.id) ? '#EF4444' : '#9CA3AF'}
              fill={isSaved(item.id) ? '#EF4444' : 'transparent'}
            />
          </TouchableOpacity>
        </View>

        <Text style={styles.propertyTitle} numberOfLines={2}>
          {item.title}
        </Text>

        <View style={styles.priceRow}>
          <Text style={styles.price}>KES {item.price.toLocaleString()}</Text>
          <Text style={styles.priceLabel}>/month</Text>
        </View>

        <View style={styles.locationRow}>
          <MapPin size={14} color="#6B7280" />
          <Text style={styles.location} numberOfLines={1}>
            {item.area}, {item.location}
          </Text>
          {item.distance && (
            <Text style={styles.distance}>• {item.distance} km</Text>
          )}
        </View>

        <View style={styles.specsRow}>
          {item.bedrooms > 0 && (
            <View style={styles.spec}>
              <Bed size={14} color="#6B7280" />
              <Text style={styles.specText}>{item.bedrooms}</Text>
            </View>
          )}
          <View style={styles.spec}>
            <Bath size={14} color="#6B7280" />
            <Text style={styles.specText}>{item.bathrooms}</Text>
          </View>
          <View style={styles.spec}>
            <Square size={14} color="#6B7280" />
            <Text style={styles.specText}>{item.size}m²</Text>
          </View>
          {item.parking && (
            <View style={styles.spec}>
              <Car size={14} color="#6B7280" />
            </View>
          )}
        </View>

        <View style={styles.propertyFooter}>
          <View style={styles.ratingRow}>
            <Star size={14} color="#F59E0B" fill="#F59E0B" />
            <Text style={styles.rating}>{item.rating}</Text>
            <Text style={styles.reviewCount}>({item.reviewCount})</Text>
          </View>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>
              {item.status === 'available' ? 'Available' : item.status}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyTitle}>No properties found</Text>
      <Text style={styles.emptySubtitle}>
        Try adjusting your search terms or filters
      </Text>
    </View>
  );

  const renderLoadingState = () => (
    <View style={styles.loadingState}>
      <Text style={styles.loadingText}>Searching properties...</Text>
    </View>
  );

  if (loading) {
    return renderLoadingState();
  }

  return (
    <FlatList
      data={properties}
      keyExtractor={(item) => item.id}
      renderItem={renderProperty}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={renderEmptyState}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flexGrow: 1,
  },
  propertyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  propertyImage: {
    width: '100%',
    height: 200,
  },
  propertyContent: {
    padding: 16,
  },
  propertyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  propertyType: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  propertyTypeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#3B82F6',
  },
  saveButton: {
    padding: 4,
  },
  propertyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    lineHeight: 24,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  price: {
    fontSize: 20,
    fontWeight: '800',
    color: '#3B82F6',
  },
  priceLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  location: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 4,
    flex: 1,
  },
  distance: {
    fontSize: 14,
    color: '#9CA3AF',
    marginLeft: 4,
  },
  specsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  spec: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  specText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  propertyFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rating: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  reviewCount: {
    fontSize: 14,
    color: '#6B7280',
  },
  statusBadge: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#059669',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  loadingState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
});
