import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  type: 'viewing' | 'payment' | 'maintenance' | 'meeting' | 'reminder';
  time?: string;
  propertyId?: string;
  propertyTitle?: string;
  description?: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
}

interface CalendarViewProps {
  events: CalendarEvent[];
  onEventPress: (event: CalendarEvent) => void;
  onDatePress: (date: Date) => void;
  onAddEvent: () => void;
  selectedDate?: Date;
}

export default function CalendarView({
  events,
  onEventPress,
  onDatePress,
  onAddEvent,
  selectedDate = new Date(),
}: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(selectedDate);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  const navigateMonth = useCallback((direction: 'prev' | 'next') => {
    Haptics.selectionAsync();
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  }, []);

  const handleDatePress = useCallback((date: Date) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onDatePress(date);
  }, [onDatePress]);

  const handleEventPress = useCallback((event: CalendarEvent) => {
    Haptics.selectionAsync();
    onEventPress(event);
  }, [onEventPress]);

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

  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const days = getDaysInMonth(currentDate);
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigateMonth('prev')} style={styles.navButton}>
          <ChevronLeft size={24} color="#3B82F6" />
        </TouchableOpacity>
        <Text style={styles.monthYear}>{formatMonthYear(currentDate)}</Text>
        <TouchableOpacity onPress={() => navigateMonth('next')} style={styles.navButton}>
          <ChevronRight size={24} color="#3B82F6" />
        </TouchableOpacity>
      </View>

      <View style={styles.weekDays}>
        {weekDays.map((day) => (
          <Text key={day} style={styles.weekDay}>{day}</Text>
        ))}
      </View>

      <View style={styles.calendarGrid}>
        {days.map((date, index) => {
          if (!date) {
            return <View key={index} style={styles.emptyDay} />;
          }

          const dayEvents = getEventsForDate(date);
          const isToday = date.toDateString() === new Date().toDateString();
          const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();

          return (
            <TouchableOpacity
              key={date.getTime()}
              style={[
                styles.dayCell,
                isToday && styles.todayCell,
                isSelected && styles.selectedCell,
              ]}
              onPress={() => handleDatePress(date)}
            >
              <Text style={[
                styles.dayNumber,
                isToday && styles.todayText,
                isSelected && styles.selectedText,
              ]}>
                {date.getDate()}
              </Text>
              
              {dayEvents.length > 0 && (
                <View style={styles.eventsContainer}>
                  {dayEvents.slice(0, 2).map((event) => (
                    <View
                      key={event.id}
                      style={[
                        styles.eventDot,
                        { backgroundColor: getEventTypeColor(event.type) }
                      ]}
                    />
                  ))}
                  {dayEvents.length > 2 && (
                    <Text style={styles.moreEvents}>+{dayEvents.length - 2}</Text>
                  )}
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.eventsList}>
        <View style={styles.eventsHeader}>
          <Text style={styles.eventsTitle}>Upcoming Events</Text>
          <TouchableOpacity style={styles.addButton} onPress={onAddEvent}>
            <Plus size={20} color="#3B82F6" />
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.eventsScroll} showsVerticalScrollIndicator={false}>
          {events
            .filter(event => event.date >= new Date())
            .sort((a, b) => a.date.getTime() - b.date.getTime())
            .slice(0, 5)
            .map((event) => (
              <TouchableOpacity
                key={event.id}
                style={styles.eventItem}
                onPress={() => handleEventPress(event)}
              >
                <View style={styles.eventIcon}>
                  <Text style={styles.eventIconText}>
                    {getEventTypeIcon(event.type)}
                  </Text>
                </View>
                
                <View style={styles.eventContent}>
                  <Text style={styles.eventTitle}>{event.title}</Text>
                  {event.propertyTitle && (
                    <Text style={styles.eventProperty}>{event.propertyTitle}</Text>
                  )}
                  <Text style={styles.eventTime}>
                    {event.date.toLocaleDateString()} {event.time && `at ${event.time}`}
                  </Text>
                </View>
                
                <View style={[
                  styles.eventStatus,
                  { backgroundColor: getEventTypeColor(event.type) + '20' }
                ]}>
                  <Text style={[
                    styles.eventStatusText,
                    { color: getEventTypeColor(event.type) }
                  ]}>
                    {event.status}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  navButton: {
    padding: 8,
  },
  monthYear: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  weekDays: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#F9FAFB',
  },
  weekDay: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  emptyDay: {
    width: '14.28%',
    height: 60,
  },
  dayCell: {
    width: '14.28%',
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  todayCell: {
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
  },
  selectedCell: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
  },
  dayNumber: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  todayText: {
    color: '#3B82F6',
    fontWeight: '700',
  },
  selectedText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  eventsContainer: {
    position: 'absolute',
    bottom: 4,
    flexDirection: 'row',
    gap: 2,
  },
  eventDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  moreEvents: {
    fontSize: 10,
    color: '#6B7280',
    fontWeight: '600',
  },
  eventsList: {
    flex: 1,
    padding: 20,
  },
  eventsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  eventsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  eventsScroll: {
    flex: 1,
  },
  eventItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    marginBottom: 8,
  },
  eventIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  eventIconText: {
    fontSize: 20,
  },
  eventContent: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  eventProperty: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  eventTime: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  eventStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  eventStatusText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
