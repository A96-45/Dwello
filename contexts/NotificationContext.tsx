import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import * as Haptics from 'expo-haptics';

export interface Notification {
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
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  removeNotification: (notificationId: string) => void;
  clearAllNotifications: () => void;
  requestPermissions: () => Promise<boolean>;
  scheduleReminder: (title: string, message: string, triggerDate: Date) => Promise<string>;
  cancelReminder: (notificationId: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [permissions, setPermissions] = useState<Notifications.NotificationPermissionsStatus | null>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Request notification permissions
  const requestPermissions = useCallback(async (): Promise<boolean> => {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      setPermissions(finalStatus);
      return finalStatus === 'granted';
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  }, []);

  // Add a new notification
  const addNotification = useCallback((notificationData: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const notification: Notification = {
      ...notificationData,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      read: false,
    };

    setNotifications(prev => [notification, ...prev]);

    // Trigger haptic feedback
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Show local notification if app is in background
    if (permissions?.status === 'granted') {
      Notifications.scheduleNotificationAsync({
        content: {
          title: notification.title,
          body: notification.message,
          data: notification.actionData,
        },
        trigger: null, // Show immediately
      });
    }
  }, [permissions]);

  // Mark notification as read
  const markAsRead = useCallback((notificationId: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    );
    Haptics.selectionAsync();
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(() => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, []);

  // Remove a notification
  const removeNotification = useCallback((notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    Haptics.selectionAsync();
  }, []);

  // Clear all notifications
  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, []);

  // Schedule a reminder notification
  const scheduleReminder = useCallback(async (
    title: string,
    message: string,
    triggerDate: Date
  ): Promise<string> => {
    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body: message,
          data: { type: 'reminder' },
        },
        trigger: triggerDate,
      });

      // Add to local notifications
      addNotification({
        type: 'reminder',
        title,
        message,
        priority: 'medium',
        actionData: { paymentId: notificationId },
      });

      return notificationId;
    } catch (error) {
      console.error('Error scheduling reminder:', error);
      throw error;
    }
  }, [addNotification]);

  // Cancel a reminder notification
  const cancelReminder = useCallback(async (notificationId: string) => {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      removeNotification(notificationId);
    } catch (error) {
      console.error('Error canceling reminder:', error);
    }
  }, [removeNotification]);

  // Initialize permissions on mount
  useEffect(() => {
    requestPermissions();
  }, [requestPermissions]);

  // Listen for notification responses
  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data;
      
      // Handle different notification types
      if (data?.propertyId) {
        // Navigate to property
        console.log('Navigate to property:', data.propertyId);
      } else if (data?.chatId) {
        // Navigate to chat
        console.log('Navigate to chat:', data.chatId);
      } else if (data?.paymentId) {
        // Navigate to payment
        console.log('Navigate to payment:', data.paymentId);
      }
    });

    return () => subscription.remove();
  }, []);

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications,
    requestPermissions,
    scheduleReminder,
    cancelReminder,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
