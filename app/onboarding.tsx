import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Home, Building2, Users } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import type { UserRole } from '@/types';

export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { switchRole, completeOnboarding } = useApp();
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

  const handleContinue = async () => {
    if (selectedRole) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await switchRole(selectedRole);
      await completeOnboarding();
      router.replace('/(tabs)');
    }
  };

  const roles = [
    {
      value: 'tenant' as UserRole,
      title: 'Tenant',
      description: 'I am looking for a place to rent',
      icon: Home,
      color: '#3B82F6',
    },
    {
      value: 'landlord' as UserRole,
      title: 'Landlord',
      description: 'I have properties to rent out',
      icon: Building2,
      color: '#10B981',
    },
    {
      value: 'both' as UserRole,
      title: 'Both',
      description: 'I am both a tenant and landlord',
      icon: Users,
      color: '#8B5CF6',
    },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.logo}>🏠 Dwello</Text>
          <Text style={styles.title}>Welcome!</Text>
          <Text style={styles.subtitle}>Let&apos;s get started. What brings you here?</Text>
        </View>

        <View style={styles.rolesContainer}>
          {roles.map((role) => {
            const Icon = role.icon;
            const isSelected = selectedRole === role.value;
            
            return (
              <TouchableOpacity
                key={role.value}
                style={[
                  styles.roleCard,
                  isSelected && {
                    borderColor: role.color,
                    borderWidth: 3,
                    backgroundColor: `${role.color}10`,
                  },
                ]}
                onPress={() => {
                  Haptics.selectionAsync();
                  setSelectedRole(role.value);
                }}
                activeOpacity={0.7}
              >
                <View style={[styles.iconContainer, { backgroundColor: role.color }]}>
                  <Icon size={32} color="#FFFFFF" />
                </View>
                <View style={styles.roleInfo}>
                  <Text style={styles.roleTitle}>{role.title}</Text>
                  <Text style={styles.roleDescription}>{role.description}</Text>
                </View>
                {isSelected && (
                  <View style={[styles.checkmark, { backgroundColor: role.color }]}>
                    <Text style={styles.checkmarkText}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.note}>
          💡 You can change this later in your profile settings
        </Text>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            !selectedRole && styles.continueButtonDisabled,
          ]}
          onPress={handleContinue}
          disabled={!selectedRole}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    fontSize: 48,
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '800' as const,
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  rolesContainer: {
    gap: 16,
  },
  roleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    gap: 16,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  roleInfo: {
    flex: 1,
  },
  roleTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#111827',
    marginBottom: 4,
  },
  roleDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  checkmark: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700' as const,
  },
  note: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 24,
  },
  footer: {
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  continueButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  continueButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700' as const,
  },
});
