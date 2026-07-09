// /components/triage/ROSSection.js
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const ROS_CATEGORIES = {
  general: ["Fever", "Fatigue", "Weight Loss"],
  respiratory: ["Cough", "Shortness of Breath", "Wheezing"],
  cardiovascular: ["Chest Pain", "Palpitations"],
  gastrointestinal: ["Nausea", "Vomiting", "Diarrhea", "Constipation", "Abdominal Pain"],
  neurological: ["Dizziness", "Headache", "Numbness", "Weakness"],
};

export default function ROSSection() {
  // Local state initialized with the requested object structure
  const [ros, setRos] = useState({
    general: [],
    respiratory: [],
    cardiovascular: [],
    gastrointestinal: [],
    neurological: []
  });

  // Toggle logic for specific category arrays
  const toggleRosItem = (category, item) => {
    setRos((prev) => {
      const categoryArray = prev[category];
      const isSelected = categoryArray.includes(item);
      
      return {
        ...prev,
        [category]: isSelected
          ? categoryArray.filter((i) => i !== item)
          : [...categoryArray, item]
      };
    });
  };

  // Calculate total symptoms across all categories
  const totalSymptoms = Object.values(ros).reduce((sum, categoryArray) => sum + categoryArray.length, 0);

  return (
    <View style={styles.container}>
      <Text style={styles.sectionHeader}>Review of Systems (ROS)</Text>
      
      {Object.entries(ROS_CATEGORIES).map(([categoryKey, items]) => (
        <View key={categoryKey} style={styles.categoryBox}>
          {/* Format key for display (e.g., 'gastrointestinal' -> 'Gastrointestinal') */}
          <Text style={styles.categoryTitle}>
            {categoryKey.charAt(0).toUpperCase() + categoryKey.slice(1)}
          </Text>
          
          <View style={styles.checkboxGrid}>
            {items.map((item) => {
              const isChecked = ros[categoryKey].includes(item);
              return (
                <View key={item} style={styles.gridItem}>
                  <TouchableOpacity 
                    style={styles.checkboxContainer} 
                    onPress={() => toggleRosItem(categoryKey, item)}
                  >
                    <MaterialIcons
                      name={isChecked ? "check-box" : "check-box-outline-blank"}
                      size={20}
                      color={isChecked ? "#2563eb" : "#9ca3af"}
                    />
                    <Text style={styles.checkboxLabel}>{item}</Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        </View>
      ))}

      {/* Bottom Counter */}
      <View style={styles.counterContainer}>
        <Text style={styles.counterText}>
          Total ROS Symptoms Noted: <Text style={styles.counterValue}>{totalSymptoms}</Text>
        </Text>
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
  categoryBox: {
    marginVertical: 8,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingTop: 8,
  },
  categoryTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#2563eb",
    marginBottom: 6,
  },
  checkboxGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 6,
  },
  gridItem: {
    width: '33%', 
    marginBottom: 8,
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
  counterContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    alignItems: "flex-end",
  },
  counterText: {
    fontSize: 13,
    color: "#4b5563",
    fontWeight: "500",
  },
  counterValue: {
    color: "#1d4ed8",
    fontWeight: "bold",
    fontSize: 14,
  }
});