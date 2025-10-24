import AsyncStorage from '@react-native-async-storage/async-storage';
import type { PropertyNFT, BlockchainVerification } from '@/types';

const STORAGE_KEYS = {
  PROPERTY_NFTS: '@dwello:propertyNFTs',
  BLOCKCHAIN_VERIFICATIONS: '@dwello:blockchainVerifications',
  PARCEL_REGISTRY: '@dwello:parcelRegistry',
};

// Mock blockchain addresses for demonstration
const MOCK_BLOCKCHAIN_ADDRESSES = [
  '0x742d35Cc6634C0532925a3b8D4C2Aa3e4f6c8b2E',
  '0x8ba1f109551bD432803012645Hac136c5C5c8c4',
  '0x9f2d4ac5B8c3d7e1F4a6b9c8d7e2F1a5b4c3d2e1',
  '0xa1b2c3d4e5f6789012345678901234567890abcd',
  '0xb2c3d4e5f6789012345678901234567890abcdef',
];

export class BlockchainService {
  
  /**
   * Verify parcel number and check for duplicates
   */
  static async verifyParcelNumber(
    userId: string,
    parcelNumber: string,
    ownerName: string
  ): Promise<{
    success: boolean;
    isDuplicate: boolean;
    existingOwner?: string;
    verificationId?: string;
    error?: string;
  }> {
    try {
      // Clean and validate parcel number format
      const cleanParcelNumber = parcelNumber.trim().toUpperCase();
      
      if (!this.isValidParcelNumber(cleanParcelNumber)) {
        return {
          success: false,
          isDuplicate: false,
          error: 'Invalid parcel number format. Please use format: ABC/123/456',
        };
      }

      // Check for existing NFT with same parcel number
      const existingNFTs = await this.getPropertyNFTs();
      const duplicateNFT = existingNFTs.find(nft => nft.parcelNumber === cleanParcelNumber);
      
      if (duplicateNFT) {
        return {
          success: false,
          isDuplicate: true,
          existingOwner: duplicateNFT.ownerName,
          error: `This parcel number is already registered to ${duplicateNFT.ownerName}`,
        };
      }

      // Create verification request
      const verification: BlockchainVerification = {
        id: `verify_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        parcelNumber: cleanParcelNumber,
        status: 'pending',
        submittedAt: new Date().toISOString(),
      };

      // Store verification request
      const existingVerifications = await this.getBlockchainVerifications();
      const updatedVerifications = [...existingVerifications, verification];
      await AsyncStorage.setItem(
        STORAGE_KEYS.BLOCKCHAIN_VERIFICATIONS,
        JSON.stringify(updatedVerifications)
      );

      // Simulate blockchain verification process
      setTimeout(() => {
        this.processVerification(verification.id, ownerName);
      }, 2000);

      return {
        success: true,
        isDuplicate: false,
        verificationId: verification.id,
      };
    } catch (error) {
      console.error('Error verifying parcel number:', error);
      return {
        success: false,
        isDuplicate: false,
        error: 'Failed to verify parcel number. Please try again.',
      };
    }
  }

  /**
   * Process verification and mint NFT if valid
   */
  private static async processVerification(
    verificationId: string,
    ownerName: string
  ): Promise<void> {
    try {
      const verifications = await this.getBlockchainVerifications();
      const verification = verifications.find(v => v.id === verificationId);
      
      if (!verification) return;

      // Simulate government land registry check (90% success rate)
      const isValidProperty = Math.random() > 0.1;
      
      if (isValidProperty) {
        // Mint NFT
        const nft = await this.mintPropertyNFT(
          verification.parcelNumber,
          verification.userId,
          ownerName
        );

        // Update verification status
        verification.status = 'verified';
        verification.verifiedAt = new Date().toISOString();
        verification.nftTokenId = nft.tokenId;
        verification.blockchainAddress = nft.ownerAddress;
      } else {
        // Reject verification
        verification.status = 'rejected';
        verification.rejectionReason = 'Property not found in government land registry';
      }

      // Save updated verification
      const updatedVerifications = verifications.map(v => 
        v.id === verificationId ? verification : v
      );
      await AsyncStorage.setItem(
        STORAGE_KEYS.BLOCKCHAIN_VERIFICATIONS,
        JSON.stringify(updatedVerifications)
      );
    } catch (error) {
      console.error('Error processing verification:', error);
    }
  }

  /**
   * Mint Property NFT
   */
  private static async mintPropertyNFT(
    parcelNumber: string,
    userId: string,
    ownerName: string
  ): Promise<PropertyNFT> {
    const nft: PropertyNFT = {
      id: `nft_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      parcelNumber,
      tokenId: `TOKEN_${Date.now()}`,
      ownerAddress: MOCK_BLOCKCHAIN_ADDRESSES[Math.floor(Math.random() * MOCK_BLOCKCHAIN_ADDRESSES.length)],
      ownerName,
      mintedAt: new Date().toISOString(),
      blockchainTxHash: `0x${Math.random().toString(16).substr(2, 64)}`,
      verified: true,
      metadata: {
        location: this.generateMockLocation(parcelNumber),
        size: `${Math.floor(Math.random() * 5000) + 1000} sq ft`,
        propertyType: this.generateMockPropertyType(),
        legalDescription: `Legal parcel ${parcelNumber} as recorded in government registry`,
      },
    };

    // Store NFT
    const existingNFTs = await this.getPropertyNFTs();
    const updatedNFTs = [...existingNFTs, nft];
    await AsyncStorage.setItem(
      STORAGE_KEYS.PROPERTY_NFTS,
      JSON.stringify(updatedNFTs)
    );

    return nft;
  }

  /**
   * Get all property NFTs
   */
  static async getPropertyNFTs(): Promise<PropertyNFT[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.PROPERTY_NFTS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting property NFTs:', error);
      return [];
    }
  }

  /**
   * Get NFTs owned by user
   */
  static async getUserNFTs(userId: string): Promise<PropertyNFT[]> {
    const allNFTs = await this.getPropertyNFTs();
    return allNFTs.filter(nft => nft.ownerAddress === userId || nft.id.includes(userId));
  }

  /**
   * Get blockchain verifications
   */
  static async getBlockchainVerifications(): Promise<BlockchainVerification[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.BLOCKCHAIN_VERIFICATIONS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting blockchain verifications:', error);
      return [];
    }
  }

  /**
   * Get user's verification status
   */
  static async getUserVerificationStatus(userId: string): Promise<{
    hasVerification: boolean;
    status?: BlockchainVerification['status'];
    nftCount: number;
    verifications: BlockchainVerification[];
  }> {
    const verifications = await this.getBlockchainVerifications();
    const userVerifications = verifications.filter(v => v.userId === userId);
    const userNFTs = await this.getUserNFTs(userId);
    
    const latestVerification = userVerifications
      .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())[0];

    return {
      hasVerification: userVerifications.length > 0,
      status: latestVerification?.status,
      nftCount: userNFTs.length,
      verifications: userVerifications,
    };
  }

  /**
   * Check if user can become landlord
   */
  static async canUserBecomeLandlord(userId: string): Promise<{
    allowed: boolean;
    reason?: string;
    requiresVerification?: boolean;
  }> {
    const status = await this.getUserVerificationStatus(userId);
    
    if (!status.hasVerification) {
      return {
        allowed: false,
        reason: 'Property ownership verification required',
        requiresVerification: true,
      };
    }

    if (status.status === 'pending') {
      return {
        allowed: false,
        reason: 'Property verification is being processed',
      };
    }

    if (status.status === 'rejected') {
      return {
        allowed: false,
        reason: 'Property verification was rejected',
        requiresVerification: true,
      };
    }

    if (status.status === 'verified' && status.nftCount > 0) {
      return { allowed: true };
    }

    return {
      allowed: false,
      reason: 'No verified properties found',
      requiresVerification: true,
    };
  }

  /**
   * Validate parcel number format
   */
  private static isValidParcelNumber(parcelNumber: string): boolean {
    // Accept various formats: ABC/123/456, ABC-123-456, ABC123456, etc.
    const patterns = [
      /^[A-Z]{2,4}[\/\-]?\d{3,6}[\/\-]?\d{3,6}$/,  // ABC/123/456 or ABC-123-456
      /^[A-Z]{2,4}\d{6,12}$/,                        // ABC123456789
      /^\d{8,15}$/,                                  // 123456789012
      /^[A-Z]{1,3}\d{4,8}[A-Z]{0,2}$/,              // A1234B
    ];
    
    return patterns.some(pattern => pattern.test(parcelNumber));
  }

  /**
   * Generate mock location based on parcel number
   */
  private static generateMockLocation(parcelNumber: string): string {
    const locations = [
      'Nairobi, Kenya',
      'Mombasa, Kenya', 
      'Kisumu, Kenya',
      'Nakuru, Kenya',
      'Eldoret, Kenya',
    ];
    
    // Use parcel number to consistently generate same location
    const index = parcelNumber.charCodeAt(0) % locations.length;
    return locations[index];
  }

  /**
   * Generate mock property type
   */
  private static generateMockPropertyType(): string {
    const types = [
      'Residential Land',
      'Commercial Property',
      'Agricultural Land',
      'Mixed-Use Property',
      'Industrial Land',
    ];
    
    return types[Math.floor(Math.random() * types.length)];
  }

  /**
   * Get blockchain transaction details (mock)
   */
  static async getTransactionDetails(txHash: string): Promise<{
    hash: string;
    blockNumber: number;
    timestamp: string;
    gasUsed: string;
    status: 'success' | 'failed';
  }> {
    return {
      hash: txHash,
      blockNumber: Math.floor(Math.random() * 1000000) + 15000000,
      timestamp: new Date().toISOString(),
      gasUsed: (Math.random() * 100000 + 21000).toFixed(0),
      status: 'success',
    };
  }

  /**
   * Clear all blockchain data (for testing)
   */
  static async clearBlockchainData(): Promise<void> {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.PROPERTY_NFTS,
      STORAGE_KEYS.BLOCKCHAIN_VERIFICATIONS,
      STORAGE_KEYS.PARCEL_REGISTRY,
    ]);
  }
}