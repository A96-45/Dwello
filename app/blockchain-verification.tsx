import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { 
  ArrowLeft, 
  Shield, 
  CheckCircle,
  AlertTriangle,
  Hash,
  MapPin,
  FileText,
  Coins,
  Clock,
  Link
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useApp } from '@/contexts/AppContext';
import { BlockchainService } from '@/services/BlockchainService';
import type { BlockchainVerification, PropertyNFT } from '@/types';

export default function BlockchainVerificationScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  // Removed unused userRole
  const [parcelNumber, setParcelNumber] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [, setVerificationStatus] = useState<any>(null);
  const [userNFTs, setUserNFTs] = useState<PropertyNFT[]>([]);
  const [verifications, setVerifications] = useState<BlockchainVerification[]>([]);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const status = await BlockchainService.getUserVerificationStatus('demo_user');
      setVerificationStatus(status);
      
      const nfts = await BlockchainService.getUserNFTs('demo_user');
      setUserNFTs(nfts);
      
      setVerifications(status.verifications);
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const handleVerifyParcel = async () => {
    if (!parcelNumber.trim() || !ownerName.trim()) {
      Alert.alert('Missing Information', 'Please enter both parcel number and owner name.');
      return;
    }

    try {
      setIsVerifying(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const result = await BlockchainService.verifyParcelNumber(
        'demo_user',
        parcelNumber.trim(),
        ownerName.trim()
      );

      if (result.success) {
        Alert.alert(
          '🔗 Verification Started',
          'Your property is being verified on the blockchain. This may take a few moments.',
          [{ text: 'OK', onPress: () => {
            setParcelNumber('');
            setOwnerName('');
            // Refresh data after a delay
            setTimeout(loadUserData, 3000);
          }}]
        );
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else if (result.isDuplicate) {
        Alert.alert(
          '⚠️ Duplicate Property',
          result.error || 'This property is already registered.',
          [{ text: 'OK' }]
        );
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      } else {
        Alert.alert(
          '❌ Verification Failed',
          result.error || 'Failed to verify property.',
          [{ text: 'OK' }]
        );
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } catch (error) {
      console.error('Error verifying parcel:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return '#10B981';
      case 'pending': return '#F59E0B';
      case 'rejected': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified': return CheckCircle;
      case 'pending': return Clock;
      case 'rejected': return AlertTriangle;
      default: return Hash;
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.title}>Blockchain Verification</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Info Section */}
        <View style={styles.section}>
          <View style={styles.infoCard}>
            <Shield size={32} color="#3B82F6" />
            <Text style={styles.infoTitle}>Property NFT Registration</Text>
            <Text style={styles.infoText}>
              Register your property on the blockchain to become a verified landlord. 
              Each property becomes a unique NFT that proves ownership.
            </Text>
          </View>
        </View>

        {/* Verification Form */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Register New Property</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Property Parcel Number</Text>
            <TextInput
              style={styles.textInput}
              value={parcelNumber}
              onChangeText={setParcelNumber}
              placeholder="e.g., ABC/123/456 or ABC123456"
              placeholderTextColor="#9CA3AF"
              autoCapitalize="characters"
            />
            <Text style={styles.inputHint}>
              Enter the official parcel number from your title deed
            </Text>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Property Owner Name</Text>
            <TextInput
              style={styles.textInput}
              value={ownerName}
              onChangeText={setOwnerName}
              placeholder="Full name as on title deed"
              placeholderTextColor="#9CA3AF"
              autoCapitalize="words"
            />
            <Text style={styles.inputHint}>
              Must match the name on official property documents
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.verifyButton, isVerifying && styles.verifyButtonDisabled]}
            onPress={handleVerifyParcel}
            disabled={isVerifying}
          >
            {isVerifying ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Coins size={20} color="#FFFFFF" />
            )}
            <Text style={styles.verifyButtonText}>
              {isVerifying ? 'Creating NFT...' : 'Mint Property NFT'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* User's NFTs */}
        {userNFTs.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Property NFTs ({userNFTs.length})</Text>
            {userNFTs.map((nft) => (
              <View key={nft.id} style={styles.nftCard}>
                <View style={styles.nftHeader}>
                  <View style={styles.nftInfo}>
                    <Text style={styles.nftParcel}>{nft.parcelNumber}</Text>
                    <Text style={styles.nftOwner}>{nft.ownerName}</Text>
                  </View>
                  <View style={styles.verifiedBadge}>
                    <CheckCircle size={16} color="#10B981" />
                    <Text style={styles.verifiedText}>Verified</Text>
                  </View>
                </View>

                <View style={styles.nftDetails}>
                  <View style={styles.nftDetail}>
                    <MapPin size={14} color="#6B7280" />
                    <Text style={styles.nftDetailText}>{nft.metadata.location}</Text>
                  </View>
                  <View style={styles.nftDetail}>
                    <FileText size={14} color="#6B7280" />
                    <Text style={styles.nftDetailText}>{nft.metadata.size}</Text>
                  </View>
                </View>

                <View style={styles.nftFooter}>
                  <Text style={styles.nftTokenId}>Token ID: {nft.tokenId}</Text>
                  <TouchableOpacity style={styles.viewButton}>
                    <Link size={12} color="#3B82F6" />
                    <Text style={styles.viewButtonText}>View on Blockchain</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Verification History */}
        {verifications.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Verification History</Text>
            {verifications.map((verification) => {
              const StatusIcon = getStatusIcon(verification.status);
              return (
                <View key={verification.id} style={styles.verificationCard}>
                  <View style={styles.verificationHeader}>
                    <StatusIcon size={20} color={getStatusColor(verification.status)} />
                    <View style={styles.verificationInfo}>
                      <Text style={styles.verificationParcel}>{verification.parcelNumber}</Text>
                      <Text style={styles.verificationDate}>
                        {new Date(verification.submittedAt).toLocaleDateString()}
                      </Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(verification.status) + '20' }]}>
                      <Text style={[styles.statusText, { color: getStatusColor(verification.status) }]}>
                        {verification.status.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                  
                  {verification.rejectionReason && (
                    <Text style={styles.rejectionReason}>{verification.rejectionReason}</Text>
                  )}
                </View>
              );
            })}
          </View>
        )}

        {/* How it Works */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How It Works</Text>
          <View style={styles.stepsContainer}>
            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Enter Parcel Number</Text>
                <Text style={styles.stepDescription}>
                  Provide your official property parcel number from title deed
                </Text>
              </View>
            </View>

            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Blockchain Verification</Text>
                <Text style={styles.stepDescription}>
                  System checks government land registry and creates unique NFT
                </Text>
              </View>
            </View>

            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>3</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Become Verified Landlord</Text>
                <Text style={styles.stepDescription}>
                  NFT ownership proves legitimacy and prevents impersonation
                </Text>
              </View>
            </View>
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
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#111827',
    marginBottom: 16,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#111827',
    marginTop: 12,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#111827',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#111827',
  },
  inputHint: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  verifyButton: {
    backgroundColor: '#3B82F6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  verifyButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  verifyButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  nftCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  nftHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  nftInfo: {
    flex: 1,
  },
  nftParcel: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#111827',
    marginBottom: 4,
  },
  nftOwner: {
    fontSize: 14,
    color: '#6B7280',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  verifiedText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#10B981',
  },
  nftDetails: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  nftDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  nftDetailText: {
    fontSize: 12,
    color: '#6B7280',
  },
  nftFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nftTokenId: {
    fontSize: 12,
    color: '#9CA3AF',
    fontFamily: 'monospace',
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewButtonText: {
    fontSize: 12,
    color: '#3B82F6',
    fontWeight: '600' as const,
  },
  verificationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  verificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  verificationInfo: {
    flex: 1,
  },
  verificationParcel: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#111827',
  },
  verificationDate: {
    fontSize: 12,
    color: '#6B7280',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  rejectionReason: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 8,
    fontStyle: 'italic',
  },
  stepsContainer: {
    gap: 20,
  },
  step: {
    flexDirection: 'row',
    gap: 16,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumberText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#111827',
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
});