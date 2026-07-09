import React, { useState, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
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
} from "react-native";


const { width } = Dimensions.get("window");
const isMobile = width < 768;


const API_URL = "http://localhost:1337/api";


const SPECIALTIES = [
  "Cardiologist",
  "Dermatologist",
  "Endocrinologist",
  "Gastroenterologist",
  "Neurologist",
  "Oncologist",
  "Orthopedist",
  "Pediatrician",
  "Psychiatrist",
  "Pulmonologist"
];


const CONSULTATION_TYPES = ["Face-to-Face", "Video Consultation"];


const CLOSE_REASONS = [
  "Patient declined schedule",
  "Specialist unavailable",
  "Patient unresponsive",
  "Duplicate ticket",
  "Other",
];


export default function SpecialistAppointmentScreen() {
  // Global Workflow Controllers
  const [currentStep, setCurrentStep] = useState(1);
  const [ticketId, setTicketId] = useState(null);
  const [ticketNumber, setTicketNumber] = useState("SA-PENDING");
  const [loading, setLoading] = useState(false);


  // Modals & UI Toggles
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [closeDropdownOpen, setCloseDropdownOpen] = useState(false);
  const [selectedCloseReason, setSelectedCloseReason] = useState("");
  const [specDropdownOpen, setSpecDropdownOpen] = useState(false);
  const [typeDropdownOpen, setTypeDropdownOpen] = useState(false);
  const [docDropdownOpen, setDocDropdownOpen] = useState(false);


  // Step 1 State: Create Ticket
  const [searchText, setSearchText] = useState("");
  const [patientsList, setPatientsList] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [specialistType, setSpecialistType] = useState("");
  const [consultationType, setConsultationType] = useState("");
  const [chiefComplaint, setChiefComplaint] = useState("");


  // Step 2 State: Availability
  const [doctorsList, setDoctorsList] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null); // Format: YYYY-MM-DD
  const [selectedTime, setSelectedTime] = useState(null);
  const [bookedSlots, setBookedSlots] = useState([]);


  // Step 3 State: Patient Details Modification
  const [philHealth, setPhilHealth] = useState("");
  const [hmoProvider, setHmoProvider] = useState("");
  const [address, setAddress] = useState("");


  // Step 5 State: Invoice
  const [invoiceGenerated, setInvoiceGenerated] = useState(false);
  const bookingFee = 200;


  // Generate clean mockup dates list for visual custom inline calendar representation
  const [calendarDates, setCalendarDates] = useState([]);
  useEffect(() => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const nextDate = new Date(today);
      nextDate.setDate(today.getDate() + i);
      dates.push({
        full: nextDate.toISOString().split("T")[0],
        dayName: nextDate.toLocaleDateString("en-US", { weekday: "short" }),
        dayNum: nextDate.getDate(),
      });
    }
    setCalendarDates(dates);
  }, []);


  // --- Step 1 API Integrations: Patient Lookups ---
  const searchPatients = async (text) => {
    setSearchText(text);
    if (!text.trim()) {
      setPatientsList([]);
      return;
    }
    try {
      const res = await fetch(`${API_URL}/patients/search?q=${encodeURIComponent(text)}`);
      if (res.ok) {
        const data = await res.json();
        setPatientsList(data);
      }
    } catch (err) {
      console.error("Error looking up matching patient targets:", err);
    }
  };


  // --- Step 2 API Integrations: Specialist Lookup ---
  useEffect(() => {
    if (currentStep === 2 && specialistType) {
      fetchDoctorsBySpecialty();
    }
  }, [currentStep, specialistType]);


  const fetchDoctorsBySpecialty = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/doctors/specialization?specialization=${encodeURIComponent(specialistType)}`);
      if (res.ok) {
        const data = await res.json();
        setDoctorsList(data);
      }
    } catch (err) {
      console.error("Error fetching matching specialist list profiles:", err);
    } finally {
      setLoading(false);
    }
  };


  // --- Step 2 API Integrations: Availability Matrices ---
  useEffect(() => {
    if (selectedDoctor && selectedDate) {
      fetchDoctorSlotMatrix();
    }
  }, [selectedDoctor, selectedDate]);


  const fetchDoctorSlotMatrix = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/doctors/availability?doctorId=${selectedDoctor.id}&date=${selectedDate}`);
      if (res.ok) {
        const data = await res.json();
        setBookedSlots(data.booked || []);
      }
    } catch (err) {
      console.error("Error calculating target doctor slot matrices:", err);
    } finally {
      setLoading(false);
    }
  };


  // --- Operational Workflow Submission Handlers ---
  const handleNextStep = async () => {
    try {
      setLoading(true);
      if (currentStep === 1) {
        const payload = {
          patient: selectedPatient.id,
          fullName: selectedPatient.fullName,
          mobileNumber: selectedPatient.mobileNumber,
          email: selectedPatient.email,
          specialistType,
          consultationType,
          chiefComplaint,
          isDraft: false
        };


        const res = await fetch(`${API_URL}/consultations`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });


        if (res.ok) {
          const data = await res.json();
          setTicketId(data.id);
          if (data.ticketNumber) setTicketNumber(data.ticketNumber);
          setCurrentStep(2);
        }
      }
      else if (currentStep === 2) {
        const payload = {
          specialist: selectedDoctor.id,
          appointmentDate: selectedDate,
          appointmentTime: selectedTime,
          consultationFee: selectedDoctor.consultationFee || 0
        };


        const res = await fetch(`${API_URL}/consultations/${ticketId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });


        if (res.ok) {
          // FIXED: Map correctly to the model field names
          setPhilHealth(selectedPatient.philHealthNumber || "");
          setHmoProvider(selectedPatient.hmoProvider || "");
          setAddress(selectedPatient.streetAddress || selectedPatient.address || "");
          setCurrentStep(3);
        }
      }
      else if (currentStep === 3) {
        // FIXED: Re-mapped variables explicitly into backend attributes targets keys
        const payload = {
          philHealthNumber: philHealth,
          hmoProvider: hmoProvider,
          streetAddress: address
        };
        const res = await fetch(`${API_URL}/consultations/${ticketId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });


        if (res.ok) setCurrentStep(4);
      }
      else if (currentStep === 4) {
        setCurrentStep(5);
      }
    } catch (err) {
      console.error("Workflow tracking propagation runtime failure:", err);
    } finally {
      setLoading(false);
    }
  };


  const handleGenerateInvoice = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/consultations/${ticketId}/invoice`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      if (res.ok) {
        setInvoiceGenerated(true);
      }
    } catch (err) {
      console.error("Error generating systematic client ledger invoice frames:", err);
    } finally {
      setLoading(false);
    }
  };


  const handleConfirmClose = async () => {
    if (!selectedCloseReason) return;
    try {
      if (ticketId) {
        await fetch(`${API_URL}/consultations/${ticketId}/close`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ closeReason: selectedCloseReason })
        });
      }
      setShowCloseModal(false);
      router.push("/NurseDashboard");
    } catch (err) {
      console.error("Error operationalizing closing pipelines:", err);
    }
  };


  // --- Dynamic Step Guard Configurations Rules Matrix ---
  const canProceedStep1 = selectedPatient && specialistType && consultationType;
  const canProceedStep2 = selectedDoctor && selectedDate && selectedTime;
  const canProceedStep3 = true;
  const canProceedStep4 = true;
 
  const isNextDisabled = () => {
    if (currentStep === 1) return !canProceedStep1;
    if (currentStep === 2) return !canProceedStep2;
    if (currentStep === 3) return !canProceedStep3;
    if (currentStep === 4) return !canProceedStep4;
    return false;
  };


  // --- Structural Dynamic UI Render Layers ---


  const renderStep1 = () => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Ionicons name="person-add-outline" size={24} color="#2563eb" />
        <Text style={styles.cardTitle}>Step 1: Create Specialist Ticket</Text>
      </View>


      <View style={styles.formGroup}>
        <Text style={styles.label}>Search & Select Patient *</Text>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color="#9ca3af" />
          <TextInput
            placeholder="Search patient by Name or Email..."
            placeholderTextColor="#94a3b8"
            value={searchText}
            onChangeText={searchPatients}
            style={styles.searchInput}
          />
        </View>


        {patientsList.length > 0 && (
          <View style={styles.searchResultsContainer}>
            {patientsList.map((p) => (
              <TouchableOpacity
                key={p.id}
                style={styles.searchResultItem}
                onPress={() => {
                  setSelectedPatient(p);
                  setPatientsList([]);
                  setSearchText("");
                }}
              >
                <Text style={styles.searchResultText}>{p.fullName} ({p.email})</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}


        {selectedPatient && (
          <View style={styles.selectedPatientBox}>
            <Text style={styles.selectedLabelText}>Selected Patient</Text>
            <Text style={styles.selectedBoxName}>{selectedPatient.fullName}</Text>
            <Text style={styles.selectedBoxSub}>{selectedPatient.email}</Text>
            <Text style={styles.selectedBoxSub}>{selectedPatient.mobileNumber}</Text>
          </View>
        )}
      </View>


      <View style={styles.row}>
        <View style={styles.half}>
          <Text style={styles.label}>Specialist Type *</Text>
          <TouchableOpacity
            style={styles.customSelectInput}
            onPress={() => setSpecDropdownOpen(!specDropdownOpen)}
          >
            <Text style={{ color: specialistType ? "#111827" : "#94a3b8" }}>
              {specialistType || "Select specialty"}
            </Text>
            <Ionicons name={specDropdownOpen ? "chevron-up" : "chevron-down"} size={18} color="#64748b" />
          </TouchableOpacity>
          {specDropdownOpen && (
            <View style={styles.inlineSelectDropdown}>
              {SPECIALTIES.map((item) => (
                <TouchableOpacity
                  key={item}
                  style={styles.inlineSelectOption}
                  onPress={() => { setSpecialistType(item); setSpecDropdownOpen(false); }}
                >
                  <Text>{item}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>


        <View style={styles.half}>
          <Text style={styles.label}>Consultation Type *</Text>
          <TouchableOpacity
            style={styles.customSelectInput}
            onPress={() => setTypeDropdownOpen(!typeDropdownOpen)}
          >
            <Text style={{ color: consultationType ? "#111827" : "#94a3b8" }}>
              {consultationType || "Select format"}
            </Text>
            <Ionicons name={typeDropdownOpen ? "chevron-up" : "chevron-down"} size={18} color="#64748b" />
          </TouchableOpacity>
          {typeDropdownOpen && (
            <View style={styles.inlineSelectDropdown}>
              {CONSULTATION_TYPES.map((item) => (
                <TouchableOpacity
                  key={item}
                  style={styles.inlineSelectOption}
                  onPress={() => { setConsultationType(item); setTypeDropdownOpen(false); }}
                >
                  <Text>{item}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>


      <View style={styles.formGroup}>
        <Text style={styles.label}>Inquiry Reason / Chief Complaint</Text>
        <TextInput
          multiline
          value={chiefComplaint}
          onChangeText={setChiefComplaint}
          placeholder="Describe the reason for specialist consultation"
          placeholderTextColor="#94a3b8"
          style={styles.textArea}
        />
      </View>
    </View>
  );


  const renderStep2 = () => {
    const allSlots = [
      "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
      "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
      "16:00", "16:30", "17:00"
    ];


    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="calendar-outline" size={24} color="#9333ea" />
          <Text style={styles.cardTitle}>Step 2: Availability & Scheduling</Text>
        </View>


        <View style={styles.formGroup}>
          <Text style={styles.label}>Select Specialist Provider *</Text>
          <TouchableOpacity
            style={styles.customSelectInput}
            onPress={() => setDocDropdownOpen(!docDropdownOpen)}
          >
            <Text style={{ color: selectedDoctor ? "#111827" : "#94a3b8" }}>
              {selectedDoctor ? `Dr. ${selectedDoctor.fullName} - ₱${selectedDoctor.consultationFee}` : "Choose physician"}
            </Text>
            <Ionicons name={docDropdownOpen ? "chevron-up" : "chevron-down"} size={18} color="#64748b" />
          </TouchableOpacity>
          {docDropdownOpen && (
            <View style={styles.inlineSelectDropdown}>
              {doctorsList.map((doc) => (
                <TouchableOpacity
                  key={doc.id}
                  style={styles.inlineSelectOption}
                  onPress={() => { setSelectedDoctor(doc); setDocDropdownOpen(false); }}
                >
                  <Text>Dr. {doc.fullName} - ₱{doc.consultationFee || 0}</Text>
                </TouchableOpacity>
              ))}
              {doctorsList.length === 0 && <Text style={{ padding: 12, color: '#64748b' }}>No doctors found for this specialty.</Text>}
            </View>
          )}


          {selectedDoctor && (
            <View style={styles.selectedDoctorBlueBox}>
              <Text style={styles.selectedLabelTextBlue}>Selected Specialist</Text>
              <Text style={styles.selectedBoxName}>Dr. {selectedDoctor.fullName}</Text>
              <Text style={styles.selectedBoxSub}>{specialistType}</Text>
              <Text style={styles.selectedBoxPriceTag}>Fee: ₱{selectedDoctor.consultationFee || 0}</Text>
            </View>
          )}
        </View>


        <View style={styles.formGroup}>
          <Text style={styles.label}>Select Appointment Date *</Text>
          <View style={styles.customCalendarWrapper}>
            {calendarDates.map((d) => {
              const isDateSelected = selectedDate === d.full;
              return (
                <TouchableOpacity
                  key={d.full}
                  style={[styles.calendarDayColumn, isDateSelected && styles.calendarDayColumnActive]}
                  onPress={() => setSelectedDate(d.full)}
                >
                  <Text style={[styles.calendarDayText, isDateSelected && styles.calendarTextActive]}>{d.dayName}</Text>
                  <Text style={[styles.calendarNumText, isDateSelected && styles.calendarTextActive]}>{d.dayNum}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>


        {selectedDate && (
          <View style={styles.formGroup}>
            <View style={styles.timeHeadlineRow}>
              <Text style={styles.label}>Available Time Slots for {selectedDate}</Text>
              <View style={styles.legendContainer}>
                <View style={[styles.legendDot, { backgroundColor: "#10b981" }]} /><Text style={styles.legendLabel}>Avail</Text>
                <View style={[styles.legendDot, { backgroundColor: "#ef4444" }]} /><Text style={styles.legendLabel}>Booked</Text>
                <View style={[styles.legendDot, { backgroundColor: "#9ca3af" }]} /><Text style={styles.legendLabel}>N/A</Text>
              </View>
            </View>


            <View style={styles.timeGridContainer}>
              {allSlots.map((slot) => {
                const isBooked = bookedSlots.includes(slot);
                const isNotAvailable = slot.startsWith("12:");
               
                let slotStyle = styles.slotAvail;
                if (isBooked) slotStyle = styles.slotBooked;
                if (isNotAvailable) slotStyle = styles.slotNA;
                if (selectedTime === slot) slotStyle = styles.slotSelected;


                return (
                  <TouchableOpacity
                    key={slot}
                    disabled={isBooked || isNotAvailable}
                    style={[styles.slotBaseButton, slotStyle]}
                    onPress={() => setSelectedTime(slot)}
                  >
                    <Text style={[styles.slotTextMain, (isBooked || isNotAvailable || selectedTime === slot) && { color: "#ffffff" }]}>
                      {slot}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>


            {selectedTime && (
              <View style={styles.selectedTimeConfirmLabel}>
                <Ionicons name="time-outline" size={16} color="#1d4ed8" />
                <Text style={styles.selectedTimeConfirmText}>
                  Selected Slot: <Text style={{ fontWeight: "800" }}>{selectedTime}</Text> on {selectedDate}
                </Text>
              </View>
            )}
          </View>
        )}
      </View>
    );
  };


  const renderStep3 = () => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Ionicons name="document-text-outline" size={24} color="#059669" />
        <Text style={styles.cardTitle}>Step 3: Patient Intake Verification</Text>
      </View>


      <Text style={styles.subSectionHeader}>Demographics Profiles (Read-Only)</Text>
      <View style={styles.row}>
        <View style={styles.half}>
          <Text style={styles.label}>First Name</Text>
          <TextInput editable={false} value={selectedPatient?.firstName || "N/A"} style={[styles.input, styles.disabledInput]} />
        </View>
        <View style={styles.half}>
          <Text style={styles.label}>Last Name</Text>
          <TextInput editable={false} value={selectedPatient?.lastName || "N/A"} style={[styles.input, styles.disabledInput]} />
        </View>
      </View>
      <View style={styles.row}>
        <View style={styles.half}>
          <Text style={styles.label}>Email Address</Text>
          <TextInput editable={false} value={selectedPatient?.email || "N/A"} style={[styles.input, styles.disabledInput]} />
        </View>
        <View style={styles.half}>
          <Text style={styles.label}>Mobile Number</Text>
          <TextInput editable={false} value={selectedPatient?.mobileNumber || "N/A"} style={[styles.input, styles.disabledInput]} />
        </View>
      </View>
      <View style={styles.row}>
        <View style={thirdStyle}>
          <Text style={styles.label}>Birthday</Text>
          <TextInput editable={false} value={selectedPatient?.birthDate || "N/A"} style={[styles.input, styles.disabledInput]} />
        </View>
        <View style={thirdStyle}>
          <Text style={styles.label}>Gender</Text>
          <TextInput editable={false} value={selectedPatient?.gender || "N/A"} style={[styles.input, styles.disabledInput]} />
        </View>
        <View style={thirdStyle}>
          <Text style={styles.label}>Subscription</Text>
          <TextInput editable={false} value={selectedPatient?.subscriptionType || "Regular"} style={[styles.input, styles.disabledInput]} />
        </View>
      </View>


      <Text style={[styles.subSectionHeader, { marginTop: 16 }]}>Insurance & Coverage Extensions (Editable)</Text>
      <View style={styles.row}>
        <View style={styles.half}>
          <Text style={styles.label}>PhilHealth Number</Text>
          <TextInput value={philHealth} onChangeText={setPhilHealth} placeholder="Enter PhilHealth ID" style={styles.input} />
        </View>
        <View style={styles.half}>
          <Text style={styles.label}>HMO Provider</Text>
          <TextInput value={hmoProvider} onChangeText={setHmoProvider} placeholder="e.g. Maxicare, Intellicare" style={styles.input} />
        </View>
      </View>
      <View style={styles.formGroup}>
        <Text style={styles.label}>Residential Address Mapping</Text>
        <TextInput value={address} onChangeText={setAddress} placeholder="Street, Barangay, City, Province" style={styles.input} />
      </View>
    </View>
  );


  const renderStep4 = () => (
    <ScrollView style={styles.card} contentContainerStyle={{ paddingBottom: 20 }}>
      <View style={styles.cardHeader}>
        <Ionicons name="eye-outline" size={24} color="#ea580c" />
        <Text style={styles.cardTitle}>Step 4: Summary Audit Check</Text>
      </View>


      <View style={[styles.summaryCardView, { backgroundColor: "#eff6ff", borderColor: "#bfdbfe" }]}>
        <View style={styles.summaryCardViewHeader}>
          <Ionicons name="person" size={20} color="#2563eb" />
          <Text style={[styles.summaryCardViewTitle, { color: "#1e3a8a" }]}>Patient Information</Text>
        </View>
        <Text style={styles.summaryCardField}>Name: {selectedPatient?.fullName}</Text>
        <Text style={styles.summaryCardField}>Contact: {selectedPatient?.mobileNumber}</Text>
        <Text style={styles.summaryCardField}>Email: {selectedPatient?.email}</Text>
      </View>


      <View style={[styles.summaryCardView, { backgroundColor: "#faf5ff", borderColor: "#e9d5ff" }]}>
        <View style={styles.summaryCardViewHeader}>
          <Ionicons name="medical" size={20} color="#9333ea" />
          <Text style={[styles.summaryCardViewTitle, { color: "#4c1d95" }]}>Specialist Details</Text>
        </View>
        <Text style={styles.summaryCardField}>Doctor: Dr. {selectedDoctor?.fullName}</Text>
        <Text style={styles.summaryCardField}>Specialty: {specialistType}</Text>
        <Text style={styles.summaryCardField}>Format: {consultationType}</Text>
      </View>


      <View style={[styles.summaryCardView, { backgroundColor: "#f0fdf4", borderColor: "#bbf7d0" }]}>
        <View style={styles.summaryCardViewHeader}>
          <Ionicons name="alarm" size={20} color="#16a34a" />
          <Text style={[styles.summaryCardViewTitle, { color: "#14532d" }]}>Schedule Configuration</Text>
        </View>
        <Text style={styles.summaryCardField}>Date: {selectedDate}</Text>
        <Text style={styles.summaryCardField}>Time Allocation: {selectedTime}</Text>
      </View>
    </ScrollView>
  );


  const renderStep5 = () => {
    const docFee = selectedDoctor?.consultationFee || 0;
    const totalAmount = docFee + bookingFee;


    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="cash-outline" size={24} color="#16a34a" />
          <Text style={styles.cardTitle}>Step 5: Billing & Invoice Generation</Text>
        </View>


        <View style={styles.invoiceReceiptContainer}>
          <Text style={styles.invoiceReceiptTitle}>Billing Statement Summary</Text>
         
          <View style={styles.invoiceLineItem}>
            <Text style={styles.invoiceLineLabel}>Specialist Consultation Fee</Text>
            <Text style={styles.invoiceLineValue}>₱{docFee.toFixed(2)}</Text>
          </View>


          <View style={styles.invoiceLineItem}>
            <Text style={styles.invoiceLineLabel}>Platform Booking Fee</Text>
            <Text style={styles.invoiceLineValue}>₱{bookingFee.toFixed(2)}</Text>
          </View>


          <View style={[styles.invoiceLineItem, styles.invoiceTotalLine]}>
            <Text style={styles.invoiceTotalLabel}>Total Amount Due</Text>
            <Text style={styles.invoiceTotalValue}>₱{totalAmount.toFixed(2)}</Text>
          </View>
        </View>


        <TouchableOpacity
          disabled={invoiceGenerated || loading}
          style={[styles.generateInvoiceBtn, invoiceGenerated && styles.generateInvoiceBtnSuccess]}
          onPress={handleGenerateInvoice}
        >
          <Ionicons name={invoiceGenerated ? "checkmark-circle" : "mail-open-outline"} size={20} color="white" />
          <Text style={styles.generateInvoiceBtnText}>
            {invoiceGenerated ? "Invoice Sent to Patient Successfully via SMS/Email" : "Generate Invoice & Send to Patient"}
          </Text>
        </TouchableOpacity>


        {invoiceGenerated && (
          <View style={styles.invoiceStatusCallout}>
            <Ionicons name="information-circle" size={18} color="#155724" />
            <Text style={styles.invoiceStatusCalloutText}>
              Appointment status shifted to <Text style={{ fontWeight: "bold" }}>"Pending Payment"</Text>. Link dispatched.
            </Text>
          </View>
        )}
      </View>
    );
  };


  return (
    <View style={styles.container}>
      {/* HEADER SECTION */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={20} color="#111827" />
            <Text style={styles.backText}>Back to Dashboard</Text>
          </TouchableOpacity>


          <View style={styles.titleContainer}>
            <View style={styles.titleRow}>
              <Ionicons name="medkit-outline" size={isMobile ? 24 : 30} color="#9333ea" />
              <Text style={styles.title}>Specialist Appointment Workflow</Text>
            </View>
            <Text style={styles.subtitle}>
              Manage specialist consultations through a guided 5-step transaction pipeline
            </Text>
          </View>
        </View>


        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.closeButton} onPress={() => setShowCloseModal(true)}>
            <Ionicons name="close" size={24} color="#111827" />
          </TouchableOpacity>
        </View>
      </View>


      {/* STEPS INDICATOR LINE */}
      <View style={{ backgroundColor: 'white' }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.stepsContainer}>
          {["Create Ticket", "Availability", "Patient Details", "Summary", "Invoice"].map((step, index) => {
            const stepNum = index + 1;
            const isStepActive = stepNum === currentStep;
            return (
              <View key={step} style={styles.stepWrapper}>
                <View style={[styles.stepCircle, isStepActive && styles.activeStepCircle]}>
                  <Text style={[styles.stepNumber, isStepActive && styles.activeStepNumber]}>{stepNum}</Text>
                </View>
                <Text style={[styles.stepText, isStepActive && styles.activeStepText]}>{step}</Text>
              </View>
            );
          })}
        </ScrollView>
      </View>


      {/* FIXED: Restored complete dual panel structural view templates */}
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.mainLayoutGrid}>
          <View style={styles.leftPanel}>
            {loading && <ActivityIndicator size="large" color="#2563eb" style={{ marginVertical: 20 }} />}
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
            {currentStep === 4 && renderStep4()}
            {currentStep === 5 && renderStep5()}
          </View>


          <View style={styles.summaryPanel}>
            <View style={styles.summarySideCard}>
              <Text style={styles.summaryTitle}>Ticket Summary</Text>
              <Text style={styles.ticketId}>{ticketNumber}</Text>


              <View style={styles.summarySection}>
                <Text style={styles.summarySectionTitle}>Patient</Text>
                <SummaryItem label="Name" value={selectedPatient ? selectedPatient.fullName : "Not Set"} />
                <SummaryItem label="Email" value={selectedPatient ? selectedPatient.email : "Not Set"} />
                <SummaryItem label="Mobile" value={selectedPatient ? selectedPatient.mobileNumber : "Not Set"} />
              </View>


              <View style={styles.summarySection}>
                <Text style={styles.summarySectionTitle}>Specialist</Text>
                <SummaryItem label="Name" value={selectedDoctor ? `Dr. ${selectedDoctor.fullName}` : "Not Selected"} />
                <SummaryItem label="Specialty" value={specialistType || "Not Set"} />
              </View>


              <View style={styles.summarySection}>
                <Text style={styles.summarySectionTitle}>Schedule</Text>
                <SummaryItem label="Date" value={selectedDate || "Not Set"} />
                <SummaryItem label="Time" value={selectedTime || "Not Set"} />
                <SummaryItem label="Type" value={consultationType || "Face-to-face"} />
              </View>
            </View>
          </View>
        </View>
      </ScrollView>


      {/* FIXED: Restored Bottom Navigation Controls Footer Section */}
      <View style={styles.footerActions}>
        {currentStep > 1 && currentStep < 5 && (
          <TouchableOpacity style={styles.prevBtn} onPress={() => setCurrentStep(currentStep - 1)}>
            <Text style={styles.prevBtnText}>Previous Step</Text>
          </TouchableOpacity>
        )}
        {currentStep < 5 ? (
          <TouchableOpacity
            disabled={isNextDisabled() || loading}
            style={[styles.nextBtn, isNextDisabled() && styles.nextBtnDisabled]}
            onPress={handleNextStep}
          >
            <Text style={styles.nextBtnText}>
              {currentStep === 4 ? "Confirm & Advance to Invoice" : "Proceed Next"}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.doneBtn} onPress={() => router.push("/NurseDashboard")}>
            <Text style={styles.doneBtnText}>Exit & Return to Dashboard</Text>
          </TouchableOpacity>
        )}
      </View>


      {/* FIXED: Restored Modal for Close Workflow Operations Dismissal */}
      <Modal visible={showCloseModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Cancel & Close Appointment Ticket</Text>
            <Text style={styles.modalText}>Select a validated closure justification flag to dismiss this workspace record:</Text>
           
            <TouchableOpacity style={styles.modalDropdown} onPress={() => setCloseDropdownOpen(!closeDropdownOpen)}>
              <Text style={{ color: selectedCloseReason ? "#111827" : "#94a3b8" }}>
                {selectedCloseReason || "Choose termination category"}
              </Text>
              <Ionicons name={closeDropdownOpen ? "chevron-up" : "chevron-down"} size={18} color="#64748b" />
            </TouchableOpacity>


            {closeDropdownOpen && (
              <View style={styles.modalDropdownList}>
                {CLOSE_REASONS.map((reason) => (
                  <TouchableOpacity
                    key={reason}
                    style={styles.modalDropdownOption}
                    onPress={() => {
                      setSelectedCloseReason(reason);
                      setCloseDropdownOpen(false);
                    }}
                  >
                    <Text>{reason}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}


            <View style={styles.modalActionRow}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setShowCloseModal(false)}>
                <Text style={styles.modalCancelText}>Dismiss</Text>
              </TouchableOpacity>
              <TouchableOpacity
                disabled={!selectedCloseReason}
                style={[styles.modalConfirmBtn, !selectedCloseReason && styles.modalConfirmDisabled]}
                onPress={handleConfirmClose}
              >
                <Text style={styles.modalConfirmText}>Confirm Close Ticket</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}


// FIXED: Restored Shared Dynamic Sub-Component Helper Structural Layout Row
function SummaryItem({ label, value }) {
  return (
    <View style={styles.summaryItemRow}>
      <Text style={styles.summaryItemLabel}>{label}:</Text>
      <Text style={styles.summaryItemValue} numberOfLines={1}>{value}</Text>
    </View>
  );
}


const thirdStyle = { width: (width - 64) / 3 };


// FIXED: Complete application system theme styling sheets matrix declarations
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  header: { padding: 16, backgroundColor: "white", borderBottomWidth: 1, borderColor: "#e2e8f0", flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  headerLeft: { flex: 1 },
  backButton: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  backText: { marginLeft: 4, color: "#475569", fontWeight: "600" },
  titleContainer: { marginTop: 4 },
  titleRow: { flexDirection: "row", alignItems: "center" },
  title: { fontSize: isMobile ? 18 : 22, fontWeight: "800", color: "#1e1b4b", marginLeft: 6 },
  subtitle: { fontSize: 13, color: "#64748b", marginTop: 2 },
  headerActions: { justifyContent: "center" },
  closeButton: { padding: 6, backgroundColor: "#f1f5f9", borderRadius: 20 },
  stepsContainer: { paddingVertical: 14, paddingHorizontal: 16, alignItems: "center" },
  stepWrapper: { flexDirection: "row", alignItems: "center", marginRight: 16 },
  stepCircle: { width: 28, height: 28, borderRadius: 14, backgroundColor: "#e2e8f0", justifyContent: "center", alignItems: "center" },
  activeStepCircle: { backgroundColor: "#9333ea" },
  stepNumber: { fontSize: 13, fontWeight: "700", color: "#64748b" },
  activeStepNumber: { color: "white" },
  stepText: { fontSize: 13, marginLeft: 6, color: "#64748b", fontWeight: "500" },
  activeStepText: { color: "#9333ea", fontWeight: "700" },
  content: { flex: 1 },
  contentContainer: { padding: 16 },
  mainLayoutGrid: { flexDirection: isMobile ? "column" : "row", gap: 16 },
  leftPanel: { flex: isMobile ? undefined : 2 },
  summaryPanel: { flex: isMobile ? undefined : 1 },
  card: { backgroundColor: "white", borderRadius: 12, padding: 16, borderWidth: 1, borderColor: "#e2e8f0" },
  cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 16, gap: 8 },
  cardTitle: { fontSize: 16, fontWeight: "700", color: "#1e293b" },
  formGroup: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: "600", color: "#475569", marginBottom: 6 },
  searchBox: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#cbd5e1", borderRadius: 8, paddingHorizontal: 10, height: 44, backgroundColor: "#f8fafc" },
  searchInput: { flex: 1, marginLeft: 6, fontSize: 14, color: "#1e293b" },
  searchResultsContainer: { borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 8, backgroundColor: "white", marginTop: 4, zIndex: 10 },
  searchResultItem: { padding: 12, borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
  searchResultText: { fontSize: 13, color: "#334155" },
  selectedPatientBox: { padding: 12, backgroundColor: "#f0fdf4", borderWidth: 1, borderColor: "#bbf7d0", borderRadius: 8, marginTop: 12 },
  selectedLabelText: { fontSize: 11, fontWeight: "700", color: "#16a34a", textTransform: "uppercase" },
  selectedBoxName: { fontSize: 15, fontWeight: "700", color: "#14532d", marginTop: 2 },
  selectedBoxSub: { fontSize: 13, color: "#14532d", opacity: 0.8 },
  row: { flexDirection: "row", gap: 12, marginBottom: 12 },
  half: { flex: 1 },
  customSelectInput: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderWidth: 1, borderColor: "#cbd5e1", borderRadius: 8, paddingHorizontal: 12, height: 44, backgroundColor: "white" },
  inlineSelectDropdown: { borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 8, backgroundColor: "white", marginTop: 4, maxHeight: 180, overflow: "scroll" },
  inlineSelectOption: { padding: 12, borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
  textArea: { borderWidth: 1, borderColor: "#cbd5e1", borderRadius: 8, padding: 12, height: 80, textAlignVertical: "top", backgroundColor: "white" },
  selectedDoctorBlueBox: { padding: 12, backgroundColor: "#eff6ff", borderWidth: 1, borderColor: "#bfdbfe", borderRadius: 8, marginTop: 12 },
  selectedLabelTextBlue: { fontSize: 11, fontWeight: "700", color: "#2563eb", textTransform: "uppercase" },
  selectedBoxPriceTag: { fontSize: 13, fontWeight: "700", color: "#1e3a8a", marginTop: 4 },
  customCalendarWrapper: { flexDirection: "row", justifyContent: "space-between" },
  calendarDayColumn: { width: 44, paddingVertical: 8, alignItems: "center", borderRadius: 8, borderWidth: 1, borderColor: "#e2e8f0", backgroundColor: "white" },
  calendarDayColumnActive: { backgroundColor: "#9333ea", borderColor: "#9333ea" },
  calendarDayText: { fontSize: 11, color: "#64748b" },
  calendarNumText: { fontSize: 15, fontWeight: "700", color: "#334155", marginTop: 2 },
  calendarTextActive: { color: "white" },
  timeHeadlineRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  legendContainer: { flexDirection: "row", alignItems: "center", gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendLabel: { fontSize: 11, color: "#64748b" },
  timeGridContainer: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  slotBaseButton: { width: (width - 64) / 4, paddingVertical: 10, borderRadius: 6, alignItems: "center", borderWidth: 1 },
  slotAvail: { backgroundColor: "#f0fdf4", borderColor: "#bbf7d0" },
  slotBooked: { backgroundColor: "#fee2e2", borderColor: "#fecaca" },
  slotNA: { backgroundColor: "#f1f5f9", borderColor: "#e2e8f0" },
  slotSelected: { backgroundColor: "#1d4ed8", borderColor: "#1d4ed8" },
  slotTextMain: { fontSize: 12, fontWeight: "600", color: "#334155" },
  selectedTimeConfirmLabel: { flexDirection: "row", alignItems: "center", gap: 6, padding: 10, backgroundColor: "#eff6ff", borderRadius: 6, marginTop: 12 },
  selectedTimeConfirmText: { fontSize: 13, color: "#1d4ed8" },
  subSectionHeader: { fontSize: 14, fontWeight: "700", color: "#475569", marginBottom: 10 },
  input: { borderWidth: 1, borderColor: "#cbd5e1", borderRadius: 8, paddingHorizontal: 12, height: 44, backgroundColor: "white", fontSize: 14 },
  disabledInput: { backgroundColor: "#f1f5f9", color: "#64748b" },
  summaryCardView: { padding: 14, borderWidth: 1, borderRadius: 8, marginBottom: 12 },
  summaryCardViewHeader: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 6 },
  summaryCardViewTitle: { fontSize: 14, fontWeight: "700" },
  summaryCardField: { fontSize: 13, color: "#334155", marginTop: 2 },
  invoiceReceiptContainer: { padding: 16, backgroundColor: "#fafafa", borderRadius: 8, borderStyle: "dashed", borderWidth: 1, borderColor: "#d1d5db" },
  invoiceReceiptTitle: { fontSize: 14, fontWeight: "700", color: "#374151", marginBottom: 12, textAlign: "center" },
  invoiceLineItem: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 6 },
  invoiceLineLabel: { fontSize: 13, color: "#6b7280" },
  invoiceLineValue: { fontSize: 13, fontWeight: "600", color: "#1f2937" },
  invoiceTotalLine: { borderTopWidth: 1, borderTopColor: "#e5e7eb", marginTop: 10, paddingTop: 10 },
  invoiceTotalLabel: { fontSize: 14, fontWeight: "700", color: "#111827" },
  invoiceTotalValue: { fontSize: 16, fontWeight: "800", color: "#16a34a" },
  generateInvoiceBtn: { flexDirection: "row", padding: 14, backgroundColor: "#2563eb", borderRadius: 8, gap: 8, justifyContent: "center", alignItems: "center", marginTop: 16 },
  generateInvoiceBtnSuccess: { backgroundColor: "#16a34a" },
  generateInvoiceBtnText: { color: "white", fontSize: 14, fontWeight: "700" },
  invoiceStatusCallout: { flexDirection: "row", alignItems: "center", gap: 6, padding: 12, backgroundColor: "#d4edda", borderRadius: 6, marginTop: 12 },
  invoiceStatusCalloutText: { fontSize: 13, color: "#155724" },
  summarySideCard: { backgroundColor: "white", borderRadius: 12, padding: 16, borderWidth: 1, borderColor: "#e2e8f0" },
  summaryTitle: { fontSize: 15, fontWeight: "700", color: "#475569" },
  ticketId: { fontSize: 20, fontWeight: "800", color: "#7c3aed", marginVertical: 4 },
  summarySection: { borderTopWidth: 1, borderTopColor: "#f1f5f9", marginTop: 12, paddingTop: 10 },
  summarySectionTitle: { fontSize: 12, fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", marginBottom: 4 },
  summaryItemRow: { flexDirection: "row", justifyContent: "space-between", marginVertical: 3 },
  summaryItemLabel: { fontSize: 13, color: "#64748b" },
  summaryItemValue: { fontSize: 13, fontWeight: "600", color: "#334155" },
  footerActions: { padding: 16, backgroundColor: "white", borderTopWidth: 1, borderTopColor: "#e2e8f0", flexDirection: "row", justifyContent: "flex-end", gap: 12 },
  prevBtn: { paddingHorizontal: 18, justifyContent: "center", height: 44, borderRadius: 8, borderWidth: 1, borderColor: "#cbd5e1" },
  prevBtnText: { color: "#475569", fontWeight: "600" },
  nextBtn: { paddingHorizontal: 22, backgroundColor: "#9333ea", justifyContent: "center", height: 44, borderRadius: 8 },
  nextBtnDisabled: { opacity: 0.5 },
  nextBtnText: { color: "white", fontWeight: "700" },
  doneBtn: { paddingHorizontal: 22, backgroundColor: "#10b981", justifyContent: "center", height: 44, borderRadius: 8 },
  doneBtnText: { color: "white", fontWeight: "700" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", alignItems: "center" },
  modalContent: { width: width * 0.85, backgroundColor: "white", borderRadius: 12, padding: 20 },
  modalTitle: { fontSize: 16, fontWeight: "700", color: "#111827", marginBottom: 8 },
  modalText: { fontSize: 13, color: "#475569", marginBottom: 14 },
  modalDropdown: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderWidth: 1, borderColor: "#cbd5e1", borderRadius: 8, paddingHorizontal: 12, height: 44 },
  modalDropdownList: { borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 8, marginTop: 4, backgroundColor: "white" },
  modalDropdownOption: { padding: 12, borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
  modalActionRow: { flexDirection: "row", justifyContent: "flex-end", gap: 12, marginTop: 20 },
  modalCancelBtn: { paddingHorizontal: 16, height: 38, justifyContent: "center", borderRadius: 6, borderWidth: 1, borderColor: "#cbd5e1" },
  modalCancelText: { color: "#475569", fontWeight: "600" },
  modalConfirmBtn: { paddingHorizontal: 16, height: 38, justifyContent: "center", borderRadius: 6, backgroundColor: "#ef4444" },
  modalConfirmDisabled: { opacity: 0.5 },
  modalConfirmText: { color: "white", fontWeight: "700" }
});

