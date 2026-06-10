import React, { useState, useMemo, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Text, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';


// Services
import api from '../../services/api'; // Ensure this path matches your api.js location


// Reusable Components
import PatientQueueCard from '../../components/nurse/PatientQueueCard';
import QueueFilterTabs from '../../components/nurse/QueueFilterTabs';
import PatientSnapshotCard from '../../components/nurse/PatientSnapshotCard';
import PatientMedicalRecordModal from '../../components/modals/PatientMedicalRecordModal';
import NotificationBadge from '../../components/common/NotificationBadge';
import StatCard from '../../components/common/StatCard';
import ActionButton from '../../components/common/ActionButton';
import EmptyState from '../../components/common/EmptyState';


export default function NurseDashboardScreen() {
  // State
  const [patientsList, setPatientsList] = useState([]); // Initialized as empty array
  const [isLoading, setIsLoading] = useState(true); // Added loading state
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [filter, setFilter] = useState("all");
  const [isModalVisible, setIsModalVisible] = useState(false);


  // Fetch Data on Mount
  useEffect(() => {
    fetchQueueData();
  }, []);


  const fetchQueueData = async () => {
    setIsLoading(true);
    try {
      // Fetch both pending consultations and callbacks concurrently
      const [consultsRes, callbacksRes] = await Promise.all([
        api.get('/consultations/pending'),
        api.get('/callbacks')
      ]);


      // Normalize consultation data for the UI cards
      const formattedConsults = (consultsRes.data || []).map(c => ({
        ...c,
        id: c.id,
        ticket: c.ticketNumber,
        type: "consult",
        name: c.fullName || "Unknown Patient",
        concern: c.chiefComplaint,
        status: c.status
      }));


      // Normalize callback data for the UI cards
      const formattedCallbacks = (callbacksRes.data?.data || callbacksRes.data || []).map(cb => ({
        ...cb,
        id: cb.id,
        ticket: cb.ticketNumber,
        type: "callback",
        name: cb.patientName || "Unknown Patient", // Adjust based on populated callback model
        concern: cb.chiefComplaint,
        status: cb.status,
        contact: cb.contactNumber
      }));


      // Merge and set state
      setPatientsList([...formattedConsults, ...formattedCallbacks]);
    } catch (error) {
      console.error("Error fetching nurse queue:", error);
    } finally {
      setIsLoading(false);
    }
  };


  // Computed Metrics
  const countConsults = useMemo(() => patientsList.filter(p => p.type === "consult").length, [patientsList]);
  const countCallbacks = useMemo(() => patientsList.filter(p => p.type === "callback").length, [patientsList]);
  const totalCount = patientsList.length;


  const filteredPatients = useMemo(() => {
    if (filter === "consults") return patientsList.filter((p) => p.type === "consult");
    if (filter === "callbacks") return patientsList.filter((p) => p.type === "callback");
    return patientsList;
  }, [filter, patientsList]);


  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.headerLeft}>
              <TouchableOpacity style={styles.backButton} onPress={() => router.push("/")}>
                <Text style={styles.backText}>← Back</Text>
              </TouchableOpacity>
              <View>
                <Text style={styles.headerTitle}>Nurse Station - Triage</Text>
                <Text style={styles.headerSubtitle}>Patient queue and consultation</Text>
              </View>
            </View>
            <View style={styles.statsContainer}>
              <StatCard label="Active" value="1" color="#16a34a" />
              <StatCard label="In Queue" value={String(totalCount)} color="#d97706" />
              <StatCard label="Callbacks" value={String(countCallbacks)} color="#0f766e" />
            </View>
          </View>


          {/* ACTION BUTTONS */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.actionsScroll}>
            <ActionButton title="Create Ticket" badge={0} onPress={() => router.push("/CreateTicket")} />
            <ActionButton title="Specialist Appointment" badge={0} onPress={() => router.push("/Appointments")} active />
            <ActionButton title="Post-Consultation Billing" badge={5} onPress={() => router.push("Billing")} active />
            <ActionButton title="Follow-Up Messages" badge={3} onPress={() => router.push("/FollowUps")} active />
           
            {/* INVOICE BUTTON LOGIC */}
            <TouchableOpacity
              disabled={!selectedPatient}
              style={[styles.actionBtn, { opacity: selectedPatient ? 1 : 0.5 }]}
              onPress={() => router.push("/Invoice")}
            >
              <Text style={styles.actionBtnText}>Generate Invoice</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>


        {/* MAIN CONTENT */}
        <View style={styles.content}>
         
          {/* LEFT PANEL: PATIENT QUEUE */}
          <View style={styles.leftPanel}>
            <View style={styles.panelHeaderRow}>
              <Ionicons name="people" size={18} color="#6b7280" />
              <Text style={styles.panelTitleSmall}>Patient Queue</Text>
            </View>


            <QueueFilterTabs
              activeTab={filter}
              onTabChange={setFilter}
              totalCount={totalCount}
              consultCount={countConsults}
              callbackCount={countCallbacks}
            />


            {isLoading ? (
              <ActivityIndicator size="large" color="#2563eb" style={{ marginTop: 20 }} />
            ) : filteredPatients.length === 0 ? (
              <EmptyState text="No patients currently in queue." />
            ) : (
              <FlatList
                data={filteredPatients}
                keyExtractor={(item) => item.id.toString()}
                scrollEnabled={false}
                renderItem={({ item }) => (
                  <PatientQueueCard
                    item={item}
                    isSelected={selectedPatient?.id === item.id}
                    onPress={() => setSelectedPatient(item)}
                  />
                )}
              />
            )}
          </View>


          {/* RIGHT PANEL: PATIENT SNAPSHOT */}
          <View style={styles.rightPanel}>
            <View style={styles.panelHeaderRow}>
              <Ionicons name="information-circle-outline" size={18} color="#6b7280" />
              <Text style={styles.panelTitleSmall}>Patient Snapshot</Text>
            </View>


            {selectedPatient ? (
              <PatientSnapshotCard
                patient={selectedPatient}
                onViewMedicalHistory={() => setIsModalVisible(true)}
                onOpenTriageWorkspace={() => router.push({
                  pathname: "/screens/nurse/TriageWorkspaceScreen",
                  params: { patient: selectedPatient }
                })}
              />
            ) : (
              <EmptyState text="Select a patient from the queue to view information" />
            )}
          </View>


        </View>
      </ScrollView>


      {/* MEDICAL RECORD MODAL */}
      <PatientMedicalRecordModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        patient={selectedPatient}
      />
    </View>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f3f4f6" },
  header: { backgroundColor: "white", padding: 20, borderBottomWidth: 1, borderColor: "#e5e7eb" },
  headerTop: { flexDirection: "row", justifyContent: "space-between", flexWrap: "wrap", gap: 15 },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 15 },
  backButton: { backgroundColor: "#f3f4f6", paddingVertical: 8, paddingHorizontal: 12, borderRadius: 6 },
  backText: { color: "#4b5563", fontWeight: "600" },
  headerTitle: { fontSize: 22, fontWeight: "700", color: "#111827" },
  headerSubtitle: { fontSize: 14, color: "#6b7280" },
  statsContainer: { flexDirection: "row", gap: 12 },
  actionsScroll: { marginTop: 20, paddingVertical: 4, gap: 10 },
  actionBtn: { flexDirection: "row", alignItems: "center", backgroundColor: "white", paddingVertical: 8, paddingHorizontal: 14, borderRadius: 6, borderWidth: 1, borderColor: "#d1d5db" },
  actionBtnText: { fontSize: 13, fontWeight: "600", color: "#374151" },
  content: { flexDirection: "row", padding: 20, gap: 20 },
  leftPanel: { width: 350, backgroundColor: "white", borderRadius: 12, padding: 16, borderWidth: 1, borderColor: "#e5e7eb" },
  rightPanel: { flex: 1, backgroundColor: "white", borderRadius: 12, padding: 16, borderWidth: 1, borderColor: "#e5e7eb", minWidth: 400 },
  panelHeaderRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 15, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: "#f3f4f6" },
  panelTitleSmall: { fontSize: 14, fontWeight: "600", color: "#4b5563", textTransform: "uppercase" },
});
