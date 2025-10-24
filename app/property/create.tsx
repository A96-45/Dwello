import React, { useState, useCallback } from 'react';
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
import { useRouter } from 'expo-router';
import { 
  ArrowLeft, 
  Camera, 
  Image as ImageIcon, 
  Plus, 
  X,
  Check
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import type { PropertyType } from '@/types';

const PROPERTY_TYPES: { value: PropertyType; label: string; icon: string }[] = [
  { value: 'single_room', label: 'Single Room', icon: '🚪' },
  { value: 'bedsitter', label: 'Bedsitter', icon: '🛏️' },
  { value: 'one_bedroom', label: '1 Bedroom', icon: '🏠' },
  { value: 'two_bedroom', label: '2 Bedroom', icon: '🏘️' },
  { value: 'three_bedroom', label: '3 Bedroom', icon: '🏡' },
  { value: 'four_plus_bedroom', label: '4+ Bedroom', icon: '🏰' },
  { value: 'studio', label: 'Studio', icon: '🏢' },
  { value: 'bungalow', label: 'Bungalow', icon: '🏰' },
];

const AMENITIES_OPTIONS = [
  { id: 'wifi', label: 'WiFi', icon: '📶' },
  { id: 'water', label: 'Water 24/7', icon: '🚰' },
  { id: 'generator', label: 'Generator', icon: '⚡' },
  { id: 'parking', label: 'Parking', icon: '🅿️' },
  { id: 'security', label: 'Security', icon: '🔒' },
  { id: 'cctv', label: 'CCTV', icon: '📹' },
  { id: 'lift', label: 'Lift', icon: '🛗' },
  { id: 'gym', label: 'Gym', icon: '💪' },
  { id: 'pool', label: 'Pool', icon: '🏊' },
  { id: 'garden', label: 'Garden', icon: '🌳' },
  { id: 'balcony', label: 'Balcony', icon: '🏞️' },
  { id: 'laundry', label: 'Laundry', icon: '🧺' },
];

const FURNISHED_OPTIONS = [
  { value: 'furnished', label: 'Fully Furnished' },
  { value: 'semi_furnished', label: 'Semi-Furnished' },
  { value: 'unfurnished', label: 'Unfurnished' },
];

export default function PropertyCreateScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [images, setImages] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    type: '' as PropertyType | '',
    price: '',
    location: '',
    area: '',
    city: '',
    bedrooms: '',
    bathrooms: '',
    size: '',
    description: '',
    amenities: [] as string[],
    furnished: '',
    petsAllowed: false,
    parking: false,
    parkingSlots: '',
    deposit: '',
    serviceCharge: '',
  });

  const totalSteps = 4;

  const handleNext = useCallback(() => {
    if (currentStep < totalSteps) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  }, [currentStep, totalSteps]);

  const handlePrevious = useCallback(() => {
    if (currentStep > 1) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep]);

  const handleImagePicker = useCallback(async () => {
    Haptics.selectionAsync();
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImages(prev => [...prev, result.assets[0].uri]);
    }
  }, []);

  const handleCameraCapture = useCallback(async () => {
    Haptics.selectionAsync();
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImages(prev => [...prev, result.assets[0].uri]);
    }
  }, []);

  const removeImage = useCallback((index: number) => {
    Haptics.selectionAsync();
    setImages(prev => prev.filter((_, i) => i !== index));
  }, []);

  const toggleAmenity = useCallback((amenityId: string) => {
    Haptics.selectionAsync();
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenityId)
        ? prev.amenities.filter(id => id !== amenityId)
        : [...prev.amenities, amenityId]
    }));
  }, []);

  const handleSubmit = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Alert.alert(
      'Property Created!',
      'Your property has been successfully listed and is now visible to tenants.',
      [{ text: 'OK', onPress: () => router.back() }]
    );
  }, [router]);

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return images.length > 0 && formData.title && formData.type;
      case 2:
        return formData.price && formData.location && formData.area && formData.city;
      case 3:
        return formData.bedrooms && formData.bathrooms && formData.size;
      case 4:
        return formData.description;
      default:
        return false;
    }
  };

  const renderStep1 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Add Photos</Text>
      <Text style={styles.stepSubtitle}>Upload at least 3 photos of your property</Text>
      
      <View style={styles.imageGrid}>
        {images.map((image, index) => (
          <View key={index} style={styles.imageContainer}>
            <ImageIcon size={40} color="#3B82F6" />
            <TouchableOpacity
              style={styles.removeImageButton}
              onPress={() => removeImage(index)}
            >
              <X size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        ))}
        
        {images.length < 10 && (
          <TouchableOpacity style={styles.addImageButton} onPress={handleImagePicker}>
            <Camera size={24} color="#3B82F6" />
            <Text style={styles.addImageText}>Add Photo</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.imageActions}>
        <TouchableOpacity style={styles.imageActionButton} onPress={handleImagePicker}>
          <ImageIcon size={20} color="#3B82F6" />
          <Text style={styles.imageActionText}>Gallery</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.imageActionButton} onPress={handleCameraCapture}>
          <Camera size={20} color="#3B82F6" />
          <Text style={styles.imageActionText}>Camera</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.formSection}>
        <Text style={styles.sectionTitle}>Basic Information</Text>
        <TextInput
          style={styles.input}
          placeholder="Property title (e.g., Modern 2BR Apartment)"
          value={formData.title}
          onChangeText={(text) => setFormData(prev => ({ ...prev, title: text }))}
        />
        
        <Text style={styles.fieldLabel}>Property Type</Text>
        <View style={styles.typeGrid}>
          {PROPERTY_TYPES.map((type) => (
            <TouchableOpacity
              key={type.value}
              style={[
                styles.typeOption,
                formData.type === type.value && styles.typeOptionSelected
              ]}
              onPress={() => setFormData(prev => ({ ...prev, type: type.value }))}
            >
              <Text style={styles.typeIcon}>{type.icon}</Text>
              <Text style={[
                styles.typeLabel,
                formData.type === type.value && styles.typeLabelSelected
              ]}>
                {type.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Location & Pricing</Text>
      <Text style={styles.stepSubtitle}>Set your property location and rental price</Text>
      
      <View style={styles.formSection}>
        <Text style={styles.fieldLabel}>Location Details</Text>
        <TextInput
          style={styles.input}
          placeholder="Area (e.g., Westlands)"
          value={formData.area}
          onChangeText={(text) => setFormData(prev => ({ ...prev, area: text }))}
        />
        <TextInput
          style={styles.input}
          placeholder="Location (e.g., Rhapta Road)"
          value={formData.location}
          onChangeText={(text) => setFormData(prev => ({ ...prev, location: text }))}
        />
        <TextInput
          style={styles.input}
          placeholder="City (e.g., Nairobi)"
          value={formData.city}
          onChangeText={(text) => setFormData(prev => ({ ...prev, city: text }))}
        />
      </View>

      <View style={styles.formSection}>
        <Text style={styles.fieldLabel}>Pricing</Text>
        <View style={styles.priceRow}>
          <Text style={styles.currencySymbol}>KES</Text>
          <TextInput
            style={[styles.input, styles.priceInput]}
            placeholder="0"
            value={formData.price}
            onChangeText={(text) => setFormData(prev => ({ ...prev, price: text }))}
            keyboardType="numeric"
          />
          <Text style={styles.priceLabel}>/month</Text>
        </View>
        
        <TextInput
          style={styles.input}
          placeholder="Security deposit (optional)"
          value={formData.deposit}
          onChangeText={(text) => setFormData(prev => ({ ...prev, deposit: text }))}
          keyboardType="numeric"
        />
        <TextInput
          style={styles.input}
          placeholder="Service charge (optional)"
          value={formData.serviceCharge}
          onChangeText={(text) => setFormData(prev => ({ ...prev, serviceCharge: text }))}
          keyboardType="numeric"
        />
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Property Details</Text>
      <Text style={styles.stepSubtitle}>Specify bedrooms, bathrooms, and amenities</Text>
      
      <View style={styles.formSection}>
        <Text style={styles.fieldLabel}>Property Specifications</Text>
        <View style={styles.specsRow}>
          <View style={styles.specInput}>
            <Text style={styles.specLabel}>Bedrooms</Text>
            <TextInput
              style={styles.specTextInput}
              placeholder="0"
              value={formData.bedrooms}
              onChangeText={(text) => setFormData(prev => ({ ...prev, bedrooms: text }))}
              keyboardType="numeric"
            />
          </View>
          <View style={styles.specInput}>
            <Text style={styles.specLabel}>Bathrooms</Text>
            <TextInput
              style={styles.specTextInput}
              placeholder="0"
              value={formData.bathrooms}
              onChangeText={(text) => setFormData(prev => ({ ...prev, bathrooms: text }))}
              keyboardType="numeric"
            />
          </View>
          <View style={styles.specInput}>
            <Text style={styles.specLabel}>Size (m²)</Text>
            <TextInput
              style={styles.specTextInput}
              placeholder="0"
              value={formData.size}
              onChangeText={(text) => setFormData(prev => ({ ...prev, size: text }))}
              keyboardType="numeric"
            />
          </View>
        </View>
      </View>

      <View style={styles.formSection}>
        <Text style={styles.fieldLabel}>Furnishing</Text>
        <View style={styles.furnishedOptions}>
          {FURNISHED_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.furnishedOption,
                formData.furnished === option.value && styles.furnishedOptionSelected
              ]}
              onPress={() => setFormData(prev => ({ ...prev, furnished: option.value }))}
            >
              <Text style={[
                styles.furnishedText,
                formData.furnished === option.value && styles.furnishedTextSelected
              ]}>
                {option.label}
              </Text>
              {formData.furnished === option.value && (
                <Check size={16} color="#3B82F6" />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.formSection}>
        <Text style={styles.fieldLabel}>Amenities</Text>
        <View style={styles.amenitiesGrid}>
          {AMENITIES_OPTIONS.map((amenity) => (
            <TouchableOpacity
              key={amenity.id}
              style={[
                styles.amenityOption,
                formData.amenities.includes(amenity.id) && styles.amenityOptionSelected
              ]}
              onPress={() => toggleAmenity(amenity.id)}
            >
              <Text style={styles.amenityIcon}>{amenity.icon}</Text>
              <Text style={[
                styles.amenityLabel,
                formData.amenities.includes(amenity.id) && styles.amenityLabelSelected
              ]}>
                {amenity.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  const renderStep4 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Description & Rules</Text>
      <Text style={styles.stepSubtitle}>Add a detailed description and property rules</Text>
      
      <View style={styles.formSection}>
        <Text style={styles.fieldLabel}>Property Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Describe your property in detail. Include unique features, nearby amenities, and what makes it special..."
          value={formData.description}
          onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
          multiline
          numberOfLines={6}
          textAlignVertical="top"
        />
      </View>

      <View style={styles.formSection}>
        <Text style={styles.fieldLabel}>Property Rules</Text>
        <TouchableOpacity
          style={[
            styles.ruleOption,
            formData.petsAllowed && styles.ruleOptionSelected
          ]}
          onPress={() => setFormData(prev => ({ ...prev, petsAllowed: !prev.petsAllowed }))}
        >
          <Text style={[
            styles.ruleText,
            formData.petsAllowed && styles.ruleTextSelected
          ]}>
            🐕 Pets Allowed
          </Text>
          {formData.petsAllowed && <Check size={16} color="#3B82F6" />}
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.ruleOption,
            formData.parking && styles.ruleOptionSelected
          ]}
          onPress={() => setFormData(prev => ({ ...prev, parking: !prev.parking }))}
        >
          <Text style={[
            styles.ruleText,
            formData.parking && styles.ruleTextSelected
          ]}>
            🅿️ Parking Available
          </Text>
          {formData.parking && <Check size={16} color="#3B82F6" />}
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.title}>Create Listing</Text>
        <View style={styles.stepIndicator}>
          <Text style={styles.stepText}>{currentStep} of {totalSteps}</Text>
        </View>
      </View>

      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${(currentStep / totalSteps) * 100}%` }]} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
        {currentStep === 4 && renderStep4()}
      </ScrollView>

      <View style={styles.footer}>
        {currentStep > 1 && (
          <TouchableOpacity style={styles.previousButton} onPress={handlePrevious}>
            <Text style={styles.previousButtonText}>Previous</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.nextButton, !canProceed() && styles.nextButtonDisabled]}
          onPress={handleNext}
          disabled={!canProceed()}
        >
          <Text style={[styles.nextButtonText, !canProceed() && styles.nextButtonTextDisabled]}>
            {currentStep === totalSteps ? 'Create Listing' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 4,
    marginRight: 12,
  },
  title: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  stepIndicator: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  stepText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E5E7EB',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
  },
  content: {
    flex: 1,
  },
  stepContent: {
    padding: 20,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 24,
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  imageContainer: {
    width: 80,
    height: 80,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  removeImageButton: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addImageButton: {
    width: 80,
    height: 80,
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#BFDBFE',
    borderStyle: 'dashed',
    gap: 4,
  },
  addImageText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3B82F6',
  },
  imageActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  imageActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  imageActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
  },
  formSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
    marginBottom: 12,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  typeOption: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    minWidth: 80,
  },
  typeOptionSelected: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
  },
  typeIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  typeLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
  },
  typeLabelSelected: {
    color: '#3B82F6',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    marginBottom: 12,
  },
  currencySymbol: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
    paddingHorizontal: 16,
  },
  priceInput: {
    flex: 1,
    borderWidth: 0,
    marginBottom: 0,
  },
  priceLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
    paddingHorizontal: 16,
  },
  specsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  specInput: {
    flex: 1,
  },
  specLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
  },
  specTextInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
    textAlign: 'center',
  },
  furnishedOptions: {
    gap: 8,
  },
  furnishedOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  furnishedOptionSelected: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
  },
  furnishedText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  furnishedTextSelected: {
    color: '#3B82F6',
    fontWeight: '600',
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  amenityOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
  },
  amenityOptionSelected: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
  },
  amenityIcon: {
    fontSize: 16,
  },
  amenityLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  amenityLabelSelected: {
    color: '#3B82F6',
    fontWeight: '600',
  },
  ruleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
  },
  ruleOptionSelected: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
  },
  ruleText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  ruleTextSelected: {
    color: '#3B82F6',
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 12,
  },
  previousButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  previousButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  nextButton: {
    flex: 2,
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  nextButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  nextButtonTextDisabled: {
    color: '#9CA3AF',
  },
});
