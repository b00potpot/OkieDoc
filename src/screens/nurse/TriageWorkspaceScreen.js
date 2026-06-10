// /components/nurse/PatientSnapshotCard.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import NotificationBadge from '../common/NotificationBadge';

export default function PatientSnapshotCard({ patient, onViewMedicalHistory, onOpenTriageWorkspace }) {
  // Fallbacks for mock data mapping
  const allergies = patient.allergies || ["Penicillin"];
  const consultationCount = patient.consultationCount || 3;

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      {/* Profile Header */}
      <View style={styles.snapshotProfile}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>
            {patient.name.split(" ").map(n => n[0]).join("")}
          </Text>
        </View>
        <Text style={styles.snapshotName}>{patient.name}</Text>
        <Text style={styles.snapshotSub}>{patient.age} years • {patient.gender}</Text>
      </View>

      {/* Quick Info Grid */}
      <View style={styles.snapshotInfoBlock}>
        <View style={styles.snapRow}>
          <MaterialIcons name="phone" size={16} color="#6b7280" style={{ width: 20 }} />
          <Text style={styles.snapText}>{patient.contact}</Text>
        </View>
        <View style={styles.snapRow}>
          <MaterialCommunityIcons name="blood-bag" size={16} color="#6b7280" style={{ width: 20 }} />
          <Text style={styles.snapText}>Blood Type {patient.bloodType || "O+"}</Text>
        </View>
        <View style={styles.snapRow}>
          <MaterialIcons name="email" size={16} color="#6b7280" style={{ width: 20 }} />
          <Text style={styles.snapText}>{patient.email}</Text>
        </View>
      </View>

      {/* Allergies Section */}
      <View style={styles.snapshotSectionBlock}>
        <Text style={styles.snapshotSectionTitle}>ALLERGIES</Text>
        <View style={styles.tagRow}>
          {allergies.map(allergy => (
            <View key={allergy} style={styles.redTag}>
              <Text style={styles.redTagText}>{allergy}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* History Summary */}
      <View style={styles.snapshotSectionBlock}>
        <Text style={styles.snapshotSectionTitle}>MEDICAL HISTORY SUMMARY</Text>
        <Text style={styles.bulletText}>• Hypertension History Profile</Text>
        <Text style={styles.bulletText}>• Prior Outpatient Clinical Evaluation</Text>
        <Text style={styles.lastVisitText}>Last visit: {patient.lastVisit || "February 15, 2026"}</Text>
      </View>

      {/* Action Links */}
      <View style={styles.snapshotSectionBlock}>
        <TouchableOpacity style={styles.linkButton} onPress={onViewMedicalHistory}>
          <MaterialIcons name="assignment" size={18} color="#2563eb" />
          <Text style={styles.linkButtonText}>View Full Medical History</Text>
          <NotificationBadge count={consultationCount} />
        </TouchableOpacity>
      </View>

      {/* Launch Triage Workspace */}
      <TouchableOpacity style={styles.triageLaunchButton} onPress={onOpenTriageWorkspace}>
        <MaterialCommunityIcons name="clipboard-pulse-outline" size={20} color="white" />
        <Text style={styles.triageLaunchText}>Open Triage Workspace</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  snapshotProfile: { alignItems: "center", marginVertical: 15 },
  avatarCircle: { width: 60, height: 60, borderRadius: 30, backgroundColor: "#e0f2fe", justifyContent: "center", alignItems: "center", marginBottom: 8 },
  avatarText: { fontSize: 18, fontWeight: "700", color: "#0369a1" },
  snapshotName: { fontSize: 18, fontWeight: "700", color: "#111827" },
  snapshotSub: { fontSize: 13, color: "#6b7280" },
  snapshotInfoBlock: { backgroundColor: "#f9fafb", borderRadius: 8, padding: 12, gap: 10, marginVertical: 15 },
  snapRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  snapText: { fontSize: 13, color: "#374151", flex: 1 },
  snapshotSectionBlock: { marginVertical: 12 },
  snapshotSectionTitle: { fontSize: 11, fontWeight: "700", color: "#9ca3af", letterSpacing: 0.5, marginBottom: 8 },
  tagRow: { flexDirection: "row", flexWrap: 'wrap', gap: 6, marginTop: 6 },
  redTag: { backgroundColor: "#fee2e2", paddingVertical: 4, paddingHorizontal: 8, borderRadius: 4 },
  redTagText: { fontSize: 12, color: "#dc2626", fontWeight: "500" },
  bulletText: { fontSize: 13, color: "#4b5563", marginVertical: 2, paddingLeft: 4 },
  lastVisitText: { fontSize: 12, color: "#9ca3af", fontStyle: "italic", marginTop: 4 },
  linkButton: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 12, backgroundColor: "#eff6ff", borderRadius: 8, paddingHorizontal: 12 },
  linkButtonText: { fontSize: 13, color: "#2563eb", fontWeight: "600" },
  triageLaunchButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: "#2563eb", paddingVertical: 14, borderRadius: 8, marginTop: 20 },
  triageLaunchText: { color: "white", fontWeight: "700", fontSize: 15 }
});