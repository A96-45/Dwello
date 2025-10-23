import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { 
  ArrowLeft, Heart, Share2, MapPin, Bed, Bath, Square, 
  Car, Wifi, Shield, Phone, MessageCircle, Calendar
} from 'lucide-react-native';
import { MOCK_PROPERTIES } from '@/mocks/properties';
import { useApp } from '@/contexts/AppContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function PropertyDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { toggleSaveProperty, isSaved } = useApp();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const property = MOCK_PROPERTIES.find(p => p.id === id);

  if (!property) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Property not found</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const saved = isSaved(property.id);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: property.title, headerShown: true }} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.imageContainer}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => {
              const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
              setCurrentImageIndex(index);
            }}
          >
            {property.images.map((image, index) => (
              <Image
                key={index}
                source={{ uri: image }}
                style={styles.image}
                resizeMode="cover"
              />
            ))}
          </ScrollView>

          <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
            <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
              <ArrowLeft size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <View style={styles.topActions}>
              <TouchableOpacity onPress={() => {}} style={styles.iconButton}>
                <Share2 size={24} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => toggleSaveProperty(property.id)}
                style={styles.iconButton}
              >
                <Heart
                  size={24}
                  color={saved ? '#EF4444' : '#FFFFFF'}
                  fill={saved ? '#EF4444' : 'transparent'}
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.imagePagination}>
            {property.images.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.paginationDot,
                  index === currentImageIndex && styles.paginationDotActive,
                ]}
              />
            ))}
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.typeContainer}>
              <Text style={styles.propertyType}>
                {property.type.replace('_', ' ').toUpperCase()}
              </Text>
            </View>
            {property.verified && (
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedText}>✓ Verified</Text>
              </View>
            )}
          </View>

          <Text style={styles.title}>{property.title}</Text>

          <View style={styles.priceRow}>
            <Text style={styles.price}>KES {property.price.toLocaleString()}</Text>
            <Text style={styles.priceLabel}>/month</Text>
          </View>

          <View style={styles.ratingRow}>
            <Text style={styles.rating}>⭐ {property.rating}</Text>
            <Text style={styles.reviewCount}>({property.reviewCount} reviews)</Text>
            <Text style={styles.saves}>❤️ {property.saves} saves</Text>
          </View>

          <View style={styles.locationRow}>
            <MapPin size={18} color="#6B7280" />
            <Text style={styles.location}>
              {property.area}, {property.location}, {property.city}
            </Text>
          </View>
          {property.distance && (
            <Text style={styles.distance}>{property.distance} km from your location</Text>
          )}

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Property Details</Text>
          <View style={styles.specs}>
            {property.bedrooms > 0 && (
              <View style={styles.specCard}>
                <Bed size={24} color="#3B82F6" />
                <Text style={styles.specLabel}>{property.bedrooms}</Text>
                <Text style={styles.specText}>Bedrooms</Text>
              </View>
            )}
            <View style={styles.specCard}>
              <Bath size={24} color="#3B82F6" />
              <Text style={styles.specLabel}>{property.bathrooms}</Text>
              <Text style={styles.specText}>Bathrooms</Text>
            </View>
            <View style={styles.specCard}>
              <Square size={24} color="#3B82F6" />
              <Text style={styles.specLabel}>{property.size}m²</Text>
              <Text style={styles.specText}>Size</Text>
            </View>
            {property.parking && (
              <View style={styles.specCard}>
                <Car size={24} color="#3B82F6" />
                <Text style={styles.specLabel}>{property.parkingSlots || 1}</Text>
                <Text style={styles.specText}>Parking</Text>
              </View>
            )}
          </View>

          {property.floor !== undefined && (
            <Text style={styles.floorInfo}>
              Floor {property.floor}{property.totalFloors ? ` of ${property.totalFloors}` : ''}
            </Text>
          )}

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{property.description}</Text>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Amenities</Text>
          <View style={styles.amenitiesList}>
            {property.amenities.map((amenity, index) => (
              <View key={index} style={styles.amenityItem}>
                <View style={styles.amenityIcon}>
                  {amenity.toLowerCase().includes('wifi') && <Wifi size={16} color="#3B82F6" />}
                  {amenity.toLowerCase().includes('security') && <Shield size={16} color="#3B82F6" />}
                  {amenity.toLowerCase().includes('parking') && <Car size={16} color="#3B82F6" />}
                  {!amenity.toLowerCase().includes('wifi') &&
                   !amenity.toLowerCase().includes('security') &&
                   !amenity.toLowerCase().includes('parking') && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </View>
                <Text style={styles.amenityText}>{amenity}</Text>
              </View>
            ))}
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Payment Details</Text>
          <View style={styles.paymentCard}>
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Monthly Rent</Text>
              <Text style={styles.paymentValue}>KES {property.price.toLocaleString()}</Text>
            </View>
            {property.deposit && (
              <View style={styles.paymentRow}>
                <Text style={styles.paymentLabel}>Security Deposit</Text>
                <Text style={styles.paymentValue}>KES {property.deposit.toLocaleString()}</Text>
              </View>
            )}
            {property.serviceCharge && (
              <View style={styles.paymentRow}>
                <Text style={styles.paymentLabel}>Service Charge</Text>
                <Text style={styles.paymentValue}>KES {property.serviceCharge.toLocaleString()}</Text>
              </View>
            )}
            <View style={styles.paymentDivider} />
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabelBold}>Total Move-in Cost</Text>
              <Text style={styles.paymentValueBold}>
                KES{' '}
                {(
                  property.price +
                  (property.deposit || 0) +
                  (property.serviceCharge || 0)
                ).toLocaleString()}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Landlord</Text>
          <View style={styles.landlordCard}>
            <View style={styles.landlordHeader}>
              <View style={styles.landlordAvatar}>
                <Text style={styles.landlordInitial}>
                  {property.landlord.name.charAt(0)}
                </Text>
              </View>
              <View style={styles.landlordInfo}>
                <View style={styles.landlordNameRow}>
                  <Text style={styles.landlordName}>{property.landlord.name}</Text>
                  {property.landlord.verified && (
                    <Text style={styles.landlordVerified}>✓</Text>
                  )}
                </View>
                <Text style={styles.landlordRating}>
                  ⭐ {property.landlord.rating} ({property.landlord.reviewCount} reviews)
                </Text>
                <Text style={styles.landlordDetails}>
                  Response time: {property.landlord.responseTime}
                </Text>
                <Text style={styles.landlordDetails}>
                  Member since {property.landlord.memberSince}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Availability</Text>
          <View style={styles.availabilityCard}>
            <Text style={styles.availabilityText}>
              {property.availableFrom === 'now'
                ? '🟢 Available Now'
                : `Available from ${property.availableFrom}`}
            </Text>
          </View>

          <View style={{ height: 100 }} />
        </View>
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <TouchableOpacity
          style={styles.messageButton}
          onPress={() => router.push('/(tabs)/chats')}
        >
          <MessageCircle size={20} color="#FFFFFF" />
          <Text style={styles.buttonText}>Message</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.callButton} onPress={() => {}}>
          <Phone size={20} color="#FFFFFF" />
          <Text style={styles.buttonText}>Call</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.scheduleButton} onPress={() => {}}>
          <Calendar size={20} color="#3B82F6" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  imageContainer: {
    height: 400,
    position: 'relative' as const,
  },
  image: {
    width: SCREEN_WIDTH,
    height: 400,
  },
  topBar: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  topActions: {
    flexDirection: 'row',
    gap: 12,
  },
  imagePagination: {
    position: 'absolute' as const,
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  paginationDotActive: {
    backgroundColor: '#FFFFFF',
    width: 24,
  },
  content: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  typeContainer: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  propertyType: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: '#3B82F6',
    letterSpacing: 0.5,
  },
  verifiedBadge: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  verifiedText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#059669',
  },
  title: {
    fontSize: 26,
    fontWeight: '800' as const,
    color: '#111827',
    marginBottom: 8,
    lineHeight: 32,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  price: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: '#3B82F6',
  },
  priceLabel: {
    fontSize: 16,
    color: '#6B7280',
    marginLeft: 4,
    fontWeight: '500' as const,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  rating: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#111827',
  },
  reviewCount: {
    fontSize: 14,
    color: '#6B7280',
  },
  saves: {
    fontSize: 14,
    color: '#6B7280',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  location: {
    fontSize: 15,
    color: '#374151',
    fontWeight: '500' as const,
    flex: 1,
  },
  distance: {
    fontSize: 13,
    color: '#9CA3AF',
    marginLeft: 24,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#111827',
    marginBottom: 16,
  },
  specs: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  specCard: {
    flex: 1,
    minWidth: 70,
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  specLabel: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#111827',
    marginTop: 8,
  },
  specText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
  },
  floorInfo: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 12,
  },
  description: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 24,
  },
  amenitiesList: {
    gap: 12,
  },
  amenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  amenityIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#3B82F6',
  },
  amenityText: {
    fontSize: 15,
    color: '#374151',
    fontWeight: '500' as const,
  },
  paymentCard: {
    backgroundColor: '#F9FAFB',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  paymentLabel: {
    fontSize: 15,
    color: '#6B7280',
  },
  paymentValue: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#111827',
  },
  paymentLabelBold: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#111827',
  },
  paymentValueBold: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: '#3B82F6',
  },
  paymentDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 8,
  },
  landlordCard: {
    backgroundColor: '#F9FAFB',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  landlordHeader: {
    flexDirection: 'row',
    gap: 16,
  },
  landlordAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  landlordInitial: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  landlordInfo: {
    flex: 1,
  },
  landlordNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  landlordName: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#111827',
  },
  landlordVerified: {
    fontSize: 16,
    color: '#10B981',
  },
  landlordRating: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 4,
  },
  landlordDetails: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 2,
  },
  availabilityCard: {
    backgroundColor: '#D1FAE5',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  availabilityText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#059669',
  },
  bottomBar: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  messageButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#3B82F6',
    paddingVertical: 14,
    borderRadius: 12,
  },
  callButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#10B981',
    paddingVertical: 14,
    borderRadius: 12,
  },
  scheduleButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorText: {
    fontSize: 18,
    color: '#6B7280',
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600' as const,
  },
});
