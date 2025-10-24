import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Star, Send } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

interface ReviewFormProps {
  onSubmit: (review: {
    rating: number;
    reviewText: string;
    categories: { [key: string]: number };
  }) => void;
  onCancel: () => void;
  propertyTitle: string;
  landlordName: string;
}

const REVIEW_CATEGORIES = [
  { id: 'cleanliness', label: 'Cleanliness', icon: '🧹' },
  { id: 'communication', label: 'Communication', icon: '💬' },
  { id: 'maintenance', label: 'Maintenance', icon: '🔧' },
  { id: 'value', label: 'Value for Money', icon: '💰' },
  { id: 'location', label: 'Location', icon: '📍' },
  { id: 'amenities', label: 'Amenities', icon: '✨' },
];

export default function ReviewForm({
  onSubmit,
  onCancel,
  propertyTitle,
  landlordName,
}: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [categories, setCategories] = useState<{ [key: string]: number }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleStarPress = useCallback((starRating: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRating(starRating);
  }, []);

  const handleCategoryRating = useCallback((categoryId: string, categoryRating: number) => {
    Haptics.selectionAsync();
    setCategories(prev => ({
      ...prev,
      [categoryId]: categoryRating,
    }));
  }, []);

  const handleSubmit = useCallback(async () => {
    if (rating === 0 || reviewText.trim() === '') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setIsSubmitting(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    onSubmit({
      rating,
      reviewText: reviewText.trim(),
      categories,
    });
    
    setIsSubmitting(false);
  }, [rating, reviewText, categories, onSubmit]);

  const renderStars = (currentRating: number, onPress: (rating: number) => void) => {
    return Array.from({ length: 5 }, (_, index) => (
      <TouchableOpacity
        key={index}
        onPress={() => onPress(index + 1)}
        style={styles.starButton}
      >
        <Star
          size={32}
          color={index < currentRating ? '#F59E0B' : '#D1D5DB'}
          fill={index < currentRating ? '#F59E0B' : 'transparent'}
        />
      </TouchableOpacity>
    ));
  };

  const renderCategoryStars = (categoryId: string, currentRating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <TouchableOpacity
        key={index}
        onPress={() => handleCategoryRating(categoryId, index + 1)}
        style={styles.categoryStarButton}
      >
        <Star
          size={20}
          color={index < currentRating ? '#F59E0B' : '#D1D5DB'}
          fill={index < currentRating ? '#F59E0B' : 'transparent'}
        />
      </TouchableOpacity>
    ));
  };

  const getRatingText = (rating: number) => {
    switch (rating) {
      case 1: return 'Poor';
      case 2: return 'Fair';
      case 3: return 'Good';
      case 4: return 'Very Good';
      case 5: return 'Excellent';
      default: return 'Rate this property';
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Write a Review</Text>
        <Text style={styles.subtitle}>
          Share your experience with {propertyTitle} by {landlordName}
        </Text>
      </View>

      <View style={styles.ratingSection}>
        <Text style={styles.sectionTitle}>Overall Rating</Text>
        <View style={styles.starsContainer}>
          {renderStars(rating, handleStarPress)}
        </View>
        <Text style={styles.ratingText}>{getRatingText(rating)}</Text>
      </View>

      <View style={styles.categoriesSection}>
        <Text style={styles.sectionTitle}>Rate by Category</Text>
        <Text style={styles.sectionSubtitle}>Help others understand what to expect</Text>
        
        {REVIEW_CATEGORIES.map((category) => (
          <View key={category.id} style={styles.categoryRow}>
            <View style={styles.categoryInfo}>
              <Text style={styles.categoryIcon}>{category.icon}</Text>
              <Text style={styles.categoryLabel}>{category.label}</Text>
            </View>
            <View style={styles.categoryStars}>
              {renderCategoryStars(category.id, categories[category.id] || 0)}
            </View>
          </View>
        ))}
      </View>

      <View style={styles.reviewSection}>
        <Text style={styles.sectionTitle}>Write Your Review</Text>
        <Text style={styles.sectionSubtitle}>
          Tell others about your experience. What did you like? What could be improved?
        </Text>
        <TextInput
          style={styles.textInput}
          placeholder="Share your detailed experience..."
          value={reviewText}
          onChangeText={setReviewText}
          multiline
          numberOfLines={6}
          textAlignVertical="top"
          maxLength={500}
        />
        <Text style={styles.characterCount}>{reviewText.length}/500</Text>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.submitButton,
            (rating === 0 || reviewText.trim() === '' || isSubmitting) && styles.submitButtonDisabled
          ]}
          onPress={handleSubmit}
          disabled={rating === 0 || reviewText.trim() === '' || isSubmitting}
        >
          <Send size={20} color="#FFFFFF" />
          <Text style={styles.submitButtonText}>
            {isSubmitting ? 'Submitting...' : 'Submit Review'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 24,
  },
  ratingSection: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginBottom: 8,
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  starButton: {
    padding: 4,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  categoriesSection: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 20,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  categoryLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  categoryStars: {
    flexDirection: 'row',
    gap: 4,
  },
  categoryStarButton: {
    padding: 2,
  },
  reviewSection: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
    height: 120,
    textAlignVertical: 'top',
  },
  characterCount: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'right',
    marginTop: 4,
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  submitButton: {
    flex: 2,
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  submitButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
