import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { 
  ArrowLeft, 
  Plus, 
  BarChart3, 
  Home, 
  MessageCircle, 
  DollarSign,
  TrendingUp,
  Users,
  Eye,
  Heart
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import AnalyticsCard from '@/components/AnalyticsCard';
import PropertyManagementCard from '@/components/PropertyManagementCard';
import { MOCK_PROPERTIES } from '@/mocks/properties';
import type { Property } from '@/types';

const MOCK_ANALYTICS = {
  totalRevenue: 245000,
  revenueChange: 12.5,
  totalProperties: 8,
  propertiesChange: 0,
  totalViews: 2847,
  viewsChange: 8.3,
  totalInquiries: 23,
  inquiriesChange: -5.2,
  occupancyRate: 87.5,
  occupancyChange: 2.1,
  averageRating: 4.8,
  ratingChange: 0.3,
};

const MOCK_INQUIRIES = [
  {
    id: '1',
    propertyId: '1',
    tenantName: 'Sarah Mwangi',
    tenantPhoto: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100',
    message: 'Hi, I\'m interested in viewing this property. When is it available?',
    timestamp: '2 hours ago',
    status: 'new',
  },
  {
    id: '2',
    propertyId: '2',
    tenantName: 'John Kamau',
    tenantPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
    message: 'Is the property still available? I can move in next month.',
    timestamp: '4 hours ago',
    status: 'replied',
  },
  {
    id: '3',
    propertyId: '3',
    tenantName: 'Mary Wanjiku',
    tenantPhoto: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100',
    message: 'Thank you for the quick response! I\'d like to schedule a viewing.',
    timestamp: '1 day ago',
    status: 'scheduled',
  },
];

export default function LandlordDashboardScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'properties' | 'inquiries'>('overview');

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate refresh
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const handleAddProperty = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/property/create');
  }, [router]);

  const handlePropertyPress = useCallback((property: Property) => {
    Haptics.selectionAsync();
    router.push(`/property/${property.id}`);
  }, [router]);

  const handlePropertyEdit = useCallback((property: Property) => {
    Haptics.selectionAsync();
    router.push(`/property/edit/${property.id}`);
  }, [router]);

  const handleInquiryPress = useCallback((inquiry: typeof MOCK_INQUIRIES[0]) => {
    Haptics.selectionAsync();
    router.push(`/chat/${inquiry.id}`);
  }, [router]);

  const renderOverview = () => (
    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.analyticsGrid}>
        <AnalyticsCard
          title="Total Revenue"
          value={`KES ${MOCK_ANALYTICS.totalRevenue.toLocaleString()}`}
          change={MOCK_ANALYTICS.revenueChange}
          changeType="increase"
          subtitle="This month"
          icon={<DollarSign size={20} color="#10B981" />}
        />
        <AnalyticsCard
          title="Properties"
          value={MOCK_ANALYTICS.totalProperties}
          change={MOCK_ANALYTICS.propertiesChange}
          changeType="neutral"
          subtitle="Active listings"
          icon={<Home size={20} color="#3B82F6" />}
        />
        <AnalyticsCard
          title="Total Views"
          value={MOCK_ANALYTICS.totalViews.toLocaleString()}
          change={MOCK_ANALYTICS.viewsChange}
          changeType="increase"
          subtitle="All time"
          icon={<Eye size={20} color="#8B5CF6" />}
        />
        <AnalyticsCard
          title="Inquiries"
          value={MOCK_ANALYTICS.totalInquiries}
          change={MOCK_ANALYTICS.inquiriesChange}
          changeType="decrease"
          subtitle="This month"
          icon={<MessageCircle size={20} color="#F59E0B" />}
        />
        <AnalyticsCard
          title="Occupancy Rate"
          value={`${MOCK_ANALYTICS.occupancyRate}%`}
          change={MOCK_ANALYTICS.occupancyChange}
          changeType="increase"
          subtitle="Current"
          icon={<TrendingUp size={20} color="#10B981" />}
        />
        <AnalyticsCard
          title="Average Rating"
          value={MOCK_ANALYTICS.averageRating}
          change={MOCK_ANALYTICS.ratingChange}
          changeType="increase"
          subtitle="From tenants"
          icon={<Heart size={20} color="#EF4444" />}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.quickAction} onPress={handleAddProperty}>
            <Plus size={24} color="#3B82F6" />
            <Text style={styles.quickActionText}>Add Property</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickAction}>
            <BarChart3 size={24} color="#10B981" />
            <Text style={styles.quickActionText}>View Analytics</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickAction}>
            <MessageCircle size={24} color="#F59E0B" />
            <Text style={styles.quickActionText}>Messages</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );

  const renderProperties = () => (
    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>My Properties ({MOCK_PROPERTIES.length})</Text>
        {MOCK_PROPERTIES.map((property) => (
          <PropertyManagementCard
            key={property.id}
            property={property}
            onPress={() => handlePropertyPress(property)}
            onEdit={() => handlePropertyEdit(property)}
            onMore={() => {}}
          />
        ))}
      </View>
    </ScrollView>
  );

  const renderInquiries = () => (
    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Inquiries ({MOCK_INQUIRIES.length})</Text>
        {MOCK_INQUIRIES.map((inquiry) => (
          <TouchableOpacity
            key={inquiry.id}
            style={styles.inquiryCard}
            onPress={() => handleInquiryPress(inquiry)}
          >
            <View style={styles.inquiryHeader}>
              <View style={styles.inquiryInfo}>
                <Text style={styles.inquiryName}>{inquiry.tenantName}</Text>
                <Text style={styles.inquiryTime}>{inquiry.timestamp}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: getInquiryStatusColor(inquiry.status) }]}>
                <Text style={styles.statusText}>{inquiry.status}</Text>
              </View>
            </View>
            <Text style={styles.inquiryMessage} numberOfLines={2}>
              {inquiry.message}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );

  const getInquiryStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return '#EFF6FF';
      case 'replied':
        return '#F0FDF4';
      case 'scheduled':
        return '#FEF3C7';
      default:
        return '#F3F4F6';
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.title}>Dashboard</Text>
        <TouchableOpacity onPress={handleAddProperty} style={styles.addButton}>
          <Plus size={24} color="#3B82F6" />
        </TouchableOpacity>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'overview' && styles.tabActive]}
          onPress={() => setActiveTab('overview')}
        >
          <BarChart3 size={20} color={activeTab === 'overview' ? '#3B82F6' : '#6B7280'} />
          <Text style={[styles.tabText, activeTab === 'overview' && styles.tabTextActive]}>
            Overview
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'properties' && styles.tabActive]}
          onPress={() => setActiveTab('properties')}
        >
          <Home size={20} color={activeTab === 'properties' ? '#3B82F6' : '#6B7280'} />
          <Text style={[styles.tabText, activeTab === 'properties' && styles.tabTextActive]}>
            Properties
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'inquiries' && styles.tabActive]}
          onPress={() => setActiveTab('inquiries')}
        >
          <MessageCircle size={20} color={activeTab === 'inquiries' ? '#3B82F6' : '#6B7280'} />
          <Text style={[styles.tabText, activeTab === 'inquiries' && styles.tabTextActive]}>
            Inquiries
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'properties' && renderProperties()}
        {activeTab === 'inquiries' && renderInquiries()}
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
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
  },
  tabActive: {
    backgroundColor: '#EFF6FF',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  tabTextActive: {
    color: '#3B82F6',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  analyticsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
  },
  quickAction: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 8,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
  },
  inquiryCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  inquiryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  inquiryInfo: {
    flex: 1,
  },
  inquiryName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  inquiryTime: {
    fontSize: 12,
    color: '#6B7280',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    textTransform: 'capitalize',
  },
  inquiryMessage: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
});
