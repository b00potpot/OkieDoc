import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const STATUSES = {
  waiting: { label: 'Waiting', color: '#6b7280', icon: 'schedule' },
  inTriage: { label: 'In Triage', color: '#2563eb', icon: 'assignment' },
  ready: { label: 'Ready for Doctor', color: '#059669', icon: 'check-circle' },
  urgent: { label: 'Urgent', color: '#d97706', icon: 'warning' },
  completed: { label: 'Completed', color: '#7c3aed', icon: 'task-alt' },
};

export default function TriageStatusDropdown({ status, onSelect }) {
  const current = STATUSES[status];
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', padding: 10 }}>
      <MaterialIcons name={current.icon} size={20} color={current.color} />
      <Text style={{ marginLeft: 8, color: current.color, fontWeight: '700' }}>{current.label}</Text>
    </View>
  );
}