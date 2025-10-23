import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
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
import { useApp } from '@/contexts/AppContext';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { userRole, switchRole, savedProperties, isLandlord, isTenant } = useApp();

  const handleRoleSwitch = async () => {
    const newRole = userRole === 'tenant' ? 'landlord' : 'tenant';
    await switchRole(newRole);
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
            </View>
            <View style={styles.stats}>
              <Text style={styles.stat}>{savedProperties.length} saved</Text>
              <Text style={styles.statDivider}>•</Text>
              <Text style={styles.stat}>0 reviews</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity onPress={handleRoleSwitch} style={styles.switchButton}>
          {userRole === 'tenant' ? (
            <Building2 size={20} color="#3B82F6" />
          ) : (
            <Home size={20} color="#3B82F6" />
          )}
          <Text style={styles.switchButtonText}>
            Switch to {userRole === 'tenant' ? 'Landlord' : 'Tenant'}
          </Text>
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

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIcon}>
              <User size={22} color="#3B82F6" />
            </View>
            <Text style={styles.menuText}>Edit Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
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
    gap: 8,
    backgroundColor: '#EFF6FF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  switchButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#3B82F6',
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
