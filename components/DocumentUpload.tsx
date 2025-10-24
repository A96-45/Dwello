import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { Upload, File, Image as ImageIcon, X, CheckCircle, AlertCircle } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

interface DocumentUploadProps {
  documentType: 'id' | 'agreement' | 'verification' | 'other';
  onUpload: (file: {
    uri: string;
    name: string;
    type: string;
    size: number;
  }) => void;
  onRemove: () => void;
  uploadedFile?: {
    uri: string;
    name: string;
    type: string;
    size: number;
  } | null;
  status?: 'pending' | 'approved' | 'rejected' | 'processing';
  error?: string;
  maxSize?: number; // in MB
  acceptedTypes?: string[];
}

export default function DocumentUpload({
  documentType,
  onUpload,
  onRemove,
  uploadedFile,
  status = 'pending',
  error,
  maxSize = 10,
  acceptedTypes = ['image/*', 'application/pdf'],
}: DocumentUploadProps) {
  const [isUploading, setIsUploading] = useState(false);

  const getDocumentTypeInfo = () => {
    switch (documentType) {
      case 'id':
        return {
          title: 'ID Document',
          description: 'Upload your national ID, passport, or driver\'s license',
          icon: '🆔',
          required: true,
        };
      case 'agreement':
        return {
          title: 'Rental Agreement',
          description: 'Upload your signed rental agreement or lease document',
          icon: '📄',
          required: true,
        };
      case 'verification':
        return {
          title: 'Verification Document',
          description: 'Upload employment letter, bank statement, or income proof',
          icon: '✅',
          required: false,
        };
      default:
        return {
          title: 'Document',
          description: 'Upload your document',
          icon: '📎',
          required: false,
        };
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'approved':
        return '#10B981';
      case 'rejected':
        return '#EF4444';
      case 'processing':
        return '#F59E0B';
      default:
        return '#6B7280';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'approved':
        return <CheckCircle size={20} color="#10B981" />;
      case 'rejected':
        return <AlertCircle size={20} color="#EF4444" />;
      case 'processing':
        return <AlertCircle size={20} color="#F59E0B" />;
      default:
        return null;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'approved':
        return 'Approved';
      case 'rejected':
        return 'Rejected';
      case 'processing':
        return 'Processing';
      default:
        return 'Pending';
    }
  };

  const handleImageUpload = useCallback(async () => {
    try {
      Haptics.selectionAsync();
      setIsUploading(true);

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const file = {
          uri: result.assets[0].uri,
          name: `document_${Date.now()}.jpg`,
          type: 'image/jpeg',
          size: result.assets[0].fileSize || 0,
        };

        if (file.size > maxSize * 1024 * 1024) {
          Alert.alert('File Too Large', `File size must be less than ${maxSize}MB`);
          return;
        }

        onUpload(file);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert('Upload Error', 'Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  }, [maxSize, onUpload]);

  const handleDocumentUpload = useCallback(async () => {
    try {
      Haptics.selectionAsync();
      setIsUploading(true);

      const result = await DocumentPicker.getDocumentAsync({
        type: acceptedTypes,
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        const file = {
          uri: result.assets[0].uri,
          name: result.assets[0].name,
          type: result.assets[0].mimeType || 'application/octet-stream',
          size: result.assets[0].size || 0,
        };

        if (file.size > maxSize * 1024 * 1024) {
          Alert.alert('File Too Large', `File size must be less than ${maxSize}MB`);
          return;
        }

        onUpload(file);
      }
    } catch (error) {
      console.error('Error uploading document:', error);
      Alert.alert('Upload Error', 'Failed to upload document. Please try again.');
    } finally {
      setIsUploading(false);
    }
  }, [maxSize, acceptedTypes, onUpload]);

  const handleRemove = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Remove Document',
      'Are you sure you want to remove this document?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: onRemove },
      ]
    );
  }, [onRemove]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const documentInfo = getDocumentTypeInfo();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.icon}>{documentInfo.icon}</Text>
          <View style={styles.titleTextContainer}>
            <Text style={styles.title}>{documentInfo.title}</Text>
            {documentInfo.required && (
              <Text style={styles.required}>Required</Text>
            )}
          </View>
        </View>
        {status !== 'pending' && (
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor() + '20' }]}>
            {getStatusIcon()}
            <Text style={[styles.statusText, { color: getStatusColor() }]}>
              {getStatusText()}
            </Text>
          </View>
        )}
      </View>

      <Text style={styles.description}>{documentInfo.description}</Text>

      {error && (
        <View style={styles.errorContainer}>
          <AlertCircle size={16} color="#EF4444" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {uploadedFile ? (
        <View style={styles.uploadedFileContainer}>
          <View style={styles.fileInfo}>
            <View style={styles.fileIcon}>
              {uploadedFile.type.startsWith('image/') ? (
                <ImageIcon size={24} color="#3B82F6" />
              ) : (
                <File size={24} color="#3B82F6" />
              )}
            </View>
            <View style={styles.fileDetails}>
              <Text style={styles.fileName} numberOfLines={1}>
                {uploadedFile.name}
              </Text>
              <Text style={styles.fileSize}>
                {formatFileSize(uploadedFile.size)}
              </Text>
            </View>
          </View>
          
          {uploadedFile.type.startsWith('image/') && (
            <Image source={{ uri: uploadedFile.uri }} style={styles.filePreview} />
          )}
          
          <TouchableOpacity style={styles.removeButton} onPress={handleRemove}>
            <X size={20} color="#EF4444" />
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.uploadContainer}>
          <TouchableOpacity
            style={[styles.uploadButton, isUploading && styles.uploadButtonDisabled]}
            onPress={handleImageUpload}
            disabled={isUploading}
          >
            <ImageIcon size={24} color="#3B82F6" />
            <Text style={styles.uploadButtonText}>
              {isUploading ? 'Uploading...' : 'Upload Photo'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.uploadButton, isUploading && styles.uploadButtonDisabled]}
            onPress={handleDocumentUpload}
            disabled={isUploading}
          >
            <File size={24} color="#3B82F6" />
            <Text style={styles.uploadButtonText}>
              {isUploading ? 'Uploading...' : 'Upload Document'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <Text style={styles.helpText}>
        Supported formats: JPG, PNG, PDF. Max size: {maxSize}MB
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  icon: {
    fontSize: 24,
    marginRight: 12,
  },
  titleTextContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  required: {
    fontSize: 12,
    fontWeight: '600',
    color: '#EF4444',
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
    lineHeight: 20,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#EF4444',
    flex: 1,
  },
  uploadedFileContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    position: 'relative',
  },
  fileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  fileIcon: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  fileDetails: {
    flex: 1,
  },
  fileName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  fileSize: {
    fontSize: 12,
    color: '#6B7280',
  },
  filePreview: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    marginBottom: 12,
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  uploadButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#EFF6FF',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  uploadButtonDisabled: {
    opacity: 0.5,
  },
  uploadButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
  },
  helpText: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});
