import React, { useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  TouchableOpacity,
  Animated,
  PanResponder,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Heart, MoreVertical, MapPin, Bed, Bath, Square, Car, Wifi, Shield } from 'lucide-react-native';
import type { Property } from '@/types';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const SWIPE_THRESHOLD = 40;

interface PropertyCardProps {
  property: Property;
  isFirst: boolean;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onPress?: () => void;
  onDoubleTap?: () => void;
  isSaved?: boolean;
  onToggleSave?: () => void;
  style?: any;
}

export default function PropertyCard({
  property,
  isFirst,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  onPress,
  onDoubleTap,
  isSaved,
  onToggleSave,
  style,
}: PropertyCardProps) {
  const pan = useRef(new Animated.ValueXY()).current;
  const lastTap = useRef(0);
  const scale = useRef(new Animated.Value(1)).current;

  const resetPosition = useCallback(() => {
    Animated.parallel([
      Animated.spring(pan, {
        toValue: { x: 0, y: 0 },
        useNativeDriver: true,
        friction: 6,
        tension: 50,
      }),
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        friction: 6,
      }),
    ]).start();
  }, [pan, scale]);

  const animateOut = useCallback((direction: 'left' | 'right' | 'up' | 'down', callback?: () => void) => {
    const toValue = {
      left: { x: -SCREEN_WIDTH * 1.5, y: 0 },
      right: { x: SCREEN_WIDTH * 1.5, y: 0 },
      up: { x: 0, y: -SCREEN_HEIGHT * 1.2 },
      down: { x: 0, y: SCREEN_HEIGHT * 1.2 },
    }[direction];

    Animated.parallel([
      Animated.timing(pan, {
        toValue,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 0.8,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      pan.setValue({ x: 0, y: 0 });
      scale.setValue(1);
      callback?.();
    });
  }, [pan, scale]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => isFirst,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return isFirst && (Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5);
      },
      onPanResponderGrant: () => {
        pan.setOffset({
          x: (pan.x as any)._value,
          y: (pan.y as any)._value,
        });
        pan.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: Animated.event(
        [null, { dx: pan.x, dy: pan.y }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: (_, gestureState) => {
        pan.flattenOffset();

        const absX = Math.abs(gestureState.dx);
        const absY = Math.abs(gestureState.dy);

        if (absX > SWIPE_THRESHOLD || absY > SWIPE_THRESHOLD) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          if (absX > absY) {
            if (gestureState.dx > 0) {
              animateOut('right', onSwipeRight);
            } else {
              animateOut('left', onSwipeLeft);
            }
          } else {
            if (gestureState.dy > 0) {
              animateOut('down', onSwipeDown);
            } else {
              animateOut('up', onSwipeUp);
            }
          }
        } else {
          resetPosition();
        }
      },
      onPanResponderTerminate: resetPosition,
    })
  ).current;

  const handlePress = () => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;
    
    if (now - lastTap.current < DOUBLE_TAP_DELAY) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onDoubleTap?.();
    } else {
      Haptics.selectionAsync();
      setTimeout(() => {
        if (Date.now() - lastTap.current >= DOUBLE_TAP_DELAY) {
          onPress?.();
        }
      }, DOUBLE_TAP_DELAY);
    }
    lastTap.current = now;
  };

  const getStatusColor = () => {
    switch (property.status) {
      case 'available':
        return '#10B981';
      case 'occupied':
        return '#EF4444';
      case 'maintenance':
        return '#3B82F6';
      default:
        return '#F59E0B';
    }
  };

  const getStatusText = () => {
    switch (property.status) {
      case 'available':
        return property.availableFrom === 'now' ? 'AVAILABLE NOW' : `AVAILABLE ${property.availableFrom}`;
      case 'occupied':
        return 'OCCUPIED';
      case 'maintenance':
        return 'UNDER MAINTENANCE';
      default:
        return 'PENDING';
    }
  };

  const rotate = pan.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
    outputRange: ['-15deg', '0deg', '15deg'],
    extrapolate: 'clamp',
  });

  const likeOpacity = pan.x.interpolate({
    inputRange: [0, SCREEN_WIDTH / 4],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const nopeOpacity = pan.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 4, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const cardStyle = isFirst
    ? {
        transform: [
          { translateX: pan.x },
          { translateY: pan.y },
          { rotate },
          { scale },
        ],
      }
    : {};

  return (
    <Animated.View
      style={[styles.card, style, cardStyle]}
      {...(isFirst ? panResponder.panHandlers : {})}
    >
      <TouchableOpacity activeOpacity={0.95} onPress={handlePress} style={styles.cardContent}>
        <Image source={{ uri: property.images[0] }} style={styles.image} resizeMode="cover" />

        {/* Swipe labels */}
        <Animated.View style={[styles.labelLike, { opacity: likeOpacity }]}> 
          <Text style={styles.labelTextLike}>LIKE</Text>
        </Animated.View>
        <Animated.View style={[styles.labelNope, { opacity: nopeOpacity }]}> 
          <Text style={styles.labelTextNope}>NOPE</Text>
        </Animated.View>
        
        <View style={styles.gradient}>
          <View style={styles.topOverlay}>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
              <Text style={styles.statusText}>{getStatusText()}</Text>
            </View>
            
            <View style={styles.topActions}>
              <TouchableOpacity style={styles.actionButton} onPress={(e) => {
                e.stopPropagation();
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                onToggleSave?.();
              }}>
                <Heart
                  size={24}
                  color={isSaved ? '#EF4444' : '#FFFFFF'}
                  fill={isSaved ? '#EF4444' : 'transparent'}
                />
                <Text style={styles.actionText}>{property.saves}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <MoreVertical size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.badges}>
            {property.verified && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>✓ Verified</Text>
              </View>
            )}
            {property.featured && (
              <View style={[styles.badge, { backgroundColor: '#F59E0B' }]}>
                <Text style={styles.badgeText}>⭐ Premium</Text>
              </View>
            )}
            {property.hasVirtualTour && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>📸 360° Tour</Text>
              </View>
            )}
          </View>

          <View style={styles.bottomOverlay}>
            <View style={styles.propertyInfo}>
              <View style={styles.header}>
                <View style={styles.typeContainer}>
                  <Text style={styles.propertyType}>{property.type.replace('_', ' ').toUpperCase()}</Text>
                </View>
              </View>
              
              <Text style={styles.title} numberOfLines={2}>{property.title}</Text>
              
              <Text style={styles.price}>KES {property.price.toLocaleString()}/month</Text>
              
              <View style={styles.locationRow}>
                <MapPin size={16} color="#FFFFFF" />
                <Text style={styles.location}>{property.location}, {property.city}</Text>
                {property.distance && (
                  <Text style={styles.distance}> · {property.distance} km away</Text>
                )}
              </View>

              <View style={styles.specs}>
                {property.bedrooms > 0 && (
                  <View style={styles.spec}>
                    <Bed size={16} color="#FFFFFF" />
                    <Text style={styles.specText}>{property.bedrooms}</Text>
                  </View>
                )}
                <View style={styles.spec}>
                  <Bath size={16} color="#FFFFFF" />
                  <Text style={styles.specText}>{property.bathrooms}</Text>
                </View>
                <View style={styles.spec}>
                  <Square size={16} color="#FFFFFF" />
                  <Text style={styles.specText}>{property.size}m²</Text>
                </View>
                {property.parking && (
                  <View style={styles.spec}>
                    <Car size={16} color="#FFFFFF" />
                  </View>
                )}
                {property.amenities.some(a => a.toLowerCase().includes('wifi')) && (
                  <View style={styles.spec}>
                    <Wifi size={16} color="#FFFFFF" />
                  </View>
                )}
                {property.amenities.some(a => a.toLowerCase().includes('security')) && (
                  <View style={styles.spec}>
                    <Shield size={16} color="#FFFFFF" />
                  </View>
                )}
              </View>

              <View style={styles.landlordRow}>
                <Text style={styles.landlordText}>
                  {property.landlord.name} · ⭐ {property.landlord.rating}
                  {property.landlord.verified && ' · ✓'}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    position: 'absolute' as const,
    width: SCREEN_WIDTH - 32,
    height: SCREEN_HEIGHT * 0.68,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  cardContent: {
    flex: 1,
  },
  image: {
    width: '100%',
    height: '100%',
    position: 'absolute' as const,
  },
  gradient: {
    flex: 1,
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  labelLike: {
    position: 'absolute' as const,
    top: 24,
    left: 24,
    transform: [{ rotate: '-15deg' }],
    borderWidth: 4,
    borderColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(16,185,129,0.1)',
  },
  labelNope: {
    position: 'absolute' as const,
    top: 24,
    right: 24,
    transform: [{ rotate: '15deg' }],
    borderWidth: 4,
    borderColor: '#EF4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(239,68,68,0.1)',
  },
  labelTextLike: {
    color: '#10B981',
    fontSize: 18,
    fontWeight: '900' as const,
    letterSpacing: 2,
  },
  labelTextNope: {
    color: '#EF4444',
    fontSize: 18,
    fontWeight: '900' as const,
    letterSpacing: 2,
  },
  topOverlay: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 16,
    paddingTop: 20,
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700' as const,
    letterSpacing: 0.5,
  },
  topActions: {
    flexDirection: 'column',
    gap: 12,
  },
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600' as const,
    marginTop: 2,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 16,
    marginTop: -80,
  },
  badge: {
    backgroundColor: 'rgba(59, 130, 246, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600' as const,
  },
  bottomOverlay: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 20,
    paddingBottom: 24,
  },
  propertyInfo: {
    gap: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  typeContainer: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  propertyType: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700' as const,
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  price: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  location: {
    fontSize: 14,
    color: '#FFFFFF',
    marginLeft: 4,
    fontWeight: '500' as const,
  },
  distance: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '400' as const,
  },
  specs: {
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
    color: '#FFFFFF',
    fontWeight: '600' as const,
  },
  landlordRow: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
    paddingTop: 12,
  },
  landlordText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500' as const,
  },
});
