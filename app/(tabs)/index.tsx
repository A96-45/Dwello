import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { X, Search, Bell, Map, Calendar, DollarSign, Home as HomeIcon, Eye, MessageCircle, TrendingUp, Heart } from 'lucide-react-native';
import PropertyCard from '@/components/PropertyCard';
import FilterBottomSheet from '@/components/FilterBottomSheet';
import { useApp } from '@/contexts/AppContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { MOCK_PROPERTIES } from '@/mocks/properties';
import type { FilterOptions, Property } from '@/types';
import LandlordDashboardScreen from '../landlord-dashboard';

// Extended property type for endless scrolling
interface ExtendedProperty extends Property {
  originalId?: string;
}
import AnalyticsCard from '@/components/AnalyticsCard';

const FILTER_CHIPS = [
  { id: 'type', label: 'House Types', icon: '🏠', priority: true },
  { id: 'price', label: 'Price Range', icon: '💰', priority: true },
  { id: 'bedrooms', label: 'Bedrooms', icon: '🛏️', priority: false },
  { id: 'location', label: 'Location', icon: '📍', priority: false },
  { id: 'amenities', label: 'Amenities', icon: '✨', priority: false },
  { id: 'furnished', label: 'Furnished', icon: '🛋️', priority: false },
  { id: 'parking', label: 'Parking', icon: '🅿️', priority: false },
  { id: 'pets', label: 'Pets', icon: '🐕', priority: false },
  { id: 'sort', label: 'Sort', icon: '📊', priority: false },
] as const;

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { toggleSaveProperty, isSaved, filters, updateFilters, isLandlord } = useApp();
  const { unreadCount } = useNotifications();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [viewedProperties, setViewedProperties] = useState<string[]>([]);
  const [filterSheetVisible, setFilterSheetVisible] = useState(false);
  const [activeFilterType, setActiveFilterType] = useState<typeof FILTER_CHIPS[number]['id'] | null>(null);
  const properties = useMemo(() => {
    let filtered = MOCK_PROPERTIES.filter(p => p.status === 'available');

    if (filters.propertyTypes && filters.propertyTypes.length > 0) {
      filtered = filtered.filter(p => filters.propertyTypes?.includes(p.type));
    }

    if (filters.priceMin !== undefined && filters.priceMax !== undefined) {
      filtered = filtered.filter(p => p.price >= filters.priceMin! && p.price <= filters.priceMax!);
    }

    if (filters.bedrooms && filters.bedrooms.length > 0) {
      filtered = filtered.filter(p => filters.bedrooms?.includes(p.bedrooms));
    }

    if (filters.amenities && filters.amenities.length > 0) {
      filtered = filtered.filter(p => 
        filters.amenities!.some(amenity => 
          p.amenities.some(a => a.toLowerCase().includes(amenity.toLowerCase()))
        )
      );
    }

    if (filters.parking !== undefined) {
      filtered = filtered.filter(p => p.parking === filters.parking);
    }

    if (filters.furnished && filters.furnished.length > 0) {
      filtered = filtered.filter(p => filters.furnished!.includes(p.furnished));
    }

    if (filters.petsAllowed !== undefined) {
      filtered = filtered.filter(p => p.petsAllowed === filters.petsAllowed);
    }

    return filtered;
  }, [filters]);

  // Simplified infinite card management
  const getNextIndex = (currentIdx: number) => {
    if (currentIdx >= properties.length - 1) {
      return 0; // Loop back to the beginning
    }
    return currentIdx + 1;
  };

  const getPreviousIndex = (currentIdx: number) => {
    if (currentIdx <= 0) {
      return properties.length - 1; // Loop back to the end
    }
    return currentIdx - 1;
  };

  // Get the current visible cards (current and next 2)
  const visibleCards = useMemo(() => {
    const cards: ExtendedProperty[] = [];
    let idx = currentIndex;
    
    // Add current and next 2 cards
    for (let i = 0; i < 3; i++) {
      if (properties[idx]) {
        cards.push({
          ...properties[idx],
          id: `${properties[idx].id}_${i}`,
          originalId: properties[idx].id
        });
      }
      idx = getNextIndex(idx);
    }
    
    return cards;
  }, [currentIndex, properties]);

  const handlePrevious = useCallback(() => {
    setCurrentIndex(getPreviousIndex);
  }, []);

  const handleSwipe = useCallback((direction: 'left' | 'right' | 'up' | 'down') => {
    const currentProperty = properties[currentIndex];
    
    if (currentProperty && !viewedProperties.includes(currentProperty.id)) {
      setViewedProperties(prev => [...prev, currentProperty.id]);
    }
    
    if (direction === 'down') {
      handlePrevious();
    } else {
      setCurrentIndex(getNextIndex);
    }
  }, [currentIndex, properties, viewedProperties, handlePrevious]);



  const handleCardPress = useCallback((property: Property) => {
    router.push(`/property/${property.id}`);
  }, [router]);

  const handleDoubleTap = useCallback((property: Property) => {
    toggleSaveProperty(property.id);
  }, [toggleSaveProperty]);

  const handleFilterChipPress = (chipId: typeof FILTER_CHIPS[number]['id']) => {
    Haptics.selectionAsync();
    setActiveFilterType(chipId);
    setFilterSheetVisible(true);
  };

  const handleApplyFilters = useCallback((newFilters: FilterOptions) => {
    updateFilters(newFilters);
    // Reset will be handled by useEffect when properties change
  }, [updateFilters]);

  const handleClearFilters = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await updateFilters({});
    // Reset will be handled by useEffect when properties change
  }, [updateFilters]);

  const renderCard = (property: ExtendedProperty, index: number) => {
    const isFirst = index === 0;
    const position = index;
    
    if (position < 0) return null;
    if (position > 2) return null;

    const scale = 1 - (position * 0.05);
    const translateY = position * 15;
    const opacity = 1 - (position * 0.2);

    return (
      <PropertyCard
        key={property.id}
        property={property}
        isFirst={isFirst}
        onSwipeLeft={() => handleSwipe('left')}
        onSwipeRight={() => handleSwipe('right')}
        onSwipeUp={() => handleSwipe('up')}
        onSwipeDown={() => handleSwipe('down')}
        onPress={() => handleCardPress(property)}
        onDoubleTap={() => handleDoubleTap(property)}
        isSaved={isSaved(property.originalId || property.id)}
        onToggleSave={() => toggleSaveProperty(property.originalId || property.id)}
        style={{
          transform: [{ scale }, { translateY }],
          opacity,
          zIndex: properties.length - index,
        }}
      />
    );
  };

  const activeFiltersCount = Object.values(filters).filter(v => 
    v !== undefined && v !== null && (Array.isArray(v) ? v.length > 0 : true)
  ).length;

  // Show full landlord dashboard when user is a landlord
  if (isLandlord) {
    return <LandlordDashboardScreen />;
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.logo}>Dwello</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={styles.notificationButton}
            onPress={() => {
              Haptics.selectionAsync();
              router.push('/notifications');
            }}
          >
            <Bell size={24} color="#3B82F6" />
            {unreadCount > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>{unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.mapButton}
            onPress={() => {
              Haptics.selectionAsync();
              router.push('/map');
            }}
          >
            <Map size={24} color="#3B82F6" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.calendarButton}
            onPress={() => {
              Haptics.selectionAsync();
              router.push('/calendar');
            }}
          >
            <Calendar size={24} color="#3B82F6" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.searchButton}
            onPress={() => {
              Haptics.selectionAsync();
              router.push('/search');
            }}
          >
            <Search size={24} color="#3B82F6" />
          </TouchableOpacity>
          {activeFiltersCount > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{activeFiltersCount}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Active Filters Summary */}
      {activeFiltersCount > 0 && (
        <View style={styles.activeFiltersContainer}>
          <Text style={styles.activeFiltersTitle}>Active Filters:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.activeFiltersList}>
              {filters.propertyTypes && filters.propertyTypes.length > 0 && (
                <View style={styles.activeFilterTag}>
                  <Text style={styles.activeFilterTagText}>
                    🏠 {filters.propertyTypes.length} type{filters.propertyTypes.length > 1 ? 's' : ''}
                  </Text>
                </View>
              )}
              {(filters.priceMin !== undefined || filters.priceMax !== undefined) && (
                <View style={styles.activeFilterTag}>
                  <Text style={styles.activeFilterTagText}>
                    💰 {filters.priceMin ? `${filters.priceMin/1000}K` : '0'} - {filters.priceMax ? `${filters.priceMax/1000}K` : '∞'}
                  </Text>
                </View>
              )}
              {filters.bedrooms && filters.bedrooms.length > 0 && (
                <View style={styles.activeFilterTag}>
                  <Text style={styles.activeFilterTagText}>
                    🛏️ {filters.bedrooms.length} bedroom{filters.bedrooms.length > 1 ? 's' : ''}
                  </Text>
                </View>
              )}
              {filters.amenities && filters.amenities.length > 0 && (
                <View style={styles.activeFilterTag}>
                  <Text style={styles.activeFilterTagText}>
                    ✨ {filters.amenities.length} amenit{filters.amenities.length > 1 ? 'ies' : 'y'}
                  </Text>
                </View>
              )}
            </View>
          </ScrollView>
        </View>
      )}

      <View style={styles.filtersContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContent}
        >
          {FILTER_CHIPS.map((chip) => {
            const isActive = 
              (chip.id === 'type' && filters.propertyTypes && filters.propertyTypes.length > 0) ||
              (chip.id === 'price' && (filters.priceMin !== undefined || filters.priceMax !== undefined)) ||
              (chip.id === 'bedrooms' && filters.bedrooms && filters.bedrooms.length > 0) ||
              (chip.id === 'amenities' && filters.amenities && filters.amenities.length > 0) ||
              (chip.id === 'furnished' && filters.furnished && filters.furnished.length > 0) ||
              (chip.id === 'parking' && filters.parking !== undefined) ||
              (chip.id === 'pets' && filters.petsAllowed !== undefined);

            return (
              <TouchableOpacity 
                key={chip.id} 
                style={[
                  styles.filterChip,
                  chip.priority && styles.priorityFilterChip,
                  isActive && styles.activeFilterChip
                ]}
                onPress={() => handleFilterChipPress(chip.id)}
              >
                <Text style={[
                  styles.filterChipText,
                  chip.priority && styles.priorityFilterChipText,
                  isActive && styles.activeFilterChipText
                ]}>
                  {chip.icon} {chip.label}
                </Text>
                {isActive && (
                  <View style={styles.activeIndicator}>
                    <Text style={styles.activeIndicatorText}>•</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
          {activeFiltersCount > 0 && (
            <TouchableOpacity 
              style={styles.clearFiltersChip}
              onPress={handleClearFilters}
            >
              <X size={14} color="#EF4444" />
              <Text style={styles.clearFiltersText}>Clear</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>

      {/* Properties count */}
      <View style={styles.propertiesCountContainer}>
        <Text style={styles.propertiesCountText}>
          {properties.length === 0 ? 'No properties found' : 
           properties.length === 1 ? '1 property found' :
           `${properties.length} properties found`}
        </Text>
        {properties.length > 0 && (
          <Text style={styles.propertiesCountSubtext}>
            Swipe to explore • Double tap to save
          </Text>
        )}
      </View>

      <View style={styles.cardContainer}>
        {properties.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No properties found</Text>
            <Text style={styles.emptySubtitle}>Try adjusting your filters</Text>
            <TouchableOpacity
              style={styles.resetButton}
              onPress={handleClearFilters}
            >
              <Text style={styles.resetButtonText}>Clear Filters</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {visibleCards.map((property, index) => 
              renderCard(property, index)
            )}
          </>
        )}
      </View>

      <FilterBottomSheet
        visible={filterSheetVisible}
        onClose={() => setFilterSheetVisible(false)}
        filterType={activeFilterType}
        currentFilters={filters}
        onApplyFilters={handleApplyFilters}
      />
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    zIndex: 1000,
  },
  logo: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: '#3B82F6',
    letterSpacing: -0.5,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  notificationButton: {
    position: 'relative',
    padding: 8,
  },
  notificationBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: '#EF4444',
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  mapButton: {
    padding: 8,
  },
  calendarButton: {
    padding: 8,
  },
  searchButton: {
    padding: 8,
  },
  dashboardButton: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
  },
  dashboardButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
  },
  landlordContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  landlordTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  landlordSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
  },
  analyticsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginTop: 12,
  },
  dashboardCard: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    alignItems: 'center',
  },
  dashboardCardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  dashboardCardSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  filterBadge: {
    backgroundColor: '#EF4444',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700' as const,
  },
  filtersContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    zIndex: 999,
    elevation: 5,
    marginBottom: 1, // Added small margin
  },
  filtersContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginRight: 8,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  priorityFilterChip: {
    backgroundColor: '#EFF6FF',
    borderColor: '#3B82F6',
    borderWidth: 2,
  },
  activeFilterChip: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#374151',
  },
  priorityFilterChipText: {
    color: '#3B82F6',
    fontWeight: '700' as const,
  },
  activeFilterChipText: {
    color: '#FFFFFF',
    fontWeight: '700' as const,
  },
  activeIndicator: {
    marginLeft: 6,
  },
  activeIndicatorText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700' as const,
  },
  activeFiltersContainer: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  activeFiltersTitle: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#6B7280',
    marginBottom: 8,
  },
  activeFiltersList: {
    flexDirection: 'row',
    gap: 8,
  },
  activeFilterTag: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  activeFilterTagText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  propertiesCountContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  propertiesCountText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#111827',
    marginBottom: 2,
  },
  propertiesCountSubtext: {
    fontSize: 12,
    color: '#6B7280',
  },
  clearFiltersChip: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginRight: 8,
  },
  clearFiltersText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#EF4444',
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 1, // Reduced padding
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  resetButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  resetButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600' as const,
  },
});
