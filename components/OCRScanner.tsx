import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import { Camera, CameraType, CameraView } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { X, RotateCcw, Flashlight, FlashlightOff, CheckCircle, AlertCircle } from 'lucide-react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface OCRScannerProps {
  visible: boolean;
  onClose: () => void;
  onScanComplete: (result: {
    plateNumber: string;
    confidence: number;
    vehicleType?: string;
    make?: string;
    model?: string;
  }) => void;
  scanType: 'license_plate' | 'vehicle_info' | 'general';
  title?: string;
  subtitle?: string;
}

export default function OCRScanner({
  visible,
  onClose,
  onScanComplete,
  scanType,
  title = 'Scan Document',
  subtitle = 'Position the document within the frame',
}: OCRScannerProps) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [cameraType, setCameraType] = useState<CameraType>('back');
  const [flashMode, setFlashMode] = useState<'off' | 'on' | 'auto'>('off');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const cameraRef = useRef<CameraView | null>(null);

  const requestCameraPermission = useCallback(async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setHasPermission(status === 'granted');
  }, []);

  // Ensure we request camera permission as soon as scanner becomes visible
  useEffect(() => {
    if (!visible) return;
    if (hasPermission === null) {
      (async () => {
        const existing = await Camera.getCameraPermissionsAsync();
        if (existing.status === 'granted') {
          setHasPermission(true);
        } else {
          const { status } = await Camera.requestCameraPermissionsAsync();
          setHasPermission(status === 'granted');
        }
      })();
    }
  }, [visible, hasPermission]);

  const handleCameraReady = useCallback(() => {
    if (hasPermission === null) {
      requestCameraPermission();
    }
  }, [hasPermission, requestCameraPermission]);

  const toggleCameraType = useCallback(() => {
    Haptics.selectionAsync();
    setCameraType(current => current === 'back' ? 'front' : 'back');
  }, []);

  const toggleFlash = useCallback(() => {
    Haptics.selectionAsync();
    setFlashMode(current => {
      switch (current) {
        case 'off':
          return 'on';
        case 'on':
          return 'auto';
        case 'auto':
          return 'off';
        default:
          return 'off';
      }
    });
  }, []);

  const handleScan = useCallback(async () => {
    if (!cameraRef.current || isScanning) return;

    try {
      setIsScanning(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // Simulate OCR processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock OCR result based on scan type
      let mockResult;
      switch (scanType) {
        case 'license_plate':
          mockResult = {
            plateNumber: 'KCA 123A',
            confidence: 0.95,
            vehicleType: 'Sedan',
            make: 'Toyota',
            model: 'Camry',
          };
          break;
        case 'vehicle_info':
          mockResult = {
            plateNumber: 'KCB 456B',
            confidence: 0.88,
            vehicleType: 'SUV',
            make: 'Honda',
            model: 'CR-V',
          };
          break;
        default:
          mockResult = {
            plateNumber: 'KCC 789C',
            confidence: 0.92,
            vehicleType: 'Hatchback',
            make: 'Nissan',
            model: 'Note',
          };
      }

      setScanResult(mockResult.plateNumber);
      onScanComplete(mockResult);
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('OCR scan error:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Scan Error', 'Failed to scan document. Please try again.');
    } finally {
      setIsScanning(false);
    }
  }, [cameraRef, isScanning, scanType, onScanComplete]);

  const handleRetry = useCallback(() => {
    Haptics.selectionAsync();
    setScanResult(null);
  }, []);

  const getScanInstructions = () => {
    switch (scanType) {
      case 'license_plate':
        return {
          title: 'Scan License Plate',
          subtitle: 'Position the license plate within the frame',
          tips: [
            'Ensure good lighting',
            'Keep the plate straight',
            'Avoid reflections',
            'Hold steady for 2 seconds',
          ],
        };
      case 'vehicle_info':
        return {
          title: 'Scan Vehicle',
          subtitle: 'Position the vehicle within the frame',
          tips: [
            'Include the front of the vehicle',
            'Ensure clear visibility of plates',
            'Good lighting is important',
            'Hold steady for 3 seconds',
          ],
        };
      default:
        return {
          title: 'Scan Document',
          subtitle: 'Position the document within the frame',
          tips: [
            'Ensure good lighting',
            'Keep the document flat',
            'Avoid shadows',
            'Hold steady for 2 seconds',
          ],
        };
    }
  };

  const instructions = getScanInstructions();

  if (!visible) return null;

  if (hasPermission === null) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.permissionContainer}>
        <AlertCircle size={48} color="#EF4444" />
        <Text style={styles.permissionTitle}>Camera Access Required</Text>
        <Text style={styles.permissionText}>
          Please enable camera access to use the scanner
        </Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestCameraPermission}>
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={cameraType}
        flash={flashMode}
        onCameraReady={handleCameraReady}
      >
        <View style={styles.overlay}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <X size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <View style={styles.headerCenter}>
              <Text style={styles.headerTitle}>{title}</Text>
              <Text style={styles.headerSubtitle}>{subtitle}</Text>
            </View>
            <TouchableOpacity style={styles.flashButton} onPress={toggleFlash}>
              {flashMode === 'off' ? (
                <FlashlightOff size={24} color="#FFFFFF" />
              ) : (
                <Flashlight size={24} color="#FFFFFF" />
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.scanArea}>
            <View style={styles.scanFrame}>
              <View style={styles.corner} />
              <View style={[styles.corner, styles.cornerTopRight]} />
              <View style={[styles.corner, styles.cornerBottomLeft]} />
              <View style={[styles.corner, styles.cornerBottomRight]} />
            </View>
          </View>

          <View style={styles.footer}>
            <View style={styles.controls}>
              <TouchableOpacity style={styles.controlButton} onPress={toggleCameraType}>
                <RotateCcw size={24} color="#FFFFFF" />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.scanButton, isScanning && styles.scanButtonDisabled]}
                onPress={handleScan}
                disabled={isScanning}
              >
                {isScanning ? (
                  <View style={styles.scanningIndicator} />
                ) : scanResult ? (
                  <CheckCircle size={32} color="#10B981" />
                ) : (
                  <View style={styles.scanIcon} />
                )}
              </TouchableOpacity>

              {scanResult && (
                <TouchableOpacity style={styles.controlButton} onPress={handleRetry}>
                  <RotateCcw size={24} color="#FFFFFF" />
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.instructions}>
              <Text style={styles.instructionsTitle}>Tips:</Text>
              {instructions.tips.map((tip, index) => (
                <Text key={index} style={styles.instructionText}>
                  • {tip}
                </Text>
              ))}
            </View>
          </View>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  header: {
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
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#CCCCCC',
    textAlign: 'center',
  },
  flashButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    width: SCREEN_WIDTH * 0.8,
    height: SCREEN_WIDTH * 0.5,
    position: 'relative',
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
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  controlButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20,
  },
  scanButtonDisabled: {
    backgroundColor: '#6B7280',
  },
  scanningIndicator: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    borderTopColor: 'transparent',
    // Add rotation animation here
  },
  scanIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
  },
  instructions: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 16,
    borderRadius: 12,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 14,
    color: '#CCCCCC',
    marginBottom: 4,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
    padding: 40,
  },
  permissionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
  },
  permissionText: {
    fontSize: 16,
    color: '#CCCCCC',
    textAlign: 'center',
    marginBottom: 24,
  },
  permissionButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  permissionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
