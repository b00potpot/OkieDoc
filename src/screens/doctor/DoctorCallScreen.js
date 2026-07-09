import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import api from "../../services/api"; // Added API import

import {
  Alert,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View
} from "react-native";

export default function DoctorCallScreen() {
  const { width, height } = useWindowDimensions();
  const isMobile = width < 900;

  const [isConnecting, setIsConnecting] = useState(true);
  const [callStatus, setCallStatus] = useState("Connecting...");
  const [callStarted, setCallStarted] = useState(false);
  const [callSeconds, setCallSeconds] = useState(0);
  const [micMuted, setMicMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);
  const [activeTab, setActiveTab] = useState("SOAP");
  const [showEndModal, setShowEndModal] = useState(false);

  // SOAP
  const [subjective, setSubjective] = useState("");
  const [objective, setObjective] = useState("");
  const [assessment, setAssessment] = useState("");
  const [plan, setPlan] = useState("");

  // RX
  const [medicationName, setMedicationName] = useState("");
  const [dosage, setDosage] = useState("");
  const [frequency, setFrequency] = useState("");
  const [duration, setDuration] = useState("");

  // LAB
  const [testName, setTestName] = useState("");
  const [clinicalIndication, setClinicalIndication] = useState("");

  // CONNECTING SCREEN
  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsConnecting(false);
      setCallStatus("Connected");
      setCallStarted(true);
    }, 3000);

    return () => clearTimeout(timeout);
  }, []);

  // TIMER
  useEffect(() => {
    let interval;
    if (callStarted) {
      interval = setInterval(() => {
        setCallSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [callStarted]);

  // AUTO CLOSE MODAL
  useEffect(() => {
    let timeout;
    if (showEndModal) {
      timeout = setTimeout(() => {
        setShowEndModal(false);
        router.replace("/DoctorDashboard");
      }, 10000);
    }
    return () => clearTimeout(timeout);
  }, [showEndModal]);

  const formattedTime = useMemo(() => {
    const mins = Math.floor(callSeconds / 60)
      .toString()
      .padStart(2, "0");
    const secs = (callSeconds % 60)
      .toString()
      .padStart(2, "0");
    return `${mins}:${secs}`;
  }, [callSeconds]);

  const endCall = () => {
    setCallStarted(false);
    setShowEndModal(true);
  };

  // --- NEW: BACKEND INTEGRATION FUNCTION ---
  const completeConsultation = async () => {
    try {
      // NOTE: Hardcoded IDs for now. Replace with actual dynamic params (e.g., from route.params).
      const DOCTOR_ID = 1;
      const PATIENT_ID = 1;
      const CONSULTATION_ID = 1;

      // 1. POST /soap
      if (subjective || objective || assessment || plan) {
        await api.post("/soap", {
          consultation: CONSULTATION_ID,
          doctor: DOCTOR_ID,
          subjective,
          objective,
          assessment,
          plan,
        });
      }

      // 2. POST /prescriptions (Optimized single bulk request)
      if (medicationName) {
        await api.post("/prescriptions", {
          consultation: CONSULTATION_ID,
          patient: PATIENT_ID,
          doctor: DOCTOR_ID,
          items: [
            {
              medicationName,
              dosage,
              frequency,
              duration,
            }
          ]
        });
      }

      // 3. POST /laboratories
      if (testName) {
        await api.post("/laboratories", {
          consultation: CONSULTATION_ID,
          patient: PATIENT_ID,
          doctor: DOCTOR_ID,
          testName,
          clinicalIndication,
        });
      }

      // 4. PUT /consultations/:id/complete
      await api.put(`/consultations/${CONSULTATION_ID}/complete`);

      // 5. POST /medical-records
      await api.post("/medical-records", {
        patient: PATIENT_ID,
        consultation: CONSULTATION_ID,
        diagnosis: assessment || "No diagnosis provided",
        remarks: plan || "No remarks provided",
      });

      // Show success and end call UI
      Alert.alert("Success", "Consultation data saved successfully.");
      endCall();
    } catch (error) {
      console.error("Error completing consultation:", error);
      Alert.alert("Error", "Failed to complete consultation. Please try again.");
    }
  };

  // CONNECTING UI
  if (isConnecting) {
    return (
      <SafeAreaView style={styles.connectingContainer}>
        <View style={styles.connectingCard}>
          <View style={styles.connectingAvatar}>
            <Ionicons name="person-outline" size={70} color="white" />
          </View>
          <Text style={styles.connectingName}>Maria Santos</Text>
          <Text style={styles.connectingLabel}>Patient</Text>
          <View style={styles.connectingRow}>
            <View style={styles.connectingDot} />
            <Text style={styles.connectingText}>
              Establishing connection with Maria Santos...
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.mainLayout, isMobile && styles.mobileLayout]}>
        {/* VIDEO SECTION */}
        <View style={[styles.videoSection, isMobile && styles.videoMobile]}>
          {/* TOP BAR */}
          <View style={styles.topBar}>
            <View style={styles.patientInfo}>
              <View style={styles.patientAvatar}>
                <Text style={styles.avatarText}>MS</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text numberOfLines={1} style={styles.patientName}>
                  Maria Santos
                </Text>
                <View style={styles.statusRow}>
                  <View style={styles.consultTag}>
                    <Text style={styles.consultTagText}>
                      Doctor Consultation
                    </Text>
                  </View>
                  <View style={styles.onlineDot} />
                  <Text style={styles.connectedText}>{callStatus}</Text>
                </View>
              </View>
            </View>
            <View style={styles.timerBox}>
              <Ionicons name="time-outline" size={16} color="white" />
              <Text style={styles.timerText}>{formattedTime}</Text>
            </View>
          </View>

          {/* MINI CAMERA */}
          <View
            style={[
              styles.doctorMiniCamera,
              isMobile && styles.doctorMiniCameraMobile,
            ]}
          >
            {cameraOff ? (
              <View style={styles.noCameraContainer}>
                <Ionicons name="videocam-off" size={40} color="white" />
                <Text style={styles.youText}>Camera Off</Text>
              </View>
            ) : (
              <>
                <View style={styles.doctorCameraCircle}>
                  <Ionicons name="person-outline" size={36} color="white" />
                </View>
                <Text style={styles.youText}>You (Doctor)</Text>
              </>
            )}
          </View>

          {/* CENTER */}
          <View style={styles.centerPatient}>
            <View style={styles.bigAvatar}>
              <Ionicons
                name="person-outline"
                size={isMobile ? 80 : 100}
                color="white"
              />
            </View>
            <Text style={[styles.bigPatientName, isMobile && { fontSize: 34 }]}>
              Maria Santos
            </Text>
            <View style={styles.patientRole}>
              <Text style={styles.patientRoleText}>Patient</Text>
            </View>
          </View>

          {/* CONTROLS */}
          <View
            style={[
              styles.bottomControls,
              isMobile && styles.bottomControlsMobile,
            ]}
          >
            <TouchableOpacity
              style={styles.controlButton}
              onPress={() => setMicMuted(!micMuted)}
            >
              <Ionicons
                name={micMuted ? "mic-off-outline" : "mic-outline"}
                size={26}
                color="#111827"
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.controlButton}
              onPress={() => setCameraOff(!cameraOff)}
            >
              <Ionicons
                name={cameraOff ? "videocam-off-outline" : "videocam-outline"}
                size={26}
                color="#111827"
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.endCallButton} onPress={endCall}>
              <Ionicons name="call" size={30} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        {/* WORKSPACE */}
        <View style={[styles.workspace, isMobile && styles.workspaceMobile]}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* HEADER */}
            <View style={styles.workspaceHeader}>
              <Text style={styles.workspaceTitle}>Clinical Workspace</Text>
              <Text style={styles.workspaceSubtitle}>
                Document consultation in real-time
              </Text>
            </View>

            {/* BUTTONS */}
            <View style={styles.workspaceButtons}>
              <TouchableOpacity style={styles.recordsButton}>
                <Ionicons
                  name="folder-open-outline"
                  size={18}
                  color="#111827"
                />
                <Text style={styles.recordsButtonText}>Request Records</Text>
              </TouchableOpacity>
              
              {/* COMPLETED BUTTON INTEGRATION HERE */}
              <TouchableOpacity 
                style={styles.completeButton}
                onPress={completeConsultation} 
              >
                <Ionicons
                  name="checkmark-circle-outline"
                  size={18}
                  color="white"
                />
                <Text style={styles.completeButtonText}>Complete</Text>
              </TouchableOpacity>
            </View>

            {/* TABS */}
            <View style={styles.tabs}>
              <TouchableOpacity
                style={[
                  styles.tabButton,
                  activeTab === "SOAP" && styles.activeTabButton,
                ]}
                onPress={() => setActiveTab("SOAP")}
              >
                <Ionicons
                  name="document-text-outline"
                  size={16}
                  color="#111827"
                />
                <Text style={styles.tabText}>SOAP</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.tabButton,
                  activeTab === "RX" && styles.activeTabButton,
                ]}
                onPress={() => setActiveTab("RX")}
              >
                <Ionicons name="attach-outline" size={16} color="#111827" />
                <Text style={styles.tabText}>Rx</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.tabButton,
                  activeTab === "LAB" && styles.activeTabButton,
                ]}
                onPress={() => setActiveTab("LAB")}
              >
                <Ionicons name="flask-outline" size={16} color="#111827" />
                <Text style={styles.tabText}>Lab</Text>
              </TouchableOpacity>
            </View>

            {/* SOAP */}
            {activeTab === "SOAP" && (
              <View style={styles.formContainer}>
                <Text style={styles.fieldLabel}>Subjective</Text>
                <TextInput
                  value={subjective}
                  onChangeText={setSubjective}
                  multiline
                  placeholder="Patient’s reported symptoms and history."
                  placeholderTextColor="#9ca3af"
                  style={styles.textArea}
                />
                <Text style={styles.fieldLabel}>Objective</Text>
                <TextInput
                  value={objective}
                  onChangeText={setObjective}
                  multiline
                  placeholder="Physical examination findings."
                  placeholderTextColor="#9ca3af"
                  style={styles.textArea}
                />
                <Text style={styles.fieldLabel}>Assessment</Text>
                <TextInput
                  value={assessment}
                  onChangeText={setAssessment}
                  multiline
                  placeholder="Diagnosis and evaluation."
                  placeholderTextColor="#9ca3af"
                  style={styles.textArea}
                />
                <Text style={styles.fieldLabel}>Plan</Text>
                <TextInput
                  value={plan}
                  onChangeText={setPlan}
                  multiline
                  placeholder="Treatment Plan and Next Steps."
                  placeholderTextColor="#9ca3af"
                  style={styles.textArea}
                />
              </View>
            )}

            {/* RX */}
            {activeTab === "RX" && (
              <View style={styles.formContainer}>
                <Text style={styles.sectionLabel}>
                  Add medications for prescription
                </Text>
                <TextInput
                  placeholder="Medication Name"
                  placeholderTextColor="#9ca3af"
                  value={medicationName}
                  onChangeText={setMedicationName}
                  style={styles.input}
                />
                <TextInput
                  placeholder="Dosage"
                  placeholderTextColor="#9ca3af"
                  value={dosage}
                  onChangeText={setDosage}
                  style={styles.input}
                />
                <TextInput
                  placeholder="Frequency"
                  placeholderTextColor="#9ca3af"
                  value={frequency}
                  onChangeText={setFrequency}
                  style={styles.input}
                />
                <TextInput
                  placeholder="Duration"
                  placeholderTextColor="#9ca3af"
                  value={duration}
                  onChangeText={setDuration}
                  style={styles.input}
                />
                <TouchableOpacity style={styles.blackButton}>
                  <Text style={styles.blackButtonText}>Add Medication</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* LAB */}
            {activeTab === "LAB" && (
              <View style={styles.formContainer}>
                <TextInput
                  placeholder="Test name"
                  placeholderTextColor="#9ca3af"
                  value={testName}
                  onChangeText={setTestName}
                  style={styles.input}
                />
                <TextInput
                  placeholder="Clinical indication"
                  placeholderTextColor="#9ca3af"
                  value={clinicalIndication}
                  onChangeText={setClinicalIndication}
                  multiline
                  style={styles.largeTextArea}
                />
                <TouchableOpacity style={styles.blackButton}>
                  <Text style={styles.blackButtonText}>Add Lab Request</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </View>
      </View>

      {/* END CALL MODAL */}
      <Modal transparent visible={showEndModal} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalIcon}>
              <Ionicons name="call-outline" size={38} color="#ef4444" />
            </View>
            <Text style={styles.modalTitle}>Consultation Ended</Text>
            <Text style={styles.modalText}>
              You were in consultation with Maria Santos
            </Text>
            <Text style={styles.modalDuration}>Duration: {formattedTime}</Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                setShowEndModal(false);
                router.replace("/DoctorDashboard");
              }}
            >
              <Text style={styles.modalButtonText}>
                Back to Doctor Dashboard
              </Text>
            </TouchableOpacity>
            <Text style={styles.autoCloseText}>
              This window closes automatically after 10 seconds.
            </Text>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
  },
  mainLayout: {
    flex: 1,
    flexDirection: "row",
  },
  mobileLayout: {
    flexDirection: "column",
  },
  connectingContainer: {
    flex: 1,
    backgroundColor: "#0f172a",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  connectingCard: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "#111827",
    borderRadius: 28,
    padding: 32,
    alignItems: "center",
  },
  connectingAvatar: {
    width: 130,
    height: 130,
    borderRadius: 999,
    backgroundColor: "#2563eb",
    justifyContent: "center",
    alignItems: "center",
  },
  connectingName: {
    marginTop: 24,
    fontSize: 34,
    fontWeight: "700",
    color: "white",
  },
  connectingLabel: {
    marginTop: 8,
    color: "#93c5fd",
    fontSize: 16,
  },
  connectingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 28,
    gap: 10,
  },
  connectingDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    backgroundColor: "#22c55e",
  },
  connectingText: {
    color: "#d1d5db",
    fontSize: 15,
  },
  videoSection: {
    flex: 1,
    backgroundColor: "#1e3a8a",
    position: "relative",
  },
  videoMobile: {
    height: "48%",
  },
  topBar: {
    position: "absolute",
    top: Platform.OS === "ios" ? 50 : 20,
    left: 16,
    right: 16,
    zIndex: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  patientInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 12,
  },
  patientAvatar: {
    width: 44,
    height: 44,
    borderRadius: 999,
    backgroundColor: "#2563eb",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  avatarText: {
    color: "white",
    fontWeight: "700",
  },
  patientName: {
    color: "white",
    fontSize: 20,
    fontWeight: "700",
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 4,
  },
  consultTag: {
    borderWidth: 1,
    borderColor: "#60a5fa",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  consultTagText: {
    color: "#bfdbfe",
    fontSize: 12,
    fontWeight: "600",
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: "#22c55e",
  },
  connectedText: {
    color: "white",
    fontSize: 13,
  },
  timerBox: {
    backgroundColor: "#0f172a",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  timerText: {
    color: "white",
    fontWeight: "700",
    fontSize: 16,
  },
  doctorMiniCamera: {
    position: "absolute",
    top: 100,
    right: 16,
    width: 160,
    height: 110,
    borderRadius: 18,
    backgroundColor: "#334155",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 5,
  },
  doctorMiniCameraMobile: {
    width: 120,
    height: 90,
    top: 90,
  },
  doctorCameraCircle: {
    width: 54,
    height: 54,
    borderRadius: 999,
    backgroundColor: "#22c55e",
    justifyContent: "center",
    alignItems: "center",
  },
  noCameraContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  youText: {
    marginTop: 8,
    color: "white",
    fontSize: 12,
    fontWeight: "700",
  },
  centerPatient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  bigAvatar: {
    width: 150,
    height: 150,
    borderRadius: 999,
    backgroundColor: "#2563eb",
    justifyContent: "center",
    alignItems: "center",
  },
  bigPatientName: {
    marginTop: 18,
    fontSize: 42,
    color: "white",
    fontWeight: "700",
    textAlign: "center",
  },
  patientRole: {
    marginTop: 10,
    backgroundColor: "#2563eb",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 999,
  },
  patientRoleText: {
    color: "white",
    fontWeight: "700",
  },
  bottomControls: {
    position: "absolute",
    bottom: 30,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
  },
  bottomControlsMobile: {
    bottom: 20,
  },
  controlButton: {
    width: 64,
    height: 64,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.25)",
    justifyContent: "center",
    alignItems: "center",
  },
  endCallButton: {
    width: 74,
    height: 74,
    borderRadius: 999,
    backgroundColor: "#ef4444",
    justifyContent: "center",
    alignItems: "center",
    transform: [{ rotate: "135deg" }],
  },
  workspace: {
    width: "38%",
    minWidth: 340,
    backgroundColor: "white",
  },
  workspaceMobile: {
    width: "100%",
    height: "52%",
    minWidth: "100%",
  },
  workspaceHeader: {
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  workspaceTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
  },
  workspaceSubtitle: {
    marginTop: 4,
    color: "#6b7280",
    fontSize: 14,
  },
  workspaceButtons: {
    flexDirection: "row",
    gap: 10,
    padding: 16,
  },
  recordsButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 12,
    height: 46,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  recordsButtonText: {
    fontWeight: "600",
    color: "#111827",
    fontSize: 13,
  },
  completeButton: {
    flex: 1,
    backgroundColor: "#16a34a",
    borderRadius: 12,
    height: 46,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  completeButtonText: {
    color: "white",
    fontWeight: "700",
    fontSize: 13,
  },
  tabs: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginBottom: 10,
    backgroundColor: "#f3f4f6",
    borderRadius: 14,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    height: 42,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
  },
  activeTabButton: {
    backgroundColor: "white",
  },
  tabText: {
    fontWeight: "600",
    color: "#111827",
    fontSize: 13,
  },
  formContainer: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  fieldLabel: {
    marginBottom: 8,
    marginTop: 18,
    fontWeight: "600",
    color: "#111827",
    fontSize: 15,
  },
  sectionLabel: {
    fontWeight: "600",
    color: "#374151",
    marginBottom: 16,
    fontSize: 15,
  },
  textArea: {
    minHeight: 100,
    backgroundColor: "#f3f4f6",
    borderRadius: 12,
    padding: 14,
    textAlignVertical: "top",
    color: "#111827",
    fontSize: 14,
  },
  largeTextArea: {
    height: 120,
    backgroundColor: "#f3f4f6",
    borderRadius: 12,
    padding: 14,
    textAlignVertical: "top",
    color: "#111827",
    fontSize: 14,
    marginBottom: 16,
  },
  input: {
    height: 52,
    backgroundColor: "#f3f4f6",
    borderRadius: 12,
    paddingHorizontal: 14,
    marginBottom: 14,
    color: "#111827",
    fontSize: 14,
  },
  blackButton: {
    height: 50,
    borderRadius: 12,
    backgroundColor: "black",
    justifyContent: "center",
    alignItems: "center",
  },
  blackButtonText: {
    color: "white",
    fontWeight: "700",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalCard: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "white",
    borderRadius: 24,
    padding: 28,
    alignItems: "center",
  },
  modalIcon: {
    width: 80,
    height: 80,
    borderRadius: 999,
    backgroundColor: "#fee2e2",
    justifyContent: "center",
    alignItems: "center",
  },
  modalTitle: {
    marginTop: 20,
    fontSize: 28,
    fontWeight: "700",
    color: "#111827",
  },
  modalText: {
    marginTop: 12,
    fontSize: 16,
    color: "#4b5563",
    textAlign: "center",
    lineHeight: 24,
  },
  modalDuration: {
    marginTop: 12,
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  modalButton: {
    marginTop: 24,
    width: "100%",
    height: 56,
    borderRadius: 14,
    backgroundColor: "#2563eb",
    justifyContent: "center",
    alignItems: "center",
  },
  modalButtonText: {
    color: "white",
    fontWeight: "700",
    fontSize: 16,
  },
  autoCloseText: {
    marginTop: 16,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 22,
  },
});