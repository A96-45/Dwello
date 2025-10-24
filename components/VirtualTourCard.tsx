import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Play, Camera, Video, RotateCcw } from 'lucide-react-native';

interface VirtualTourCardProps {
  tour: {
    id: string;
    type: '360' | 'video' | 'slideshow';
    title: string;
    thumbnail: string;
    duration?: number;
    mediaCount: number;
    description?: string;
  };
  onPress: () => void;
}

export default function VirtualTourCard({ tour, onPress }: VirtualTourCardProps) {
  const getTypeIcon = () => {
    switch (tour.type) {
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

  const getTypeLabel = () => {
    switch (tour.type) {
      case '360':
        return '360° Tour';
      case 'video':
        return 'Video Tour';
      case 'slideshow':
        return 'Photo Tour';
      default:
        return 'Virtual Tour';
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.95}>
      <View style={styles.thumbnailContainer}>
        <Image source={{ uri: tour.thumbnail }} style={styles.thumbnail} />
        <View style={styles.overlay}>
          <View style={styles.playButton}>
            <Play size={24} color="#FFFFFF" />
          </View>
        </View>
        <View style={styles.typeBadge}>
          {getTypeIcon()}
          <Text style={styles.typeText}>{getTypeLabel()}</Text>
        </View>
        {tour.duration && (
          <View style={styles.durationBadge}>
            <Text style={styles.durationText}>{formatDuration(tour.duration)}</Text>
          </View>
        )}
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>{tour.title}</Text>
        {tour.description && (
          <Text style={styles.description} numberOfLines={2}>
            {tour.description}
          </Text>
        )}
        <View style={styles.footer}>
          <Text style={styles.mediaCount}>{tour.mediaCount} {tour.mediaCount === 1 ? 'item' : 'items'}</Text>
          <View style={styles.playIcon}>
            <Play size={16} color="#3B82F6" />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
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
  thumbnailContainer: {
    position: 'relative',
    height: 200,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  playButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  typeBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  typeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  durationBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  durationText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mediaCount: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  playIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
