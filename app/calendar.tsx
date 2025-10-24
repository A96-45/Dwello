import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Plus, Calendar as CalendarIcon, Clock, MapPin, User } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import CalendarView from '@/components/CalendarView';
import type { CalendarEvent } from '@/components/CalendarView';

const MOCK_EVENTS: CalendarEvent[] = [
  {
    id: '1',
    title: 'Property Viewing',
    date: new Date(2024, 0, 20, 14, 0),
    type: 'viewing',
    time: '2:00 PM',
    propertyId: '1',
    propertyTitle: 'Modern 2BR Apartment',
    description: 'Viewing appointment with Sarah Mwangi',
    status: 'scheduled',
    priority: 'high',
  },
  {
    id: '2',
    title: 'Rent Payment Due',
    date: new Date(2024, 0, 25, 0, 0),
    type: 'payment',
    time: '12:00 AM',
    propertyId: '2',
    propertyTitle: 'Cozy Studio in Westlands',
    description: 'Monthly rent payment of KES 35,000',
    status: 'scheduled',
    priority: 'high',
  },
  {
    id: '3',
    title: 'Maintenance Check',
    date: new Date(2024, 0, 22, 10, 0),
    type: 'maintenance',
    time: '10:00 AM',
    propertyId: '1',
    propertyTitle: 'Modern 2BR Apartment',
    description: 'Plumbing maintenance and inspection',
    status: 'scheduled',
    priority: 'medium',
  },
  {
    id: '4',
    title: 'Landlord Meeting',
    date: new Date(2024, 0, 18, 15, 30),
    type: 'meeting',
    time: '3:30 PM',
    propertyId: '3',
    propertyTitle: 'Luxury Penthouse',
    description: 'Discuss lease renewal terms',
    status: 'completed',
    priority: 'medium',
  },
  {
    id: '5',
    title: 'Property Inspection',
    date: new Date(2024, 0, 28, 9, 0),
    type: 'viewing',
    time: '9:00 AM',
    propertyId: '4',
    propertyTitle: 'Spacious 3BR House',
    description: 'Final inspection before move-in',
    status: 'scheduled',
    priority: 'high',
  },
];

export default function CalendarScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);

  const handleDatePress = useCallback((date: Date) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedDate(date);
  }, []);

  const handleEventPress = useCallback((event: CalendarEvent) => {
    Haptics.selectionAsync();
    setSelectedEvent(event);
    setShowEventModal(true);
  }, []);

  const handleAddEvent = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // TODO: Navigate to add event screen
    console.log('Add new event');
  }, []);

  const handleCloseModal = useCallback(() => {
    Haptics.selectionAsync();
    setShowEventModal(false);
    setSelectedEvent(null);
  }, []);

  const getEventsForDate = (date: Date) => {
    return MOCK_EVENTS.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  const getEventTypeColor = (type: CalendarEvent['type']) => {
    switch (type) {
      case 'viewing':
        return '#3B82F6';
      case 'payment':
        return '#F59E0B';
      case 'maintenance':
        return '#EF4444';
      case 'meeting':
        return '#10B981';
      case 'reminder':
        return '#8B5CF6';
      default:
        return '#6B7280';
    }
  };

  const getEventTypeIcon = (type: CalendarEvent['type']) => {
    switch (type) {
      case 'viewing':
        return '🏠';
      case 'payment':
        return '💰';
      case 'maintenance':
        return '🔧';
      case 'meeting':
        return '👥';
      case 'reminder':
        return '⏰';
      default:
        return '📅';
    }
  };

  const selectedDateEvents = getEventsForDate(selectedDate);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.title}>Calendar</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAddEvent}>
          <Plus size={24} color="#3B82F6" />
        </TouchableOpacity>
      </View>

      <CalendarView
        events={MOCK_EVENTS}
        onEventPress={handleEventPress}
        onDatePress={handleDatePress}
        onAddEvent={handleAddEvent}
        selectedDate={selectedDate}
      />

      {selectedDateEvents.length > 0 && (
        <View style={styles.selectedDateEvents}>
          <Text style={styles.selectedDateTitle}>
            {selectedDate.toLocaleDateString('en-US', { 
              weekday: 'long', 
              month: 'long', 
              day: 'numeric' 
            })}
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.eventsRow}>
              {selectedDateEvents.map((event) => (
                <TouchableOpacity
                  key={event.id}
                  style={[
                    styles.eventCard,
                    { borderLeftColor: getEventTypeColor(event.type) }
                  ]}
                  onPress={() => handleEventPress(event)}
                >
                  <View style={styles.eventCardHeader}>
                    <Text style={styles.eventCardIcon}>
                      {getEventTypeIcon(event.type)}
                    </Text>
                    <Text style={styles.eventCardTime}>{event.time}</Text>
                  </View>
                  <Text style={styles.eventCardTitle}>{event.title}</Text>
                  {event.propertyTitle && (
                    <Text style={styles.eventCardProperty}>{event.propertyTitle}</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      )}

      <Modal
        visible={showEventModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Event Details</Text>
            <TouchableOpacity onPress={handleCloseModal} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
          </View>
          
          {selectedEvent && (
            <ScrollView style={styles.modalContent}>
              <View style={styles.eventDetailHeader}>
                <View style={[
                  styles.eventTypeBadge,
                  { backgroundColor: getEventTypeColor(selectedEvent.type) + '20' }
                ]}>
                  <Text style={styles.eventTypeIcon}>
                    {getEventTypeIcon(selectedEvent.type)}
                  </Text>
                  <Text style={[
                    styles.eventTypeText,
                    { color: getEventTypeColor(selectedEvent.type) }
                  ]}>
                    {selectedEvent.type.charAt(0).toUpperCase() + selectedEvent.type.slice(1)}
                  </Text>
                </View>
              </View>

              <Text style={styles.eventDetailTitle}>{selectedEvent.title}</Text>
              
              <View style={styles.eventDetailInfo}>
                <View style={styles.infoRow}>
                  <Clock size={20} color="#6B7280" />
                  <Text style={styles.infoText}>
                    {selectedEvent.date.toLocaleDateString()} at {selectedEvent.time}
                  </Text>
                </View>
                
                {selectedEvent.propertyTitle && (
                  <View style={styles.infoRow}>
                    <MapPin size={20} color="#6B7280" />
                    <Text style={styles.infoText}>{selectedEvent.propertyTitle}</Text>
                  </View>
                )}
                
                <View style={styles.infoRow}>
                  <CalendarIcon size={20} color="#6B7280" />
                  <Text style={styles.infoText}>
                    Status: {selectedEvent.status.charAt(0).toUpperCase() + selectedEvent.status.slice(1)}
                  </Text>
                </View>
              </View>

              {selectedEvent.description && (
                <View style={styles.descriptionSection}>
                  <Text style={styles.descriptionTitle}>Description</Text>
                  <Text style={styles.descriptionText}>{selectedEvent.description}</Text>
                </View>
              )}

              <View style={styles.eventActions}>
                <TouchableOpacity style={styles.actionButton}>
                  <Text style={styles.actionButtonText}>Edit Event</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionButton, styles.primaryButton]}>
                  <Text style={[styles.actionButtonText, styles.primaryButtonText]}>
                    {selectedEvent.type === 'viewing' ? 'Start Viewing' : 'View Details'}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          )}
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
  addButton: {
    padding: 4,
  },
  selectedDateEvents: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  selectedDateTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  eventsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  eventCard: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    minWidth: 200,
  },
  eventCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  eventCardIcon: {
    fontSize: 20,
  },
  eventCardTime: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
  },
  eventCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  eventCardProperty: {
    fontSize: 14,
    color: '#6B7280',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#6B7280',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  eventDetailHeader: {
    marginBottom: 20,
  },
  eventTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
    gap: 8,
  },
  eventTypeIcon: {
    fontSize: 16,
  },
  eventTypeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  eventDetailTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 20,
  },
  eventDetailInfo: {
    gap: 16,
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoText: {
    fontSize: 16,
    color: '#374151',
    flex: 1,
  },
  descriptionSection: {
    marginBottom: 24,
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
  },
  eventActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  primaryButton: {
    backgroundColor: '#3B82F6',
  },
  primaryButtonText: {
    color: '#FFFFFF',
  },
});
