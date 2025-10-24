import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Camera, Car, QrCode, Clock, MapPin, CheckCircle, Plus, X, Scan } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useApp } from '@/contexts/AppContext';
import OCRScanner from '@/components/OCRScanner';

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
  const { isLandlord, isTenant } = useApp();
  const [vehicles, setVehicles] = useState<Vehicle[]>(MOCK_VEHICLES);
  const [showScanner, setShowScanner] = useState(false);
  const [showAddVehicleModal, setShowAddVehicleModal] = useState(false);
  const [scanType, setScanType] = useState<'license_plate' | 'vehicle_info' | 'general'>('license_plate');
  const [newVehicle, setNewVehicle] = useState({
    plateNumber: '',
    vehicleType: '',
    make: '',
    model: '',
    color: '',
  });

  const handleScanPlate = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (isTenant) {
      handleTenantScan();
    } else {
      setScanType('license_plate');
      setShowScanner(true);
    }
  }, [isTenant, handleTenantScan]);

  const handleScanVehicle = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setScanType('vehicle_info');
    setShowScanner(true);
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
      Alert.alert(
        'Vehicle Found',
        `This vehicle (${result.plateNumber}) is already registered.`,
        [
          { text: 'OK', style: 'default' },
          { text: 'View Details', onPress: () => console.log('View vehicle details') },
        ]
      );
    } else {
      // Add new vehicle
      const newVehicle: Vehicle = {
        id: Date.now().toString(),
        plateNumber: result.plateNumber,
        vehicleType: result.vehicleType || 'Unknown',
        make: result.make || 'Unknown',
        model: result.model || 'Unknown',
        color: 'Unknown',
        registeredAt: new Date().toISOString(),
        lastSeen: new Date().toISOString(),
        status: 'active',
      };

      setVehicles(prev => [newVehicle, ...prev]);
      
      Alert.alert(
        'Vehicle Registered',
        `${result.plateNumber} has been successfully registered.`,
        [{ text: 'OK', style: 'default' }]
      );
    }
  }, [vehicles]);

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

  const handleAddVehicle = useCallback(() => {
    if (!newVehicle.plateNumber.trim()) {
      Alert.alert('Error', 'Please enter a plate number');
      return;
    }

    const vehicle: Vehicle = {
      id: Date.now().toString(),
      plateNumber: newVehicle.plateNumber,
      vehicleType: newVehicle.vehicleType || 'Unknown',
      make: newVehicle.make || 'Unknown',
      model: newVehicle.model || 'Unknown',
      color: newVehicle.color || 'Unknown',
      registeredAt: new Date().toISOString(),
      lastSeen: new Date().toISOString(),
      status: 'active',
    };

    setVehicles(prev => [vehicle, ...prev]);
    setNewVehicle({
      plateNumber: '',
      vehicleType: '',
      make: '',
      model: '',
      color: '',
    });
    setShowAddVehicleModal(false);
    
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('Success', 'Vehicle added successfully!');
  }, [newVehicle]);

  const handleTenantScan = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // Simulate QR code scan for parking entry/exit
    setTimeout(() => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        'Parking Access',
        'Access granted! Gate opening...',
        [{ text: 'OK', style: 'default' }]
      );
    }, 1000);
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

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionButtons}>
            {isLandlord ? (
              <>
                <TouchableOpacity style={styles.actionButton} onPress={handleScanPlate}>
                  <Camera size={24} color="#3B82F6" />
                  <Text style={styles.actionButtonText}>Scan License Plate</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton} onPress={() => setShowAddVehicleModal(true)}>
                  <Plus size={24} color="#10B981" />
                  <Text style={styles.actionButtonText}>Add Vehicle</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity style={styles.scanButton} onPress={handleScanPlate}>
                  <Scan size={32} color="#FFFFFF" />
                  <Text style={styles.scanButtonText}>Scan QR Code</Text>
                  <Text style={styles.scanButtonSubtext}>Scan to enter/exit parking</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {isLandlord ? `Registered Vehicles (${vehicles.length})` : 'My Vehicles'}
          </Text>
          {vehicles.length === 0 ? (
            <View style={styles.emptyState}>
              <Car size={48} color="#9CA3AF" />
              <Text style={styles.emptyTitle}>No Vehicles Registered</Text>
              <Text style={styles.emptySubtitle}>
                {isLandlord 
                  ? 'Add vehicles to manage parking access'
                  : 'Ask your landlord to register your vehicle'
                }
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
                        styles.statusText,
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

                  {isLandlord && (
                    <View style={styles.vehicleActions}>
                      <TouchableOpacity style={styles.actionButtonSmall}>
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
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Parking History</Text>
          <View style={styles.historyCard}>
            <Text style={styles.historyTitle}>Recent Activity</Text>
            <View style={styles.historyItem}>
              <CheckCircle size={20} color="#10B981" />
              <View style={styles.historyContent}>
                <Text style={styles.historyText}>Vehicle KCA 123A entered parking</Text>
                <Text style={styles.historyTime}>2 hours ago</Text>
              </View>
            </View>
            <View style={styles.historyItem}>
              <CheckCircle size={20} color="#10B981" />
              <View style={styles.historyContent}>
                <Text style={styles.historyText}>Vehicle KCB 456B exited parking</Text>
                <Text style={styles.historyTime}>5 hours ago</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How It Works</Text>
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Automatic Vehicle Recognition</Text>
            <Text style={styles.infoText}>
              SmartPark uses advanced OCR technology to automatically recognize your vehicle's license plate and register it in the system. This enables seamless parking management and access control.
            </Text>
            <View style={styles.infoFeatures}>
              <Text style={styles.infoFeature}>• Automatic plate recognition</Text>
              <Text style={styles.infoFeature}>• Vehicle type detection</Text>
              <Text style={styles.infoFeature}>• Real-time tracking</Text>
              <Text style={styles.infoFeature}>• Secure data storage</Text>
            </View>
          </View>
        </View>
      </ScrollView>

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

      {/* Add Vehicle Modal */}
      <Modal
        visible={showAddVehicleModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAddVehicleModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Vehicle</Text>
            <TouchableOpacity
              onPress={() => setShowAddVehicleModal(false)}
              style={styles.closeButton}
            >
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Plate Number *</Text>
              <TextInput
                style={styles.textInput}
                value={newVehicle.plateNumber}
                onChangeText={(text) => setNewVehicle(prev => ({ ...prev, plateNumber: text.toUpperCase() }))}
                placeholder="KCA 123A"
                autoCapitalize="characters"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Vehicle Type</Text>
              <TextInput
                style={styles.textInput}
                value={newVehicle.vehicleType}
                onChangeText={(text) => setNewVehicle(prev => ({ ...prev, vehicleType: text }))}
                placeholder="Sedan, SUV, Hatchback, etc."
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Make</Text>
              <TextInput
                style={styles.textInput}
                value={newVehicle.make}
                onChangeText={(text) => setNewVehicle(prev => ({ ...prev, make: text }))}
                placeholder="Toyota, Honda, Nissan, etc."
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Model</Text>
              <TextInput
                style={styles.textInput}
                value={newVehicle.model}
                onChangeText={(text) => setNewVehicle(prev => ({ ...prev, model: text }))}
                placeholder="Camry, CR-V, Note, etc."
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Color</Text>
              <TextInput
                style={styles.textInput}
                value={newVehicle.color}
                onChangeText={(text) => setNewVehicle(prev => ({ ...prev, color: text }))}
                placeholder="White, Black, Silver, etc."
              />
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.addButton}
              onPress={handleAddVehicle}
            >
              <Text style={styles.addButtonText}>Add Vehicle</Text>
            </TouchableOpacity>
          </View>
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
  statusText: {
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
  // New styles for enhanced SmartPark
  scanButton: {
    backgroundColor: '#3B82F6',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  scanButtonText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  scanButtonSubtext: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#111827',
  },
  closeButton: {
    padding: 4,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#111827',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  modalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  addButton: {
    backgroundColor: '#10B981',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
});
