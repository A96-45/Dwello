import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Dimensions,
} from 'react-native';
import { X } from 'lucide-react-native';
import type { FilterOptions, PropertyType } from '@/types';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface FilterBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  filterType: 'location' | 'price' | 'type' | 'bedrooms' | 'amenities' | 'parking' | 'furnished' | 'pets' | 'sort' | null;
  currentFilters: FilterOptions;
  onApplyFilters: (filters: FilterOptions) => void;
}

const PROPERTY_TYPES: { value: PropertyType; label: string }[] = [
  { value: 'single_room', label: '🚪 Single Room' },
  { value: 'bedsitter', label: '🛏️ Bedsitter' },
  { value: 'one_bedroom', label: '🏠 1 Bedroom' },
  { value: 'two_bedroom', label: '🏘️ 2 Bedroom' },
  { value: 'three_bedroom', label: '🏡 3 Bedroom' },
  { value: 'four_plus_bedroom', label: '🏰 4+ Bedroom' },
  { value: 'studio', label: '🏢 Studio' },
  { value: 'bungalow', label: '🏰 Bungalow' },
  { value: 'bnb', label: '🏨 BnB/Short Stay' },
];

const PRICE_RANGES = [
  { label: 'Under 20K', min: 0, max: 20000 },
  { label: '20-40K', min: 20000, max: 40000 },
  { label: '40-60K', min: 40000, max: 60000 },
  { label: '60-100K', min: 60000, max: 100000 },
  { label: '100K+', min: 100000, max: 1000000 },
];

const BEDROOM_OPTIONS = [1, 2, 3, 4, 5];

const AMENITIES_OPTIONS = [
  { value: 'wifi', label: '📶 WiFi' },
  { value: 'water', label: '🚰 Water 24/7' },
  { value: 'generator', label: '⚡ Generator' },
  { value: 'parking', label: '🅿️ Parking' },
  { value: 'security', label: '🔒 Security' },
  { value: 'cctv', label: '📹 CCTV' },
  { value: 'lift', label: '🛗 Lift' },
  { value: 'gym', label: '💪 Gym' },
  { value: 'pool', label: '🏊 Pool' },
  { value: 'garden', label: '🌳 Garden' },
];

const FURNISHED_OPTIONS = [
  { value: 'furnished', label: 'Fully Furnished' },
  { value: 'semi_furnished', label: 'Semi-Furnished' },
  { value: 'unfurnished', label: 'Unfurnished' },
];

const SORT_OPTIONS = [
  { value: 'recommended', label: 'Recommended for you' },
  { value: 'price_low', label: 'Price: Low to High' },
  { value: 'price_high', label: 'Price: High to Low' },
  { value: 'newest', label: 'Newest listings' },
  { value: 'distance', label: 'Distance: Nearest' },
];

export default function FilterBottomSheet({
  visible,
  onClose,
  filterType,
  currentFilters,
  onApplyFilters,
}: FilterBottomSheetProps) {
  const [localFilters, setLocalFilters] = useState<FilterOptions>(currentFilters);

  useEffect(() => {
    setLocalFilters(currentFilters);
  }, [currentFilters, visible]);

  const handleApply = useCallback(() => {
    onApplyFilters(localFilters);
    onClose();
  }, [localFilters, onApplyFilters, onClose]);

  const togglePropertyType = (type: PropertyType) => {
    setLocalFilters(prev => {
      const current = prev.propertyTypes || [];
      const updated = current.includes(type)
        ? current.filter(t => t !== type)
        : [...current, type];
      return { ...prev, propertyTypes: updated };
    });
  };

  const setPriceRange = (min: number, max: number) => {
    setLocalFilters(prev => ({
      ...prev,
      priceMin: min,
      priceMax: max,
    }));
  };

  const toggleBedroom = (count: number) => {
    setLocalFilters(prev => {
      const current = prev.bedrooms || [];
      const updated = current.includes(count)
        ? current.filter(b => b !== count)
        : [...current, count];
      return { ...prev, bedrooms: updated };
    });
  };

  const toggleAmenity = (amenity: string) => {
    setLocalFilters(prev => {
      const current = prev.amenities || [];
      const updated = current.includes(amenity)
        ? current.filter(a => a !== amenity)
        : [...current, amenity];
      return { ...prev, amenities: updated };
    });
  };

  const toggleFurnished = (value: string) => {
    setLocalFilters(prev => {
      const current = prev.furnished || [];
      const updated = current.includes(value)
        ? current.filter(f => f !== value)
        : [...current, value];
      return { ...prev, furnished: updated };
    });
  };

  const renderContent = () => {
    switch (filterType) {
      case 'type':
        return (
          <View style={styles.content}>
            <Text style={styles.sectionTitle}>Select Property Types</Text>
            <View style={styles.optionsList}>
              {PROPERTY_TYPES.map(({ value, label }) => {
                const isSelected = localFilters.propertyTypes?.includes(value);
                return (
                  <TouchableOpacity
                    key={value}
                    style={[styles.option, isSelected && styles.optionSelected]}
                    onPress={() => togglePropertyType(value)}
                  >
                    <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                      {label}
                    </Text>
                    {isSelected && <Text style={styles.checkmark}>✓</Text>}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        );

      case 'price':
        return (
          <View style={styles.content}>
            <Text style={styles.sectionTitle}>Price Range (KES/month)</Text>
            <View style={styles.optionsList}>
              {PRICE_RANGES.map(({ label, min, max }) => {
                const isSelected =
                  localFilters.priceMin === min && localFilters.priceMax === max;
                return (
                  <TouchableOpacity
                    key={label}
                    style={[styles.option, isSelected && styles.optionSelected]}
                    onPress={() => setPriceRange(min, max)}
                  >
                    <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                      {label}
                    </Text>
                    {isSelected && <Text style={styles.checkmark}>✓</Text>}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        );

      case 'bedrooms':
        return (
          <View style={styles.content}>
            <Text style={styles.sectionTitle}>Number of Bedrooms</Text>
            <View style={styles.optionsList}>
              {BEDROOM_OPTIONS.map(count => {
                const isSelected = localFilters.bedrooms?.includes(count);
                return (
                  <TouchableOpacity
                    key={count}
                    style={[styles.option, isSelected && styles.optionSelected]}
                    onPress={() => toggleBedroom(count)}
                  >
                    <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                      {count} Bedroom{count > 1 ? 's' : ''}
                    </Text>
                    {isSelected && <Text style={styles.checkmark}>✓</Text>}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        );

      case 'amenities':
        return (
          <View style={styles.content}>
            <Text style={styles.sectionTitle}>Amenities</Text>
            <View style={styles.optionsList}>
              {AMENITIES_OPTIONS.map(({ value, label }) => {
                const isSelected = localFilters.amenities?.includes(value);
                return (
                  <TouchableOpacity
                    key={value}
                    style={[styles.option, isSelected && styles.optionSelected]}
                    onPress={() => toggleAmenity(value)}
                  >
                    <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                      {label}
                    </Text>
                    {isSelected && <Text style={styles.checkmark}>✓</Text>}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        );

      case 'parking':
        return (
          <View style={styles.content}>
            <Text style={styles.sectionTitle}>Parking</Text>
            <View style={styles.optionsList}>
              <TouchableOpacity
                style={[styles.option, localFilters.parking === true && styles.optionSelected]}
                onPress={() => setLocalFilters(prev => ({ ...prev, parking: true }))}
              >
                <Text style={[styles.optionText, localFilters.parking === true && styles.optionTextSelected]}>
                  Parking Required
                </Text>
                {localFilters.parking === true && <Text style={styles.checkmark}>✓</Text>}
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.option, localFilters.parking === undefined && styles.optionSelected]}
                onPress={() => setLocalFilters(prev => ({ ...prev, parking: undefined }))}
              >
                <Text style={[styles.optionText, localFilters.parking === undefined && styles.optionTextSelected]}>
                  No Preference
                </Text>
                {localFilters.parking === undefined && <Text style={styles.checkmark}>✓</Text>}
              </TouchableOpacity>
            </View>
          </View>
        );

      case 'furnished':
        return (
          <View style={styles.content}>
            <Text style={styles.sectionTitle}>Furnishing Status</Text>
            <View style={styles.optionsList}>
              {FURNISHED_OPTIONS.map(({ value, label }) => {
                const isSelected = localFilters.furnished?.includes(value);
                return (
                  <TouchableOpacity
                    key={value}
                    style={[styles.option, isSelected && styles.optionSelected]}
                    onPress={() => toggleFurnished(value)}
                  >
                    <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                      {label}
                    </Text>
                    {isSelected && <Text style={styles.checkmark}>✓</Text>}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        );

      case 'pets':
        return (
          <View style={styles.content}>
            <Text style={styles.sectionTitle}>Pet Policy</Text>
            <View style={styles.optionsList}>
              <TouchableOpacity
                style={[styles.option, localFilters.petsAllowed === true && styles.optionSelected]}
                onPress={() => setLocalFilters(prev => ({ ...prev, petsAllowed: true }))}
              >
                <Text style={[styles.optionText, localFilters.petsAllowed === true && styles.optionTextSelected]}>
                  🐕 Pets Allowed
                </Text>
                {localFilters.petsAllowed === true && <Text style={styles.checkmark}>✓</Text>}
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.option, localFilters.petsAllowed === false && styles.optionSelected]}
                onPress={() => setLocalFilters(prev => ({ ...prev, petsAllowed: false }))}
              >
                <Text style={[styles.optionText, localFilters.petsAllowed === false && styles.optionTextSelected]}>
                  🚫 No Pets
                </Text>
                {localFilters.petsAllowed === false && <Text style={styles.checkmark}>✓</Text>}
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.option, localFilters.petsAllowed === undefined && styles.optionSelected]}
                onPress={() => setLocalFilters(prev => ({ ...prev, petsAllowed: undefined }))}
              >
                <Text style={[styles.optionText, localFilters.petsAllowed === undefined && styles.optionTextSelected]}>
                  No Preference
                </Text>
                {localFilters.petsAllowed === undefined && <Text style={styles.checkmark}>✓</Text>}
              </TouchableOpacity>
            </View>
          </View>
        );

      case 'sort':
        return (
          <View style={styles.content}>
            <Text style={styles.sectionTitle}>Sort By</Text>
            <View style={styles.optionsList}>
              {SORT_OPTIONS.map(({ value, label }) => {
                const isSelected = false;
                return (
                  <TouchableOpacity
                    key={value}
                    style={[styles.option, isSelected && styles.optionSelected]}
                    onPress={() => {}}
                  >
                    <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                      {label}
                    </Text>
                    {isSelected && <Text style={styles.checkmark}>✓</Text>}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          
          <View style={styles.header}>
            <Text style={styles.title}>Filters</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
          >
            {renderContent()}
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => setLocalFilters({})}
            >
              <Text style={styles.clearButtonText}>Clear All</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.applyButton}
              onPress={handleApply}
            >
              <Text style={styles.applyButtonText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  backdrop: {
    flex: 1,
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: SCREEN_HEIGHT * 0.75,
    paddingBottom: 24,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#111827',
  },
  closeButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#111827',
    marginBottom: 16,
  },
  optionsList: {
    gap: 12,
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  optionSelected: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
  },
  optionText: {
    fontSize: 15,
    fontWeight: '500' as const,
    color: '#374151',
  },
  optionTextSelected: {
    color: '#3B82F6',
    fontWeight: '600' as const,
  },
  checkmark: {
    fontSize: 18,
    color: '#3B82F6',
    fontWeight: '700' as const,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  clearButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#6B7280',
  },
  applyButton: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
});
