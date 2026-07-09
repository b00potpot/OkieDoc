import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import api from "../../services/api";

import {
  Dimensions,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";

const { width } = Dimensions.get("window");
const isMobile = width < 768;

export default function DoctorDashboardScreen() {
  const [assignedPatients, setAssignedPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Replace with actual authenticated doctor ID from your auth context
  const DOCTOR_ID = 1;

  useEffect(() => {
    fetchConsultations();
  }, []);

  const fetchConsultations = async () => {
    setIsLoading(true);
    try {
      const response = await api.get(`/consultations/doctor/${DOCTOR_ID}`);

      const formattedData = response.data.map((ticket) => ({
        id: ticket.ticketNumber || ticket.id,
        dbId: ticket.id,
        name: ticket.patient
          ? `${ticket.patient.firstName} ${ticket.patient.lastName}`
          : "Unknown Patient",
        age: ticket.patient?.age || 30,
        concern: ticket.chiefComplaint || "No complaint recorded",
        status: ticket.status || "Waiting",
        type: "Video Consultation",
      }));

      setAssignedPatients(formattedData);
    } catch (error) {
      console.error("Error fetching doctor consultations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const waitingCount = assignedPatients.filter((p) => p.status === "Waiting").length;
  const consultationCount = assignedPatients.filter((p) => p.status === "In Consultation").length;

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={[styles.header, isMobile && styles.mobileHeader]}>
        {/* LEFT */}
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color="#111827" />
            {!isMobile && <Text style={styles.backText}>Back</Text>}
          </TouchableOpacity>

          <View>
            <Text style={styles.headerTitle}>Doctor Dashboard</Text>
            <Text style={styles.headerSubtitle}>Patient consultation and treatment</Text>
          </View>
        </View>

        {/* RIGHT */}
        <View style={[styles.headerRight, isMobile && styles.mobileHeaderRight]}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push("/screens/nurse/InvoiceScreen")}
          >
            <Ionicons name="cash-outline" size={18} color="#111827" />
            <Text style={styles.actionButtonText}>Billing</Text>
            {/* Optional Notification Badge */}
            <View style={styles.badge}>
              <Text style={styles.badgeText}>5</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="document-text-outline" size={18} color="#6b7280" />
            <Text style={styles.secondaryActionText}>Invoice</Text>
          </TouchableOpacity>

          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={[styles.statValue, { color: "#2563eb" }]}>
                {consultationCount}
              </Text>
              <Text style={styles.statLabel}>In Consultation</Text>
            </View>

            <View style={styles.statBox}>
              <Text style={[styles.statValue, { color: "#d97706" }]}>
                {waitingCount}
              </Text>
              <Text style={styles.statLabel}>Waiting</Text>
            </View>
          </View>
        </View>
      </View>

      {/* MAIN CONTENT */}
      <View style={[styles.content, isMobile && styles.mobileContent]}>
        
        {/* LEFT PANEL */}
        <View style={[styles.leftPanel, isMobile && styles.mobileLeftPanel]}>
          <View style={styles.panelHeader}>
            <Ionicons name="people-outline" size={22} color="#374151" />
            <Text style={styles.panelTitle}>Assigned Patients</Text>
          </View>

          {isLoading ? (
            <ActivityIndicator size="large" color="#2563eb" style={{ marginTop: 20 }} />
          ) : assignedPatients.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>No patients assigned yet</Text>
              <Text style={styles.emptyText}>
                Patients will appear here after nurse triage
              </Text>
            </View>
          ) : (
            <FlatList
              data={assignedPatients}
              keyExtractor={(item) => item.dbId.toString()}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 20 }}
              renderItem={({ item }) => {
                const active = selectedPatient?.dbId === item.dbId;

                return (
                  <TouchableOpacity
                    style={[styles.patientCard, active && styles.activePatientCard]}
                    onPress={() => setSelectedPatient(item)}
                  >
                    <View style={styles.patientCardTop}>
                      <Text style={styles.ticketText}>{item.id}</Text>

                      <View
                        style={[
                          styles.statusBadge,
                          item.status === "Waiting"
                            ? styles.waitingBadge
                            : styles.consultBadge,
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusText,
                            item.status === "Waiting"
                              ? { color: "#92400e" }
                              : { color: "#1d4ed8" },
                          ]}
                        >
                          {item.status}
                        </Text>
                      </View>
                    </View>

                    <Text style={styles.patientName}>{item.name}</Text>
                    <Text style={styles.patientConcern} numberOfLines={2}>
                      {item.concern}
                    </Text>
                    <Text style={styles.patientType}>{item.type}</Text>
                  </TouchableOpacity>
                );
              }}
            />
          )}
        </View>

        {/* CENTER PANEL */}
        <View style={[styles.centerPanel, isMobile && styles.mobileCenterPanel]}>
          {selectedPatient ? (
            <ScrollView
              contentContainerStyle={{ paddingBottom: 30 }}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.patientHero}>
                <Ionicons name="person-circle" size={70} color="#2563eb" />
                <View>
                  <Text style={styles.heroPatientName}>{selectedPatient.name}</Text>
                  <Text style={styles.heroPatientInfo}>
                    Age {selectedPatient.age} • {selectedPatient.type}
                  </Text>
                </View>
              </View>

              <View style={styles.infoCard}>
                <Text style={styles.infoTitle}>Chief Complaint</Text>
                <Text style={styles.infoText}>{selectedPatient.concern}</Text>
              </View>

              <TouchableOpacity style={styles.primaryButton}>
                <Ionicons name="videocam" size={18} color="white" />
                <Text style={styles.primaryButtonText}>Start Consultation</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.secondaryButton}>
                <Ionicons name="document-text-outline" size={18} color="#111827" />
                <Text style={styles.secondaryButtonText}>View Medical Record</Text>
              </TouchableOpacity>
            </ScrollView>
          ) : (
            <View style={styles.emptyCenter}>
              <Ionicons name="medkit-outline" size={90} color="#d1d5db" />
              <Text style={styles.emptyCenterText}>
                Select a patient to start consultation
              </Text>
            </View>
          )}
        </View>

        {/* RIGHT PANEL (Desktop Only) */}
        {!isMobile && (
          <View style={styles.rightPanel}>
            <View style={styles.ordersBox}>
              <Ionicons name="medkit-outline" size={90} color="#d1d5db" />
              <Text style={styles.ordersText}>Orders & Documents</Text>
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    height: 95,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  mobileHeader: {
    height: "auto",
    paddingTop: 55,
    paddingBottom: 18,
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 18,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 18,
    gap: 6,
  },
  backText: {
    fontWeight: "600",
    fontSize: 15,
  },
  headerTitle: {
    fontSize: isMobile ? 26 : 34,
    fontWeight: "bold",
    color: "#111827",
  },
  headerSubtitle: {
    marginTop: 4,
    color: "#6b7280",
    fontSize: isMobile ? 14 : 16,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  mobileHeaderRight: {
    width: "100%",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    position: "relative",
  },
  actionButtonText: {
    fontWeight: "600",
    color: "#111827",
  },
  secondaryActionText: {
    fontWeight: "600",
    color: "#6b7280",
  },
  badge: {
    backgroundColor: "#ef4444",
    minWidth: 24,
    height: 24,
    borderRadius: 999,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
  },
  badgeText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 12,
  },
  statsRow: {
    flexDirection: "row",
    gap: 20,
  },
  statBox: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 34,
    fontWeight: "bold",
  },
  statLabel: {
    color: "#6b7280",
    fontSize: 13,
  },
  content: {
    flex: 1,
    flexDirection: "row",
  },
  mobileContent: {
    flexDirection: "column",
  },
  leftPanel: {
    width: 350,
    backgroundColor: "white",
    borderRightWidth: 1,
    borderRightColor: "#e5e7eb",
    padding: 18,
  },
  mobileLeftPanel: {
    width: "100%",
    height: 320,
    borderRightWidth: 0,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  centerPanel: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  mobileCenterPanel: {
    minHeight: 450,
  },
  rightPanel: {
    width: 320,
    borderLeftWidth: 1,
    borderLeftColor: "#e5e7eb",
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
  },
  panelHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 18,
  },
  panelTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#111827",
  },
  emptyCard: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#64748b",
    marginBottom: 10,
    textAlign: "center",
  },
  emptyText: {
    color: "#94a3b8",
    textAlign: "center",
    lineHeight: 22,
  },
  patientCard: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
  },
  activePatientCard: {
    borderColor: "#2563eb",
    backgroundColor: "#eff6ff",
  },
  patientCardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  ticketText: {
    fontWeight: "bold",
    color: "#374151",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  waitingBadge: {
    backgroundColor: "#fef3c7",
  },
  consultBadge: {
    backgroundColor: "#dbeafe",
  },
  statusText: {
    fontWeight: "bold",
    fontSize: 12,
  },
  patientName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 8,
  },
  patientConcern: {
    color: "#64748b",
    marginBottom: 10,
    lineHeight: 22,
  },
  patientType: {
    color: "#94a3b8",
    fontSize: 13,
  },
  emptyCenter: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },
  emptyCenterText: {
    marginTop: 20,
    color: "#94a3b8",
    fontSize: 22,
    textAlign: "center",
  },
  patientHero: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    padding: 24,
  },
  heroPatientName: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#111827",
  },
  heroPatientInfo: {
    marginTop: 4,
    color: "#64748b",
  },
  infoCard: {
    backgroundColor: "white",
    marginHorizontal: 24,
    marginBottom: 20,
    borderRadius: 22,
    padding: 22,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 12,
  },
  infoText: {
    color: "#475569",
    lineHeight: 24,
    fontSize: 16,
  },
  primaryButton: {
    backgroundColor: "#2563eb",
    marginHorizontal: 24,
    marginBottom: 16,
    paddingVertical: 18,
    borderRadius: 18,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
  primaryButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  secondaryButton: {
    backgroundColor: "white",
    marginHorizontal: 24,
    paddingVertical: 18,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#d1d5db",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
  secondaryButtonText: {
    color: "#111827",
    fontWeight: "600",
    fontSize: 16,
  },
  ordersBox: {
    justifyContent: "center",
    alignItems: "center",
  },
  ordersText: {
    marginTop: 18,
    fontSize: 24,
    color: "#9ca3af",
  },
});