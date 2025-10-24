import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Home, Users, RefreshCw, Star, DollarSign, Phone, Shield, Clock, CheckCircle } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import { MOCK_PROPERTIES } from '@/mocks/properties';
import { MOCK_PAYMENT_SETTINGS, MOCK_PAYMENTS } from '@/mocks/payments';
import type { Property, Payment } from '@/types';

export default function PostScreen() {
  const insets = useSafeAreaInsets();
  const { isLandlord, isTenant } = useApp();

  // Tenant Payment state
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>(MOCK_PROPERTIES[0]?.id ?? '');
  const [mpesaPhone, setMpesaPhone] = useState<string>('0712345678');
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastPayment, setLastPayment] = useState<Payment | null>(null);

  const selectedProperty: Property | undefined = useMemo(
    () => MOCK_PROPERTIES.find(p => p.id === selectedPropertyId),
    [selectedPropertyId]
  );

  const paymentSettings = useMemo(() => {
    if (!selectedProperty) return undefined;
    return (
      MOCK_PAYMENT_SETTINGS.find(s => s.propertyId === selectedProperty.id) ||
      MOCK_PAYMENT_SETTINGS.find(s => s.landlordId === selectedProperty.landlord.id)
    );
  }, [selectedProperty]);

  const amountDue = useMemo(() => {
    if (!selectedProperty) return 0;
    const base = selectedProperty.price;
    const service = selectedProperty.serviceCharge || 0;
    return base + service;
  }, [selectedProperty]);

  useEffect(() => {
    // Preload a previous payment for this property if available (mock)
    if (!selectedProperty) return;
    const existing = MOCK_PAYMENTS.find(p => p.propertyId === selectedProperty.id);
    setLastPayment(existing || null);
  }, [selectedProperty]);

  const formatCurrency = (amount: number) => `KES ${amount.toLocaleString()}`;

  const initiateMpesaPayment = useCallback(async () => {
    if (!selectedProperty || !paymentSettings) {
      Alert.alert('Unavailable', 'Missing payment settings for this property.');
      return;
    }
    if (!/^0\d{9}$/.test(mpesaPhone)) {
      Alert.alert('Invalid Number', 'Enter a valid Kenyan phone number e.g. 0712345678');
      return;
    }
    try {
      setIsProcessing(true);
      // Simulate STK push delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      const ref = `MPESA-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
      const payment: Payment = {
        id: `pmt_${Date.now()}`,
        propertyId: selectedProperty.id,
        tenantId: 'tenant_1',
        landlordId: selectedProperty.landlord.id,
        amount: amountDue,
        type: 'rent',
        status: 'completed',
        dueDate: new Date(new Date().getFullYear(), new Date().getMonth(), paymentSettings.dueDay).toISOString(),
        paidDate: new Date().toISOString(),
        method: 'mpesa',
        reference: ref,
      };
      setLastPayment(payment);
      Alert.alert('Payment Successful', `Reference: ${ref}`);
    } catch (e) {
      Alert.alert('Payment Failed', 'Please try again.');
    } finally {
      setIsProcessing(false);
    }
  }, [selectedProperty, paymentSettings, mpesaPhone, amountDue]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {isTenant ? (
        <View style={styles.header}>
          <Text style={styles.title}>Pay Rent</Text>
          <Text style={styles.subtitle}>Secure M-Pesa payments synced with landlord details</Text>
        </View>
      ) : (
        <View style={styles.header}>
          <Text style={styles.title}>Post</Text>
          <Text style={styles.subtitle}>
            {isLandlord ? 'List your properties' : 'Create posts & find roommates'}
          </Text>
        </View>
      )}

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {isLandlord && (
          <>
            <TouchableOpacity style={styles.actionCard}>
              <View style={styles.iconContainer}>
                <Home size={32} color="#3B82F6" />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>List Property</Text>
                <Text style={styles.cardDescription}>
                  Add a new rental property with photos, details, and pricing
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard}>
              <View style={styles.iconContainer}>
                <Star size={32} color="#F59E0B" />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>Boost Listing</Text>
                <Text style={styles.cardDescription}>
                  Promote your property for better visibility
                </Text>
              </View>
            </TouchableOpacity>

            <View style={styles.statsCard}>
              <Text style={styles.statsTitle}>Your Listings</Text>
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>0</Text>
                  <Text style={styles.statLabel}>Active</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>0</Text>
                  <Text style={styles.statLabel}>Drafts</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>0</Text>
                  <Text style={styles.statLabel}>Total Views</Text>
                </View>
              </View>
            </View>
          </>
        )}

        {isTenant && selectedProperty && (
          <>
            <View style={styles.payCard}>
              <View style={styles.payHeader}>
                <DollarSign size={20} color="#10B981" />
                <Text style={styles.payHeaderText}>This Month&apos;s Rent</Text>
              </View>
              <Text style={styles.payAmount}>{formatCurrency(amountDue)}</Text>
              <View style={styles.payMetaRow}>
                <Clock size={16} color="#6B7280" />
                <Text style={styles.payMetaText}>
                  Due on {paymentSettings ? `${paymentSettings.dueDay}` : '--'}
                </Text>
              </View>

              <View style={styles.selector}>
                <Text style={styles.selectorLabel}>Property</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                  {MOCK_PROPERTIES.map(p => (
                    <TouchableOpacity
                      key={p.id}
                      style={[styles.propertyChip, selectedPropertyId === p.id && styles.propertyChipActive]}
                      onPress={() => setSelectedPropertyId(p.id)}
                    >
                      <Text style={[styles.propertyChipText, selectedPropertyId === p.id && styles.propertyChipTextActive]}>
                        {p.title}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {paymentSettings ? (
                <View style={styles.settingsCard}>
                  <View style={styles.settingsRow}>
                    <Shield size={18} color="#3B82F6" />
                    <Text style={styles.settingsTitle}>Landlord Payment Details</Text>
                  </View>
                  <View style={styles.settingsGrid}>
                    <View style={styles.settingsItem}>
                      <Text style={styles.settingsLabel}>Paybill / Till</Text>
                      <Text style={styles.settingsValue}>{paymentSettings.mpesaNumber}</Text>
                    </View>
                    <View style={styles.settingsItem}>
                      <Text style={styles.settingsLabel}>Account</Text>
                      <Text style={styles.settingsValue}>{paymentSettings.accountNumber}</Text>
                    </View>
                    <View style={styles.settingsItem}>
                      <Text style={styles.settingsLabel}>Account Name</Text>
                      <Text style={styles.settingsValue}>{paymentSettings.accountName}</Text>
                    </View>
                    {paymentSettings.bankName && (
                      <View style={styles.settingsItem}>
                        <Text style={styles.settingsLabel}>Bank</Text>
                        <Text style={styles.settingsValue}>{paymentSettings.bankName}</Text>
                      </View>
                    )}
                  </View>
                </View>
              ) : (
                <View style={styles.settingsCard}>
                  <Text style={styles.settingsTitle}>No payment settings found for this property.</Text>
                </View>
              )}

              <View style={styles.inputRow}>
                <View style={styles.inputIcon}><Phone size={18} color="#6B7280" /></View>
                <TextInput
                  style={styles.input}
                  keyboardType="phone-pad"
                  value={mpesaPhone}
                  onChangeText={setMpesaPhone}
                  placeholder="M-Pesa phone number"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <TouchableOpacity
                style={[styles.payButton, isProcessing && styles.payButtonDisabled]}
                onPress={initiateMpesaPayment}
                disabled={isProcessing}
              >
                <Text style={styles.payButtonText}>{isProcessing ? 'Processing…' : 'Pay with M-Pesa'}</Text>
              </TouchableOpacity>

              {lastPayment && (
                <View style={styles.lastPayment}>
                  <CheckCircle size={18} color="#10B981" />
                  <Text style={styles.lastPaymentText}>
                    Last payment {formatCurrency(lastPayment.amount)} • Ref {lastPayment.reference}
                  </Text>
                </View>
              )}
            </View>
          </>
        )}

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>💡 Pro Tip</Text>
          <Text style={styles.infoText}>
            {isLandlord && !isTenant
              ? 'Properties with at least 5 photos and detailed descriptions get 3x more inquiries!'
              : 'Pay early to avoid late fees and ensure uninterrupted tenancy.'}
          </Text>
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
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: '#6B7280',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  payCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 16,
    gap: 12,
  },
  payHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  payHeaderText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  payAmount: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
  },
  payMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  payMetaText: {
    fontSize: 13,
    color: '#6B7280',
  },
  actionCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 16,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#111827',
    marginBottom: 6,
  },
  cardDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  selector: {
    gap: 8,
  },
  selectorLabel: {
    fontSize: 13,
    color: '#6B7280',
  },
  propertyChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  propertyChipActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },
  propertyChipText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '600',
  },
  propertyChipTextActive: {
    color: '#1D4ED8',
  },
  settingsCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 12,
    gap: 8,
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  settingsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  settingsItem: {
    minWidth: '45%',
  },
  settingsLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  settingsValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  inputIcon: {
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    fontSize: 16,
    color: '#111827',
  },
  payButton: {
    backgroundColor: '#10B981',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  payButtonDisabled: {
    backgroundColor: '#6EE7B7',
  },
  payButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  lastPayment: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#DCFCE7',
    padding: 10,
    borderRadius: 8,
  },
  lastPaymentText: {
    fontSize: 12,
    color: '#14532D',
    fontWeight: '600',
  },
  statsCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#111827',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 32,
    fontWeight: '800' as const,
    color: '#3B82F6',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: '#6B7280',
  },
  infoCard: {
    backgroundColor: '#EFF6FF',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#1E40AF',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#1E40AF',
    lineHeight: 20,
  },
});
