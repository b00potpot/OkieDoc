// /components/triage/UrgencySelector.js
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

// Configuration map for urgency levels
const URGENCY_CONFIG = {
  low: {
    label: "Low",
    bg: "#f0fdf4",
    border: "#bbf7d0",
    text: "#16a34a",
    icon: "arrow-downward"
  },
  normal: {
    label: "Normal",
    bg: "#f8fafc",
    border: "#cbd5e1",
    text: "#475569",
    icon: "remove" // horizontal dash
  },
  urgent: {
    label: "Urgent",
    bg: "#fef9c3",
    border: "#fde047",
    text: "#ca8a04",
    icon: "warning"
  },
  critical: {
    label: "Critical",
    bg: "#fef2f2",
    border: "#fecaca",
    text: "#dc2626",
    icon: "error"
  }
};

export default function UrgencySelector() {
  const [selectedUrgency, setSelectedUrgency] = useState("normal"); // Default to normal

  return (
    <View style={styles.container}>
      <Text style={styles.sectionHeader}>Triage Urgency Level</Text>
      
      <View style={styles.selectorRow}>
        {Object.keys(URGENCY_CONFIG).map((levelKey) => {
          const config = URGENCY_CONFIG[levelKey];
          const isSelected = selectedUrgency === levelKey;
          
          return (
            <TouchableOpacity
              key={levelKey}
              onPress={() => setSelectedUrgency(levelKey)}
              style={[
                styles.urgencyCard,
                { 
                  backgroundColor: isSelected ? config.bg : "#ffffff",
                  borderColor: isSelected ? config.border : "#e5e7eb"
                },
                isSelected && styles.cardElevated
              ]}
            >
              <MaterialIcons 
                name={config.icon} 
                size={22} 
                color={isSelected ? config.text : "#9ca3af"} 
                style={styles.icon}
              />
              <Text 
                style={[
                  styles.urgencyLabel, 
                  { color: isSelected ? config.text : "#6b7280" },
                  isSelected && styles.boldText
                ]}
              >
                {config.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#ffffff",
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
  selectorRow: {
    flexDirection: "row",
    gap: 10,
    justifyContent: "space-between",
  },
  urgencyCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  cardElevated: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  icon: {
    marginBottom: 4,
  },
  urgencyLabel: {
    fontSize: 13,
    fontWeight: "500",
  },
  boldText: {
    fontWeight: "700",
  }
});