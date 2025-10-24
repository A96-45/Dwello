import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Search, X, MapPin, Filter } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import type { Property } from '@/types';

interface SearchBarProps {
  onSearch: (query: string) => void;
  onLocationSearch: () => void;
  onFilterPress: () => void;
  placeholder?: string;
  showLocationButton?: boolean;
  showFilterButton?: boolean;
}

export default function SearchBar({
  onSearch,
  onLocationSearch,
  onFilterPress,
  placeholder = "Search properties...",
  showLocationButton = true,
  showFilterButton = true,
}: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSearch = useCallback((text: string) => {
    setQuery(text);
    onSearch(text);
  }, [onSearch]);

  const handleClear = useCallback(() => {
    Haptics.selectionAsync();
    setQuery('');
    onSearch('');
  }, [onSearch]);

  const handleLocationPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onLocationSearch();
  }, [onLocationSearch]);

  const handleFilterPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onFilterPress();
  }, [onFilterPress]);

  return (
    <View style={styles.container}>
      <View style={[styles.searchContainer, isFocused && styles.searchContainerFocused]}>
        <Search size={20} color="#9CA3AF" />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          value={query}
          onChangeText={handleSearch}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          returnKeyType="search"
          autoCorrect={false}
          autoCapitalize="none"
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
            <X size={18} color="#9CA3AF" />
          </TouchableOpacity>
        )}
      </View>
      
      <View style={styles.actionButtons}>
        {showLocationButton && (
          <TouchableOpacity style={styles.actionButton} onPress={handleLocationPress}>
            <MapPin size={20} color="#3B82F6" />
          </TouchableOpacity>
        )}
        {showFilterButton && (
          <TouchableOpacity style={styles.actionButton} onPress={handleFilterPress}>
            <Filter size={20} color="#3B82F6" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchContainerFocused: {
    borderColor: '#3B82F6',
    backgroundColor: '#FFFFFF',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    marginLeft: 12,
  },
  clearButton: {
    padding: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
});
