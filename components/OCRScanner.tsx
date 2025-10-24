import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { Camera, CameraType, CameraView } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { X, RotateCcw, Flashlight, FlashlightOff, CheckCircle, AlertCircle, Zap, Target } from 'lucide-react-native';

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
  const [autoScanEnabled, setAutoScanEnabled] = useState(true);
  const [scanProgress, setScanProgress] = useState(0);
  const [detectedText, setDetectedText] = useState<string>('');
  const cameraRef = useRef<CameraView | null>(null);
  const scanAnimationValue = useRef(new Animated.Value(0)).current;
  const progressAnimationValue = useRef(new Animated.Value(0)).current;
  const autoScanTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  // Enhanced OCR processing with real-time simulation
  const processOCR = useCallback(async (imageData?: string) => {
    try {
      // Simulate more realistic OCR processing with progress updates
      const steps = [
        { progress: 0.2, text: 'Analyzing image...' },
        { progress: 0.4, text: 'Detecting text regions...' },
        { progress: 0.6, text: 'Processing characters...' },
        { progress: 0.8, text: 'Validating results...' },
        { progress: 1.0, text: 'Complete!' },
      ];

      for (const step of steps) {
        setScanProgress(step.progress);
        setDetectedText(step.text);
        await new Promise(resolve => setTimeout(resolve, 300));
      }

      // Generate more realistic mock results based on scan type
      const plateNumbers = ['KCA 123A', 'KCB 456B', 'KCC 789C', 'KDA 001X', 'KEB 555Y'];
      const vehicleTypes = ['Sedan', 'SUV', 'Hatchback', 'Pickup', 'Van'];
      const makes = ['Toyota', 'Honda', 'Nissan', 'Mazda', 'Subaru'];
      const models = ['Camry', 'CR-V', 'Note', 'CX-5', 'Forester'];
      
      const randomIndex = Math.floor(Math.random() * plateNumbers.length);
      const confidence = 0.85 + Math.random() * 0.15; // 85-100% confidence
      
      const mockResult = {
        plateNumber: plateNumbers[randomIndex],
        confidence: Math.round(confidence * 100) / 100,
        vehicleType: vehicleTypes[randomIndex],
        make: makes[randomIndex],
        model: models[randomIndex],
      };

      return mockResult;
    } catch (error) {
      throw new Error('OCR processing failed');
    }
  }, []);

  const handleScan = useCallback(async () => {
    if (!cameraRef.current || isScanning) return;

    try {
      setIsScanning(true);
      setScanProgress(0);
      setDetectedText('Starting scan...');
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // Start scan animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(scanAnimationValue, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(scanAnimationValue, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      ).start();

      const result = await processOCR();
      
      setScanResult(result.plateNumber);
      onScanComplete(result);
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('OCR scan error:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Scan Error', 'Failed to scan document. Please try again.');
    } finally {
      setIsScanning(false);
      setScanProgress(0);
      setDetectedText('');
      scanAnimationValue.setValue(0);
    }
  }, [cameraRef, isScanning, processOCR, onScanComplete, scanAnimationValue]);

  const handleRetry = useCallback(() => {
    Haptics.selectionAsync();
    setScanResult(null);
    setScanProgress(0);
    setDetectedText('');
  }, []);

  const toggleAutoScan = useCallback(() => {
    Haptics.selectionAsync();
    setAutoScanEnabled(prev => !prev);
  }, []);

  // Auto-scan functionality
  useEffect(() => {
    if (!autoScanEnabled || isScanning || scanResult) return;

    autoScanTimeoutRef.current = setTimeout(() => {
      if (visible && !isScanning && !scanResult) {
        handleScan();
      }
    }, 3000); // Auto-scan after 3 seconds

    return () => {
      if (autoScanTimeoutRef.current) {
        clearTimeout(autoScanTimeoutRef.current);
      }
    };
  }, [autoScanEnabled, isScanning, scanResult, visible, handleScan]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (autoScanTimeoutRef.current) {
        clearTimeout(autoScanTimeoutRef.current);
      }
    };
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
              
              {/* Animated scan line */}
              {isScanning && (
                <Animated.View
                  style={[
                    styles.scanLine,
                    {
                      transform: [
                        {
                          translateY: scanAnimationValue.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0, SCREEN_WIDTH * 0.5 - 4],
                          }),
                        },
                      ],
                    },
                  ]}
                />
              )}
              
              {/* Target indicator */}
              {!isScanning && !scanResult && (
                <View style={styles.targetIndicator}>
                  <Target size={32} color="#3B82F6" />
                </View>
              )}
            </View>
            
            {/* Progress indicator */}
            {isScanning && (
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <Animated.View
                    style={[
                      styles.progressFill,
                      {
                        width: `${scanProgress * 100}%`,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.progressText}>{detectedText}</Text>
              </View>
            )}
          </View>

          <View style={styles.footer}>
            <View style={styles.controls}>
              <TouchableOpacity style={styles.controlButton} onPress={toggleCameraType}>
                <RotateCcw size={24} color="#FFFFFF" />
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.autoScanButton,
                  autoScanEnabled && styles.autoScanButtonActive
                ]}
                onPress={toggleAutoScan}
              >
                <Zap size={20} color={autoScanEnabled ? "#FFFFFF" : "#9CA3AF"} />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.scanButton, isScanning && styles.scanButtonDisabled]}
                onPress={handleScan}
                disabled={isScanning}
              >
                {isScanning ? (
                  <ActivityIndicator size="large" color="#FFFFFF" />
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
              <Text style={styles.instructionsTitle}>
                {autoScanEnabled ? 'Auto-Scan Enabled' : 'Manual Scan Mode'}
              </Text>
              {instructions.tips.map((tip, index) => (
                <Text key={index} style={styles.instructionText}>
                  • {tip}
                </Text>
              ))}
              {autoScanEnabled && (
                <Text style={styles.autoScanInfo}>
                  📱 Auto-scan will start in 3 seconds
                </Text>
              )}
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
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#3B82F6',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  targetIndicator: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -16 }, { translateY: -16 }],
  },
  progressContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  progressBar: {
    width: SCREEN_WIDTH * 0.6,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 14,
    color: '#FFFFFF',
    marginTop: 8,
    textAlign: 'center',
  },
  autoScanButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  autoScanButtonActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  autoScanInfo: {
    fontSize: 12,
    color: '#10B981',
    marginTop: 8,
    textAlign: 'center',
    fontStyle: 'italic',
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
