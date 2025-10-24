import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect, useCallback, useMemo } from 'react';
import type { User, UserRole, Vehicle, SavedCollection, FilterOptions, VerificationLevel } from '@/types';
import { VerificationService } from '@/services/VerificationService';

const STORAGE_KEYS = {
  USER_ROLE: '@dwello:userRole',
  USER_DATA: '@dwello:userData',
  VERIFICATION_LEVEL: '@dwello:verificationLevel',
  SAVED_PROPERTIES: '@dwello:savedProperties',
  COLLECTIONS: '@dwello:collections',
  VEHICLES: '@dwello:vehicles',
  FILTERS: '@dwello:filters',
  ONBOARDING_COMPLETE: '@dwello:onboardingComplete',
};

export const [AppProvider, useApp] = createContextHook(() => {
  const [userRole, setUserRole] = useState<UserRole>('tenant');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [verificationLevel, setVerificationLevel] = useState<VerificationLevel>('unverified');
  const [savedProperties, setSavedProperties] = useState<string[]>([]);
  const [collections, setCollections] = useState<SavedCollection[]>([
    { id: '1', name: 'Top Picks', properties: [] },
    { id: '2', name: 'Dream Homes', properties: [] },
    { id: '3', name: 'Backups', properties: [] },
  ]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [filters, setFilters] = useState<FilterOptions>({});
  const [isLoading, setIsLoading] = useState(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  useEffect(() => {
    loadPersistedData();
  }, []);

  const loadPersistedData = async () => {
    try {
      const [roleData, userData, verificationData, savedData, collectionsData, vehiclesData, filtersData, onboardingData] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.USER_ROLE),
        AsyncStorage.getItem(STORAGE_KEYS.USER_DATA),
        AsyncStorage.getItem(STORAGE_KEYS.VERIFICATION_LEVEL),
        AsyncStorage.getItem(STORAGE_KEYS.SAVED_PROPERTIES),
        AsyncStorage.getItem(STORAGE_KEYS.COLLECTIONS),
        AsyncStorage.getItem(STORAGE_KEYS.VEHICLES),
        AsyncStorage.getItem(STORAGE_KEYS.FILTERS),
        AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETE),
      ]);

      if (roleData) setUserRole(roleData as UserRole);
      if (userData) setCurrentUser(JSON.parse(userData));
      if (verificationData) setVerificationLevel(verificationData as VerificationLevel);
      if (savedData) setSavedProperties(JSON.parse(savedData));
      if (collectionsData) setCollections(JSON.parse(collectionsData));
      if (vehiclesData) setVehicles(JSON.parse(vehiclesData));
      if (filtersData) setFilters(JSON.parse(filtersData));
      if (onboardingData) setHasCompletedOnboarding(JSON.parse(onboardingData));
    } catch (error) {
      console.error('Error loading persisted data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const switchRole = useCallback(async (newRole: UserRole): Promise<{
    success: boolean;
    error?: string;
    requiresVerification?: boolean;
    requiredLevel?: VerificationLevel;
  }> => {
    // Check if switching to landlord requires verification
    if (newRole === 'landlord' || newRole === 'both') {
      const verificationCheck = VerificationService.canSwitchToLandlord(verificationLevel);
      
      if (!verificationCheck.allowed) {
        return {
          success: false,
          error: verificationCheck.reason,
          requiresVerification: true,
          requiredLevel: verificationCheck.requiredLevel,
        };
      }
    }
    
    setUserRole(newRole);
    await AsyncStorage.setItem(STORAGE_KEYS.USER_ROLE, newRole);
    
    return { success: true };
  }, [verificationLevel]);

  const updateUser = useCallback(async (userData: User) => {
    setCurrentUser(userData);
    await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
  }, []);

  const toggleSaveProperty = useCallback(async (propertyId: string) => {
    setSavedProperties(prev => {
      const newSaved = prev.includes(propertyId)
        ? prev.filter(id => id !== propertyId)
        : [...prev, propertyId];
      AsyncStorage.setItem(STORAGE_KEYS.SAVED_PROPERTIES, JSON.stringify(newSaved));
      return newSaved;
    });
  }, []);

  const addToCollection = useCallback(async (collectionId: string, propertyId: string) => {
    setCollections(prev => {
      const newCollections = prev.map(col => {
        if (col.id === collectionId && !col.properties.includes(propertyId)) {
          return { ...col, properties: [...col.properties, propertyId] };
        }
        return col;
      });
      AsyncStorage.setItem(STORAGE_KEYS.COLLECTIONS, JSON.stringify(newCollections));
      return newCollections;
    });
  }, []);

  const createCollection = useCallback(async (name: string, color?: string) => {
    setCollections(prev => {
      const newCollection: SavedCollection = {
        id: Date.now().toString(),
        name,
        properties: [],
        color,
      };
      const newCollections = [...prev, newCollection];
      AsyncStorage.setItem(STORAGE_KEYS.COLLECTIONS, JSON.stringify(newCollections));
      return newCollections;
    });
  }, []);

  const addVehicle = useCallback(async (vehicle: Vehicle) => {
    setVehicles(prev => {
      const newVehicles = [...prev, vehicle];
      AsyncStorage.setItem(STORAGE_KEYS.VEHICLES, JSON.stringify(newVehicles));
      return newVehicles;
    });
  }, []);

  const removeVehicle = useCallback(async (vehicleId: string) => {
    setVehicles(prev => {
      const newVehicles = prev.filter(v => v.id !== vehicleId);
      AsyncStorage.setItem(STORAGE_KEYS.VEHICLES, JSON.stringify(newVehicles));
      return newVehicles;
    });
  }, []);

  const updateFilters = useCallback(async (newFilters: FilterOptions) => {
    setFilters(newFilters);
    await AsyncStorage.setItem(STORAGE_KEYS.FILTERS, JSON.stringify(newFilters));
  }, []);

  const clearFilters = useCallback(async () => {
    setFilters({});
    await AsyncStorage.removeItem(STORAGE_KEYS.FILTERS);
  }, []);

  const isSaved = useCallback((propertyId: string) => savedProperties.includes(propertyId), [savedProperties]);

  const completeOnboarding = useCallback(async () => {
    setHasCompletedOnboarding(true);
    await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETE, JSON.stringify(true));
  }, []);

  const updateVerificationLevel = useCallback(async (level: VerificationLevel) => {
    setVerificationLevel(level);
    await AsyncStorage.setItem(STORAGE_KEYS.VERIFICATION_LEVEL, level);
  }, []);

  const getUserPermissions = useCallback(() => {
    return VerificationService.getUserPermissions(verificationLevel);
  }, [verificationLevel]);

  const canAccessFeature = useCallback((feature: keyof ReturnType<typeof VerificationService.getUserPermissions>) => {
    const permissions = getUserPermissions();
    return permissions[feature];
  }, [getUserPermissions]);

  const isLandlord = useMemo(() => userRole === 'landlord' || userRole === 'both', [userRole]);
  const isTenant = useMemo(() => userRole === 'tenant' || userRole === 'both', [userRole]);

  return useMemo(() => ({
    userRole,
    currentUser,
    verificationLevel,
    savedProperties,
    collections,
    vehicles,
    filters,
    isLoading,
    hasCompletedOnboarding,
    switchRole,
    updateUser,
    updateVerificationLevel,
    getUserPermissions,
    canAccessFeature,
    toggleSaveProperty,
    addToCollection,
    createCollection,
    addVehicle,
    removeVehicle,
    updateFilters,
    clearFilters,
    completeOnboarding,
    isSaved,
    isLandlord,
    isTenant,
  }), [
    userRole,
    currentUser,
    verificationLevel,
    savedProperties,
    collections,
    vehicles,
    filters,
    isLoading,
    hasCompletedOnboarding,
    switchRole,
    updateUser,
    updateVerificationLevel,
    getUserPermissions,
    canAccessFeature,
    toggleSaveProperty,
    addToCollection,
    createCollection,
    addVehicle,
    removeVehicle,
    updateFilters,
    clearFilters,
    completeOnboarding,
    isSaved,
    isLandlord,
    isTenant,
  ]);
});
