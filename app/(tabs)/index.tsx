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
import { X, Search, Bell, Map, Calendar } from 'lucide-react-native';
import PropertyCard from '@/components/PropertyCard';
import FilterBottomSheet from '@/components/FilterBottomSheet';
import { useApp } from '@/contexts/AppContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { MOCK_PROPERTIES } from '@/mocks/properties';
import type { FilterOptions } from '@/types';

const FILTER_CHIPS = [
  { id: 'location', label: 'Location', icon: '📍' },
  { id: 'price', label: 'Price', icon: '💰' },
  { id: 'type', label: 'Type', icon: '🏠' },
  { id: 'bedrooms', label: 'Bedrooms', icon: '🛏️' },
  { id: 'amenities', label: 'Amenities', icon: '✨' },
  { id: 'parking', label: 'Parking', icon: '🅿️' },
  { id: 'furnished', label: 'Furnished', icon: '🛋️' },
  { id: 'pets', label: 'Pets', icon: '🐕' },
  { id: 'sort', label: 'Sort', icon: '📊' },
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

  const currentProperty = properties[currentIndex];

  const handlePrevious = useCallback(() => {
    setCurrentIndex(prev => (prev - 1 + properties.length) % properties.length);
  }, [properties.length]);

  const handleSwipe = useCallback((direction: 'left' | 'right' | 'up' | 'down') => {
    if (currentProperty && !viewedProperties.includes(currentProperty.id)) {
      setViewedProperties(prev => [...prev, currentProperty.id]);
    }
    
    if (direction === 'down') {
      handlePrevious();
    } else {
      setCurrentIndex(prev => (prev + 1) % properties.length);
    }
  }, [currentProperty, properties.length, viewedProperties, handlePrevious]);



  const handleCardPress = useCallback(() => {
    if (currentProperty) {
      router.push(`/property/${currentProperty.id}`);
    }
  }, [currentProperty, router]);

  const handleDoubleTap = useCallback(() => {
    if (currentProperty) {
      toggleSaveProperty(currentProperty.id);
    }
  }, [currentProperty, toggleSaveProperty]);

  const handleFilterChipPress = (chipId: typeof FILTER_CHIPS[number]['id']) => {
    Haptics.selectionAsync();
    setActiveFilterType(chipId);
    setFilterSheetVisible(true);
  };

  const handleApplyFilters = useCallback((newFilters: FilterOptions) => {
    updateFilters(newFilters);
    setCurrentIndex(0);
    setViewedProperties([]);
  }, [updateFilters]);

  const handleClearFilters = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await updateFilters({});
    setCurrentIndex(0);
    setViewedProperties([]);
  }, [updateFilters]);

  const renderCard = (property: typeof properties[0], index: number) => {
    const isFirst = index === currentIndex;
    const position = index - currentIndex;
    
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
        onPress={handleCardPress}
        onDoubleTap={handleDoubleTap}
        isSaved={isSaved(property.id)}
        onToggleSave={() => toggleSaveProperty(property.id)}
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

  // Show landlord dashboard if user is a landlord
  if (isLandlord) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Text style={styles.logo}>Dwello</Text>
          <View style={styles.headerRight}>
            <TouchableOpacity 
              style={styles.dashboardButton}
              onPress={() => {
                Haptics.selectionAsync();
                router.push('/landlord-dashboard');
              }}
            >
              <Text style={styles.dashboardButtonText}>Dashboard</Text>
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
          </View>
        </View>
        <View style={styles.landlordContent}>
          <Text style={styles.landlordTitle}>Welcome back!</Text>
          <Text style={styles.landlordSubtitle}>Manage your properties and track performance</Text>
          <TouchableOpacity 
            style={styles.dashboardCard}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              router.push('/landlord-dashboard');
            }}
          >
            <Text style={styles.dashboardCardTitle}>View Full Dashboard</Text>
            <Text style={styles.dashboardCardSubtitle}>Analytics, properties, and inquiries</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
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

      <View style={styles.filtersContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContent}
        >
          {FILTER_CHIPS.map((chip) => (
            <TouchableOpacity 
              key={chip.id} 
              style={styles.filterChip}
              onPress={() => handleFilterChipPress(chip.id)}
            >
              <Text style={styles.filterChipText}>
                {chip.icon} {chip.label}
              </Text>
            </TouchableOpacity>
          ))}
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
        ) : false ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>🎉</Text>
            <Text style={styles.emptyTitle}>You&apos;ve seen all properties!</Text>
            <Text style={styles.emptySubtitle}>{viewedProperties.length} properties viewed</Text>
            <TouchableOpacity
              style={styles.resetButton}
              onPress={() => {
                setCurrentIndex(0);
                setViewedProperties([]);
              }}
            >
              <Text style={styles.resetButtonText}>Start Over</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {properties.map((property, index) => renderCard(property, index))}
          </>
        )}
      </View>

      {currentProperty && (
        <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${((currentIndex + 1) / properties.length) * 100}%` },
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              Property {currentIndex + 1} of {properties.length}
            </Text>
          </View>
        </View>
      )}

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
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#374151',
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
    paddingVertical: 20,
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
  bottomBar: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingHorizontal: 20,
    paddingTop: 16,
    zIndex: 998,
  },
  progressContainer: {
    gap: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    fontWeight: '500' as const,
  },
});
