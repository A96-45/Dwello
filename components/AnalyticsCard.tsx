import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react-native';

interface AnalyticsCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
  subtitle?: string;
  onPress?: () => void;
  icon?: React.ReactNode;
}

export default function AnalyticsCard({
  title,
  value,
  change,
  changeType = 'neutral',
  subtitle,
  onPress,
  icon,
}: AnalyticsCardProps) {
  const getChangeIcon = () => {
    switch (changeType) {
      case 'increase':
        return <TrendingUp size={16} color="#10B981" />;
      case 'decrease':
        return <TrendingDown size={16} color="#EF4444" />;
      default:
        return <Minus size={16} color="#6B7280" />;
    }
  };

  const getChangeColor = () => {
    switch (changeType) {
      case 'increase':
        return '#10B981';
      case 'decrease':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  return (
    <TouchableOpacity
      style={[styles.container, onPress && styles.pressable]}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {icon && <View style={styles.iconContainer}>{icon}</View>}
      </View>
      
      <Text style={styles.value}>{value}</Text>
      
      {change !== undefined && (
        <View style={styles.changeRow}>
          {getChangeIcon()}
          <Text style={[styles.changeText, { color: getChangeColor() }]}>
            {change > 0 ? '+' : ''}{change}%
          </Text>
        </View>
      )}
      
      {subtitle && (
        <Text style={styles.subtitle}>{subtitle}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  pressable: {
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    flex: 1,
  },
  iconContainer: {
    marginLeft: 8,
  },
  value: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 8,
  },
  changeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  changeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 12,
    color: '#9CA3AF',
  },
});
