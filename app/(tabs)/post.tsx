import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { 
  Home, 
  Users, 
  RefreshCw, 
  Star, 
  DollarSign, 
  CreditCard, 
  Smartphone, 
  Building, 
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  X
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useApp } from '@/contexts/AppContext';

// Mock payment settings from landlord
const MOCK_PAYMENT_SETTINGS = {
  propertyId: '1',
  landlordId: '1',
  accountName: 'John Kamau',
  accountNumber: '254712345678',
  bankName: 'Equity Bank',
  mpesaNumber: '254712345678',
  dueDay: 5,
  lateFee: 1000,
  gracePeriodDays: 3,
};

// Mock payment history
const MOCK_PAYMENT_HISTORY = [
  {
    id: '1',
    amount: 35000,
    type: 'rent',
    status: 'completed',
    dueDate: '2024-01-05',
    paidDate: '2024-01-03',
    method: 'mpesa',
    reference: 'RKJ8H3M2QP',
  },
  {
    id: '2',
    amount: 35000,
    type: 'rent',
    status: 'pending',
    dueDate: '2024-02-05',
    method: undefined,
    reference: undefined,
  },
  {
    id: '3',
    amount: 2000,
    type: 'service_charge',
    status: 'overdue',
    dueDate: '2024-01-05',
    method: undefined,
    reference: undefined,
  },
];

export default function PostScreen() {
  const insets = useSafeAreaInsets();
  const { isLandlord, isTenant } = useApp();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState<'mpesa' | 'card' | 'bank_transfer'>('mpesa');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePaymentPress = useCallback((payment: any) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedPayment(payment);
    setShowPaymentModal(true);
  }, []);

  const handlePayment = useCallback(async () => {
    if (!phoneNumber.trim()) {
      Alert.alert('Error', 'Please enter your M-Pesa phone number');
      return;
    }

    setIsProcessing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      setShowPaymentModal(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        'Payment Initiated',
        `M-Pesa payment request sent to ${phoneNumber}. Please complete the transaction on your phone.`,
        [{ text: 'OK', style: 'default' }]
      );
      setPhoneNumber('');
      setSelectedPayment(null);
    }, 3000);
  }, [phoneNumber]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#10B981';
      case 'pending':
        return '#F59E0B';
      case 'overdue':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={20} color="#10B981" />;
      case 'pending':
        return <Clock size={20} color="#F59E0B" />;
      case 'overdue':
        return <AlertCircle size={20} color="#EF4444" />;
      default:
        return <Clock size={20} color="#6B7280" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const renderPaymentModal = () => (
    <Modal
      visible={showPaymentModal}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowPaymentModal(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Make Payment</Text>
          <TouchableOpacity
            onPress={() => setShowPaymentModal(false)}
            style={styles.closeButton}
          >
            <X size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          {selectedPayment && (
            <>
              <View style={styles.paymentSummary}>
                <Text style={styles.summaryTitle}>Payment Details</Text>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Amount:</Text>
                  <Text style={styles.summaryValue}>KES {selectedPayment.amount.toLocaleString()}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Type:</Text>
                  <Text style={styles.summaryValue}>{selectedPayment.type.replace('_', ' ').toUpperCase()}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Due Date:</Text>
                  <Text style={styles.summaryValue}>{formatDate(selectedPayment.dueDate)}</Text>
                </View>
              </View>

              <View style={styles.paymentMethods}>
                <Text style={styles.sectionTitle}>Payment Method</Text>
                
                <TouchableOpacity
                  style={[
                    styles.methodOption,
                    paymentMethod === 'mpesa' && styles.methodOptionActive
                  ]}
                  onPress={() => setPaymentMethod('mpesa')}
                >
                  <Smartphone size={24} color={paymentMethod === 'mpesa' ? '#10B981' : '#6B7280'} />
                  <View style={styles.methodInfo}>
                    <Text style={[
                      styles.methodTitle,
                      paymentMethod === 'mpesa' && styles.methodTitleActive
                    ]}>M-Pesa</Text>
                    <Text style={styles.methodDescription}>Pay with M-Pesa mobile money</Text>
                  </View>
                  <View style={[
                    styles.radioButton,
                    paymentMethod === 'mpesa' && styles.radioButtonActive
                  ]} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.methodOption,
                    paymentMethod === 'card' && styles.methodOptionActive
                  ]}
                  onPress={() => setPaymentMethod('card')}
                >
                  <CreditCard size={24} color={paymentMethod === 'card' ? '#10B981' : '#6B7280'} />
                  <View style={styles.methodInfo}>
                    <Text style={[
                      styles.methodTitle,
                      paymentMethod === 'card' && styles.methodTitleActive
                    ]}>Card Payment</Text>
                    <Text style={styles.methodDescription}>Pay with debit or credit card</Text>
                  </View>
                  <View style={[
                    styles.radioButton,
                    paymentMethod === 'card' && styles.radioButtonActive
                  ]} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.methodOption,
                    paymentMethod === 'bank_transfer' && styles.methodOptionActive
                  ]}
                  onPress={() => setPaymentMethod('bank_transfer')}
                >
                  <Building size={24} color={paymentMethod === 'bank_transfer' ? '#10B981' : '#6B7280'} />
                  <View style={styles.methodInfo}>
                    <Text style={[
                      styles.methodTitle,
                      paymentMethod === 'bank_transfer' && styles.methodTitleActive
                    ]}>Bank Transfer</Text>
                    <Text style={styles.methodDescription}>Direct bank transfer</Text>
                  </View>
                  <View style={[
                    styles.radioButton,
                    paymentMethod === 'bank_transfer' && styles.radioButtonActive
                  ]} />
                </TouchableOpacity>
              </View>

              {paymentMethod === 'mpesa' && (
                <View style={styles.paymentForm}>
                  <Text style={styles.inputLabel}>M-Pesa Phone Number</Text>
                  <TextInput
                    style={styles.phoneInput}
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    placeholder="254712345678"
                    keyboardType="phone-pad"
                    maxLength={12}
                  />
                  <Text style={styles.inputHint}>
                    Enter your M-Pesa registered phone number
                  </Text>
                </View>
              )}

              <View style={styles.landlordInfo}>
                <Text style={styles.sectionTitle}>Payment To</Text>
                <View style={styles.landlordCard}>
                  <Text style={styles.landlordName}>{MOCK_PAYMENT_SETTINGS.accountName}</Text>
                  <Text style={styles.landlordDetails}>
                    M-Pesa: {MOCK_PAYMENT_SETTINGS.mpesaNumber}
                  </Text>
                  <Text style={styles.landlordDetails}>
                    Bank: {MOCK_PAYMENT_SETTINGS.bankName} - {MOCK_PAYMENT_SETTINGS.accountNumber}
                  </Text>
                </View>
              </View>
            </>
          )}
        </ScrollView>

        <View style={styles.modalFooter}>
          <TouchableOpacity
            style={[styles.payButton, isProcessing && styles.payButtonDisabled]}
            onPress={handlePayment}
            disabled={isProcessing}
          >
            <Text style={styles.payButtonText}>
              {isProcessing ? 'Processing...' : `Pay KES ${selectedPayment?.amount.toLocaleString()}`}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>{isTenant ? 'Pay Rent' : 'Post'}</Text>
        <Text style={styles.subtitle}>
          {isLandlord ? 'List your properties' : 'Manage your rent payments'}
        </Text>
      </View>

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

        {isTenant && (
          <>
            {/* Payment Summary Card */}
            <View style={styles.paymentSummaryCard}>
              <Text style={styles.cardTitle}>Payment Summary</Text>
              <View style={styles.summaryStats}>
                <View style={styles.summaryStatItem}>
                  <Text style={styles.summaryStatValue}>KES 37,000</Text>
                  <Text style={styles.summaryStatLabel}>Due This Month</Text>
                </View>
                <View style={styles.summaryStatItem}>
                  <Text style={[styles.summaryStatValue, { color: '#EF4444' }]}>KES 2,000</Text>
                  <Text style={styles.summaryStatLabel}>Overdue</Text>
                </View>
              </View>
            </View>

            {/* Payment History */}
            <View style={styles.paymentHistoryCard}>
              <Text style={styles.cardTitle}>Payment History</Text>
              {MOCK_PAYMENT_HISTORY.map((payment) => (
                <TouchableOpacity
                  key={payment.id}
                  style={styles.paymentItem}
                  onPress={() => payment.status !== 'completed' && handlePaymentPress(payment)}
                  disabled={payment.status === 'completed'}
                >
                  <View style={styles.paymentItemLeft}>
                    {getStatusIcon(payment.status)}
                    <View style={styles.paymentItemInfo}>
                      <Text style={styles.paymentItemTitle}>
                        {payment.type.replace('_', ' ').toUpperCase()}
                      </Text>
                      <Text style={styles.paymentItemDate}>
                        Due: {formatDate(payment.dueDate)}
                        {payment.paidDate && ` • Paid: ${formatDate(payment.paidDate)}`}
                      </Text>
                      {payment.reference && (
                        <Text style={styles.paymentItemReference}>
                          Ref: {payment.reference}
                        </Text>
                      )}
                    </View>
                  </View>
                  <View style={styles.paymentItemRight}>
                    <Text style={styles.paymentItemAmount}>
                      KES {payment.amount.toLocaleString()}
                    </Text>
                    <Text style={[
                      styles.paymentItemStatus,
                      { color: getStatusColor(payment.status) }
                    ]}>
                      {payment.status.toUpperCase()}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {/* Quick Actions */}
            <TouchableOpacity style={styles.actionCard}>
              <View style={styles.iconContainer}>
                <Users size={32} color="#3B82F6" />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>Find Roommate</Text>
                <Text style={styles.cardDescription}>
                  Post an ad to find someone to share your apartment
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard}>
              <View style={styles.iconContainer}>
                <RefreshCw size={32} color="#10B981" />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>Sublet My Place</Text>
                <Text style={styles.cardDescription}>
                  Temporarily rent out your apartment while you're away
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard}>
              <View style={styles.iconContainer}>
                <Star size={32} color="#F59E0B" />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>Write Review</Text>
                <Text style={styles.cardDescription}>
                  Share your experience with your landlord or property
                </Text>
              </View>
            </TouchableOpacity>
          </>
        )}

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>💡 Pro Tip</Text>
          <Text style={styles.infoText}>
            {isLandlord
              ? 'Properties with at least 5 photos and detailed descriptions get 3x more inquiries!'
              : 'Set up automatic payments to never miss a due date and avoid late fees!'}
          </Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {renderPaymentModal()}
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
  // Payment-specific styles
  paymentSummaryCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  summaryStatItem: {
    alignItems: 'center',
  },
  summaryStatValue: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: '#3B82F6',
    marginBottom: 4,
  },
  summaryStatLabel: {
    fontSize: 13,
    color: '#6B7280',
  },
  paymentHistoryCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  paymentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  paymentItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  paymentItemInfo: {
    flex: 1,
  },
  paymentItemTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#111827',
    marginBottom: 2,
  },
  paymentItemDate: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  paymentItemReference: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  paymentItemRight: {
    alignItems: 'flex-end',
  },
  paymentItemAmount: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#111827',
    marginBottom: 2,
  },
  paymentItemStatus: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#111827',
  },
  closeButton: {
    padding: 4,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  paymentSummary: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#111827',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#111827',
  },
  paymentMethods: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#111827',
    marginBottom: 16,
  },
  methodOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 12,
    gap: 12,
  },
  methodOptionActive: {
    borderColor: '#10B981',
    backgroundColor: '#F0FDF4',
  },
  methodInfo: {
    flex: 1,
  },
  methodTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#111827',
    marginBottom: 2,
  },
  methodTitleActive: {
    color: '#10B981',
  },
  methodDescription: {
    fontSize: 13,
    color: '#6B7280',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  radioButtonActive: {
    borderColor: '#10B981',
    backgroundColor: '#10B981',
  },
  paymentForm: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#111827',
    marginBottom: 8,
  },
  phoneInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  inputHint: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  landlordInfo: {
    marginBottom: 24,
  },
  landlordCard: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
  },
  landlordName: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#111827',
    marginBottom: 8,
  },
  landlordDetails: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  modalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  payButton: {
    backgroundColor: '#10B981',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  payButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  payButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
});