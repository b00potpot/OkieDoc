import { Ionicons } from "@expo/vector-icons";
import { useState, useEffect } from "react";
import {
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Alert
} from "react-native";

// Adjust this import path based on where you store your API calls
import { 
  getCallbacks, 
  startCallback, 
  updateCallback,
  escalateCallback, 
  convertCallbackToTicket,
  markCallbackComplete
} from "../../services/api";

const { width } = Dimensions.get("window");
const isMobile = width < 768;

export default function CallbackScreen() {
  const [callbacks, setCallbacks] = useState([]);
  const [selectedCallback, setSelectedCallback] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Controlled State for Form Fields
  const [symptoms, setSymptoms] = useState("");
  const [remarks, setRemarks] = useState("");
  const [notes, setNotes] = useState("");

  // ---------------------------------------------------------------------------
  // A & B. Fetch Callbacks on Mount
  // ---------------------------------------------------------------------------
  useEffect(() => {
    fetchCallbacks();
  }, []);

  const fetchCallbacks = async () => {
    setIsLoading(true);
    try {
      const response = await getCallbacks();
      // Assuming your API returns { data: [...] }
      setCallbacks(response.data || []);
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to fetch callback requests.");
    } finally {
      setIsLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // C. Start / View Details
  // ---------------------------------------------------------------------------
  const openDetails = async (item) => {
    try {
      // 1. Call Backend to update status to "In Progress" if currently "Waiting"
      if (item.status === "Waiting") {
        await startCallback(item.id);
        
        // Optimistically update local list state
        setCallbacks((prev) =>
          prev.map((cb) => (cb.id === item.id ? { ...cb, status: "In Progress" } : cb))
        );
      }

      // 2. Set Modal State
      setSelectedCallback({
        ...item,
        status: item.status === "Waiting" ? "In Progress" : item.status,
      });

      // 3. Populate Controlled Fields
      setSymptoms(item.symptoms || "");
      setRemarks(item.nurseRemarks || "");
      setNotes(item.callbackNotes || "");

    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Could not open details. Please try again.");
    }
  };

  // ---------------------------------------------------------------------------
  // 7. Save Notes 
  // ---------------------------------------------------------------------------
  const handleSaveNotes = async () => {
    if (!selectedCallback) return;
    
    try {
      await updateCallback(selectedCallback.id, {
        symptoms,
        nurseRemarks: remarks,
        callbackNotes: notes,
      });
      
      Alert.alert("Success", "Notes updated successfully!");
      fetchCallbacks(); // Refresh the list to reflect any changes
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to save notes.");
    }
  };

  // ---------------------------------------------------------------------------
  // 8. Status Color System
  // ---------------------------------------------------------------------------
  const getStatusStyle = (status) => {
    switch (status) {
      case "Waiting":
        return styles.waitingBadge;
      case "In Progress":
        return styles.progressBadge;
      case "Escalated":
        return styles.escalatedBadge;
      case "Inquiry":
        return styles.inquiryBadge;
      case "Closed":
        return styles.closedBadge;
      default:
        return styles.waitingBadge;
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#16a34a" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <View style={styles.titleRow}>
            <Ionicons name="call-outline" size={30} color="#16a34a" />
            <Text style={styles.title}>Callback Requests</Text>
          </View>
          <Text style={styles.subtitle}>Free inquiry and triage assessment</Text>
        </View>
      </View>

      {/* TABLE / MOBILE CARDS */}
      <ScrollView contentContainerStyle={styles.content}>
        {isMobile ? (
          <View style={styles.mobileList}>
            {callbacks.map((item) => (
              <View key={item.id} style={styles.mobileCard}>
                <View style={styles.mobileCardTop}>
                  <Text style={styles.mobileTicket}>{item.id}</Text>
                  <View style={[styles.statusBadge, getStatusStyle(item.status)]}>
                    <Text style={styles.statusText}>{item.status}</Text>
                  </View>
                </View>

                <Text style={styles.mobilePatient}>{item.patient}</Text>
                <Text style={styles.mobileComplaint}>{item.complaint}</Text>

                <View style={styles.methodRow}>
                  <Ionicons
                    name={item.method?.includes("Phone") ? "call-outline" : "videocam-outline"}
                    size={18}
                    color={item.method?.includes("Viber") ? "#9333ea" : "#111827"}
                  />
                  <Text style={styles.methodText}>{item.method}</Text>
                </View>

                <TouchableOpacity
                  style={item.status === "Waiting" ? styles.startButton : styles.viewButton}
                  onPress={() => openDetails(item)}
                >
                  <Text style={item.status === "Waiting" ? styles.startText : styles.viewText}>
                    {item.status === "Waiting" ? "Start" : "View Details"}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.table}>
            {/* HEADER ROW */}
            <View style={styles.tableHeader}>
              <Text style={[styles.headerCell, { flex: 1.1 }]}>Ticket ID</Text>
              <Text style={[styles.headerCell, { flex: 1.3 }]}>Patient Name</Text>
              <Text style={[styles.headerCell, { flex: 1.4 }]}>Contact Number</Text>
              <Text style={[styles.headerCell, { flex: 1.3 }]}>Method</Text>
              <Text style={[styles.headerCell, { flex: 1.6 }]}>Request Time</Text>
              <Text style={[styles.headerCell, { flex: 2.1 }]}>Complaint</Text>
              <Text style={[styles.headerCell, { flex: 1.1 }]}>Status</Text>
              <Text style={[styles.headerCell, { flex: 1.3 }]}>Actions</Text>
            </View>

            {/* ROWS */}
            {callbacks.map((item) => (
              <View key={item.id} style={styles.tableRow}>
                <Text style={[styles.cell, { flex: 1.1 }]}>{item.id}</Text>
                <Text style={[styles.patientCell, { flex: 1.3 }]}>{item.patient}</Text>
                <Text style={[styles.cell, { flex: 1.4 }]}>{item.number}</Text>

                <View style={[styles.methodCell, { flex: 1.3 }]}>
                  <Ionicons
                    name={item.method?.includes("Phone") ? "call-outline" : "videocam-outline"}
                    size={18}
                    color={item.method?.includes("Viber") ? "#9333ea" : "#111827"}
                  />
                  <Text style={[styles.cell, { color: item.method?.includes("Viber") ? "#9333ea" : "#111827" }]}>
                    {item.method}
                  </Text>
                </View>

                <Text style={[styles.cell, { flex: 1.6 }]}>{item.time}</Text>
                <Text style={[styles.cell, { flex: 2.1 }]}>{item.complaint}</Text>

                <View style={{ flex: 1.1 }}>
                  <View style={[styles.statusBadge, getStatusStyle(item.status)]}>
                    <Text style={styles.statusText}>{item.status}</Text>
                  </View>
                </View>

                <View style={{ flex: 1.3 }}>
                  <TouchableOpacity
                    style={item.status === "Waiting" ? styles.startButton : styles.viewButton}
                    onPress={() => openDetails(item)}
                  >
                    <Text style={item.status === "Waiting" ? styles.startText : styles.viewText}>
                      {item.status === "Waiting" ? "Start" : "View"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* MODAL */}
      <Modal visible={!!selectedCallback} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Callback Details - {selectedCallback?.id}</Text>
                <Text style={styles.modalSubtitle}>Patient inquiry and triage assessment</Text>
              </View>
              <TouchableOpacity onPress={() => setSelectedCallback(null)}>
                <Ionicons name="close" size={24} color="#111827" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* DETAILS GRID */}
              <View style={styles.detailsGrid}>
                <DetailItem label="Patient Name" value={selectedCallback?.patient} />
                <DetailItem label="Contact Number" value={selectedCallback?.number} />
                <DetailItem label="Preferred Method" value={selectedCallback?.method} />
                <DetailItem label="Request Time" value={selectedCallback?.time} />
              </View>

              {/* CHIEF COMPLAINT (Read Only) */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Chief Complaint</Text>
                <TextInput
                  multiline
                  editable={false}
                  value={selectedCallback?.complaint}
                  style={[styles.textArea, { backgroundColor: "#f1f5f9", color: "#64748b" }]}
                />
              </View>

              {/* D. CONTROLLED SYMPTOMS */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Symptoms</Text>
                <TextInput
                  multiline
                  value={symptoms}
                  onChangeText={setSymptoms}
                  placeholder="Note symptoms mentioned during callback..."
                  placeholderTextColor="#94a3b8"
                  style={styles.textArea}
                />
              </View>

              {/* D. CONTROLLED NURSE REMARKS */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Nurse Remarks</Text>
                <TextInput
                  multiline
                  value={remarks}
                  onChangeText={setRemarks}
                  placeholder="Add your assessment and recommendations..."
                  placeholderTextColor="#94a3b8"
                  style={styles.textArea}
                />
              </View>

              {/* D. CONTROLLED CALLBACK NOTES */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Callback Notes</Text>
                <TextInput
                  multiline
                  value={notes}
                  onChangeText={setNotes}
                  placeholder="Internal notes about the callback..."
                  placeholderTextColor="#94a3b8"
                  style={styles.textArea}
                />
              </View>

              {/* MODAL FOOTER BUTTONS */}
              <View style={styles.buttonGrid}>
                <TouchableOpacity style={styles.secondaryButton} onPress={() => setSelectedCallback(null)}>
                  <Text style={styles.secondaryText}>Close</Text>
                </TouchableOpacity>

                {/* 7. SAVE NOTES BUTTON */}
                <TouchableOpacity style={styles.primaryButton} onPress={handleSaveNotes}>
                  <Ionicons name="save-outline" size={18} color="white" />
                  <Text style={styles.primaryText}>Save Notes</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.outlineButton}>
                  <Ionicons name="alert-circle-outline" size={18} color="#111827" />
                  <Text style={styles.outlineText}>Mark as Inquiry</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.outlineButton}>
                  <Ionicons name="paper-plane-outline" size={18} color="#111827" />
                  <Text style={styles.outlineText}>Convert to Ticket</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.outlineButton}>
                  <Ionicons name="medical-outline" size={18} color="#111827" />
                  <Text style={styles.outlineText}>Escalate to Doctor</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.completeButton}>
                  <Ionicons name="checkmark-circle" size={18} color="white" />
                  <Text style={styles.completeText}>Mark as Complete</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function DetailItem({ label, value }) {
  return (
    <View style={styles.detailItem}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

// -----------------------------------------------------------------------------
// STYLES
// -----------------------------------------------------------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    paddingTop: isMobile ? 52 : 24,
    paddingHorizontal: isMobile ? 16 : 28,
    paddingBottom: 20,
    flexDirection: isMobile ? "column" : "row",
    justifyContent: "space-between",
    gap: 18,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  title: {
    fontSize: isMobile ? 28 : 40,
    fontWeight: "bold",
    color: "#111827",
  },
  subtitle: {
    marginTop: 6,
    color: "#64748b",
    fontSize: 16,
  },
  content: {
    padding: isMobile ? 14 : 28,
  },
  table: {
    backgroundColor: "white",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    overflow: "hidden",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f8fafc",
    paddingVertical: 18,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  headerCell: {
    fontWeight: "800",
    color: "#111827",
    fontSize: 15,
  },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 18,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  cell: {
    color: "#111827",
    fontSize: 15,
  },
  patientCell: {
    fontWeight: "700",
    fontSize: 15,
    color: "#111827",
  },
  methodCell: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  waitingBadge: {
    backgroundColor: "#fef3c7",
    borderWidth: 1,
    borderColor: "#facc15",
  },
  progressBadge: {
    backgroundColor: "#dbeafe",
    borderWidth: 1,
    borderColor: "#60a5fa",
  },
  escalatedBadge: {
    backgroundColor: "#fee2e2",
    borderWidth: 1,
    borderColor: "#f87171",
  },
  /* 8. NEW STATUS COLORS */
  inquiryBadge: {
    backgroundColor: "#ede9fe", // light purple
    borderWidth: 1,
    borderColor: "#a78bfa",
  },
  closedBadge: {
    backgroundColor: "#e5e7eb", // gray
    borderWidth: 1,
    borderColor: "#9ca3af",
  },
  statusText: {
    fontWeight: "700",
    fontSize: 13,
  },
  startButton: {
    backgroundColor: "#16a34a",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  startText: {
    color: "white",
    fontWeight: "700",
  },
  viewButton: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: "white",
  },
  viewText: {
    fontWeight: "700",
    color: "#111827",
  },
  mobileList: {
    gap: 16,
  },
  mobileCard: {
    backgroundColor: "white",
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  mobileCardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  mobileTicket: {
    fontWeight: "800",
    color: "#111827",
  },
  mobilePatient: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 8,
  },
  mobileComplaint: {
    color: "#475569",
    marginBottom: 14,
    lineHeight: 22,
  },
  methodRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  methodText: {
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: 18,
  },
  modalCard: {
    width: "100%",
    maxWidth: 760,
    maxHeight: "92%",
    backgroundColor: "white",
    borderRadius: 28,
    padding: isMobile ? 18 : 28,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 22,
  },
  modalTitle: {
    fontSize: isMobile ? 24 : 32,
    fontWeight: "bold",
    color: "#111827",
  },
  modalSubtitle: {
    marginTop: 6,
    color: "#64748b",
  },
  detailsGrid: {
    flexDirection: isMobile ? "column" : "row",
    flexWrap: "wrap",
    gap: 16,
    marginBottom: 24,
  },
  detailItem: {
    width: isMobile ? "100%" : "47%",
  },
  detailLabel: {
    fontWeight: "700",
    marginBottom: 8,
    color: "#475569",
  },
  detailValue: {
    backgroundColor: "#f8fafc",
    padding: 14,
    borderRadius: 14,
    color: "#111827",
    fontWeight: "600",
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontWeight: "700",
    marginBottom: 10,
    color: "#111827",
  },
  textArea: {
    minHeight: 110,
    backgroundColor: "#f8fafc",
    borderRadius: 16,
    padding: 16,
    textAlignVertical: "top",
    fontSize: 15,
    color: "#111827",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  buttonGrid: {
    flexDirection: isMobile ? "column" : "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 10,
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 140,
  },
  secondaryText: {
    fontWeight: "700",
    color: "#111827",
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#0ea5e9", // Blue save button
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 14,
    minWidth: 140,
  },
  primaryText: {
    fontWeight: "700",
    color: "white",
  },
  outlineButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "#d1d5db",
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 14,
    minWidth: 180,
  },
  outlineText: {
    fontWeight: "700",
    color: "#111827",
  },
  completeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#16a34a",
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 14,
    minWidth: 190,
  },
  completeText: {
    color: "white",
    fontWeight: "700",
  },
});