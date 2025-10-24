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
import { ArrowLeft, Bell, Check, Trash2, Filter, Settings } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import NotificationCard from '@/components/NotificationCard';
import { useNotifications } from '@/contexts/NotificationContext';

const MOCK_NOTIFICATIONS = [
  {
    id: '1',
    type: 'message' as const,
    title: 'New Message',
    message: 'Sarah Mwangi sent you a message about the 2BR apartment in Westlands',
    timestamp: '2024-01-15T10:30:00Z',
    read: false,
    priority: 'high' as const,
    actionData: { chatId: '1' },
    sender: {
      name: 'Sarah Mwangi',
      photo: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100',
    },
  },
  {
    id: '2',
    type: 'property' as const,
    title: 'Property Update',
    message: 'Your saved property "Modern 2BR Apartment" has a price reduction of 10%',
    timestamp: '2024-01-15T09:15:00Z',
    read: false,
    priority: 'medium' as const,
    actionData: { propertyId: '1' },
  },
  {
    id: '3',
    type: 'payment' as const,
    title: 'Payment Reminder',
    message: 'Your rent payment of KES 45,000 is due in 3 days',
    timestamp: '2024-01-15T08:00:00Z',
    read: true,
    priority: 'high' as const,
    actionData: { paymentId: '1' },
  },
  {
    id: '4',
    type: 'system' as const,
    title: 'Welcome to Dwello!',
    message: 'Complete your profile to get personalized property recommendations',
    timestamp: '2024-01-14T16:45:00Z',
    read: true,
    priority: 'low' as const,
  },
  {
    id: '5',
    type: 'reminder' as const,
    title: 'Viewing Scheduled',
    message: 'You have a property viewing scheduled for tomorrow at 2:00 PM',
    timestamp: '2024-01-14T14:20:00Z',
    read: true,
    priority: 'medium' as const,
    actionData: { propertyId: '2' },
  },
];

const FILTER_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'unread', label: 'Unread' },
  { value: 'message', label: 'Messages' },
  { value: 'property', label: 'Properties' },
  { value: 'payment', label: 'Payments' },
  { value: 'system', label: 'System' },
  { value: 'reminder', label: 'Reminders' },
];

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    removeNotification,
    clearAllNotifications 
  } = useNotifications();
  
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');
  const [showFilterModal, setShowFilterModal] = useState(false);

  // Use mock data for now, replace with actual notifications
  const allNotifications = [...MOCK_NOTIFICATIONS, ...notifications];

  const filteredNotifications = allNotifications.filter(notification => {
    switch (filter) {
      case 'unread':
        return !notification.read;
      case 'message':
      case 'property':
      case 'payment':
      case 'system':
      case 'reminder':
        return notification.type === filter;
      default:
        return true;
    }
  });

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate refresh
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const handleNotificationPress = useCallback((notification: typeof allNotifications[0]) => {
    Haptics.selectionAsync();
    
    if (!notification.read) {
      markAsRead(notification.id);
    }

    // Navigate based on action data
    if (notification.actionData?.propertyId) {
      router.push(`/property/${notification.actionData.propertyId}`);
    } else if (notification.actionData?.chatId) {
      router.push(`/chat/${notification.actionData.chatId}`);
    } else if (notification.actionData?.paymentId) {
      router.push('/(tabs)/profile');
    }
  }, [markAsRead, router]);

  const handleMarkAsRead = useCallback((notificationId: string) => {
    markAsRead(notificationId);
  }, [markAsRead]);

  const handleMarkAllAsRead = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    markAllAsRead();
  }, [markAllAsRead]);

  const handleClearAll = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    clearAllNotifications();
  }, [clearAllNotifications]);

  const handleFilterChange = useCallback((newFilter: string) => {
    Haptics.selectionAsync();
    setFilter(newFilter);
    setShowFilterModal(false);
  }, []);

  const getFilterLabel = () => {
    const option = FILTER_OPTIONS.find(opt => opt.value === filter);
    return option?.label || 'All';
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.title}>Notifications</Text>
        <View style={styles.headerRight}>
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount}</Text>
            </View>
          )}
          <TouchableOpacity 
            style={styles.filterButton}
            onPress={() => setShowFilterModal(true)}
          >
            <Filter size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>
      </View>

      {allNotifications.length > 0 && (
        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionButton} onPress={handleMarkAllAsRead}>
            <Check size={16} color="#3B82F6" />
            <Text style={styles.actionText}>Mark All Read</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={handleClearAll}>
            <Trash2 size={16} color="#EF4444" />
            <Text style={[styles.actionText, { color: '#EF4444' }]}>Clear All</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {filteredNotifications.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Bell size={48} color="#9CA3AF" />
            </View>
            <Text style={styles.emptyTitle}>
              {filter === 'all' ? 'No notifications yet' : `No ${getFilterLabel().toLowerCase()} notifications`}
            </Text>
            <Text style={styles.emptySubtitle}>
              {filter === 'all' 
                ? 'You\'ll see important updates and messages here'
                : 'Try changing the filter to see other notifications'
              }
            </Text>
          </View>
        ) : (
          <View style={styles.notificationsList}>
            {filteredNotifications.map((notification) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
                onPress={() => handleNotificationPress(notification)}
                onMarkAsRead={() => handleMarkAsRead(notification.id)}
              />
            ))}
          </View>
        )}
      </ScrollView>

      {showFilterModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.filterModal}>
            <Text style={styles.modalTitle}>Filter Notifications</Text>
            {FILTER_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.filterOption,
                  filter === option.value && styles.filterOptionSelected
                ]}
                onPress={() => handleFilterChange(option.value)}
              >
                <Text style={[
                  styles.filterOptionText,
                  filter === option.value && styles.filterOptionTextSelected
                ]}>
                  {option.label}
                </Text>
                {filter === option.value && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
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
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  badge: {
    backgroundColor: '#EF4444',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  filterButton: {
    padding: 4,
  },
  actions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    gap: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
  },
  content: {
    flex: 1,
  },
  notificationsList: {
    padding: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    width: '80%',
    maxWidth: 300,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
    textAlign: 'center',
  },
  filterOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 4,
  },
  filterOptionSelected: {
    backgroundColor: '#EFF6FF',
  },
  filterOptionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  filterOptionTextSelected: {
    color: '#3B82F6',
    fontWeight: '600',
  },
  checkmark: {
    fontSize: 16,
    color: '#3B82F6',
    fontWeight: '700',
  },
});
