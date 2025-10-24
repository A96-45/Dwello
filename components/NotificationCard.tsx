import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Bell, MessageCircle, Heart, DollarSign, Calendar, AlertCircle, CheckCircle } from 'lucide-react-native';

interface NotificationCardProps {
  notification: {
    id: string;
    type: 'message' | 'property' | 'payment' | 'system' | 'reminder';
    title: string;
    message: string;
    timestamp: string;
    read: boolean;
    priority: 'low' | 'medium' | 'high';
    actionData?: {
      propertyId?: string;
      chatId?: string;
      paymentId?: string;
    };
    sender?: {
      name: string;
      photo?: string;
    };
  };
  onPress: () => void;
  onMarkAsRead: () => void;
}

export default function NotificationCard({
  notification,
  onPress,
  onMarkAsRead,
}: NotificationCardProps) {
  const getTypeIcon = () => {
    switch (notification.type) {
      case 'message':
        return <MessageCircle size={20} color="#3B82F6" />;
      case 'property':
        return <Heart size={20} color="#10B981" />;
      case 'payment':
        return <DollarSign size={20} color="#F59E0B" />;
      case 'system':
        return <Bell size={20} color="#6B7280" />;
      case 'reminder':
        return <Calendar size={20} color="#8B5CF6" />;
      default:
        return <Bell size={20} color="#6B7280" />;
    }
  };

  const getTypeColor = () => {
    switch (notification.type) {
      case 'message':
        return '#3B82F6';
      case 'property':
        return '#10B981';
      case 'payment':
        return '#F59E0B';
      case 'system':
        return '#6B7280';
      case 'reminder':
        return '#8B5CF6';
      default:
        return '#6B7280';
    }
  };

  const getPriorityColor = () => {
    switch (notification.priority) {
      case 'high':
        return '#EF4444';
      case 'medium':
        return '#F59E0B';
      case 'low':
        return '#6B7280';
      default:
        return '#6B7280';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - notificationTime.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) {
      return 'Just now';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours}h ago`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `${days}d ago`;
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        !notification.read && styles.unreadContainer,
        notification.priority === 'high' && styles.highPriorityContainer
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            {notification.sender?.photo ? (
              <Image source={{ uri: notification.sender.photo }} style={styles.senderPhoto} />
            ) : (
              <View style={[styles.iconBackground, { backgroundColor: getTypeColor() + '20' }]}>
                {getTypeIcon()}
              </View>
            )}
          </View>
          
          <View style={styles.textContent}>
            <View style={styles.titleRow}>
              <Text style={[styles.title, !notification.read && styles.unreadTitle]}>
                {notification.title}
              </Text>
              {notification.priority === 'high' && (
                <View style={[styles.priorityDot, { backgroundColor: getPriorityColor() }]} />
              )}
            </View>
            
            <Text style={[styles.message, !notification.read && styles.unreadMessage]}>
              {notification.message}
            </Text>
            
            <View style={styles.footer}>
              <Text style={styles.timestamp}>
                {formatTimestamp(notification.timestamp)}
              </Text>
              {notification.sender && (
                <Text style={styles.sender}>
                  from {notification.sender.name}
                </Text>
              )}
            </View>
          </View>
        </View>

        {!notification.read && (
          <TouchableOpacity
            style={styles.markAsReadButton}
            onPress={(e) => {
              e.stopPropagation();
              onMarkAsRead();
            }}
          >
            <CheckCircle size={16} color="#10B981" />
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  unreadContainer: {
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
    backgroundColor: '#F8FAFC',
  },
  highPriorityContainer: {
    borderColor: '#FEE2E2',
    backgroundColor: '#FEF2F2',
  },
  content: {
    flexDirection: 'row',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    flex: 1,
  },
  iconContainer: {
    marginRight: 12,
  },
  senderPhoto: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  iconBackground: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContent: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    flex: 1,
  },
  unreadTitle: {
    fontWeight: '700',
    color: '#111827',
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
  message: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 8,
  },
  unreadMessage: {
    color: '#374151',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timestamp: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  sender: {
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  markAsReadButton: {
    padding: 8,
    marginLeft: 8,
  },
});
