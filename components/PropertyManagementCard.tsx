import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Eye, Heart, MessageCircle, Edit, MoreVertical } from 'lucide-react-native';
import type { Property } from '@/types';

interface PropertyManagementCardProps {
  property: Property;
  onPress: () => void;
  onEdit: () => void;
  onMore: () => void;
}

export default function PropertyManagementCard({
  property,
  onPress,
  onEdit,
  onMore,
}: PropertyManagementCardProps) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.95}>
      <Image source={{ uri: property.images[0] }} style={styles.image} />
      
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.propertyInfo}>
            <Text style={styles.title} numberOfLines={1}>{property.title}</Text>
            <Text style={styles.location}>{property.location}</Text>
          </View>
          <TouchableOpacity onPress={onMore} style={styles.moreButton}>
            <MoreVertical size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>

        <View style={styles.priceRow}>
          <Text style={styles.price}>KES {property.price.toLocaleString()}</Text>
          <Text style={styles.priceLabel}>/month</Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Eye size={16} color="#6B7280" />
            <Text style={styles.statText}>{property.views}</Text>
          </View>
          <View style={styles.stat}>
            <Heart size={16} color="#EF4444" />
            <Text style={styles.statText}>{property.saves}</Text>
          </View>
          <View style={styles.stat}>
            <MessageCircle size={16} color="#3B82F6" />
            <Text style={styles.statText}>12</Text>
          </View>
        </View>

        <View style={styles.statusRow}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(property.status) }]}>
            <Text style={styles.statusText}>{getStatusText(property.status)}</Text>
          </View>
          <TouchableOpacity onPress={onEdit} style={styles.editButton}>
            <Edit size={16} color="#3B82F6" />
            <Text style={styles.editText}>Edit</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'available':
      return '#D1FAE5';
    case 'occupied':
      return '#FEE2E2';
    case 'maintenance':
      return '#FEF3C7';
    default:
      return '#F3F4F6';
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'available':
      return 'Available';
    case 'occupied':
      return 'Occupied';
    case 'maintenance':
      return 'Maintenance';
    default:
      return 'Pending';
  }
};

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
  image: {
    width: '100%',
    height: 160,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  propertyInfo: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  location: {
    fontSize: 14,
    color: '#6B7280',
  },
  moreButton: {
    padding: 4,
    marginLeft: 8,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 12,
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
  statsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
  },
  editText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3B82F6',
  },
});
