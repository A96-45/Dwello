import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Star, ThumbsUp, Flag, CheckCircle } from 'lucide-react-native';

interface ReviewCardProps {
  review: {
    id: string;
    tenantName: string;
    tenantPhoto?: string;
    rating: number;
    reviewText: string;
    date: string;
    verified: boolean;
    helpful: number;
    propertyId: string;
    landlordResponse?: string;
    landlordResponseDate?: string;
  };
  onHelpful: (reviewId: string) => void;
  onReport: (reviewId: string) => void;
  isHelpful?: boolean;
}

export default function ReviewCard({
  review,
  onHelpful,
  onReport,
  isHelpful = false,
}: ReviewCardProps) {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        size={16}
        color={index < rating ? '#F59E0B' : '#D1D5DB'}
        fill={index < rating ? '#F59E0B' : 'transparent'}
      />
    ));
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.tenantInfo}>
          <View style={styles.avatar}>
            {review.tenantPhoto ? (
              <Image source={{ uri: review.tenantPhoto }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarText}>{review.tenantName.charAt(0)}</Text>
            )}
            {review.verified && (
              <View style={styles.verifiedBadge}>
                <CheckCircle size={12} color="#FFFFFF" />
              </View>
            )}
          </View>
          <View style={styles.tenantDetails}>
            <View style={styles.tenantNameRow}>
              <Text style={styles.tenantName}>{review.tenantName}</Text>
              {review.verified && (
                <Text style={styles.verifiedText}>Verified Tenant</Text>
              )}
            </View>
            <View style={styles.ratingRow}>
              <View style={styles.stars}>
                {renderStars(review.rating)}
              </View>
              <Text style={styles.date}>{review.date}</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity onPress={() => onReport(review.id)} style={styles.reportButton}>
          <Flag size={16} color="#9CA3AF" />
        </TouchableOpacity>
      </View>

      <Text style={styles.reviewText}>{review.reviewText}</Text>

      {review.landlordResponse && (
        <View style={styles.landlordResponse}>
          <Text style={styles.landlordResponseLabel}>Landlord Response:</Text>
          <Text style={styles.landlordResponseText}>{review.landlordResponse}</Text>
          {review.landlordResponseDate && (
            <Text style={styles.landlordResponseDate}>{review.landlordResponseDate}</Text>
          )}
        </View>
      )}

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.helpfulButton, isHelpful && styles.helpfulButtonActive]}
          onPress={() => onHelpful(review.id)}
        >
          <ThumbsUp size={16} color={isHelpful ? '#3B82F6' : '#9CA3AF'} />
          <Text style={[styles.helpfulText, isHelpful && styles.helpfulTextActive]}>
            Helpful ({review.helpful})
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  tenantInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    position: 'relative',
  },
  avatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  tenantDetails: {
    flex: 1,
  },
  tenantNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  tenantName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginRight: 8,
  },
  verifiedText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10B981',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stars: {
    flexDirection: 'row',
    gap: 2,
  },
  date: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  reportButton: {
    padding: 4,
  },
  reviewText: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 22,
    marginBottom: 12,
  },
  landlordResponse: {
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#3B82F6',
  },
  landlordResponseLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 4,
  },
  landlordResponseText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 4,
  },
  landlordResponseDate: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  helpfulButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  helpfulButtonActive: {
    backgroundColor: '#EFF6FF',
  },
  helpfulText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  helpfulTextActive: {
    color: '#3B82F6',
  },
});
