export type UserRole = 'tenant' | 'landlord' | 'both';

export type PropertyType = 
  | 'single_room' 
  | 'bedsitter' 
  | 'one_bedroom' 
  | 'two_bedroom' 
  | 'three_bedroom' 
  | 'four_plus_bedroom'
  | 'studio'
  | 'bungalow'
  | 'bnb'
  | 'commercial'
  | 'warehouse'
  | 'shop'
  | 'office';

export type PropertyStatus = 'available' | 'occupied' | 'maintenance' | 'pending';

export interface Property {
  id: string;
  title: string;
  type: PropertyType;
  price: number;
  location: string;
  area: string;
  city: string;
  distance?: number;
  bedrooms: number;
  bathrooms: number;
  size: number;
  floor?: number;
  totalFloors?: number;
  images: string[];
  description: string;
  amenities: string[];
  status: PropertyStatus;
  landlord: Landlord;
  rating: number;
  reviewCount: number;
  saves: number;
  views: number;
  furnished: 'furnished' | 'semi_furnished' | 'unfurnished';
  petsAllowed: boolean;
  parking: boolean;
  parkingSlots: number;
  deposit: number;
  serviceCharge?: number;
  availableFrom: string;
  featured?: boolean;
  verified?: boolean;
  hasVirtualTour?: boolean;
  hasVideo?: boolean;
}

export interface Landlord {
  id: string;
  name: string;
  photo?: string;
  rating: number;
  reviewCount: number;
  verified: boolean;
  responseTime: string;
  memberSince: string;
  propertiesListed: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  photo?: string;
  role: UserRole;
  verified: boolean;
  rating?: number;
  memberSince: string;
}

export interface Vehicle {
  id: string;
  plate: string;
  make: string;
  model: string;
  year: number;
  color: string;
  type: 'car' | 'suv' | 'van' | 'motorcycle' | 'pickup';
  slot?: string;
  status: 'parked' | 'out' | 'leaving_soon' | 'away';
  photo?: string;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderPhoto?: string;
  content: string;
  timestamp: string;
  read: boolean;
  propertyId?: string;
}

export interface GroupMessage extends Message {
  groupId: string;
  reactions?: { emoji: string; count: number; users: string[] }[];
}

export interface Notification {
  id: string;
  type: 'smartpark' | 'message' | 'property' | 'payment' | 'event' | 'maintenance';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  icon?: string;
}

export interface FilterOptions {
  location?: string;
  priceMin?: number;
  priceMax?: number;
  propertyTypes?: PropertyType[];
  bedrooms?: number[];
  amenities?: string[];
  furnished?: string[];
  petsAllowed?: boolean;
  parking?: boolean;
  availableNow?: boolean;
}

export interface SavedCollection {
  id: string;
  name: string;
  properties: string[];
  color?: string;
}

export interface Group {
  id: string;
  name: string;
  propertyId: string;
  landlordId: string;
  members: GroupMember[];
  createdAt: string;
  photo?: string;
}

export interface GroupMember {
  id: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  role: 'landlord' | 'tenant';
  joinedAt: string;
  unit?: string;
}

export interface Payment {
  id: string;
  propertyId: string;
  groupId?: string;
  tenantId: string;
  landlordId: string;
  amount: number;
  type: 'rent' | 'deposit' | 'service_charge' | 'other';
  status: 'pending' | 'completed' | 'failed' | 'overdue';
  dueDate: string;
  paidDate?: string;
  method?: 'mpesa' | 'card' | 'bank_transfer' | 'cash';
  reference?: string;
}

export interface PaymentSettings {
  propertyId: string;
  landlordId: string;
  accountName: string;
  accountNumber: string;
  bankName?: string;
  mpesaNumber?: string;
  dueDay: number;
  lateFee?: number;
  gracePeriodDays?: number;
}
