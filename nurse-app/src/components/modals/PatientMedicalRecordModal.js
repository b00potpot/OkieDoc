import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import MedicalHistoryTab from '../medicalrecords/MedicalHistoryTab';
import PastConsultationsTab from '../medicalrecords/PastConsultationsTab';
import AuditTrailTab from '../medicalrecords/AuditTrailTab';

export default function PatientMedicalRecordModal({ visible, onClose, patient }) {
  const [activeTab, setActiveTab] = useState('Medical History');

  if (!patient) return null;

  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
      <View style={styles.modalCenteredView}>
        <View style={styles.modalView}>
          
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.patientName}>{patient.name || patient.fullName}</Text>
              <Text style={styles.patientSub}>Patient Medical Record</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeIcon}>
              <MaterialIcons name="close" size={24} color="#374151" />
            </TouchableOpacity>
          </View>

          {/* Tab Navigation */}
          <View style={styles.modalTabsRow}>
            {['Medical History', 'Past Consultations', 'Audit Trail'].map((tab) => (
              <TouchableOpacity 
                key={tab}
                style={[styles.modalTabButton, activeTab === tab && styles.modalTabButtonActive]} 
                onPress={() => setActiveTab(tab)}
              >
                <Text style={[styles.modalTabButtonText, activeTab === tab && styles.modalTabButtonTextActive]}>
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Tab Content */}
          <View style={styles.modalContentBody}>
            {activeTab === 'Medical History' && <MedicalHistoryTab patient={patient} />}
            {activeTab === 'Past Consultations' && <PastConsultationsTab patient={patient} />}
            {activeTab === 'Audit Trail' && <AuditTrailTab patient={patient} />}
          </View>
          
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalCenteredView: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)", padding: 20 },
  modalView: { width: "100%", maxWidth: 800, backgroundColor: "white", borderRadius: 12, padding: 20, maxHeight: "90%" },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  patientName: { fontSize: 22, fontWeight: '700', color: '#111827' },
  patientSub: { fontSize: 14, color: '#6b7280', marginTop: 4 },
  closeIcon: { padding: 4, backgroundColor: '#f3f4f6', borderRadius: 20 },
  modalTabsRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#e5e7eb", paddingBottom: 0 },
  modalTabButton: { paddingVertical: 12, paddingHorizontal: 16, borderBottomWidth: 2, borderBottomColor: "transparent" },
  modalTabButtonActive: { borderBottomColor: "#2563eb" },
  modalTabButtonText: { fontSize: 14, color: "#6b7280", fontWeight: "500" },
  modalTabButtonTextActive: { color: "#2563eb", fontWeight: "700" },
  modalContentBody: { flex: 1, marginTop: 15 }
});