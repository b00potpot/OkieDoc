import React, { useState, useEffect } from "react";
import {
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import axios from "axios";

const { width } = Dimensions.get("window");
const isMobile = width < 768;

const API_BASE_URL = "http://192.168.1.71:1337"; 

const symptomOptions = [
  "Fever", "Cough", "Headache", "Sore throat", "Body pain",
  "Nausea", "Dizziness", "Fatigue", "Shortness of breath", "Chest pain",
];

const consultationTypes = [
  "Chat Consultation", "Voice Consultation",
  "Video Consultation", "Specialist Consultation", "Callback Request",
];

export default function CreateTicketScreen() {
  const params = useLocalSearchParams();
  const activeDraftId = params?.draftId;

  // Operational State Context
  const [loading, setLoading] = useState(false);
  const [draftId, setDraftId] = useState(null);

  // Form Field States
  const [fullName, setFullName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [email, setEmail] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [gender, setGender] = useState("");

  const [streetAddress, setStreetAddress] = useState("");
  const [region, setRegion] = useState("");
  const [province, setProvince] = useState("");
  const [cityMunicipality, setCityMunicipality] = useState("");
  const [barangay, setBarangay] = useState("");

  const [hmoProvider, setHmoProvider] = useState("");
  const [subscriptionType, setSubscriptionType] = useState("");
  const [philhealthMember, setPhilhealthMember] = useState(false);

  const [consultationType, setConsultationType] = useState("");
  const [chiefComplaint, setChiefComplaint] = useState("");
  const [otherSymptoms, setOtherSymptoms] = useState("");

  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [selectedPainAreas, setSelectedPainAreas] = useState([]);
  const [painView, setPainView] = useState("front");

  // Load draft configuration hook if parameter context mounts
  useEffect(() => {
    if (activeDraftId) {
      loadDraft(activeDraftId);
    }
  }, [activeDraftId]);

  // API Call: Load Draft Data on Startup
  const loadDraft = async (id) => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/consultations/draft/${id}`);
      if (response.data) {
        const draft = response.data;
        setDraftId(draft.id);
        setFullName(draft.fullName || "");
        setMobileNumber(draft.mobileNumber || "");
        setEmail(draft.email || "");
        setBirthDate(draft.birthDate || "");
        setGender(draft.gender || "");
        setStreetAddress(draft.streetAddress || "");
        setRegion(draft.region || "");
        setProvince(draft.province || "");
        setCityMunicipality(draft.cityMunicipality || "");
        setBarangay(draft.barangay || "");
        setHmoProvider(draft.hmoProvider || "");
        setSubscriptionType(draft.subscriptionType || "");
        setPhilhealthMember(!!draft.philhealthMember);
        setConsultationType(draft.consultationType || "");
        setChiefComplaint(draft.chiefComplaint || "");
        setOtherSymptoms(draft.otherSymptoms || "");
        setSelectedPainAreas(draft.painAreas || []);
        setPainView(draft.painView || "front");
        
        // Dynamic payload schema normalization for pure clean JSON Array assignments
        if (draft.symptoms) {
          setSelectedSymptoms(Array.isArray(draft.symptoms) ? draft.symptoms : []);
        }
      }
    } catch (error) {
      console.error("Error retrieving existing form draft data", error);
      Alert.alert("Error", "Could not populate existing records or file data correctly.");
    } finally {
      setLoading(false);
    }
  };

  // Package Active Local Form Data State Structure (Clean JSON arrays for symptoms/pain maps)
  const buildPayload = () => {
    return {
      fullName,
      mobileNumber,
      email,
      birthDate,
      gender,
      streetAddress,
      region,
      province,
      cityMunicipality,
      barangay,
      hmoProvider,
      subscriptionType,
      philhealthMember,
      consultationType,
      chiefComplaint,
      otherSymptoms,
      symptoms: selectedSymptoms, 
      painAreas: selectedPainAreas,
      painView
    };
  };

  // Helper utility to completely reset transaction state tracking
  const resetFormState = () => {
    setDraftId(null);
    setFullName("");
    setMobileNumber("");
    setEmail("");
    setBirthDate("");
    setGender("");
    setStreetAddress("");
    setRegion("");
    setProvince("");
    setCityMunicipality("");
    setBarangay("");
    setHmoProvider("");
    setSubscriptionType("");
    setPhilhealthMember(false);
    setConsultationType("");
    setChiefComplaint("");
    setOtherSymptoms("");
    setSelectedSymptoms([]);
    setSelectedPainAreas([]);
    setPainView("front");
  };

  // API Call: Save Draft Handler (POST/PUT dynamic processing logic)
  const saveDraft = async () => {
    setLoading(true);
    const payload = buildPayload();
    try {
      if (draftId) {
        await axios.put(`${API_BASE_URL}/consultations/draft/${draftId}`, payload);
        Alert.alert("Success", "Draft session updated cleanly!");
      } else {
        const response = await axios.post(`${API_BASE_URL}/consultations/draft`, payload);
        setDraftId(response.data.id);
        Alert.alert("Saved", "New operational workflow draft created successfully.");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to compile snapshot changes.");
    } finally {
      setLoading(false);
    }
  };

  // API Call: Create Clean Final Standard Live Ticket Workflow
  const createTicket = async () => {
    if (!fullName || !mobileNumber || !consultationType) {
      Alert.alert("Validation Error", "Please provide required fields (Name, Mobile, and Consultation Variant).");
      return;
    }

    setLoading(true);
    const payload = { ...buildPayload(), id: draftId };

    try {
      await axios.post(`${API_BASE_URL}/consultations`, payload);
      Alert.alert("Created", "Live active intake record published successfully.", [
        { 
          text: "OK", 
          onPress: () => {
            resetFormState();
            router.push("/NurseDashboard");
          } 
        }
      ]);
    } catch (error) {
      console.error(error);
      Alert.alert("Submission Failure", "Failed to build the live transaction model details mapping.");
    } finally {
      setLoading(false);
    }
  };

  // API Call: Assign to Nurse Operations Queue
  const assignToNurse = async () => {
    if (!draftId) {
      Alert.alert("Action Error", "Please save your progress as a draft baseline before attempting assignments mapping workflows.");
      return;
    }

    setLoading(true);
    try {
      // Dynamic routing context parameters placeholder payload structures
      await axios.put(`${API_BASE_URL}/consultations/${draftId}/assign-nurse`, { 
        nurseId: 3 // Replace downstream with your dynamic context profile parameter structure (e.g., currentAuthenticatedUser.id)
      });
      Alert.alert("Success", "Ticket transaction context processed and routed to assigned nurse queue.");
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Could not complete queue transaction target lookup assignments workflow.");
    } finally {
      setLoading(false);
    }
  };

  const toggleSymptom = (symptom) => {
    if (selectedSymptoms.includes(symptom)) {
      setSelectedSymptoms(selectedSymptoms.filter((s) => s !== symptom));
    } else {
      setSelectedSymptoms([...selectedSymptoms, symptom]);
    }
  };

  const togglePainArea = (area) => {
    if (selectedPainAreas.includes(area)) {
      setSelectedPainAreas(selectedPainAreas.filter((a) => a !== area));
    } else {
      setSelectedPainAreas([...selectedPainAreas, area]);
    }
  };

  return (
    <View style={styles.container}>
      {/* HEADER SECTION */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.push("/NurseDashboard")}>
              <Ionicons name="arrow-back" size={20} color="#111827" />
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={styles.headerTitle}>Create Consultation Ticket</Text>
              <Text style={styles.headerSubtitle}>Nurse-assisted patient registration</Text>
            </View>
          </View>

          {/* ACTION NAVIGATION CONTROLS */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.actionsScroll}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#2563eb" style={{ marginRight: 20 }} />
            ) : (
              <>
                <TouchableOpacity style={styles.secondaryButton} onPress={saveDraft}>
                  <Ionicons name="save-outline" size={18} color="#111827" />
                  <Text style={styles.secondaryButtonText}>Save Draft</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.secondaryButton} onPress={assignToNurse}>
                  <Ionicons name="paper-plane-outline" size={18} color="#111827" />
                  <Text style={styles.secondaryButtonText}>Assign to Nurse</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.primaryButton} onPress={createTicket}>
                  <Ionicons name="document-text-outline" size={18} color="white" />
                  <Text style={styles.primaryButtonText}>Create Ticket</Text>
                </TouchableOpacity>
              </>
            )}
          </ScrollView>
        </View>
      </View>

      {/* COMPONENT BODY DATA INPUT SCREEN */}
      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* PATIENT INFO CATEGORY SECTION */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Patient Information</Text>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Full Name *</Text>
            <TextInput placeholder="Enter full name" style={styles.input} value={fullName} onChangeText={setFullName} />
          </View>

          <View style={styles.responsiveRow}>
            <View style={styles.responsiveHalf}>
              <Text style={styles.label}>Mobile Number *</Text>
              <TextInput placeholder="+63 XXX XXX XXXX" style={styles.input} keyboardType="phone-pad" value={mobileNumber} onChangeText={setMobileNumber} />
            </View>
            <View style={styles.responsiveHalf}>
              <Text style={styles.label}>Email</Text>
              <TextInput placeholder="email@example.com" style={styles.input} keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />
            </View>
          </View>

          <View style={styles.responsiveRow}>
            <View style={styles.responsiveHalf}>
              <Text style={styles.label}>Date of Birth</Text>
              <TextInput placeholder="mm/dd/yyyy" style={styles.input} value={birthDate} onChangeText={setBirthDate} />
            </View>
            <View style={styles.responsiveHalf}>
              <Text style={styles.label}>Gender</Text>
              <View style={styles.pickerContainer}>
                <Picker selectedValue={gender} onValueChange={(itemValue) => setGender(itemValue)} style={styles.pickerElement}>
                  <Picker.Item label="Select Gender" value="" />
                  <Picker.Item label="Male" value="Male" />
                  <Picker.Item label="Female" value="Female" />
                  <Picker.Item label="Other" value="Other" />
                </Picker>
              </View>
            </View>
          </View>
        </View>

        {/* ADDRESS CATEGORY SECTION */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Address</Text>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Street Address</Text>
            <TextInput placeholder="House/Unit/Building No., Street Name" style={styles.input} value={streetAddress} onChangeText={setStreetAddress} />
          </View>

          <View style={styles.responsiveRow}>
            <View style={styles.responsiveHalf}>
              <Text style={styles.label}>Region</Text>
              <TextInput placeholder="e.g., NCR, Region III" style={styles.input} value={region} onChangeText={setRegion} />
            </View>
            <View style={styles.responsiveHalf}>
              <Text style={styles.label}>Province</Text>
              <TextInput placeholder="Province" style={styles.input} value={province} onChangeText={setProvince} />
            </View>
          </View>

          <View style={styles.responsiveRow}>
            <View style={styles.responsiveHalf}>
              <Text style={styles.label}>City / Municipality</Text>
              <TextInput placeholder="City" style={styles.input} value={cityMunicipality} onChangeText={setCityMunicipality} />
            </View>
            <View style={styles.responsiveHalf}>
              <Text style={styles.label}>Barangay</Text>
              <TextInput placeholder="Barangay" style={styles.input} value={barangay} onChangeText={setBarangay} />
            </View>
          </View>
        </View>

        {/* HEALTHCARE INFORMATION SECTION */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Healthcare Information</Text>

          <View style={styles.responsiveRow}>
            <View style={styles.responsiveHalf}>
              <Text style={styles.label}>Healthcare Provider</Text>
              <TextInput placeholder="e.g., Maxicare" style={styles.input} value={hmoProvider} onChangeText={setHmoProvider} />
            </View>
            <View style={styles.responsiveHalf}>
              <Text style={styles.label}>Subscription Type</Text>
              <TextInput placeholder="Select subscription type" style={styles.input} value={subscriptionType} onChangeText={setSubscriptionType} />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>PhilHealth Member?</Text>
            <View style={styles.radioGroup}>
              <TouchableOpacity style={[styles.radioButton, philhealthMember === true && styles.radioActive]} onPress={() => setPhilhealthMember(true)}>
                <View style={[styles.radioOuter, philhealthMember === true && styles.radioOuterActive]}>
                  {philhealthMember === true && <View style={styles.radioInner} />}
                </View>
                <Text style={[styles.radioLabel, philhealthMember === true && styles.radioLabelActive]}>Yes</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.radioButton, philhealthMember === false && styles.radioActive]} onPress={() => setPhilhealthMember(false)}>
                <View style={[styles.radioOuter, philhealthMember === false && styles.radioOuterActive]}>
                  {philhealthMember === false && <View style={styles.radioInner} />}
                </View>
                <Text style={[styles.radioLabel, philhealthMember === false && styles.radioLabelActive]}>No</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* CONSULTATION DATA SELECTIONS */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Consultation Type *</Text>
          
          <View style={[styles.pickerContainer, { marginBottom: 15 }]}>
            <Picker selectedValue={consultationType} onValueChange={(itemValue) => setConsultationType(itemValue)} style={styles.pickerElement}>
              <Picker.Item label="Select Consultation Type" value="" />
              {consultationTypes.map((type, idx) => (
                <Picker.Item key={idx} label={type} value={type} />
              ))}
            </Picker>
          </View>

          <View style={styles.consultationTypeBox}>
            <Text style={styles.consultationTypeText}>Initial Intake Context</Text>
          </View>

          <Text style={[styles.label, { marginTop: 20 }]}>Main Complaint</Text>
          <TextInput placeholder="Describe the main complaint..." multiline style={styles.textArea} value={chiefComplaint} onChangeText={setChiefComplaint} />

          {/* SYMPTOMS SECTION MAP */}
          <Text style={[styles.sectionTitle, { marginTop: 25 }]}>Symptoms</Text>
          <View style={styles.symptomContainer}>
            {symptomOptions.map((symptom) => {
              const active = selectedSymptoms.includes(symptom);
              return (
                <Pressable key={symptom} onPress={() => toggleSymptom(symptom)} style={[styles.symptomChip, active && styles.symptomChipActive]}>
                  <Text style={[styles.symptomText, active && styles.symptomTextActive]}>{symptom}</Text>
                </Pressable>
              );
            })}
          </View>

          <TextInput placeholder="Additional symptoms not listed above..." style={[styles.input, { marginTop: 20 }]} value={otherSymptoms} onChangeText={setOtherSymptoms} />
        </View>

        {/* INTERACTIVE PAIN MAP SEGMENT AREA */}
        <View style={styles.card}>
          <View style={styles.painHeader}>
            <Text style={styles.sectionTitle}>Pain Map</Text>
            <View style={styles.toggleContainer}>
              <TouchableOpacity style={[styles.toggleButton, painView === "front" && styles.toggleButtonActive]} onPress={() => setPainView("front")}>
                <Text style={[styles.toggleText, painView === "front" && styles.toggleTextActive]}>Front</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.toggleButton, painView === "back" && styles.toggleButtonActive]} onPress={() => setPainView("back")}>
                <Text style={[styles.toggleText, painView === "back" && styles.toggleTextActive]}>Back</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.painContent}>
            <View style={styles.bodyMap}>
              <Pressable style={[styles.head, selectedPainAreas.includes("Head") && styles.activeBodyPart]} onPress={() => togglePainArea("Head")} />
              <Pressable style={[styles.chest, selectedPainAreas.includes("Chest") && styles.activeBodyPart]} onPress={() => togglePainArea("Chest")} />
              <Pressable style={[styles.abdomen, selectedPainAreas.includes("Abdomen") && styles.activeBodyPart]} onPress={() => togglePainArea("Abdomen")} />
              <Pressable style={[styles.leftArm, selectedPainAreas.includes("Left Arm") && styles.activeBodyPart]} onPress={() => togglePainArea("Left Arm")} />
              <Pressable style={[styles.rightArm, selectedPainAreas.includes("Right Arm") && styles.activeBodyPart]} onPress={() => togglePainArea("Right Arm")} />
              <Pressable style={[styles.leftLeg, selectedPainAreas.includes("Left Leg") && styles.activeBodyPart]} onPress={() => togglePainArea("Left Leg")} />
              <Pressable style={[styles.rightLeg, selectedPainAreas.includes("Right Leg") && styles.activeBodyPart]} onPress={() => togglePainArea("Right Leg")} />
            </View>

            <View style={styles.selectedContainer}>
              <Text style={styles.selectedTitle}>Selected pain areas:</Text>
              {selectedPainAreas.length === 0 ? (
                <Text style={styles.noSelection}>No areas selected</Text>
              ) : (
                <View style={styles.selectedTags}>
                  {selectedPainAreas.map((area) => (
                    <View key={area} style={styles.selectedTag}>
                      <Text style={styles.selectedTagText}>{area}</Text>
                      <TouchableOpacity onPress={() => togglePainArea(area)}>
                        <Ionicons name="close" size={14} color="white" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
              <Text style={styles.helpText}>Click on body parts to mark pain locations accurately.</Text>
            </View>
          </View>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f3f4f6" },
  header: { backgroundColor: "white", borderBottomWidth: 1, borderBottomColor: "#e5e7eb", paddingHorizontal: 16, paddingTop: 18, paddingBottom: 16 },
  headerTop: { gap: 16 },
  headerLeft: { flexDirection: "row", alignItems: "center" },
  backButton: { marginRight: 12 },
  headerTitle: { fontSize: isMobile ? 24 : 34, fontWeight: "bold", color: "#111827" },
  headerSubtitle: { marginTop: 4, color: "#6b7280", fontSize: isMobile ? 14 : 16 },
  actionsScroll: { flexDirection: "row", gap: 12, paddingRight: 10 },
  secondaryButton: { flexDirection: "row", alignItems: "center", gap: 8, borderWidth: 1, borderColor: "#d1d5db", paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12, backgroundColor: "white" },
  secondaryButtonText: { fontWeight: "600", color: "#111827", fontSize: 14 },
  primaryButton: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#2563eb", paddingHorizontal: 18, paddingVertical: 12, borderRadius: 12 },
  primaryButtonText: { color: "white", fontWeight: "bold", fontSize: 14 },
  scrollContainer: { flex: 1 },
  scrollContent: { padding: isMobile ? 14 : 30 },
  card: { backgroundColor: "white", borderRadius: 20, padding: isMobile ? 18 : 28, marginBottom: 22, borderWidth: 1, borderColor: "#e5e7eb" },
  sectionTitle: { fontSize: isMobile ? 22 : 30, fontWeight: "bold", marginBottom: 24, color: "#111827" },
  formGroup: { marginBottom: 18 },
  responsiveRow: { flexDirection: isMobile ? "column" : "row", gap: 18, marginBottom: 18 },
  responsiveHalf: { flex: 1 },
  label: { fontSize: isMobile ? 15 : 18, fontWeight: "600", marginBottom: 10, color: "#111827" },
  input: { height: 54, backgroundColor: "#f3f4f6", borderRadius: 12, paddingHorizontal: 16, fontSize: 15, color: "#111827" },
  pickerContainer: { height: 54, backgroundColor: "#f3f4f6", borderRadius: 12, overflow: "hidden", justifyContent: "center" },
  pickerElement: { width: "100%", height: "100%", color: "#111827" },
  radioGroup: { flexDirection: "row", gap: 16, marginTop: 4 },
  radioButton: { flexDirection: "row", alignItems: "center", gap: 8, borderWidth: 1, borderColor: "#e5e7eb", paddingVertical: 12, paddingHorizontal: 20, borderRadius: 12, backgroundColor: "#f9fafb" },
  radioActive: { borderColor: "#2563eb", backgroundColor: "#eff6ff" },
  radioOuter: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: "#d1d5db", alignItems: "center", justifyContent: "center" },
  radioOuterActive: { borderColor: "#2563eb" },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: "#2563eb" },
  radioLabel: { fontSize: 15, fontWeight: "500", color: "#4b5563" },
  radioLabelActive: { color: "#2563eb", fontWeight: "700" },
  textArea: { height: 130, backgroundColor: "#f3f4f6", borderRadius: 12, padding: 16, textAlignVertical: "top", fontSize: 15 },
  consultationTypeBox: { marginTop: 16, backgroundColor: "#dbeafe", paddingVertical: 10, paddingHorizontal: 14, borderRadius: 10, alignSelf: "flex-start" },
  consultationTypeText: { color: "#1d4ed8", fontWeight: "600" },
  symptomContainer: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  symptomChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 999, backgroundColor: "#f3f4f6" },
  symptomChipActive: { backgroundColor: "#fee2e2" },
  symptomText: { color: "#374151", fontWeight: "500", fontSize: 14 },
  symptomTextActive: { color: "#dc2626", fontWeight: "bold" },
  painHeader: { flexDirection: isMobile ? "column" : "row", justifyContent: "space-between", alignItems: isMobile ? "flex-start" : "center", gap: 14 },
  toggleContainer: { flexDirection: "row", backgroundColor: "#f3f4f6", borderRadius: 12, padding: 4 },
  toggleButton: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10 },
  toggleButtonActive: { backgroundColor: "white" },
  toggleText: { color: "#6b7280", fontWeight: "600" },
  toggleTextActive: { color: "#111827" },
  painContent: { flexDirection: isMobile ? "column" : "row", gap: 30, alignItems: "center" },
  bodyMap: { width: isMobile ? 240 : 320, height: isMobile ? 400 : 520, position: "relative", alignItems: "center", justifyContent: "center", alignSelf: "center" },
  head: { position: "absolute", top: isMobile ? 10 : 20, width: isMobile ? 50 : 70, height: isMobile ? 50 : 70, borderRadius: 999, backgroundColor: "#d1d5db" },
  chest: { position: "absolute", top: isMobile ? 80 : 110, width: isMobile ? 90 : 120, height: isMobile ? 70 : 100, borderRadius: 20, backgroundColor: "#d1d5db" },
  abdomen: { position: "absolute", top: isMobile ? 165 : 225, width: isMobile ? 75 : 100, height: isMobile ? 70 : 90, borderRadius: 18, backgroundColor: "#d1d5db" },
  leftArm: { position: "absolute", top: isMobile ? 90 : 120, left: isMobile ? 25 : 40, width: isMobile ? 30 : 45, height: isMobile ? 120 : 160, borderRadius: 20, backgroundColor: "#d1d5db" },
  rightArm: { position: "absolute", top: isMobile ? 90 : 120, right: isMobile ? 25 : 40, width: isMobile ? 30 : 45, height: isMobile ? 120 : 160, borderRadius: 20, backgroundColor: "#d1d5db" },
  leftLeg: { position: "absolute", bottom: isMobile ? 10 : 20, left: isMobile ? 75 : 105, width: isMobile ? 32 : 45, height: isMobile ? 140 : 180, borderRadius: 20, backgroundColor: "#d1d5db" },
  rightLeg: { position: "absolute", bottom: isMobile ? 10 : 20, right: isMobile ? 75 : 105, width: isMobile ? 32 : 45, height: isMobile ? 140 : 180, borderRadius: 20, backgroundColor: "#d1d5db" },
  activeBodyPart: { backgroundColor: "#ef4444" },
  selectedContainer: { width: "100%", flex: 1 },
  selectedTitle: { fontSize: isMobile ? 18 : 22, fontWeight: "bold", marginBottom: 18, color: "#111827" },
  noSelection: { color: "#6b7280", marginBottom: 18 },
  selectedTags: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 18 },
  selectedTag: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#ef4444", paddingHorizontal: 14, paddingVertical: 10, borderRadius: 999 },
  selectedTagText: { color: "white", fontWeight: "bold", fontSize: 13 },
  helpText: { color: "#6b7280", lineHeight: 22, marginTop: 8, fontSize: 14 },
});