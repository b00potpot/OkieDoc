import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const PRESET_DISEASES = [
  "Hypertension",
  "Diabetes",
  "Asthma",
  "Heart Disease",
  "Kidney Disease",
  "Thyroid Disorder",
  "Cancer",
  "Arthritis"
];

export default function DiseaseQuickAdd({ selectedDiseases = [], onToggleDisease }) {
  return (
    <View style={styles.container}>
      {PRESET_DISEASES.map((disease) => {
        const isActive = selectedDiseases.includes(disease);
        
        return (
          <TouchableOpacity
            key={disease}
            style={[styles.chip, isActive && styles.chipActive]}
            onPress={() => onToggleDisease(disease)}
            activeOpacity={0.7}
          >
            <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
              {isActive ? `✓ ${disease}` : `+ ${disease}`}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 8,
    marginBottom: 16,
  },
  chip: {
    backgroundColor: '#f3f4f6', 
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999, 
    borderWidth: 1,
    borderColor: '#e5e7eb', 
  },
  chipActive: {
    backgroundColor: '#eff6ff', 
    borderColor: '#2563eb', 
  },
  chipText: {
    fontSize: 13,
    color: '#4b5563', 
    fontWeight: '500',
  },
  chipTextActive: {
    color: '#2563eb',
    fontWeight: '700',
  }
});