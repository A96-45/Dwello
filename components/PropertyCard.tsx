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
import { useRouter } from 'expo-router';
import { 
  Heart, 
  MoreVertical, 
  MapPin, 
  Bed, 
  Bath, 
  Square, 
  Car, 
  Wifi, 
  Shield,
  Star,
  Check
} from 'lucide-react-native';
import type { Property } from '@/types';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const SWIPE_THRESHOLD = 60; // Reduced threshold for easier swipes
const VELOCITY_THRESHOLD = 0.25; // Lower velocity threshold for smoother detection
const CARD_WIDTH = SCREEN_WIDTH - 40;
const CARD_HEIGHT = SCREEN_HEIGHT * 0.7;

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
  const router = useRouter();
  const pan = useRef(new Animated.ValueXY()).current;
  const lastTap = useRef(0);

  const resetPosition = useCallback(() => {
    Animated.spring(pan, {
      toValue: { x: 0, y: 0 },
      useNativeDriver: true,
      friction: 7, // Increased friction for snappier return
      tension: 40, // Reduced tension for smoother motion
      restSpeedThreshold: 100,
      restDisplacementThreshold: 40,
    }).start();
  }, [pan]);

  const animateOut = useCallback((direction: 'left' | 'right' | 'up' | 'down', callback?: () => void) => {
    const toValue = {
      left: { x: -SCREEN_WIDTH * 1.5, y: 50 }, // Reduced multiplier and y-offset
      right: { x: SCREEN_WIDTH * 1.5, y: 50 },
      up: { x: 0, y: -SCREEN_HEIGHT },
      down: { x: 0, y: SCREEN_HEIGHT },
    }[direction];

    Animated.timing(pan, {
      toValue,
      useNativeDriver: true,
      duration: 200, // Faster exit animation
    }).start(() => {
      pan.setValue({ x: 0, y: 0 });
      callback?.();
    });
  }, [pan]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => isFirst,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        if (!isFirst) return false;
        const { dx, dy } = gestureState;
        return Math.abs(dx) > 2 || Math.abs(dy) > 2;
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
        const velocityX = Math.abs(gestureState.vx);
        const velocityY = Math.abs(gestureState.vy);

        // Use either velocity or distance threshold
        const hasMetHorizontalThreshold = absX > SWIPE_THRESHOLD || velocityX > VELOCITY_THRESHOLD;
        const hasMetVerticalThreshold = absY > SWIPE_THRESHOLD || velocityY > VELOCITY_THRESHOLD;

        if (hasMetHorizontalThreshold || hasMetVerticalThreshold) {
          // Determine direction based on larger movement or velocity
          const isHorizontal = absX > absY || velocityX > velocityY;
          
          requestAnimationFrame(() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            
            if (isHorizontal) {
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
          });
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
          if (onPress) {
            onPress();
          } else {
            router.push(`/property/${property.id}`);
          }
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
        return '#DC2626';
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
        return 'TAKEN';
      case 'maintenance':
        return 'UNDER MAINTENANCE';
      default:
        return 'PENDING';
    }
  };

  const getStatusIcon = () => {
    switch (property.status) {
      case 'occupied':
        return '🔒';
      case 'available':
        return '🔑';
      case 'maintenance':
        return '🔧';
      default:
        return '⏳';
    }
  };

  const rotate = pan.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
    outputRange: ['-10deg', '0deg', '10deg'],
    extrapolate: 'clamp',
  });

  const likeOpacity = pan.x.interpolate({
    inputRange: [25, 100],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const nopeOpacity = pan.x.interpolate({
    inputRange: [-100, -25],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const cardStyle = {
    transform: [
      { translateX: pan.x },
      { translateY: pan.y },
      { rotate },
    ],
  };

  return (
    <Animated.View
      style={[styles.card, style, isFirst && cardStyle]}
      {...(isFirst ? panResponder.panHandlers : {})}
    >
      <TouchableOpacity activeOpacity={0.95} onPress={handlePress} style={styles.cardContent}>
        <Image source={{ uri: property.images[0] }} style={styles.image} resizeMode="cover" />

        {/* Gradient Overlays */}
        <View style={styles.topGradient} />
        <View style={styles.bottomGradient} />

        {/* Swipe labels */}
        {isFirst && (
          <>
            <Animated.View style={[styles.labelLike, { opacity: likeOpacity }]}> 
              <Text style={styles.labelTextLike}>LIKE</Text>
            </Animated.View>
            <Animated.View style={[styles.labelNope, { opacity: nopeOpacity }]}> 
              <Text style={styles.labelTextNope}>NOPE</Text>
            </Animated.View>
          </>
        )}
        
        <View style={styles.contentContainer}>
          {/* Top Section */}
          <View style={styles.topSection}>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
              <Text style={styles.statusIcon}>{getStatusIcon()}</Text>
              <Text style={styles.statusText}>{getStatusText()}</Text>
            </View>
            
            <View style={styles.topActions}>
              <TouchableOpacity 
                style={styles.actionButton} 
                onPress={(e) => {
                  e.stopPropagation();
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  onToggleSave?.();
                }}
              >
                <Heart
                  size={22}
                  color={isSaved ? '#EF4444' : '#FFFFFF'}
                  fill={isSaved ? '#EF4444' : 'transparent'}
                />
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <MoreVertical size={22} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Badges */}
          <View style={styles.badges}>
            {property.verified && (
              <View style={styles.badge}>
                <Check size={10} color="#FFFFFF" />
                <Text style={styles.badgeText}>Verified</Text>
              </View>
            )}
            {property.featured && (
              <View style={[styles.badge, styles.premiumBadge]}>
                <Star size={10} color="#FFFFFF" />
                <Text style={styles.badgeText}>Premium</Text>
              </View>
            )}
            {property.hasVirtualTour && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>360° Tour</Text>
              </View>
            )}
          </View>

          {/* Bottom Section */}
          <View style={styles.bottomSection}>
            <View style={styles.propertyHeader}>
              <View style={styles.typeContainer}>
                <Text style={styles.propertyType}>
                  {property.type.replace('_', ' ').toUpperCase()}
                </Text>
              </View>
            </View>
            
            <Text style={styles.title} numberOfLines={2}>{property.title}</Text>
            
            <Text style={styles.price}>KES {property.price.toLocaleString()}/mo</Text>
            
            <View style={styles.locationRow}>
              <MapPin size={14} color="#FFFFFF" />
              <Text style={styles.location} numberOfLines={1}>
                {property.location}, {property.city}
                {property.distance && ` · ${property.distance}km`}
              </Text>
            </View>

            <View style={styles.specs}>
              {property.bedrooms > 0 && (
                <View style={styles.spec}>
                  <Bed size={14} color="#FFFFFF" />
                  <Text style={styles.specText}>{property.bedrooms}</Text>
                </View>
              )}
              <View style={styles.spec}>
                <Bath size={14} color="#FFFFFF" />
                <Text style={styles.specText}>{property.bathrooms}</Text>
              </View>
              <View style={styles.spec}>
                <Square size={14} color="#FFFFFF" />
                <Text style={styles.specText}>{property.size}m²</Text>
              </View>
              {property.parking && (
                <View style={styles.spec}>
                  <Car size={14} color="#FFFFFF" />
                </View>
              )}
              {property.amenities.some(a => a.toLowerCase().includes('wifi')) && (
                <View style={styles.spec}>
                  <Wifi size={14} color="#FFFFFF" />
                </View>
              )}
              {property.amenities.some(a => a.toLowerCase().includes('security')) && (
                <View style={styles.spec}>
                  <Shield size={14} color="#FFFFFF" />
                </View>
              )}
            </View>

            <View style={styles.landlordRow}>
              <Text style={styles.landlordText} numberOfLines={1}>
                {property.landlord.name} · ⭐ {property.landlord.rating}
                {property.landlord.verified && ' · ✓'}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    position: 'absolute',
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  cardContent: {
    flex: 1,
  },
  image: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  topGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '35%',
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '65%',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  topSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 16,
    paddingTop: 40,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusIcon: {
    marginRight: 4,
    fontSize: 12,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  topActions: {
    flexDirection: 'column',
    gap: 10,
  },
  actionButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    paddingHorizontal: 16,
    marginTop: -30,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(59, 130, 246, 0.9)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  premiumBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.9)',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  bottomSection: {
    padding: 16,
    paddingBottom: 20,
  },
  propertyHeader: {
    marginBottom: 8,
  },
  typeContainer: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  propertyType: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 6,
    lineHeight: 28,
  },
  price: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    maxWidth: '100%',
  },
  location: {
    fontSize: 14,
    color: '#FFFFFF',
    marginLeft: 4,
    fontWeight: '500',
    flex: 1,
  },
  specs: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  spec: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  specText: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  landlordRow: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
    paddingTop: 10,
  },
  landlordText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
  },
  labelLike: {
    position: 'absolute',
    top: 100,
    left: 30,
    transform: [{ rotate: '-20deg' }],
    borderWidth: 5,
    borderColor: '#10B981',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 8,
    zIndex: 1000,
  },
  labelNope: {
    position: 'absolute',
    top: 100,
    right: 30,
    transform: [{ rotate: '20deg' }],
    borderWidth: 5,
    borderColor: '#EF4444',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 8,
    zIndex: 1000,
  },
  labelTextLike: {
    color: '#10B981',
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 2,
  },
  labelTextNope: {
    color: '#EF4444',
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 2,
  },
});