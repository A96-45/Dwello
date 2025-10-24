import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Camera, Scan, Settings } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Camera as ExpoCamera, CameraView } from 'expo-camera';

export default function SmartParkScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [showCamera, setShowCamera] = useState(false);

  const requestCameraPermission = useCallback(async () => {
    const { status } = await ExpoCamera.requestCameraPermissionsAsync();
    setHasPermission(status === 'granted');
    
    if (status === 'granted') {
      setShowCamera(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Alert.alert(
        'Camera Permission Required',
        'Please allow camera access to use SmartPark features.',
        [{ text: 'OK' }]
      );
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }, []);

  const handleOpenCamera = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    if (hasPermission === null) {
      requestCameraPermission();
    } else if (hasPermission === false) {
      Alert.alert(
        'Camera Access Denied',
        'Camera permission is required for SmartPark. Please enable it in settings.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: () => {
            Alert.alert('Settings', 'Please enable camera permission in your device settings.');
          }}
        ]
      );
    } else {
      setShowCamera(true);
    }
  }, [hasPermission, requestCameraPermission]);

  const handleCloseCamera = useCallback(() => {
    setShowCamera(false);
    Haptics.selectionAsync();
  }, []);

  if (showCamera && hasPermission) {
    return (
      <View style={styles.cameraContainer}>
        <CameraView
          style={styles.camera}
          facing="back"
        >
          <View style={styles.cameraOverlay}>
            <View style={styles.cameraHeader}>
              <TouchableOpacity onPress={handleCloseCamera} style={styles.closeButton}>
                <ArrowLeft size={24} color="#FFFFFF" />
              </TouchableOpacity>
              <Text style={styles.cameraTitle}>SmartPark Camera</Text>
              <View style={styles.headerSpacer} />
            </View>

            <View style={styles.cameraContent}>
              <View style={styles.scanFrame}>
                <View style={styles.corner} />
                <View style={[styles.corner, styles.cornerTopRight]} />
                <View style={[styles.corner, styles.cornerBottomLeft]} />
                <View style={[styles.corner, styles.cornerBottomRight]} />
              </View>
              
              <Text style={styles.scanInstructions}>
                Point camera at license plate or parking area
              </Text>
            </View>

            <View style={styles.cameraFooter}>
              <TouchableOpacity style={styles.captureButton}>
                <Scan size={32} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        </CameraView>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.title}>SmartPark</Text>
        <View style={styles.headerRight} />
      </View>

      <View style={styles.content}>
        <View style={styles.welcomeCard}>
          <Camera size={64} color="#3B82F6" />
          <Text style={styles.welcomeTitle}>SmartPark Camera</Text>
          <Text style={styles.welcomeSubtitle}>
            Access your camera to scan license plates and manage parking
          </Text>
        </View>

        <TouchableOpacity style={styles.cameraButton} onPress={handleOpenCamera}>
          <Camera size={24} color="#FFFFFF" />
          <Text style={styles.cameraButtonText}>Open Camera</Text>
        </TouchableOpacity>

        {hasPermission === false && (
          <View style={styles.permissionCard}>
            <Settings size={32} color="#F59E0B" />
            <Text style={styles.permissionTitle}>Camera Permission Required</Text>
            <Text style={styles.permissionText}>
              SmartPark needs camera access to scan license plates and manage parking. 
              Please grant permission when prompted.
            </Text>
          </View>
        )}

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>What you can do:</Text>
          <View style={styles.infoList}>
            <Text style={styles.infoItem}>📸 Scan license plates</Text>
            <Text style={styles.infoItem}>🅿️ Monitor parking spaces</Text>
            <Text style={styles.infoItem}>🚗 Track vehicle entry/exit</Text>
            <Text style={styles.infoItem}>📱 Quick camera access</Text>
          </View>
        </View>
      </View>
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
    fontWeight: '700' as const,
    color: '#111827',
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  welcomeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  cameraButton: {
    backgroundColor: '#3B82F6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 18,
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  cameraButtonText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  permissionCard: {
    backgroundColor: '#FFFBEB',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  permissionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#92400E',
    marginTop: 12,
    marginBottom: 8,
  },
  permissionText: {
    fontSize: 14,
    color: '#92400E',
    textAlign: 'center',
    lineHeight: 20,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#111827',
    marginBottom: 12,
  },
  infoList: {
    gap: 8,
  },
  infoItem: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  // Camera styles
  cameraContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  cameraHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  headerSpacer: {
    width: 44,
  },
  cameraContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    width: 280,
    height: 180,
    position: 'relative',
    marginBottom: 32,
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderLeftWidth: 4,
    borderTopWidth: 4,
    borderColor: '#3B82F6',
    top: 0,
    left: 0,
  },
  cornerTopRight: {
    borderLeftWidth: 0,
    borderRightWidth: 4,
    top: 0,
    right: 0,
    left: 'auto',
  },
  cornerBottomLeft: {
    borderTopWidth: 0,
    borderBottomWidth: 4,
    bottom: 0,
    top: 'auto',
  },
  cornerBottomRight: {
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderRightWidth: 4,
    borderBottomWidth: 4,
    bottom: 0,
    right: 0,
    top: 'auto',
    left: 'auto',
  },
  scanInstructions: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  cameraFooter: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    alignItems: 'center',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
});