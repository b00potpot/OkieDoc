import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { router } from "expo-router";

export default function HomeScreen() {
  return (
    <ScrollView style={styles.container}>
      {/* HEADER */}
      <Text style={styles.title}>
        Healthcare Queue System
      </Text>

      <Text style={styles.subtitle}>
        Streamline patient care with integrated triage and consultation
      </Text>

      {/* MAIN PORTALS */}
      <View style={styles.row}>
        {/* NURSE STATION */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            Nurse Station
          </Text>

          <Text style={styles.cardText}>
            Manage patient queue, conduct triage,
            and transfer to specialists
          </Text>

          <TouchableOpacity
            style={styles.greenButton}
            onPress={() => router.push("/NurseDashboard")}
          >
            <Text style={styles.buttonText}>
              Access Nurse Dashboard
            </Text>
          </TouchableOpacity>
        </View>

        {/* DOCTOR PORTAL */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            Doctor Portal
          </Text>

          <Text style={styles.cardText}>
            Review patient history, document SOAP notes,
            and prescribe treatments
          </Text>

          <TouchableOpacity
            style={styles.blueButton}
            onPress={() => router.push("/DoctorDashboard")}
          >
            <Text style={styles.buttonText}>
              Access Doctor Dashboard
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* TELEMEDICINE */}
      <Text style={styles.sectionTitle}>
        Telemedicine Video Consultations
      </Text>

      <View style={styles.row}>
        {/* PATIENT-NURSE CALL */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            Patient-Nurse Video Call
          </Text>

          <Text style={styles.cardText}>
            Triage consultation interface
          </Text>

          <TouchableOpacity
            style={styles.purpleButton}
            onPress={() => router.push("/FakeCall")}
          >
            <Text style={styles.buttonText}>
              Start Call
            </Text>
          </TouchableOpacity>
        </View>

        {/* DOCTOR CALL */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            Doctor Video Consultation
          </Text>

          <Text style={styles.cardText}>
            Full clinical workspace interface
          </Text>

          <TouchableOpacity
            style={styles.purpleButton}
            onPress={() => router.push("/DoctorCall")}
          >
            <Text style={styles.buttonText}>
              Start Consultation
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* NURSE TOOLS */}
      <Text style={styles.sectionTitle}>
        Nurse Tools & Management
      </Text>

      {/* TOOL CARDS */}
      <View style={styles.toolCard}>
        <Text style={styles.toolTitle}>
          Create Consultation Ticket
        </Text>

        <Text style={styles.toolText}>
          Walk-in and assisted patient registration
        </Text>

        <TouchableOpacity
          style={styles.greenButton}
          onPress={() => router.push("/CreateTicket")}
        >
          <Text style={styles.buttonText}>
            Register Patient
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.toolCard}>
        <Text style={styles.toolTitle}>
          Callback Requests
        </Text>

        <Text style={styles.toolText}>
          Manage patient callbacks and inquiries
        </Text>

        <TouchableOpacity
          style={styles.blueButton}
          onPress={() => router.push("/Callbacks")}
        >
          <Text style={styles.buttonText}>
            View Callbacks
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.toolCard}>
        <Text style={styles.toolTitle}>
          Specialist Appointments
        </Text>

        <Text style={styles.toolText}>
          Schedule and coordinate specialist consultations
        </Text>

        <TouchableOpacity
          style={styles.orangeButton}
          onPress={() => router.push("/Appointments")}
        >
          <Text style={styles.buttonText}>
            Create Appointment
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.toolCard}>
        <Text style={styles.toolTitle}>
          Follow-Up Messages
        </Text>

        <Text style={styles.toolText}>
          Post-consultation patient communication
        </Text>

        <TouchableOpacity
          style={styles.purpleButton}
          onPress={() => router.push("/FollowUps")}
        >
          <Text style={styles.buttonText}>
            View Follow-Ups
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#e9eef7",
    padding: 20,
  },

  title: {
    fontSize: 34,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 20,
    color: "#111827",
  },

  subtitle: {
    textAlign: "center",
    marginTop: 10,
    fontSize: 16,
    color: "#6b7280",
    marginBottom: 30,
    lineHeight: 24,
  },

  sectionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginVertical: 20,
    textAlign: "center",
    color: "#111827",
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
  },

  card: {
    backgroundColor: "white",
    width: "48%",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,

    elevation: 4,
  },

  cardTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
    color: "#111827",
  },

  cardText: {
    fontSize: 15,
    textAlign: "center",
    color: "#6b7280",
    marginBottom: 20,
    lineHeight: 22,
  },

  toolCard: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,

    elevation: 4,
  },

  toolTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#111827",
  },

  toolText: {
    color: "#6b7280",
    marginBottom: 15,
    lineHeight: 22,
  },

  greenButton: {
    backgroundColor: "#16a34a",
    padding: 15,
    borderRadius: 12,
  },

  blueButton: {
    backgroundColor: "#2563eb",
    padding: 15,
    borderRadius: 12,
  },

  purpleButton: {
    backgroundColor: "#7c3aed",
    padding: 15,
    borderRadius: 12,
  },

  orangeButton: {
    backgroundColor: "#ea580c",
    padding: 15,
    borderRadius: 12,
  },

  buttonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 15,
  },
});