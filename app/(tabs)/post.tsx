import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Home, Users, RefreshCw, Star } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';

export default function PostScreen() {
  const insets = useSafeAreaInsets();
  const { isLandlord, isTenant } = useApp();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Post</Text>
        <Text style={styles.subtitle}>
          {isLandlord ? 'List your properties' : 'Create posts & find roommates'}
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {isLandlord && (
          <>
            <TouchableOpacity style={styles.actionCard}>
              <View style={styles.iconContainer}>
                <Home size={32} color="#3B82F6" />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>List Property</Text>
                <Text style={styles.cardDescription}>
                  Add a new rental property with photos, details, and pricing
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard}>
              <View style={styles.iconContainer}>
                <Star size={32} color="#F59E0B" />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>Boost Listing</Text>
                <Text style={styles.cardDescription}>
                  Promote your property for better visibility
                </Text>
              </View>
            </TouchableOpacity>

            <View style={styles.statsCard}>
              <Text style={styles.statsTitle}>Your Listings</Text>
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>0</Text>
                  <Text style={styles.statLabel}>Active</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>0</Text>
                  <Text style={styles.statLabel}>Drafts</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>0</Text>
                  <Text style={styles.statLabel}>Total Views</Text>
                </View>
              </View>
            </View>
          </>
        )}

        {isTenant && (
          <>
            <TouchableOpacity style={styles.actionCard}>
              <View style={styles.iconContainer}>
                <Users size={32} color="#3B82F6" />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>Find Roommate</Text>
                <Text style={styles.cardDescription}>
                  Post an ad to find someone to share your apartment
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard}>
              <View style={styles.iconContainer}>
                <RefreshCw size={32} color="#10B981" />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>Sublet My Place</Text>
                <Text style={styles.cardDescription}>
                  Temporarily rent out your apartment while you&apos;re away
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard}>
              <View style={styles.iconContainer}>
                <Star size={32} color="#F59E0B" />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>Write Review</Text>
                <Text style={styles.cardDescription}>
                  Share your experience with your landlord or property
                </Text>
              </View>
            </TouchableOpacity>
          </>
        )}

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>💡 Pro Tip</Text>
          <Text style={styles.infoText}>
            {isLandlord
              ? 'Properties with at least 5 photos and detailed descriptions get 3x more inquiries!'
              : 'Include clear photos and detailed descriptions to attract the right roommate faster!'}
          </Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: '#6B7280',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  actionCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 16,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#111827',
    marginBottom: 6,
  },
  cardDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  statsCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#111827',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 32,
    fontWeight: '800' as const,
    color: '#3B82F6',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: '#6B7280',
  },
  infoCard: {
    backgroundColor: '#EFF6FF',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#1E40AF',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#1E40AF',
    lineHeight: 20,
  },
});
