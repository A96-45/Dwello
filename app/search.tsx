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
import { ArrowLeft, MapPin, Filter, X } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import SearchBar from '@/components/SearchBar';
import SearchResults from '@/components/SearchResults';
import FilterBottomSheet from '@/components/FilterBottomSheet';
import { useApp } from '@/contexts/AppContext';
import { MOCK_PROPERTIES } from '@/mocks/properties';
import type { FilterOptions, Property } from '@/types';

const SEARCH_SUGGESTIONS = [
  '2 bedroom apartment',
  'Furnished studio',
  'Pet friendly',
  'Near CBD',
  'With parking',
  'Under 30K',
  'Kilimani',
  'Westlands',
  'Karen',
  'Runda',
];

const QUICK_FILTERS = [
  { id: 'furnished', label: 'Furnished', icon: '🛋️' },
  { id: 'parking', label: 'Parking', icon: '🅿️' },
  { id: 'pets', label: 'Pet Friendly', icon: '🐕' },
  { id: 'under_30k', label: 'Under 30K', icon: '💰' },
  { id: 'near_cbd', label: 'Near CBD', icon: '🏢' },
];

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { filters, updateFilters, isSaved, toggleSaveProperty } = useApp();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [activeQuickFilter, setActiveQuickFilter] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<Property[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setIsSearching(true);
    
    // Simulate search delay
    setTimeout(() => {
      const results = MOCK_PROPERTIES.filter(property => {
        const searchText = query.toLowerCase();
        return (
          property.title.toLowerCase().includes(searchText) ||
          property.location.toLowerCase().includes(searchText) ||
          property.area.toLowerCase().includes(searchText) ||
          property.city.toLowerCase().includes(searchText) ||
          property.description.toLowerCase().includes(searchText) ||
          property.amenities.some(amenity => 
            amenity.toLowerCase().includes(searchText)
          )
        );
      });
      setSearchResults(results);
      setIsSearching(false);
    }, 500);
  }, []);

  const handleLocationSearch = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // TODO: Implement location-based search
    console.log('Location search pressed');
  }, []);

  const handleFilterPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowFilters(true);
  }, []);

  const handleQuickFilter = useCallback((filterId: string) => {
    Haptics.selectionAsync();
    setActiveQuickFilter(activeQuickFilter === filterId ? null : filterId);
    
    // Apply quick filter
    let newFilters: FilterOptions = { ...filters };
    
    switch (filterId) {
      case 'furnished':
        newFilters.furnished = activeQuickFilter === filterId ? [] : ['furnished'];
        break;
      case 'parking':
        newFilters.parking = activeQuickFilter === filterId ? undefined : true;
        break;
      case 'pets':
        newFilters.petsAllowed = activeQuickFilter === filterId ? undefined : true;
        break;
      case 'under_30k':
        newFilters.priceMax = activeQuickFilter === filterId ? undefined : 30000;
        break;
      case 'near_cbd':
        // This would typically use location data
        break;
    }
    
    updateFilters(newFilters);
  }, [activeQuickFilter, filters, updateFilters]);

  const handleSuggestionPress = useCallback((suggestion: string) => {
    Haptics.selectionAsync();
    setSearchQuery(suggestion);
    handleSearch(suggestion);
  }, [handleSearch]);

  const handlePropertyPress = useCallback((property: Property) => {
    Haptics.selectionAsync();
    router.push(`/property/${property.id}`);
  }, [router]);

  const handleApplyFilters = useCallback((newFilters: FilterOptions) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    updateFilters(newFilters);
    setShowFilters(false);
    
    // Re-run search with new filters
    if (searchQuery) {
      handleSearch(searchQuery);
    }
  }, [updateFilters, searchQuery, handleSearch]);

  const clearAllFilters = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    updateFilters({});
    setActiveQuickFilter(null);
    setSearchQuery('');
    setSearchResults([]);
  }, [updateFilters]);

  const hasActiveFilters = Object.values(filters).some(v => 
    v !== undefined && v !== null && (Array.isArray(v) ? v.length > 0 : true)
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.title}>Search Properties</Text>
        {hasActiveFilters && (
          <TouchableOpacity onPress={clearAllFilters} style={styles.clearButton}>
            <X size={20} color="#EF4444" />
          </TouchableOpacity>
        )}
      </View>

      <SearchBar
        onSearch={handleSearch}
        onLocationSearch={handleLocationSearch}
        onFilterPress={handleFilterPress}
        placeholder="Search by location, type, or amenities..."
      />

      {searchQuery === '' && searchResults.length === 0 && (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Filters</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.quickFilters}>
                {QUICK_FILTERS.map((filter) => (
                  <TouchableOpacity
                    key={filter.id}
                    style={[
                      styles.quickFilterChip,
                      activeQuickFilter === filter.id && styles.quickFilterChipActive,
                    ]}
                    onPress={() => handleQuickFilter(filter.id)}
                  >
                    <Text style={styles.quickFilterIcon}>{filter.icon}</Text>
                    <Text style={[
                      styles.quickFilterText,
                      activeQuickFilter === filter.id && styles.quickFilterTextActive,
                    ]}>
                      {filter.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Popular Searches</Text>
            <View style={styles.suggestions}>
              {SEARCH_SUGGESTIONS.map((suggestion, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.suggestionChip}
                  onPress={() => handleSuggestionPress(suggestion)}
                >
                  <Text style={styles.suggestionText}>{suggestion}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Searches</Text>
            <View style={styles.emptyRecent}>
              <Text style={styles.emptyText}>No recent searches</Text>
            </View>
          </View>
        </ScrollView>
      )}

      {(searchQuery !== '' || searchResults.length > 0) && (
        <SearchResults
          properties={searchResults}
          onPropertyPress={handlePropertyPress}
          onToggleSave={toggleSaveProperty}
          isSaved={isSaved}
          loading={isSearching}
        />
      )}

      <FilterBottomSheet
        visible={showFilters}
        onClose={() => setShowFilters(false)}
        filterType="type"
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
  clearButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  quickFilters: {
    flexDirection: 'row',
    gap: 12,
  },
  quickFilterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 8,
  },
  quickFilterChipActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#3B82F6',
  },
  quickFilterIcon: {
    fontSize: 16,
  },
  quickFilterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  quickFilterTextActive: {
    color: '#3B82F6',
  },
  suggestions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  suggestionChip: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  suggestionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  emptyRecent: {
    paddingVertical: 20,
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});
