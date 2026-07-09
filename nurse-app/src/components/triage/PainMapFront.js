// /components/triage/PainMapFront.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function PainMapFront({ selectedParts, onToggle }) {
  const isSelected = (part) => selectedParts.includes(part);

  const renderPart = (partId, label, customStyles) => {
    const active = isSelected(partId);
    return (
      <TouchableOpacity
        style={[styles.bodyPart, customStyles, active && styles.bodyPartActive]}
        onPress={() => onToggle(partId)}
      >
        <Text style={[styles.partLabel, active && styles.partLabelActive]}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.humanoidContainer}>
      {/* Head */}
      <View style={styles.rowCenter}>
        {renderPart('head', 'Head', styles.head)}
      </View>

      {/* Torso & Arms */}
      {/* Note: Patient facing us, so their Right is on our Left */}
      <View style={styles.row}>
        {renderPart('right arm', 'R Arm', styles.arm)}
        <View style={styles.torso}>
          {renderPart('chest', 'Chest', styles.chest)}
          {renderPart('abdomen', 'Abdomen', styles.abdomen)}
        </View>
        {renderPart('left arm', 'L Arm', styles.arm)}
      </View>

      {/* Legs */}
      <View style={styles.row}>
        {renderPart('right leg', 'R Leg', styles.leg)}
        <View style={styles.legSpacer} />
        {renderPart('left leg', 'L Leg', styles.leg)}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  humanoidContainer: {
    width: 240,
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 8,
  },
  rowCenter: {
    alignItems: 'center',
    marginBottom: 8,
  },
  bodyPart: {
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#d1d5db',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  bodyPartActive: {
    backgroundColor: '#dbeafe',
    borderColor: '#3b82f6',
  },
  partLabel: {
    fontSize: 10,
    color: '#4b5563',
    fontWeight: '500',
    textAlign: 'center',
  },
  partLabelActive: {
    color: '#1d4ed8',
    fontWeight: '700',
  },
  head: { width: 50, height: 50, borderRadius: 25 },
  torso: { width: 80, marginHorizontal: 8 },
  chest: { width: '100%', height: 60, marginBottom: 8 },
  abdomen: { width: '100%', height: 60 },
  arm: { width: 40, height: 100 },
  leg: { width: 45, height: 110 },
  legSpacer: { width: 10 }, // Gap between legs
});