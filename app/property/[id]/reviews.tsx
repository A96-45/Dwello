import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Star, Plus, Filter, SortAsc } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import ReviewCard from '@/components/ReviewCard';
import ReviewForm from '@/components/ReviewForm';
import { MOCK_PROPERTIES } from '@/mocks/properties';

const MOCK_REVIEWS = [
  {
    id: '1',
    tenantName: 'Sarah Mwangi',
    tenantPhoto: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100',
    rating: 5,
    reviewText: 'Excellent property! The landlord was very responsive and the apartment was exactly as described. Great location with easy access to public transport.',
    date: '2 weeks ago',
    verified: true,
    helpful: 12,
    propertyId: '1',
    landlordResponse: 'Thank you Sarah! We\'re glad you enjoyed your stay. You were a wonderful tenant!',
    landlordResponseDate: '1 week ago',
  },
  {
    id: '2',
    tenantName: 'John Kamau',
    tenantPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
    rating: 4,
    reviewText: 'Good property overall. The maintenance team was quick to fix any issues. Only downside was the noise from the street.',
    date: '1 month ago',
    verified: true,
    helpful: 8,
    propertyId: '1',
  },
  {
    id: '3',
    tenantName: 'Mary Wanjiku',
    tenantPhoto: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100',
    rating: 5,
    reviewText: 'Amazing place! The amenities are top-notch and the landlord is very professional. Highly recommend!',
    date: '2 months ago',
    verified: true,
    helpful: 15,
    propertyId: '1',
  },
  {
    id: '4',
    tenantName: 'Peter Mwangi',
    tenantPhoto: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
    rating: 3,
    reviewText: 'Decent property but could use some improvements. The kitchen appliances are a bit outdated.',
    date: '3 months ago',
    verified: false,
    helpful: 3,
    propertyId: '1',
  },
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'highest', label: 'Highest Rating' },
  { value: 'lowest', label: 'Lowest Rating' },
  { value: 'most_helpful', label: 'Most Helpful' },
];

export default function PropertyReviewsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [showSortModal, setShowSortModal] = useState(false);

  const property = MOCK_PROPERTIES.find(p => p.id === id);
  const reviews = MOCK_REVIEWS.filter(r => r.propertyId === id);

  const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
  const totalReviews = reviews.length;

  const sortedReviews = [...reviews].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      case 'oldest':
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      case 'highest':
        return b.rating - a.rating;
      case 'lowest':
        return a.rating - b.rating;
      case 'most_helpful':
        return b.helpful - a.helpful;
      default:
        return 0;
    }
  });

  const handleWriteReview = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowReviewForm(true);
  }, []);

  const handleReviewSubmit = useCallback((reviewData: any) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setShowReviewForm(false);
    // TODO: Submit review to backend
    console.log('Review submitted:', reviewData);
  }, []);

  const handleHelpful = useCallback((reviewId: string) => {
    Haptics.selectionAsync();
    // TODO: Update helpful count in backend
    console.log('Marked review as helpful:', reviewId);
  }, []);

  const handleReport = useCallback((reviewId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // TODO: Report review
    console.log('Reported review:', reviewId);
  }, []);

  const handleSortChange = useCallback((newSort: string) => {
    Haptics.selectionAsync();
    setSortBy(newSort);
    setShowSortModal(false);
  }, []);

  const renderStars = (rating: number, size: number = 16) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        size={size}
        color={index < rating ? '#F59E0B' : '#D1D5DB'}
        fill={index < rating ? '#F59E0B' : 'transparent'}
      />
    ));
  };

  const getRatingDistribution = () => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(review => {
      distribution[review.rating as keyof typeof distribution]++;
    });
    return distribution;
  };

  const distribution = getRatingDistribution();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.title}>Reviews</Text>
        <TouchableOpacity onPress={handleWriteReview} style={styles.writeButton}>
          <Plus size={20} color="#3B82F6" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {property && (
          <View style={styles.propertyInfo}>
            <Text style={styles.propertyTitle}>{property.title}</Text>
            <Text style={styles.propertyLocation}>{property.location}, {property.city}</Text>
          </View>
        )}

        <View style={styles.ratingOverview}>
          <View style={styles.ratingSummary}>
            <Text style={styles.averageRating}>{averageRating.toFixed(1)}</Text>
            <View style={styles.starsContainer}>
              {renderStars(Math.round(averageRating), 24)}
            </View>
            <Text style={styles.totalReviews}>{totalReviews} reviews</Text>
          </View>

          <View style={styles.ratingBreakdown}>
            {[5, 4, 3, 2, 1].map((rating) => (
              <View key={rating} style={styles.ratingRow}>
                <Text style={styles.ratingNumber}>{rating}</Text>
                <Star size={16} color="#F59E0B" fill="#F59E0B" />
                <View style={styles.ratingBar}>
                  <View
                    style={[
                      styles.ratingBarFill,
                      { width: `${(distribution[rating as keyof typeof distribution] / totalReviews) * 100}%` }
                    ]}
                  />
                </View>
                <Text style={styles.ratingCount}>
                  {distribution[rating as keyof typeof distribution]}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.reviewsHeader}>
          <Text style={styles.reviewsTitle}>All Reviews</Text>
          <TouchableOpacity
            style={styles.sortButton}
            onPress={() => setShowSortModal(true)}
          >
            <SortAsc size={16} color="#6B7280" />
            <Text style={styles.sortText}>Sort</Text>
          </TouchableOpacity>
        </View>

        {sortedReviews.map((review) => (
          <ReviewCard
            key={review.id}
            review={review}
            onHelpful={handleHelpful}
            onReport={handleReport}
          />
        ))}

        {reviews.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No reviews yet</Text>
            <Text style={styles.emptySubtitle}>
              Be the first to review this property
            </Text>
            <TouchableOpacity style={styles.writeFirstReviewButton} onPress={handleWriteReview}>
              <Text style={styles.writeFirstReviewText}>Write Review</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <Modal
        visible={showReviewForm}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <ReviewForm
          onSubmit={handleReviewSubmit}
          onCancel={() => setShowReviewForm(false)}
          propertyTitle={property?.title || ''}
          landlordName={property?.landlord.name || ''}
        />
      </Modal>

      <Modal
        visible={showSortModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSortModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.sortModal}>
            <Text style={styles.sortModalTitle}>Sort Reviews</Text>
            {SORT_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.sortOption,
                  sortBy === option.value && styles.sortOptionSelected
                ]}
                onPress={() => handleSortChange(option.value)}
              >
                <Text style={[
                  styles.sortOptionText,
                  sortBy === option.value && styles.sortOptionTextSelected
                ]}>
                  {option.label}
                </Text>
                {sortBy === option.value && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
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
  writeButton: {
    padding: 8,
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
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
  ratingOverview: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginBottom: 8,
  },
  ratingSummary: {
    alignItems: 'center',
    marginBottom: 20,
  },
  averageRating: {
    fontSize: 48,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 8,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 8,
  },
  totalReviews: {
    fontSize: 16,
    color: '#6B7280',
  },
  ratingBreakdown: {
    gap: 8,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ratingNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    width: 16,
  },
  ratingBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    overflow: 'hidden',
  },
  ratingBarFill: {
    height: '100%',
    backgroundColor: '#F59E0B',
    borderRadius: 4,
  },
  ratingCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    width: 24,
    textAlign: 'right',
  },
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  reviewsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
  sortText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
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
    marginBottom: 24,
  },
  writeFirstReviewButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  writeFirstReviewText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sortModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    width: '80%',
    maxWidth: 300,
  },
  sortModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
    textAlign: 'center',
  },
  sortOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 4,
  },
  sortOptionSelected: {
    backgroundColor: '#EFF6FF',
  },
  sortOptionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  sortOptionTextSelected: {
    color: '#3B82F6',
    fontWeight: '600',
  },
  checkmark: {
    fontSize: 16,
    color: '#3B82F6',
    fontWeight: '700',
  },
});
