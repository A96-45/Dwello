import AsyncStorage from '@react-native-async-storage/async-storage';
import type { User, VerificationLevel } from '@/types';

interface SecurityEvent {
  id: string;
  userId: string;
  type: 'role_switch_attempt' | 'verification_bypass' | 'suspicious_activity' | 'document_fraud';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  metadata: Record<string, any>;
  timestamp: string;
  resolved: boolean;
}

interface SecurityFlags {
  isBlacklisted: boolean;
  isSuspicious: boolean;
  requiresManualReview: boolean;
  riskScore: number;
  lastSecurityCheck: string;
}

const STORAGE_KEYS = {
  SECURITY_EVENTS: '@dwello:securityEvents',
  SECURITY_FLAGS: '@dwello:securityFlags',
  BLOCKED_USERS: '@dwello:blockedUsers',
};

export class SecurityService {
  
  /**
   * Log security events for monitoring
   */
  static async logSecurityEvent(
    userId: string,
    type: SecurityEvent['type'],
    severity: SecurityEvent['severity'],
    description: string,
    metadata: Record<string, any> = {}
  ): Promise<void> {
    const event: SecurityEvent = {
      id: `sec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      type,
      severity,
      description,
      metadata,
      timestamp: new Date().toISOString(),
      resolved: false,
    };

    try {
      const existingEvents = await this.getSecurityEvents();
      const updatedEvents = [event, ...existingEvents].slice(0, 1000); // Keep last 1000 events
      
      await AsyncStorage.setItem(
        STORAGE_KEYS.SECURITY_EVENTS,
        JSON.stringify(updatedEvents)
      );

      // Auto-escalate critical events
      if (severity === 'critical') {
        await this.handleCriticalSecurityEvent(event);
      }
    } catch (error) {
      console.error('Error logging security event:', error);
    }
  }

  /**
   * Get security events for monitoring
   */
  static async getSecurityEvents(userId?: string): Promise<SecurityEvent[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.SECURITY_EVENTS);
      const events: SecurityEvent[] = data ? JSON.parse(data) : [];
      
      return userId 
        ? events.filter(event => event.userId === userId)
        : events;
    } catch (error) {
      console.error('Error getting security events:', error);
      return [];
    }
  }

  /**
   * Check if user is allowed to perform action
   */
  static async checkUserPermissions(
    userId: string,
    action: string,
    verificationLevel: VerificationLevel
  ): Promise<{
    allowed: boolean;
    reason?: string;
    requiresVerification?: boolean;
  }> {
    // Check if user is blocked
    const isBlocked = await this.isUserBlocked(userId);
    if (isBlocked) {
      await this.logSecurityEvent(
        userId,
        'suspicious_activity',
        'high',
        `Blocked user attempted ${action}`,
        { action }
      );
      
      return {
        allowed: false,
        reason: 'Account has been suspended for security reasons',
      };
    }

    // Check verification requirements for landlord actions
    const landlordActions = [
      'post_property',
      'access_tenant_data',
      'collect_payment',
      'bulk_operations',
    ];

    if (landlordActions.includes(action)) {
      if (verificationLevel === 'unverified') {
        await this.logSecurityEvent(
          userId,
          'role_switch_attempt',
          'medium',
          `Unverified user attempted ${action}`,
          { action, verificationLevel }
        );

        return {
          allowed: false,
          reason: 'Identity verification required for this action',
          requiresVerification: true,
        };
      }
    }

    // Check rate limiting for sensitive actions
    const rateLimitedActions = ['post_property', 'collect_payment'];
    if (rateLimitedActions.includes(action)) {
      const isRateLimited = await this.checkRateLimit(userId, action);
      if (isRateLimited) {
        await this.logSecurityEvent(
          userId,
          'suspicious_activity',
          'medium',
          `Rate limit exceeded for ${action}`,
          { action }
        );

        return {
          allowed: false,
          reason: 'Too many requests. Please try again later.',
        };
      }
    }

    return { allowed: true };
  }

  /**
   * Validate document authenticity (mock implementation)
   */
  static async validateDocument(
    documentUrl: string,
    documentType: string
  ): Promise<{
    isValid: boolean;
    confidence: number;
    flags: string[];
    extractedData: Record<string, any>;
  }> {
    // Mock document validation - in production, use ML/AI services
    const mockValidation = {
      isValid: Math.random() > 0.1, // 90% success rate
      confidence: 0.85 + Math.random() * 0.15, // 85-100% confidence
      flags: [] as string[],
      extractedData: {} as Record<string, any>,
    };

    // Add some mock flags for suspicious documents
    if (Math.random() < 0.05) { // 5% chance of suspicious document
      mockValidation.flags.push('potential_forgery');
      mockValidation.isValid = false;
      mockValidation.confidence = 0.3;
    }

    if (Math.random() < 0.03) { // 3% chance of expired document
      mockValidation.flags.push('expired_document');
    }

    return mockValidation;
  }

  /**
   * Check if user is blocked
   */
  static async isUserBlocked(userId: string): Promise<boolean> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.BLOCKED_USERS);
      const blockedUsers: string[] = data ? JSON.parse(data) : [];
      return blockedUsers.includes(userId);
    } catch (error) {
      console.error('Error checking blocked users:', error);
      return false;
    }
  }

  /**
   * Block user for security reasons
   */
  static async blockUser(userId: string, reason: string): Promise<void> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.BLOCKED_USERS);
      const blockedUsers: string[] = data ? JSON.parse(data) : [];
      
      if (!blockedUsers.includes(userId)) {
        blockedUsers.push(userId);
        await AsyncStorage.setItem(
          STORAGE_KEYS.BLOCKED_USERS,
          JSON.stringify(blockedUsers)
        );

        await this.logSecurityEvent(
          userId,
          'suspicious_activity',
          'critical',
          `User blocked: ${reason}`,
          { reason }
        );
      }
    } catch (error) {
      console.error('Error blocking user:', error);
    }
  }

  /**
   * Check rate limiting for actions
   */
  private static async checkRateLimit(
    userId: string,
    action: string
  ): Promise<boolean> {
    const key = `@dwello:rateLimit:${userId}:${action}`;
    
    try {
      const data = await AsyncStorage.getItem(key);
      const attempts = data ? JSON.parse(data) : [];
      
      // Remove attempts older than 1 hour
      const oneHourAgo = Date.now() - (60 * 60 * 1000);
      const recentAttempts = attempts.filter((timestamp: number) => timestamp > oneHourAgo);
      
      // Define limits per action
      const limits: Record<string, number> = {
        post_property: 10, // 10 properties per hour
        collect_payment: 50, // 50 payment requests per hour
        role_switch_attempt: 5, // 5 role switch attempts per hour
      };
      
      const limit = limits[action] || 100;
      
      if (recentAttempts.length >= limit) {
        return true; // Rate limited
      }
      
      // Add current attempt
      recentAttempts.push(Date.now());
      await AsyncStorage.setItem(key, JSON.stringify(recentAttempts));
      
      return false;
    } catch (error) {
      console.error('Error checking rate limit:', error);
      return false;
    }
  }

  /**
   * Handle critical security events
   */
  private static async handleCriticalSecurityEvent(event: SecurityEvent): Promise<void> {
    // In production, this would:
    // 1. Send alerts to security team
    // 2. Temporarily suspend user if needed
    // 3. Trigger additional security checks
    
    console.warn('CRITICAL SECURITY EVENT:', event);
    
    // Auto-block users with multiple critical events
    const userEvents = await this.getSecurityEvents(event.userId);
    const criticalEvents = userEvents.filter(e => e.severity === 'critical');
    
    if (criticalEvents.length >= 3) {
      await this.blockUser(event.userId, 'Multiple critical security events');
    }
  }

  /**
   * Generate security report for user
   */
  static async generateSecurityReport(userId: string): Promise<{
    riskScore: number;
    verificationStatus: string;
    recentEvents: SecurityEvent[];
    recommendations: string[];
  }> {
    const events = await this.getSecurityEvents(userId);
    const recentEvents = events.slice(0, 10);
    
    // Calculate risk score based on recent events
    let riskScore = 0;
    recentEvents.forEach(event => {
      switch (event.severity) {
        case 'critical': riskScore += 25; break;
        case 'high': riskScore += 15; break;
        case 'medium': riskScore += 10; break;
        case 'low': riskScore += 5; break;
      }
    });
    
    riskScore = Math.min(100, riskScore);
    
    const recommendations: string[] = [];
    
    if (riskScore > 50) {
      recommendations.push('Complete additional identity verification');
      recommendations.push('Review recent account activity');
    }
    
    if (events.some(e => e.type === 'document_fraud')) {
      recommendations.push('Re-submit verification documents');
    }
    
    if (events.some(e => e.type === 'role_switch_attempt')) {
      recommendations.push('Complete required verification before switching roles');
    }
    
    return {
      riskScore,
      verificationStatus: 'Under Review',
      recentEvents,
      recommendations,
    };
  }
}