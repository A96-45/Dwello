import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { ArrowLeft, Save, Info } from 'lucide-react-native';
import { MOCK_PROPERTIES } from '@/mocks/properties';

export default function EditPropertyScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();

  const property = useMemo(() => MOCK_PROPERTIES.find(p => p.id === params.id), [params.id]);

  const handleSave = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert('Saved', 'Property details saved (mock).');
    router.back();
  };

  if (!property) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}> 
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.title}>Edit Property</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.empty}> 
          <Info size={48} color="#9CA3AF" />
          <Text style={styles.emptyTitle}>Property not found</Text>
          <Text style={styles.emptySubtitle}>The property ID "{params.id}" is invalid.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}> 
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.title}>Edit Property</Text>
        <TouchableOpacity onPress={handleSave}>
          <Save size={24} color="#3B82F6" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.label}>Title</Text>
          <TextInput defaultValue={property.title} style={styles.input} />
        </View>
        <View style={styles.section}>
          <Text style={styles.label}>Price (KES)</Text>
          <TextInput defaultValue={String(property.price)} keyboardType="number-pad" style={styles.input} />
        </View>
        <View style={styles.section}>
          <Text style={styles.label}>Location</Text>
          <TextInput defaultValue={property.location} style={styles.input} />
        </View>
        <View style={styles.section}>
          <Text style={styles.label}>Area</Text>
          <TextInput defaultValue={property.area} style={styles.input} />
        </View>
        <View style={styles.section}>
          <Text style={styles.label}>City</Text>
          <TextInput defaultValue={property.city} style={styles.input} />
        </View>

        <View style={{ height: 80 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16,
    backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5E7EB',
  },
  backButton: { padding: 4, marginRight: 12 },
  title: { flex: 1, fontSize: 20, fontWeight: '700', color: '#111827' },
  content: { flex: 1 },
  section: { padding: 20, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  label: { fontSize: 13, color: '#6B7280', marginBottom: 8 },
  input: {
    backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12,
    paddingHorizontal: 12, paddingVertical: 12, fontSize: 16, color: '#111827',
  },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8, padding: 24 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
  emptySubtitle: { fontSize: 14, color: '#6B7280', textAlign: 'center' },
});
