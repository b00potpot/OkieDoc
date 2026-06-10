import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Checkbox from 'expo-checkbox'; // Assuming expo-checkbox usage

export default function TriageHeader({ patientName, inquiryChecked, setInquiryChecked, incompleteChecked, setIncompleteChecked }) {
  const canClose = inquiryChecked || incompleteChecked;

  return (
    <View style={styles.header}>
      <Text style={styles.name}>{patientName}</Text>
      <View style={styles.controls}>
        <View style={styles.checkboxGroup}>
          <Checkbox value={inquiryChecked} onValueChange={setInquiryChecked} />
          <Text style={styles.label}>Inquiry</Text>
        </View>
        <View style={styles.checkboxGroup}>
          <Checkbox value={incompleteChecked} onValueChange={setIncompleteChecked} />
          <Text style={styles.label}>Incomplete</Text>
        </View>
        <TouchableOpacity style={[styles.btn, !canClose && styles.disabled]} disabled={!canClose}>
          <Text style={styles.btnText}>Close Ticket</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnTransfer}>
          <Text style={styles.btnText}>Transfer</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#e5e7eb' },
  name: { fontSize: 18, fontWeight: '700' },
  controls: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  checkboxGroup: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  btn: { padding: 8, backgroundColor: '#2563eb', borderRadius: 6 },
  disabled: { backgroundColor: '#9ca3af' },
  btnTransfer: { padding: 8, backgroundColor: '#f59e0b', borderRadius: 6 },
  btnText: { color: '#fff', fontSize: 12, fontWeight: '600' }
});