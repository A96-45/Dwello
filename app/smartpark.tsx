import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Animated,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { 
  ArrowLeft, 
  Car, 
  Clock, 
  MapPin, 
  CheckCircle, 
  Scan, 
  Activity,
  BarChart3,
  Shield,
  Zap,
  Users,
  TrendingUp,
  AlertTriangle,
  Wifi,
  Battery
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import OCRScanner from '@/components/OCRScanner';
import { useApp } from '@/contexts/AppContext';

interface Vehicle {
  id: string;
  plateNumber: string;
  vehicleType: string;
  make: string;
  model: string;
  color: string;
  registeredAt: string;
  lastSeen: string;
  status: 'active' | 'inactive' | 'suspended';
  parkingSpot?: string;
  ownerName?: string;
  accessLevel?: 'tenant' | 'visitor' | 'staff';
  entryTime?: string;
  exitTime?: string;
}

interface ParkingSpace {
  id: string;
  number: string;
  status: 'occupied' | 'available' | 'reserved' | 'maintenance';
  vehicleId?: string;
  lastUpdated: string;
  type: 'standard' | 'compact' | 'disabled' | 'electric';
}

interface SmartParkStats {
  totalSpaces: number;
  occupiedSpaces: number;
  availableSpaces: number;
  todayEntries: number;
  todayExits: number;
  peakHour: string;
  averageStayTime: string;
}

const MOCK_VEHICLES: Vehicle[] = [
  {
    id: '1',
    plateNumber: 'KCA 123A',
    vehicleType: 'Sedan',
    make: 'Toyota',
    model: 'Camry',
    color: 'White',
    registeredAt: '2024-01-10T10:30:00Z',
    lastSeen: '2024-01-15T14:20:00Z',
    status: 'active',
  },
  {
    id: '2',
    plateNumber: 'KCB 456B',
    vehicleType: 'SUV',
    make: 'Honda',
    model: 'CR-V',
    color: 'Black',
    registeredAt: '2024-01-08T09:15:00Z',
    lastSeen: '2024-01-14T16:45:00Z',
    status: 'active',
  },
  {
    id: '3',
    plateNumber: 'KCC 789C',
    vehicleType: 'Hatchback',
    make: 'Nissan',
    model: 'Note',
    color: 'Silver',
    registeredAt: '2024-01-05T11:20:00Z',
    lastSeen: '2024-01-12T08:30:00Z',
    status: 'inactive',
  },
];

export default function SmartParkScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { isLandlord } = useApp();
  const [vehicles, setVehicles] = useState<Vehicle[]>(MOCK_VEHICLES);
  const [showScanner, setShowScanner] = useState(false);
  const [scanType, setScanType] = useState<'license_plate' | 'vehicle_info' | 'general'>('license_plate');
  const [refreshing, setRefreshing] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const [batteryLevel, setBatteryLevel] = useState(85);
  const [parkingSpaces] = useState<ParkingSpace[]>([
    { id: '1', number: 'A01', status: 'occupied', vehicleId: '1', lastUpdated: new Date().toISOString(), type: 'standard' },
    { id: '2', number: 'A02', status: 'available', lastUpdated: new Date().toISOString(), type: 'standard' },
    { id: '3', number: 'A03', status: 'occupied', vehicleId: '2', lastUpdated: new Date().toISOString(), type: 'compact' },
    { id: '4', number: 'B01', status: 'reserved', lastUpdated: new Date().toISOString(), type: 'disabled' },
    { id: '5', number: 'B02', status: 'available', lastUpdated: new Date().toISOString(), type: 'electric' },
  ]);
  const [stats] = useState<SmartParkStats>({
    totalSpaces: 50,
    occupiedSpaces: 32,
    availableSpaces: 18,
    todayEntries: 45,
    todayExits: 38,
    peakHour: '9:00 AM',
    averageStayTime: '4.2 hours',
  });
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  const handleScanPlate = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setScanType('license_plate');
    setShowScanner(true);
  }, []);

  const handleScanVehicle = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setScanType('vehicle_info');
    setShowScanner(true);
  }, []);

  // Animation effects
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate battery drain
      setBatteryLevel(prev => Math.max(20, prev - Math.random() * 2));
      
      // Simulate connection status
      setIsConnected(prev => Math.random() > 0.1 ? true : prev);
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Simulate data refresh
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setRefreshing(false);
  }, []);

  const handleScanComplete = useCallback((result: {
    plateNumber: string;
    confidence: number;
    vehicleType?: string;
    make?: string;
    model?: string;
  }) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setShowScanner(false);

    // Check if vehicle already exists
    const existingVehicle = vehicles.find(v => v.plateNumber === result.plateNumber);
    
    if (existingVehicle) {
      // Update existing vehicle with entry time
      const updatedVehicle = {
        ...existingVehicle,
        lastSeen: new Date().toISOString(),
        entryTime: new Date().toISOString(),
        status: 'active' as const,
      };
      
      setVehicles(prev => prev.map(v => v.id === existingVehicle.id ? updatedVehicle : v));
      
      Alert.alert(
        '🚗 Vehicle Entry Recorded',
        `${result.plateNumber} has entered the parking area.\n\nConfidence: ${Math.round(result.confidence * 100)}%\nTime: ${new Date().toLocaleTimeString()}`,
        [
          { text: 'OK', style: 'default' },
          { text: 'View Details', onPress: () => handleVehiclePress(existingVehicle) },
        ]
      );
    } else {
      // Add new vehicle with smart detection
      const availableSpot = parkingSpaces.find(s => s.status === 'available');
      const newVehicle: Vehicle = {
        id: Date.now().toString(),
        plateNumber: result.plateNumber,
        vehicleType: result.vehicleType || 'Unknown',
        make: result.make || 'Unknown',
        model: result.model || 'Unknown',
        color: 'Unknown',
        registeredAt: new Date().toISOString(),
        lastSeen: new Date().toISOString(),
        entryTime: new Date().toISOString(),
        status: 'active',
        parkingSpot: availableSpot?.number,
        accessLevel: isLandlord ? 'staff' : 'visitor',
        ownerName: 'Unknown',
      };

      setVehicles(prev => [newVehicle, ...prev]);
      
      Alert.alert(
        '✅ New Vehicle Registered',
        `${result.plateNumber} has been successfully registered and assigned to spot ${availableSpot?.number || 'TBD'}.\n\nConfidence: ${Math.round(result.confidence * 100)}%\nVehicle: ${result.make} ${result.model}`,
        [{ text: 'OK', style: 'default' }]
      );
    }
  }, [vehicles, parkingSpaces, isLandlord]);

  const handleVehiclePress = useCallback((vehicle: Vehicle) => {
    Haptics.selectionAsync();
    // TODO: Navigate to vehicle details
    console.log('View vehicle details:', vehicle.id);
  }, []);

  const handleRemoveVehicle = useCallback((vehicleId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Remove Vehicle',
      'Are you sure you want to remove this vehicle from your account?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: () => setVehicles(prev => prev.filter(v => v.id !== vehicleId))
        },
      ]
    );
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: Vehicle['status']) => {
    switch (status) {
      case 'active':
        return '#10B981';
      case 'inactive':
        return '#6B7280';
      case 'suspended':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const getStatusText = (status: Vehicle['status']) => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'inactive':
        return 'Inactive';
      case 'suspended':
        return 'Suspended';
      default:
        return 'Unknown';
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.title}>SmartPark</Text>
        <View style={styles.headerRight}>
          <Text style={styles.vehicleCount}>{vehicles.length}</Text>
        </View>
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#3B82F6']}
            tintColor="#3B82F6"
          />
        }
      >
        {/* Smart Status Bar */}
        <Animated.View style={[styles.statusBar, { opacity: fadeAnim }]}>
          <View style={styles.statusItem}>
            <Wifi size={16} color={isConnected ? "#10B981" : "#EF4444"} />
            <Text style={[styles.statusText, { color: isConnected ? "#10B981" : "#EF4444" }]}>
              {isConnected ? 'Connected' : 'Offline'}
            </Text>
          </View>
          <View style={styles.statusItem}>
            <Battery size={16} color={batteryLevel > 30 ? "#10B981" : "#F59E0B"} />
            <Text style={[styles.statusText, { color: batteryLevel > 30 ? "#10B981" : "#F59E0B" }]}>
              {batteryLevel}%
            </Text>
          </View>
          <View style={styles.statusItem}>
            <Activity size={16} color="#3B82F6" />
            <Text style={styles.statusText}>Live</Text>
          </View>
        </Animated.View>

        {/* Smart Analytics Dashboard */}
        {isLandlord && (
          <Animated.View style={[styles.section, { transform: [{ translateY: slideAnim }] }]}>
            <Text style={styles.sectionTitle}>Smart Analytics</Text>
            <View style={styles.analyticsGrid}>
              <View style={styles.analyticsCard}>
                <BarChart3 size={24} color="#3B82F6" />
                <Text style={styles.analyticsValue}>{stats.occupiedSpaces}/{stats.totalSpaces}</Text>
                <Text style={styles.analyticsLabel}>Occupancy</Text>
              </View>
              <View style={styles.analyticsCard}>
                <TrendingUp size={24} color="#10B981" />
                <Text style={styles.analyticsValue}>{stats.todayEntries}</Text>
                <Text style={styles.analyticsLabel}>Today's Entries</Text>
              </View>
              <View style={styles.analyticsCard}>
                <Clock size={24} color="#F59E0B" />
                <Text style={styles.analyticsValue}>{stats.averageStayTime}</Text>
                <Text style={styles.analyticsLabel}>Avg. Stay</Text>
              </View>
              <View style={styles.analyticsCard}>
                <Users size={24} color="#8B5CF6" />
                <Text style={styles.analyticsValue}>{stats.peakHour}</Text>
                <Text style={styles.analyticsLabel}>Peak Hour</Text>
              </View>
            </View>
          </Animated.View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Smart Actions</Text>
          <View style={styles.actionButtons}>
            <TouchableOpacity style={[styles.actionButton, styles.emphasisButton]} onPress={handleScanPlate}>
              <Scan size={24} color="#FFFFFF" />
              <Text style={[styles.actionButtonText, { color: '#FFFFFF' }]}>Smart Scan</Text>
              <Text style={[styles.actionSubtext, { color: '#E5E7EB' }]}>AI-Powered</Text>
            </TouchableOpacity>
            {isLandlord && (
              <TouchableOpacity style={styles.actionButton} onPress={handleScanVehicle}>
                <Shield size={24} color="#10B981" />
                <Text style={styles.actionButtonText}>Security Scan</Text>
                <Text style={styles.actionSubtext}>Advanced Mode</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {isLandlord && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Registered Vehicles ({vehicles.length})</Text>
            {vehicles.length === 0 ? (
              <View style={styles.emptyState}>
                <Car size={48} color="#9CA3AF" />
                <Text style={styles.emptyTitle}>No Vehicles Registered</Text>
                <Text style={styles.emptySubtitle}>
                  Use the scanner to register tenants' vehicles
                </Text>
              </View>
            ) : (
              <View style={styles.vehiclesList}>
                {vehicles.map((vehicle) => (
                  <TouchableOpacity
                    key={vehicle.id}
                    style={styles.vehicleCard}
                    onPress={() => handleVehiclePress(vehicle)}
                  >
                    <View style={styles.vehicleHeader}>
                      <View style={styles.vehicleInfo}>
                        <Text style={styles.plateNumber}>{vehicle.plateNumber}</Text>
                        <Text style={styles.vehicleDetails}>
                          {vehicle.make} {vehicle.model} • {vehicle.color}
                        </Text>
                      </View>
                      <View style={[
                        styles.statusBadge,
                        { backgroundColor: getStatusColor(vehicle.status) + '20' }
                      ]}>
                        <Text style={[
                          styles.vehicleStatusText,
                          { color: getStatusColor(vehicle.status) }
                        ]}>
                          {getStatusText(vehicle.status)}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.vehicleFooter}>
                      <View style={styles.vehicleStat}>
                        <Clock size={16} color="#6B7280" />
                        <Text style={styles.vehicleStatText}>
                          Last seen {formatTime(vehicle.lastSeen)}
                        </Text>
                      </View>
                      <View style={styles.vehicleStat}>
                        <MapPin size={16} color="#6B7280" />
                        <Text style={styles.vehicleStatText}>
                          Registered {formatDate(vehicle.registeredAt)}
                        </Text>
                      </View>
                    </View>

                    {/* Enhanced vehicle info */}
                    {vehicle.parkingSpot && (
                      <View style={styles.vehicleSpot}>
                        <MapPin size={14} color="#3B82F6" />
                        <Text style={styles.vehicleSpotText}>Spot: {vehicle.parkingSpot}</Text>
                        {vehicle.accessLevel && (
                          <View style={[styles.accessBadge, 
                            vehicle.accessLevel === 'staff' ? styles.staffBadge :
                            vehicle.accessLevel === 'tenant' ? styles.tenantBadge : styles.visitorBadge
                          ]}>
                            <Text style={styles.accessText}>{vehicle.accessLevel.toUpperCase()}</Text>
                          </View>
                        )}
                      </View>
                    )}

                    <View style={styles.vehicleActions}>
                      <TouchableOpacity style={styles.actionButtonSmall} onPress={() => handleVehiclePress(vehicle)}>
                        <Text style={styles.actionButtonSmallText}>View Details</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[styles.actionButtonSmall, styles.removeButton]}
                        onPress={() => handleRemoveVehicle(vehicle.id)}
                      >
                        <Text style={[styles.actionButtonSmallText, styles.removeButtonText]}>
                          Remove
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}

        {isLandlord && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Smart Parking History</Text>
            <View style={styles.historyCard}>
              <Text style={styles.historyTitle}>Real-Time Activity</Text>
              <View style={styles.historyItem}>
                <CheckCircle size={20} color="#10B981" />
                <View style={styles.historyContent}>
                  <Text style={styles.historyText}>🚗 KCA 123A entered (Spot A01)</Text>
                  <Text style={styles.historyTime}>2 hours ago • Confidence: 98%</Text>
                </View>
              </View>
              <View style={styles.historyItem}>
                <AlertTriangle size={20} color="#F59E0B" />
                <View style={styles.historyContent}>
                  <Text style={styles.historyText}>⚠️ Unauthorized vehicle detected</Text>
                  <Text style={styles.historyTime}>3 hours ago • Requires attention</Text>
                </View>
              </View>
              <View style={styles.historyItem}>
                <CheckCircle size={20} color="#10B981" />
                <View style={styles.historyContent}>
                  <Text style={styles.historyText}>🚙 KCB 456B exited (Spot A03)</Text>
                  <Text style={styles.historyTime}>5 hours ago • Duration: 4.2h</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AI-Powered SmartPark</Text>
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>🧠 Intelligent Parking System</Text>
            <Text style={styles.infoText}>
              Advanced AI technology for seamless parking management with real-time analytics and automated security.
            </Text>
            <View style={styles.infoFeatures}>
              <Text style={styles.infoFeature}>🤖 AI-powered license plate recognition</Text>
              <Text style={styles.infoFeature}>📊 Real-time occupancy analytics</Text>
              <Text style={styles.infoFeature}>🔒 Automated security monitoring</Text>
              <Text style={styles.infoFeature}>⚡ Smart space allocation</Text>
              <Text style={styles.infoFeature}>📱 Mobile-first experience</Text>
              <Text style={styles.infoFeature}>🌐 Cloud-based data sync</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Enhanced floating action button */}
      <Animated.View style={[styles.fabContainer, { opacity: fadeAnim }]}>
        <TouchableOpacity style={styles.fab} onPress={handleScanPlate}>
          <Zap size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.fabLabel}>Smart Scan</Text>
      </Animated.View>

      {showScanner && (
        <OCRScanner
          visible={showScanner}
          onClose={() => setShowScanner(false)}
          onScanComplete={handleScanComplete}
          scanType={scanType}
          title={scanType === 'license_plate' ? 'Scan License Plate' : 'Scan Vehicle'}
          subtitle={scanType === 'license_plate' 
            ? 'Position the license plate within the frame'
            : 'Position the vehicle within the frame'
          }
        />
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
  },
  vehicleCount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3B82F6',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  emphasisButton: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginTop: 8,
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  vehiclesList: {
    gap: 12,
  },
  vehicleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  vehicleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  vehicleInfo: {
    flex: 1,
  },
  plateNumber: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
  },
  vehicleDetails: {
    fontSize: 14,
    color: '#6B7280',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  vehicleStatusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  vehicleFooter: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  vehicleStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  vehicleStatText: {
    fontSize: 12,
    color: '#6B7280',
  },
  vehicleActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButtonSmall: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonSmallText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  removeButton: {
    backgroundColor: '#FEF2F2',
  },
  removeButtonText: {
    color: '#EF4444',
  },
  historyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  historyContent: {
    flex: 1,
    marginLeft: 12,
  },
  historyText: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 2,
  },
  historyTime: {
    fontSize: 12,
    color: '#6B7280',
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 12,
  },
  infoFeatures: {
    gap: 4,
  },
  infoFeature: {
    fontSize: 14,
    color: '#374151',
  },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#1F2937',
    marginHorizontal: 20,
    marginVertical: 10,
    paddingVertical: 12,
    borderRadius: 12,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  analyticsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  analyticsCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  analyticsValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
    marginTop: 8,
    marginBottom: 4,
  },
  analyticsLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  actionSubtext: {
    fontSize: 11,
    marginTop: 2,
    textAlign: 'center',
  },
  vehicleSpot: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  vehicleSpotText: {
    fontSize: 12,
    color: '#3B82F6',
    fontWeight: '600',
  },
  accessBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 'auto',
  },
  staffBadge: {
    backgroundColor: '#FEF3C7',
  },
  tenantBadge: {
    backgroundColor: '#DBEAFE',
  },
  visitorBadge: {
    backgroundColor: '#F3E8FF',
  },
  accessText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#374151',
  },
  fabContainer: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    alignItems: 'center',
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  fabLabel: {
    fontSize: 12,
    color: '#3B82F6',
    fontWeight: '600',
    marginTop: 4,
    textAlign: 'center',
  },
});
