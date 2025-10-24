import type { PaymentSettings, Payment } from '@/types';

export const MOCK_PAYMENT_SETTINGS: PaymentSettings[] = [
  {
    propertyId: '1',
    landlordId: '1',
    accountName: 'Dwello Estates Ltd',
    accountNumber: '123456',
    bankName: 'Equity Bank',
    mpesaNumber: '247247', // Paybill
    dueDay: 5,
    lateFee: 500,
    gracePeriodDays: 3,
  },
  {
    propertyId: '2',
    landlordId: '2',
    accountName: 'Premium Homes Co',
    accountNumber: '987654',
    bankName: 'KCB',
    mpesaNumber: '522522', // Till
    dueDay: 3,
    lateFee: 1000,
    gracePeriodDays: 5,
  },
  {
    propertyId: '3',
    landlordId: '3',
    accountName: 'Parklands Realty',
    accountNumber: '334455',
    bankName: 'Co-op Bank',
    mpesaNumber: '247247',
    dueDay: 1,
    lateFee: 300,
    gracePeriodDays: 2,
  },
  {
    propertyId: '4',
    landlordId: '1',
    accountName: 'Dwello Estates Ltd',
    accountNumber: '123456',
    bankName: 'Equity Bank',
    mpesaNumber: '247247',
    dueDay: 5,
  },
  {
    propertyId: '5',
    landlordId: '2',
    accountName: 'Premium Homes Co',
    accountNumber: '987654',
    bankName: 'KCB',
    mpesaNumber: '522522',
    dueDay: 3,
  },
];

export const MOCK_PAYMENTS: Payment[] = [
  {
    id: 'pmt_001',
    propertyId: '1',
    tenantId: 'tenant_1',
    landlordId: '1',
    amount: 35000,
    type: 'rent',
    status: 'completed',
    dueDate: new Date(new Date().getFullYear(), new Date().getMonth(), 5).toISOString(),
    paidDate: new Date(new Date().getFullYear(), new Date().getMonth(), 3).toISOString(),
    method: 'mpesa',
    reference: 'MPESA-ABC123',
  },
];
