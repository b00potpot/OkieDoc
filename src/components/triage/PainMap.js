// /components/triage/PainMap.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import PainMapFront from './PainMapFront';
import PainMapBack from './PainMapBack';

export default function PainMap() {
  // Local state for tracking selected body parts
  const [selectedParts, setSelectedParts] = useState([]);
  const [viewFront, setViewFront] = useState(true);

  // Toggle logic for adding/removing a body part from the array
  const togglePart = (part) => {
    setSelectedParts((prev) =>
      prev.includes(part)
        ? prev.filter((p) => p !== part)
        : [...prev, part]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionHeader}>Pain Map</Text>
      
      {/* View Toggle (Front / Back) */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity 
          style={[styles.toggleButton, viewFront && styles.activeToggle]}
          onPress={() => setViewFront(true)}
        >
          <Text style={[styles.toggleText, viewFront && styles.activeToggleText]}>Front</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.toggleButton, !viewFront && styles.activeToggle]}
          onPress={() => setViewFront(false)}
        >
          <Text style={[styles.toggleText, !viewFront && styles.activeToggleText]}>Back</Text>
        </TouchableOpacity>
      </View>

      {/* Body Map Area */}
      <View style={styles.mapContainer}>
        {viewFront ? (
          <PainMapFront selectedParts={selectedParts} onToggle={togglePart} />
        ) : (
          <PainMapBack selectedParts={selectedParts} onToggle={togglePart} />
        )}
      </View>
      
      {/* Selection Summary */}
      <View style={styles.summaryContainer}>
        <Text style={styles.summaryText}>
          Selected: {selectedParts.length > 0 ? selectedParts.join(', ') : 'None'}
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
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#e5e7eb',
    borderRadius: 8,
    padding: 4,
    marginBottom: 16,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeToggle: {
    backgroundColor: '#ffffff',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleText: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '500',
  },
  activeToggleText: {
    color: '#2563eb',
    fontWeight: '600',
  },
  mapContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  summaryContainer: {
    marginTop: 16,
    padding: 10,
    backgroundColor: '#eff6ff',
    borderRadius: 6,
  },
  summaryText: {
    fontSize: 12,
    color: '#1e3a8a',
    textTransform: 'capitalize',
  }
});