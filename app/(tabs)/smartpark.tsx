import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Camera, Car, UserPlus, BarChart3, AlertCircle } from 'lucide-react-native';

export default function SmartParkScreen() {
  const insets = useSafeAreaInsets();
  const [vehicles] = useState([
    {
      id: '1',
      plate: 'KCB 123X',
      model: 'Toyota Fielder',
      color: 'Silver',
      slot: 'P-12',
      status: 'parked' as const,
    },
  ]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>SmartPark</Text>
        <Text style={styles.subtitle}>Smart parking management</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={styles.scanButton}>
          <Camera size={32} color="#FFFFFF" />
          <View style={styles.scanButtonContent}>
            <Text style={styles.scanButtonTitle}>Scan Number Plate</Text>
            <Text style={styles.scanButtonSubtitle}>
              Point at vehicle blocking your space
            </Text>
          </View>
        </TouchableOpacity>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>My Vehicles ({vehicles.length})</Text>
            <TouchableOpacity style={styles.addButton}>
              <Text style={styles.addButtonText}>+ Add</Text>
            </TouchableOpacity>
          </View>

          {vehicles.map((vehicle) => (
            <View key={vehicle.id} style={styles.vehicleCard}>
              <View style={styles.vehicleIcon}>
                <Car size={24} color="#3B82F6" />
              </View>
              <View style={styles.vehicleInfo}>
                <Text style={styles.vehiclePlate}>{vehicle.plate}</Text>
                <Text style={styles.vehicleDetails}>
                  {vehicle.model}, {vehicle.color}
                </Text>
                <View style={styles.vehicleMeta}>
                  <Text style={styles.vehicleSlot}>📍 Slot: {vehicle.slot}</Text>
                  <View style={styles.statusBadge}>
                    <View style={styles.statusDot} />
                    <Text style={styles.statusText}>Parked</Text>
                  </View>
                </View>
              </View>
              <TouchableOpacity style={styles.editButton}>
                <Text style={styles.editButtonText}>Edit</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity style={styles.actionButton}>
              <Car size={24} color="#3B82F6" />
              <Text style={styles.actionText}>Leaving Soon</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <UserPlus size={24} color="#10B981" />
              <Text style={styles.actionText}>Register Visitor</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <BarChart3 size={24} color="#F59E0B" />
              <Text style={styles.actionText}>Parking Stats</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.parkingStatus}>
          <Text style={styles.sectionTitle}>Compound Parking</Text>
          <View style={styles.statusCard}>
            <Text style={styles.compoundName}>Westlands Apartments</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>12</Text>
                <Text style={styles.statLabel}>Available</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>28</Text>
                <Text style={styles.statLabel}>Occupied</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>5</Text>
                <Text style={styles.statLabel}>Visitors</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.viewMapButton}>
              <Text style={styles.viewMapText}>View Parking Map</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.recentActivity}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.emptyActivity}>
            <AlertCircle size={48} color="#D1D5DB" />
            <Text style={styles.emptyText}>No recent activity</Text>
          </View>
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
  },
  scanButton: {
    flexDirection: 'row',
    backgroundColor: '#3B82F6',
    margin: 20,
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
    gap: 16,
  },
  scanButtonContent: {
    flex: 1,
  },
  scanButtonTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  scanButtonSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#111827',
  },
  addButton: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#3B82F6',
  },
  vehicleCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 12,
    marginBottom: 12,
  },
  vehicleIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  vehicleInfo: {
    flex: 1,
  },
  vehiclePlate: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#111827',
    marginBottom: 4,
  },
  vehicleDetails: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  vehicleMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  vehicleSlot: {
    fontSize: 13,
    color: '#6B7280',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: '#059669',
  },
  editButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  editButtonText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#6B7280',
  },
  quickActions: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    gap: 8,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#374151',
    textAlign: 'center',
  },
  parkingStatus: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  statusCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  compoundName: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#111827',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  statBox: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: '#3B82F6',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  viewMapButton: {
    backgroundColor: '#EFF6FF',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  viewMapText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#3B82F6',
  },
  recentActivity: {
    paddingHorizontal: 20,
  },
  emptyActivity: {
    backgroundColor: '#FFFFFF',
    padding: 40,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  emptyText: {
    fontSize: 15,
    color: '#9CA3AF',
    marginTop: 12,
  },
});
