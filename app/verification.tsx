import React, { useState } from 'react';
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
import { 
  ArrowLeft, 
  Shield, 
  CheckCircle,
  AlertTriangle,
  User,
  Home,
  Building
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useApp } from '@/contexts/AppContext';
import type { VerificationLevel } from '@/types';

const VERIFICATION_LEVELS = [
  {
    level: 'basic' as VerificationLevel,
    title: 'Basic Verification',
    description: 'Verify your identity to post up to 2 properties',
    icon: User,
    color: '#3B82F6',
    benefits: [
      'Post up to 2 property listings',
      'Basic analytics access',
      'Manual approval required',
    ],
    requirements: [
      'Government-issued ID',
      'Proof of address (utility bill)',
    ],
  },
  {
    level: 'property' as VerificationLevel,
    title: 'Property Verification',
    description: 'Verify property ownership for full landlord access',
    icon: Home,
    color: '#10B981',
    benefits: [
      'Post up to 50 properties',
      'Access tenant data',
      'Collect payments',
      'No manual approval needed',
    ],
    requirements: [
      'All basic verification documents',
      'Property title deed or lease agreement',
    ],
  },
  {
    level: 'premium' as VerificationLevel,
    title: 'Premium Verification',
    description: 'Complete business verification for advanced features',
    icon: Building,
    color: '#8B5CF6',
    benefits: [
      'Post up to 500 properties',
      'Bulk operations',
      'Advanced analytics',
      'Priority support',
    ],
    requirements: [
      'All property verification documents',
      'Business registration certificate',
      'Enhanced background check',
    ],
  },
];

export default function VerificationScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { verificationLevel, updateVerificationLevel } = useApp();
  // Removed unused state

  const handleStartVerification = async (level: VerificationLevel) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    Alert.alert(
      '🚀 Start Verification',
      `Ready to start ${level} verification? You'll need to upload the required documents.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Continue', 
          style: 'default',
          onPress: () => {
            // In production, this would navigate to document upload flow
            Alert.alert(
              '📋 Document Upload',
              'Document upload feature coming soon! For now, verification will be simulated.',
              [
                { text: 'OK', style: 'default' },
                {
                  text: 'Simulate Verification',
                  style: 'default',
                  onPress: () => simulateVerification(level),
                },
              ]
            );
          }
        }
      ]
    );
  };

  const simulateVerification = async (level: VerificationLevel) => {
    // Simulate verification process
    await updateVerificationLevel('pending');
    
    setTimeout(async () => {
      await updateVerificationLevel(level);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      Alert.alert(
        '✅ Verification Complete!',
        `Your ${level} verification has been approved. You can now access landlord features.`,
        [
          { 
            text: 'Great!', 
            style: 'default',
            onPress: () => router.back()
          }
        ]
      );
    }, 3000);
  };

  const getCurrentLevelInfo = () => {
    return VERIFICATION_LEVELS.find(level => level.level === verificationLevel);
  };

  const currentLevel = getCurrentLevelInfo();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.title}>Identity Verification</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Current Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current Status</Text>
          <View style={[styles.statusCard, currentLevel ? { borderColor: currentLevel.color } : {}]}>
            <View style={styles.statusHeader}>
              {currentLevel ? (
                <currentLevel.icon size={24} color={currentLevel.color} />
              ) : (
                <AlertTriangle size={24} color="#EF4444" />
              )}
              <Text style={styles.statusTitle}>
                {currentLevel ? currentLevel.title : 'Unverified'}
              </Text>
            </View>
            <Text style={styles.statusDescription}>
              {currentLevel 
                ? `You have ${currentLevel.title.toLowerCase()} status`
                : 'Complete verification to access landlord features'
              }
            </Text>
          </View>
        </View>

        {/* Verification Levels */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Choose Verification Level</Text>
          <Text style={styles.sectionSubtitle}>
            Select the verification level that matches your needs
          </Text>
          
          {VERIFICATION_LEVELS.map((level) => {
            const isCompleted = verificationLevel === 'premium' || 
              (verificationLevel === 'property' && level.level === 'basic') ||
              (verificationLevel === 'basic' && level.level === 'basic');
            
            return (
              <View key={level.level} style={styles.levelCard}>
                <View style={styles.levelHeader}>
                  <View style={styles.levelTitleRow}>
                    <level.icon size={24} color={level.color} />
                    <Text style={styles.levelTitle}>{level.title}</Text>
                    {isCompleted && (
                      <CheckCircle size={20} color="#10B981" />
                    )}
                  </View>
                  <Text style={styles.levelDescription}>{level.description}</Text>
                </View>

                <View style={styles.levelBenefits}>
                  <Text style={styles.benefitsTitle}>Benefits:</Text>
                  {level.benefits.map((benefit, index) => (
                    <Text key={index} style={styles.benefitItem}>
                      • {benefit}
                    </Text>
                  ))}
                </View>

                <View style={styles.levelRequirements}>
                  <Text style={styles.requirementsTitle}>Requirements:</Text>
                  {level.requirements.map((requirement, index) => (
                    <Text key={index} style={styles.requirementItem}>
                      📄 {requirement}
                    </Text>
                  ))}
                </View>

                <TouchableOpacity
                  style={[
                    styles.levelButton,
                    { backgroundColor: level.color },
                    isCompleted && styles.levelButtonCompleted,
                  ]}
                  onPress={() => handleStartVerification(level.level)}
                  disabled={isCompleted}
                >
                  <Text style={styles.levelButtonText}>
                    {isCompleted ? 'Completed' : `Start ${level.title}`}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>

        {/* Security Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Why Verification?</Text>
          <View style={styles.infoCard}>
            <Shield size={32} color="#3B82F6" />
            <Text style={styles.infoTitle}>Protecting Our Community</Text>
            <Text style={styles.infoText}>
              Verification helps us ensure that landlords are legitimate property owners, 
              protecting tenants from fraud and creating a safer rental marketplace.
            </Text>
            <View style={styles.infoFeatures}>
              <Text style={styles.infoFeature}>🔒 Secure document processing</Text>
              <Text style={styles.infoFeature}>🤖 AI-powered fraud detection</Text>
              <Text style={styles.infoFeature}>👥 Manual review by experts</Text>
              <Text style={styles.infoFeature}>🏆 Trusted landlord badges</Text>
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
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
    lineHeight: 20,
  },
  statusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#111827',
  },
  statusDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  levelCard: {
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
  levelHeader: {
    marginBottom: 16,
  },
  levelTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  levelTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#111827',
  },
  levelDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  levelBenefits: {
    marginBottom: 16,
  },
  benefitsTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#111827',
    marginBottom: 8,
  },
  benefitItem: {
    fontSize: 13,
    color: '#10B981',
    marginBottom: 4,
  },
  levelRequirements: {
    marginBottom: 20,
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#111827',
    marginBottom: 8,
  },
  requirementItem: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 4,
  },
  levelButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  levelButtonCompleted: {
    backgroundColor: '#10B981',
  },
  levelButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
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
    marginBottom: 16,
  },
  infoFeatures: {
    alignSelf: 'stretch',
  },
  infoFeature: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 8,
    textAlign: 'center',
  },
});