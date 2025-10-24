import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  User,
  Heart,
  MessageCircle,
  Calendar,
  CreditCard,
  FileText,
  Settings,
  HelpCircle,
  LogOut,
  Home,
  Building2,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useApp } from '@/contexts/AppContext';
import { useRouter } from 'expo-router';
import { SecurityService } from '@/services/SecurityService';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { userRole, switchRole, savedProperties, isLandlord, isTenant, verificationLevel, canAccessFeature } = useApp();
  const [isSwitchingRole, setIsSwitchingRole] = React.useState(false);

  const getVerificationLabel = (level: string) => {
    switch (level) {
      case 'unverified': return '❌ Unverified';
      case 'pending': return '⏳ Pending';
      case 'basic': return '✅ Basic';
      case 'property': return '🏠 Verified';
      case 'premium': return '⭐ Premium';
      default: return '❌ Unverified';
    }
  };

  const getVerificationBadgeStyle = (level: string) => {
    switch (level) {
      case 'unverified': return styles.unverifiedBadge;
      case 'pending': return styles.pendingBadge;
      case 'basic': return styles.basicBadge;
      case 'property': return styles.verifiedBadge;
      case 'premium': return styles.premiumBadge;
      default: return styles.unverifiedBadge;
    }
  };

  const getVerificationTextStyle = (level: string) => {
    switch (level) {
      case 'unverified': return styles.unverifiedText;
      case 'pending': return styles.pendingText;
      case 'basic': return styles.basicText;
      case 'property': return styles.verifiedText;
      case 'premium': return styles.premiumText;
      default: return styles.unverifiedText;
    }
  };

  const handleRoleSwitch = async () => {
    if (isSwitchingRole) return; // Prevent multiple taps
    
    try {
      setIsSwitchingRole(true);
      
      // Provide haptic feedback
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      const newRole = userRole === 'tenant' ? 'landlord' : 'tenant';
      const result = await switchRole(newRole);
      
      if (!result.success) {
        // Log security event
        await SecurityService.logSecurityEvent(
          'demo_user', // In production, use actual user ID
          'role_switch_attempt',
          'medium',
          `Failed role switch attempt: ${result.error}`,
          { 
            attemptedRole: newRole,
            currentRole: userRole,
            verificationLevel,
            requiresVerification: result.requiresVerification 
          }
        );
        
        // Show verification required alert
        Alert.alert(
          '🔒 Verification Required',
          result.error || 'You need to verify your identity to become a landlord.',
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Start Verification', 
              style: 'default',
              onPress: () => router.push('/verification')
            }
          ]
        );
        
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        return;
      }
      
      // Log successful role switch
      await SecurityService.logSecurityEvent(
        'demo_user',
        'role_switch_attempt',
        'low',
        `Successful role switch to ${newRole}`,
        { 
          newRole,
          previousRole: userRole,
          verificationLevel 
        }
      );
      
      // Small delay to let the context update
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Navigate to appropriate page based on new role
      router.replace('/(tabs)');
      
      // Success haptic feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Error switching role:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsSwitchingRole(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <User size={40} color="#FFFFFF" />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.name}>Demo User</Text>
            <View style={styles.roleRow}>
              <View style={styles.roleBadge}>
                <Text style={styles.roleText}>
                  {userRole === 'tenant' ? '🏠 Tenant' : userRole === 'landlord' ? '🏢 Landlord' : '👥 Both'}
                </Text>
              </View>
              {(userRole === 'landlord' || userRole === 'both') && (
                <View style={[styles.verificationBadge, getVerificationBadgeStyle(verificationLevel)]}>
                  <Text style={[styles.verificationText, getVerificationTextStyle(verificationLevel)]}>
                    {getVerificationLabel(verificationLevel)}
                  </Text>
                </View>
              )}
            </View>
            <View style={styles.stats}>
              <Text style={styles.stat}>{savedProperties.length} saved</Text>
              <Text style={styles.statDivider}>•</Text>
              <Text style={styles.stat}>0 reviews</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity 
          onPress={handleRoleSwitch} 
          style={[styles.switchButton, isSwitchingRole && styles.switchButtonDisabled]}
          disabled={isSwitchingRole}
        >
          {isSwitchingRole ? (
            <ActivityIndicator size="small" color="#3B82F6" />
          ) : userRole === 'tenant' ? (
            <Building2 size={20} color="#3B82F6" />
          ) : (
            <Home size={20} color="#3B82F6" />
          )}
          <View style={styles.switchButtonContent}>
            <Text style={[styles.switchButtonText, isSwitchingRole && styles.switchButtonTextDisabled]}>
              {isSwitchingRole 
                ? 'Switching...' 
                : `Switch to ${userRole === 'tenant' ? 'Landlord' : 'Tenant'}`
              }
            </Text>
            {!isSwitchingRole && (
              <Text style={[styles.switchButtonSubtext, isSwitchingRole && styles.switchButtonTextDisabled]}>
                {userRole === 'tenant' ? 'Go to Dashboard' : 'Go to Home'}
              </Text>
            )}
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {isTenant && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>My Housing</Text>
            <TouchableOpacity style={styles.menuItem}>
              <View style={styles.menuIcon}>
                <Home size={22} color="#3B82F6" />
              </View>
              <Text style={styles.menuText}>Current Residence</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem}>
              <View style={styles.menuIcon}>
                <Heart size={22} color="#EF4444" />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuText}>Saved Properties</Text>
                {savedProperties.length > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{savedProperties.length}</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem}>
              <View style={styles.menuIcon}>
                <Calendar size={22} color="#10B981" />
              </View>
              <Text style={styles.menuText}>Viewing Schedule</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem}>
              <View style={styles.menuIcon}>
                <FileText size={22} color="#F59E0B" />
              </View>
              <Text style={styles.menuText}>Rental History</Text>
            </TouchableOpacity>
          </View>
        )}

        {isLandlord && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>My Properties</Text>
            <TouchableOpacity style={styles.menuItem}>
              <View style={styles.menuIcon}>
                <Building2 size={22} color="#3B82F6" />
              </View>
              <Text style={styles.menuText}>Active Listings</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>0</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem}>
              <View style={styles.menuIcon}>
                <FileText size={22} color="#6B7280" />
              </View>
              <Text style={styles.menuText}>Drafts</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem}>
              <View style={styles.menuIcon}>
                <MessageCircle size={22} color="#10B981" />
              </View>
              <Text style={styles.menuText}>Inquiries</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payments</Text>
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIcon}>
              <CreditCard size={22} color="#3B82F6" />
            </View>
            <Text style={styles.menuText}>Payment Methods</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIcon}>
              <FileText size={22} color="#6B7280" />
            </View>
            <Text style={styles.menuText}>Transaction History</Text>
          </TouchableOpacity>
        </View>

        {(userRole === 'landlord' || userRole === 'both') && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Verification & Security</Text>
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => router.push('/verification')}
            >
              <View style={styles.menuIcon}>
                <User size={22} color="#3B82F6" />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuText}>Identity Verification</Text>
                <View style={[styles.badge, getVerificationBadgeStyle(verificationLevel)]}>
                  <Text style={[styles.badgeText, getVerificationTextStyle(verificationLevel)]}>
                    {verificationLevel.toUpperCase()}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
            {verificationLevel === 'unverified' && (
              <TouchableOpacity 
                style={[styles.menuItem, styles.warningItem]}
                onPress={() => router.push('/verification')}
              >
                <View style={[styles.menuIcon, styles.warningIcon]}>
                  <Settings size={22} color="#F59E0B" />
                </View>
                <Text style={[styles.menuText, styles.warningText]}>
                  Complete verification to access landlord features
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIcon}>
              <User size={22} color="#3B82F6" />
            </View>
            <Text style={styles.menuText}>Edit Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => router.push('/documents')}
          >
            <View style={styles.menuIcon}>
              <FileText size={22} color="#6B7280" />
            </View>
            <Text style={styles.menuText}>Documents</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIcon}>
              <Settings size={22} color="#6B7280" />
            </View>
            <Text style={styles.menuText}>Settings</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIcon}>
              <HelpCircle size={22} color="#3B82F6" />
            </View>
            <Text style={styles.menuText}>Help & Support</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIcon}>
              <FileText size={22} color="#6B7280" />
            </View>
            <Text style={styles.menuText}>Terms of Service</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <TouchableOpacity style={[styles.menuItem, styles.logoutItem]}>
            <View style={[styles.menuIcon, styles.logoutIcon]}>
              <LogOut size={22} color="#EF4444" />
            </View>
            <Text style={[styles.menuText, styles.logoutText]}>Log Out</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.versionInfo}>
          <Text style={styles.versionText}>Dwello v2.0.0</Text>
          <Text style={styles.versionSubtext}>Made with ❤️ for modern renters</Text>
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
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: '#111827',
    marginBottom: 6,
  },
  roleRow: {
    marginBottom: 8,
  },
  roleBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  roleText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#3B82F6',
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stat: {
    fontSize: 14,
    color: '#6B7280',
  },
  statDivider: {
    fontSize: 14,
    color: '#D1D5DB',
  },
  switchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: '#EFF6FF',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  switchButtonContent: {
    alignItems: 'center',
  },
  switchButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#3B82F6',
  },
  switchButtonDisabled: {
    backgroundColor: '#F3F4F6',
    opacity: 0.7,
  },
  switchButtonTextDisabled: {
    color: '#9CA3AF',
  },
  switchButtonSubtext: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  verificationBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: 8,
  },
  verificationText: {
    fontSize: 11,
    fontWeight: '600' as const,
  },
  unverifiedBadge: {
    backgroundColor: '#FEE2E2',
  },
  unverifiedText: {
    color: '#EF4444',
  },
  pendingBadge: {
    backgroundColor: '#FEF3C7',
  },
  pendingText: {
    color: '#F59E0B',
  },
  basicBadge: {
    backgroundColor: '#DBEAFE',
  },
  basicText: {
    color: '#3B82F6',
  },
  verifiedBadge: {
    backgroundColor: '#D1FAE5',
  },
  verifiedText: {
    color: '#10B981',
  },
  premiumBadge: {
    backgroundColor: '#F3E8FF',
  },
  premiumText: {
    color: '#8B5CF6',
  },
  warningItem: {
    borderWidth: 1,
    borderColor: '#FED7AA',
    backgroundColor: '#FFFBEB',
  },
  warningIcon: {
    backgroundColor: '#FED7AA',
  },
  warningText: {
    color: '#F59E0B',
    fontWeight: '600' as const,
  },
  content: {
    flex: 1,
  },
  section: {
    paddingTop: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#111827',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    gap: 12,
  },
  menuIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500' as const,
    color: '#374151',
  },
  badge: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    minWidth: 24,
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  logoutItem: {
    borderWidth: 1,
    borderColor: '#FEE2E2',
    backgroundColor: '#FEF2F2',
  },
  logoutIcon: {
    backgroundColor: '#FEE2E2',
  },
  logoutText: {
    color: '#EF4444',
    fontWeight: '600' as const,
  },
  versionInfo: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  versionText: {
    fontSize: 13,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  versionSubtext: {
    fontSize: 12,
    color: '#D1D5DB',
  },
});
