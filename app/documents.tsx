import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Upload, File, CheckCircle, AlertCircle, Clock, Shield } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import DocumentUpload from '@/components/DocumentUpload';

interface Document {
  id: string;
  type: 'id' | 'agreement' | 'verification' | 'other';
  name: string;
  uri: string;
  size: number;
  status: 'pending' | 'approved' | 'rejected' | 'processing';
  uploadedAt: string;
  error?: string;
}

const MOCK_DOCUMENTS: Document[] = [
  {
    id: '1',
    type: 'id',
    name: 'national_id.jpg',
    uri: 'file://path/to/national_id.jpg',
    size: 1024000,
    status: 'approved',
    uploadedAt: '2024-01-10T10:30:00Z',
  },
  {
    id: '2',
    type: 'agreement',
    name: 'rental_agreement.pdf',
    uri: 'file://path/to/rental_agreement.pdf',
    size: 2048000,
    status: 'processing',
    uploadedAt: '2024-01-12T14:20:00Z',
  },
  {
    id: '3',
    type: 'verification',
    name: 'employment_letter.pdf',
    uri: 'file://path/to/employment_letter.pdf',
    size: 512000,
    status: 'rejected',
    uploadedAt: '2024-01-08T09:15:00Z',
    error: 'Document is not clear. Please upload a higher quality image.',
  },
];

export default function DocumentsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [documents, setDocuments] = useState<Document[]>(MOCK_DOCUMENTS);
  const [uploadingDocuments, setUploadingDocuments] = useState<Set<string>>(new Set());

  const handleDocumentUpload = useCallback((type: Document['type'], file: {
    uri: string;
    name: string;
    type: string;
    size: number;
  }) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    const newDocument: Document = {
      id: Date.now().toString(),
      type,
      name: file.name,
      uri: file.uri,
      size: file.size,
      status: 'processing',
      uploadedAt: new Date().toISOString(),
    };

    setDocuments(prev => [newDocument, ...prev]);
    setUploadingDocuments(prev => new Set(prev).add(newDocument.id));

    // Simulate processing
    setTimeout(() => {
      setUploadingDocuments(prev => {
        const newSet = new Set(prev);
        newSet.delete(newDocument.id);
        return newSet;
      });
      
      setDocuments(prev => 
        prev.map(doc => 
          doc.id === newDocument.id 
            ? { ...doc, status: 'approved' as const }
            : doc
        )
      );
    }, 3000);
  }, []);

  const handleDocumentRemove = useCallback((type: Document['type']) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setDocuments(prev => prev.filter(doc => doc.type !== type));
  }, []);

  const getDocumentTypeInfo = (type: Document['type']) => {
    switch (type) {
      case 'id':
        return {
          title: 'ID Document',
          description: 'National ID, passport, or driver\'s license',
          icon: '🆔',
          required: true,
        };
      case 'agreement':
        return {
          title: 'Rental Agreement',
          description: 'Signed rental agreement or lease document',
          icon: '📄',
          required: true,
        };
      case 'verification':
        return {
          title: 'Verification Document',
          description: 'Employment letter, bank statement, or income proof',
          icon: '✅',
          required: false,
        };
      default:
        return {
          title: 'Other Document',
          description: 'Additional supporting documents',
          icon: '📎',
          required: false,
        };
    }
  };

  const getStatusIcon = (status: Document['status']) => {
    switch (status) {
      case 'approved':
        return <CheckCircle size={20} color="#10B981" />;
      case 'rejected':
        return <AlertCircle size={20} color="#EF4444" />;
      case 'processing':
        return <Clock size={20} color="#F59E0B" />;
      default:
        return <Clock size={20} color="#6B7280" />;
    }
  };

  const getStatusText = (status: Document['status']) => {
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

  const getStatusColor = (status: Document['status']) => {
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

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getDocumentByType = (type: Document['type']) => {
    return documents.find(doc => doc.type === type);
  };

  const documentTypes: Document['type'][] = ['id', 'agreement', 'verification'];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.title}>Documents</Text>
        <View style={styles.headerRight}>
          <Text style={styles.secureText}>
            <Shield size={16} color="#10B981" />
            {' '}Secure
          </Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Required Documents</Text>
          <Text style={styles.sectionSubtitle}>
            Upload the required documents to complete your profile verification
          </Text>
        </View>

        {documentTypes.map((type) => {
          const document = getDocumentByType(type);
          const typeInfo = getDocumentTypeInfo(type);
          
          return (
            <DocumentUpload
              key={type}
              documentType={type}
              onUpload={(file) => handleDocumentUpload(type, file)}
              onRemove={() => handleDocumentRemove(type)}
              uploadedFile={document ? {
                uri: document.uri,
                name: document.name,
                type: document.name.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg',
                size: document.size,
              } : undefined}
              status={document?.status}
              error={document?.error}
            />
          );
        })}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Document History</Text>
          <Text style={styles.sectionSubtitle}>
            View all your uploaded documents and their status
          </Text>
        </View>

        {documents.length === 0 ? (
          <View style={styles.emptyState}>
            <File size={48} color="#9CA3AF" />
            <Text style={styles.emptyTitle}>No Documents Uploaded</Text>
            <Text style={styles.emptySubtitle}>
              Upload your documents to get started
            </Text>
          </View>
        ) : (
          <View style={styles.documentsList}>
            {documents.map((document) => {
              const typeInfo = getDocumentTypeInfo(document.type);
              const isUploading = uploadingDocuments.has(document.id);
              
              return (
                <View key={document.id} style={styles.documentItem}>
                  <View style={styles.documentHeader}>
                    <View style={styles.documentIcon}>
                      <Text style={styles.documentIconText}>{typeInfo.icon}</Text>
                    </View>
                    <View style={styles.documentInfo}>
                      <Text style={styles.documentName}>{document.name}</Text>
                      <Text style={styles.documentType}>{typeInfo.title}</Text>
                      <Text style={styles.documentDate}>
                        Uploaded {formatDate(document.uploadedAt)} • {formatFileSize(document.size)}
                      </Text>
                    </View>
                    <View style={styles.documentStatus}>
                      {isUploading ? (
                        <Clock size={20} color="#F59E0B" />
                      ) : (
                        getStatusIcon(document.status)
                      )}
                    </View>
                  </View>
                  
                  <View style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(document.status) + '20' }
                  ]}>
                    <Text style={[
                      styles.statusText,
                      { color: getStatusColor(document.status) }
                    ]}>
                      {isUploading ? 'Uploading...' : getStatusText(document.status)}
                    </Text>
                  </View>
                  
                  {document.error && (
                    <View style={styles.errorContainer}>
                      <AlertCircle size={16} color="#EF4444" />
                      <Text style={styles.errorText}>{document.error}</Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}

        <View style={styles.privacySection}>
          <Text style={styles.privacyTitle}>Privacy & Security</Text>
          <Text style={styles.privacyText}>
            Your documents are encrypted and stored securely. We only use them for verification purposes and never share them with third parties.
          </Text>
        </View>
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
  secureText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
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
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  documentsList: {
    padding: 20,
  },
  documentItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  documentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  documentIcon: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  documentIconText: {
    fontSize: 24,
  },
  documentInfo: {
    flex: 1,
  },
  documentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  documentType: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  documentDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  documentStatus: {
    marginLeft: 12,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    gap: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#EF4444',
    flex: 1,
  },
  privacySection: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    margin: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  privacyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  privacyText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
});
