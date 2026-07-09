import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';

export default function MedicalHistoryTab({ patient }) {
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (patient?.id) {
      fetchMedicalHistory();
    }
  }, [patient?.id]);

  const fetchMedicalHistory = async () => {
    try {
      setLoading(true);
      // Ensure your backend endpoint matches your Sails.js routes
      const response = await fetch(`/api/patients/${patient.id}/medical-history`);
      
      if (!response.ok) throw new Error('Failed to fetch records');
      
      const data = await response.json();
      setHistory(data);
    } catch (err) {
      console.error("Error loading medical history:", err);
      setError("Unable to load history.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <ActivityIndicator style={styles.center} size="large" />;
  if (error) return <Text style={styles.errorText}>{error}</Text>;
  if (!history) return <Text style={styles.emptyText}>No medical records found.</Text>;

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.cardBody}>
        <Text style={styles.sectionTitle}>Comprehensive Health Profile</Text>

        <Text style={styles.subHeader}>Active Diseases</Text>
        <View style={styles.tagRow}>
          {history.activeDiseases?.length > 0 ? history.activeDiseases.map((item, index) => (
            <View key={index} style={styles.grayTag}><Text style={styles.grayTagText}>{item}</Text></View>
          )) : <Text style={styles.emptyText}>None reported</Text>}
        </View>

        <Text style={styles.subHeader}>Known Allergies</Text>
        <View style={styles.tagRow}>
          {history.allergies?.length > 0 ? history.allergies.map((allergy, index) => (
            <View key={index} style={styles.redTag}><Text style={styles.redTagText}>{allergy}</Text></View>
          )) : <Text style={styles.emptyText}>No known allergies</Text>}
        </View>

        <Text style={styles.subHeader}>Past Diseases & Surgeries</Text>
        {history.pastDiseases?.length > 0 ? history.pastDiseases.map((item, index) => (
          <Text key={index} style={styles.bulletText}>• {item}</Text>
        )) : <Text style={styles.emptyText}>None reported</Text>}

        <Text style={styles.subHeader}>Family History</Text>
        <Text style={styles.textBlock}>{history.familyHistory || "No significant family history."}</Text>

        <Text style={styles.subHeader}>Social History</Text>
        <Text style={styles.textBlock}>{history.socialHistory || "No social history reported."}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { marginTop: 40 },
  cardBody: { backgroundColor: "#f9fafb", borderRadius: 8, padding: 18, borderWidth: 1, borderColor: "#e5e7eb" },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: "#111827", marginBottom: 16 },
  subHeader: { fontSize: 13, fontWeight: "700", color: "#4b5563", marginTop: 16, marginBottom: 8, textTransform: 'uppercase' },
  tagRow: { flexDirection: "row", flexWrap: 'wrap', gap: 8 },
  redTag: { backgroundColor: "#fee2e2", paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6 },
  redTagText: { fontSize: 13, color: "#dc2626", fontWeight: "600" },
  grayTag: { backgroundColor: "#e5e7eb", paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6 },
  grayTagText: { fontSize: 13, color: "#374151", fontWeight: "600" },
  bulletText: { fontSize: 14, color: "#374151", marginVertical: 2, paddingLeft: 4 },
  textBlock: { fontSize: 14, color: "#4b5563", lineHeight: 20 },
  emptyText: { fontSize: 13, color: "#9ca3af", fontStyle: "italic" },
  errorText: { textAlign: 'center', marginTop: 20, color: 'red' }
});