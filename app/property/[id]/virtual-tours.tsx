import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Plus, Camera, Video, RotateCcw } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import VirtualTourCard from '@/components/VirtualTourCard';
import VirtualTourViewer from '@/components/VirtualTourViewer';
import { MOCK_PROPERTIES } from '@/mocks/properties';

const MOCK_VIRTUAL_TOURS = [
  {
    id: '1',
    propertyId: '1',
    type: '360' as const,
    title: '360° Living Room Tour',
    thumbnail: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400',
    duration: 120,
    mediaCount: 8,
    description: 'Interactive 360° view of the spacious living room with modern furniture',
    media: [
      {
        url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800',
        thumbnail: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400',
      },
      {
        url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
        thumbnail: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400',
      },
    ],
    hotspots: [
      {
        id: '1',
        x: 0.3,
        y: 0.4,
        title: 'Modern Sofa',
        description: 'Comfortable 3-seater sofa with premium fabric',
      },
      {
        id: '2',
        x: 0.7,
        y: 0.6,
        title: 'Smart TV',
        description: '55-inch 4K Smart TV with wall mount',
      },
    ],
  },
  {
    id: '2',
    propertyId: '1',
    type: 'video' as const,
    title: 'Property Walkthrough Video',
    thumbnail: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400',
    duration: 180,
    mediaCount: 1,
    description: 'Complete property walkthrough showing all rooms and amenities',
    media: [
      {
        url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
        thumbnail: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400',
        duration: 180,
      },
    ],
  },
  {
    id: '3',
    propertyId: '1',
    type: 'slideshow' as const,
    title: 'Kitchen & Dining Area',
    thumbnail: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400',
    duration: 90,
    mediaCount: 12,
    description: 'High-quality photos of the fully equipped kitchen and dining space',
    media: [
      {
        url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800',
        thumbnail: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400',
      },
      {
        url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
        thumbnail: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400',
      },
      {
        url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800',
        thumbnail: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400',
      },
    ],
  },
];

export default function VirtualToursScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [selectedTour, setSelectedTour] = useState<typeof MOCK_VIRTUAL_TOURS[0] | null>(null);

  const property = MOCK_PROPERTIES.find(p => p.id === id);
  const tours = MOCK_VIRTUAL_TOURS.filter(t => t.propertyId === id);

  const handleTourPress = useCallback((tour: typeof MOCK_VIRTUAL_TOURS[0]) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedTour(tour);
  }, []);

  const handleCloseTour = useCallback(() => {
    Haptics.selectionAsync();
    setSelectedTour(null);
  }, []);

  const handleCreateTour = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // TODO: Navigate to tour creation screen
    console.log('Create new tour');
  }, []);

  const getTourTypeIcon = (type: string) => {
    switch (type) {
      case '360':
        return <RotateCcw size={20} color="#3B82F6" />;
      case 'video':
        return <Video size={20} color="#3B82F6" />;
      case 'slideshow':
        return <Camera size={20} color="#3B82F6" />;
      default:
        return <Camera size={20} color="#3B82F6" />;
    }
  };

  const getTourTypeLabel = (type: string) => {
    switch (type) {
      case '360':
        return '360° Tours';
      case 'video':
        return 'Video Tours';
      case 'slideshow':
        return 'Photo Tours';
      default:
        return 'Virtual Tours';
    }
  };

  const groupedTours = tours.reduce((acc, tour) => {
    if (!acc[tour.type]) {
      acc[tour.type] = [];
    }
    acc[tour.type].push(tour);
    return acc;
  }, {} as Record<string, typeof MOCK_VIRTUAL_TOURS>);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.title}>Virtual Tours</Text>
        <TouchableOpacity onPress={handleCreateTour} style={styles.addButton}>
          <Plus size={24} color="#3B82F6" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {property && (
          <View style={styles.propertyInfo}>
            <Text style={styles.propertyTitle}>{property.title}</Text>
            <Text style={styles.propertyLocation}>{property.location}, {property.city}</Text>
          </View>
        )}

        {tours.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Camera size={48} color="#9CA3AF" />
            </View>
            <Text style={styles.emptyTitle}>No Virtual Tours Yet</Text>
            <Text style={styles.emptySubtitle}>
              Create immersive virtual tours to showcase your property
            </Text>
            <TouchableOpacity style={styles.createButton} onPress={handleCreateTour}>
              <Plus size={20} color="#FFFFFF" />
              <Text style={styles.createButtonText}>Create First Tour</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.toursContainer}>
            {Object.entries(groupedTours).map(([type, typeTours]) => (
              <View key={type} style={styles.tourSection}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionTitleContainer}>
                    {getTourTypeIcon(type)}
                    <Text style={styles.sectionTitle}>{getTourTypeLabel(type)}</Text>
                  </View>
                  <Text style={styles.sectionCount}>{typeTours.length}</Text>
                </View>
                
                {typeTours.map((tour) => (
                  <VirtualTourCard
                    key={tour.id}
                    tour={tour}
                    onPress={() => handleTourPress(tour)}
                  />
                ))}
              </View>
            ))}
          </View>
        )}

        <View style={styles.helpSection}>
          <Text style={styles.helpTitle}>Virtual Tour Types</Text>
          <View style={styles.helpItems}>
            <View style={styles.helpItem}>
              <RotateCcw size={20} color="#3B82F6" />
              <View style={styles.helpContent}>
                <Text style={styles.helpItemTitle}>360° Tours</Text>
                <Text style={styles.helpItemDescription}>
                  Interactive panoramic views that users can rotate and explore
                </Text>
              </View>
            </View>
            <View style={styles.helpItem}>
              <Video size={20} color="#3B82F6" />
              <View style={styles.helpContent}>
                <Text style={styles.helpItemTitle}>Video Tours</Text>
                <Text style={styles.helpItemDescription}>
                  Professional walkthrough videos showing the property in detail
                </Text>
              </View>
            </View>
            <View style={styles.helpItem}>
              <Camera size={20} color="#3B82F6" />
              <View style={styles.helpContent}>
                <Text style={styles.helpItemTitle}>Photo Tours</Text>
                <Text style={styles.helpItemDescription}>
                  High-quality photo slideshows showcasing different areas
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {selectedTour && (
        <VirtualTourViewer
          visible={!!selectedTour}
          onClose={handleCloseTour}
          tourData={selectedTour}
        />
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
  addButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  propertyInfo: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  propertyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  propertyLocation: {
    fontSize: 14,
    color: '#6B7280',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
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
    marginBottom: 32,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  toursContainer: {
    padding: 20,
  },
  tourSection: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  sectionCount: {
    fontSize: 14,
    color: '#6B7280',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  helpSection: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  helpTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  helpItems: {
    gap: 16,
  },
  helpItem: {
    flexDirection: 'row',
    gap: 12,
  },
  helpContent: {
    flex: 1,
  },
  helpItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  helpItemDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
});
