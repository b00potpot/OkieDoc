// /components/triage/SymptomSelector.js
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

// Standard symptom list from the triage workspace 
const SYMPTOMS_LIST = [
  "Fever", "Cough", "Headache", "Sore throat", "Body pain", 
  "Nausea", "Dizziness", "Fatigue", "Shortness of breath", "Chest pain"
];

export default function SymptomSelector() {
  // Local state for tracking selected symptoms
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);

  // Toggle logic for adding/removing symptoms
  const toggleSymptom = (symptom) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptom)
        ? prev.filter((s) => s !== symptom)
        : [...prev, symptom]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionHeader}>Associated Symptoms</Text>
      
      <View style={styles.checkboxGrid}>
        {SYMPTOMS_LIST.map((symptom) => {
          const isChecked = selectedSymptoms.includes(symptom);
          
          return (
            <View key={symptom} style={styles.gridItem}>
              <TouchableOpacity 
                style={styles.checkboxContainer} 
                onPress={() => toggleSymptom(symptom)}
              >
                <MaterialIcons
                  name={isChecked ? "check-box" : "check-box-outline-blank"}
                  size={20}
                  color={isChecked ? "#2563eb" : "#9ca3af"}
                />
                <Text style={styles.checkboxLabel}>{symptom}</Text>
              </TouchableOpacity>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    padding: 14,
    marginBottom: 16,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 12,
  },
  checkboxGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 10,
  },
  gridItem: {
    width: '33%', // Creates a 3-column layout matching the nurse dashboard [cite: 835]
    marginBottom: 10,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  checkboxLabel: {
    fontSize: 13,
    color: "#374151",
  },
});