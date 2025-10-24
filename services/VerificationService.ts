import AsyncStorage from '@react-native-async-storage/async-storage';
import type { 
  VerificationLevel, 
  VerificationDocument, 
  VerificationRequest, 
  UserPermissions,
  DocumentType 
} from '@/types';

const STORAGE_KEYS = {
  VERIFICATION_REQUESTS: '@dwello:verificationRequests',
  VERIFICATION_DOCUMENTS: '@dwello:verificationDocuments',
};

export class VerificationService {
  
  /**
   * Get user permissions based on verification level
   */
  static getUserPermissions(verificationLevel: VerificationLevel): UserPermissions {
    switch (verificationLevel) {
      case 'unverified':
        return {
          canPostListings: false,
          canAccessTenantData: false,
          canCollectPayments: false,
          canUseBulkOperations: false,
          canAccessAnalytics: false,
          maxListings: 0,
          requiresApproval: true,
        };
      
      case 'pending':
        return {
          canPostListings: false,
          canAccessTenantData: false,
          canCollectPayments: false,
          canUseBulkOperations: false,
          canAccessAnalytics: false,
          maxListings: 0,
          requiresApproval: true,
        };
      
      case 'basic':
        return {
          canPostListings: true,
          canAccessTenantData: false,
          canCollectPayments: false,
          canUseBulkOperations: false,
          canAccessAnalytics: true,
          maxListings: 2,
          requiresApproval: true,
        };
      
      case 'property':
        return {
          canPostListings: true,
          canAccessTenantData: true,
          canCollectPayments: true,
          canUseBulkOperations: false,
          canAccessAnalytics: true,
          maxListings: 50,
          requiresApproval: false,
        };
      
      case 'premium':
        return {
          canPostListings: true,
          canAccessTenantData: true,
          canCollectPayments: true,
          canUseBulkOperations: true,
          canAccessAnalytics: true,
          maxListings: 500,
          requiresApproval: false,
        };
      
      default:
        return this.getUserPermissions('unverified');
    }
  }

  /**
   * Get required documents for each verification level
   */
  static getRequiredDocuments(level: VerificationLevel): DocumentType[] {
    switch (level) {
      case 'basic':
        return ['national_id', 'utility_bill'];
      
      case 'property':
        return ['national_id', 'utility_bill', 'title_deed'];
      
      case 'premium':
        return ['national_id', 'utility_bill', 'title_deed', 'business_registration'];
      
      default:
        return [];
    }
  }

  /**
   * Validate if user can switch to landlord role
   */
  static canSwitchToLandlord(verificationLevel: VerificationLevel): {
    allowed: boolean;
    reason?: string;
    requiredLevel?: VerificationLevel;
  } {
    if (verificationLevel === 'unverified') {
      return {
        allowed: false,
        reason: 'Identity verification required to become a landlord',
        requiredLevel: 'basic',
      };
    }
    
    return { allowed: true };
  }

  /**
   * Create a verification request
   */
  static async createVerificationRequest(
    userId: string,
    level: VerificationLevel,
    documents: VerificationDocument[]
  ): Promise<VerificationRequest> {
    const request: VerificationRequest = {
      id: `ver_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      level,
      status: 'pending',
      documents,
      submittedAt: new Date().toISOString(),
    };

    // Store the request (in production, this would be sent to backend)
    const existingRequests = await this.getVerificationRequests();
    const updatedRequests = [...existingRequests, request];
    await AsyncStorage.setItem(
      STORAGE_KEYS.VERIFICATION_REQUESTS, 
      JSON.stringify(updatedRequests)
    );

    return request;
  }

  /**
   * Get all verification requests for a user
   */
  static async getVerificationRequests(userId?: string): Promise<VerificationRequest[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.VERIFICATION_REQUESTS);
      const requests: VerificationRequest[] = data ? JSON.parse(data) : [];
      
      return userId 
        ? requests.filter(req => req.userId === userId)
        : requests;
    } catch (error) {
      console.error('Error getting verification requests:', error);
      return [];
    }
  }

  /**
   * Upload and process document
   */
  static async uploadDocument(
    file: { uri: string; name: string; type: string },
    documentType: DocumentType
  ): Promise<VerificationDocument> {
    // In production, this would upload to cloud storage and run OCR
    const document: VerificationDocument = {
      id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: documentType,
      fileName: file.name,
      fileUrl: file.uri, // In production, this would be the cloud URL
      uploadedAt: new Date().toISOString(),
      status: 'pending',
      // Mock OCR extracted data
      extractedData: this.mockOCRExtraction(documentType),
    };

    return document;
  }

  /**
   * Mock OCR data extraction (in production, use real OCR service)
   */
  private static mockOCRExtraction(documentType: DocumentType): Record<string, any> {
    switch (documentType) {
      case 'national_id':
        return {
          fullName: 'John Doe',
          idNumber: '12345678',
          dateOfBirth: '1990-01-01',
          expiryDate: '2030-01-01',
        };
      
      case 'utility_bill':
        return {
          address: '123 Main Street, Nairobi',
          accountHolder: 'John Doe',
          billDate: '2024-01-01',
          provider: 'Kenya Power',
        };
      
      case 'title_deed':
        return {
          propertyAddress: '456 Property Lane, Nairobi',
          ownerName: 'John Doe',
          titleNumber: 'TITLE123456',
          registrationDate: '2020-01-01',
        };
      
      default:
        return {};
    }
  }

  /**
   * Calculate user risk score based on various factors
   */
  static calculateRiskScore(user: any): number {
    let score = 50; // Base score
    
    // Verification level impact
    switch (user.verificationLevel) {
      case 'premium': score -= 20; break;
      case 'property': score -= 15; break;
      case 'basic': score -= 10; break;
      case 'pending': score += 10; break;
      case 'unverified': score += 30; break;
    }
    
    // Account age impact
    const accountAge = Date.now() - new Date(user.memberSince).getTime();
    const daysOld = accountAge / (1000 * 60 * 60 * 24);
    if (daysOld > 365) score -= 10;
    else if (daysOld > 90) score -= 5;
    else if (daysOld < 7) score += 15;
    
    // Rating impact
    if (user.rating) {
      if (user.rating >= 4.5) score -= 10;
      else if (user.rating >= 4.0) score -= 5;
      else if (user.rating < 3.0) score += 15;
    }
    
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Check if user needs re-verification
   */
  static needsReVerification(user: any): boolean {
    if (!user.lastVerificationCheck) return true;
    
    const lastCheck = new Date(user.lastVerificationCheck);
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    return lastCheck < sixMonthsAgo;
  }
}