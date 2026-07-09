import React, { useState, useEffect, useMemo } from "react";
import {
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  SafeAreaView,
} from "react-native";
import { router } from "expo-router";

// Import your mock data based on your project structure
import { mockFollowups } from "../../mock/followups";

const { width } = Dimensions.get("window");
const isMobile = width < 768;

const statuses = [
  "All Status",
  "Unread",
  "Replied",
  "Waiting for Patient",
  "Closed",
];

// Utility for formatting dates
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function FollowUpsScreen() {
  // --- STATE ---
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All Status");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // --- DATA PREPARATION & FILTERING ---
  // Map the basic mock data to the rich format the UI expects
  const formattedMockData = useMemo(() => {
    return mockFollowups.map((item) => ({
      id: item.id,
      followUpNumber: item.id,
      status: item.unread ? "Unread" : "Replied",
      unreadMessagesCount: item.unread ? 1 : 0,
      patient: { fullName: item.patientName },
      lastActivityDate: item.createdAt,
      expiresAt: "2026-06-25T00:00:00", // Mock expiration for UI purposes
      lastMessageText: item.message,
      assignedNurseId: { fullName: "Nurse Anna" },
      assignedDoctorId: { fullName: "Dr. Lopez" },
      consultationId: { ticketNumber: `TKT-${item.id.split("-")[1]}` },
    }));
  }, []);

  // Filter data whenever search or status changes
  useEffect(() => {
    let filtered = formattedMockData;

    // 1. Apply Status Filter
    if (selectedStatus !== "All Status") {
      filtered = filtered.filter((item) => item.status === selectedStatus);
    }

    // 2. Apply Search Filter
    if (search.trim() !== "") {
      const query = search.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.patient.fullName.toLowerCase().includes(query) ||
          item.followUpNumber.toLowerCase().includes(query) ||
          item.consultationId.ticketNumber.toLowerCase().includes(query)
      );
    }

    setData(filtered);

    // Update unread count based on the base mock data
    const totalUnread = formattedMockData.filter((i) => i.status === "Unread").length;
    setUnreadCount(totalUnread);
  }, [search, selectedStatus, formattedMockData]);

  // --- RENDERERS ---
  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <View style={styles.heroCard}>
        <View style={styles.heroTextContainer}>
          <Text style={styles.heroTitle}>Follow-Up Messages</Text>
          <Text style={styles.heroSubtitle}>
            Manage post-consultation follow-up communications from patients
          </Text>
        </View>

        <View style={styles.unreadBox}>
          <Text style={styles.unreadNumber}>{unreadCount}</Text>
          <Text style={styles.unreadLabel}>Unread Follow-Ups</Text>
        </View>
      </View>

      {/* SEARCH + FILTER DROPDOWN */}
      <View style={styles.searchContainer}>
        <TextInput
          placeholder="Search patient, FU ID, or ticket..."
          placeholderTextColor="#94a3b8"
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
        />

        {/* Custom Dropdown Filter */}
        <View style={{ zIndex: 10 }}>
          <TouchableOpacity
            style={styles.dropdownHeader}
            onPress={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <Text style={styles.dropdownHeaderText}>{selectedStatus}</Text>
            <Text style={styles.dropdownIcon}>{isDropdownOpen ? "▲" : "▼"}</Text>
          </TouchableOpacity>

          {isDropdownOpen && (
            <View style={styles.dropdownList}>
              {statuses.map((status) => (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.dropdownItem,
                    selectedStatus === status && styles.activeDropdownItem,
                  ]}
                  onPress={() => {
                    setSelectedStatus(status);
                    setIsDropdownOpen(false);
                  }}
                >
                  <Text
                    style={[
                      styles.dropdownItemText,
                      selectedStatus === status && styles.activeDropdownItemText,
                    ]}
                  >
                    {status}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>
    </View>
  );

  const renderItem = ({ item }) => (
    <View style={styles.messageCard}>
      {/* TOP ROW */}
      <View style={styles.topRow}>
        <View style={styles.ticketRow}>
          <Text style={styles.ticketId}>{item.followUpNumber || item.id}</Text>
          <Text style={styles.arrow}>→</Text>
          <Text style={styles.original}>
            Original: {item.consultationId?.ticketNumber || "N/A"}
          </Text>
        </View>

        <View style={styles.badges}>
          <View
            style={[
              styles.statusBadge,
              item.status === "Unread" ? styles.unreadBadge : styles.repliedBadge,
            ]}
          >
            <Text
              style={[
                styles.statusText,
                item.status === "Unread" ? styles.unreadText : styles.repliedText,
              ]}
            >
              {item.status || "Open"}
            </Text>
          </View>

          {item.unreadMessagesCount > 0 && (
            <View style={styles.newBadge}>
              <Text style={styles.newBadgeText}>{item.unreadMessagesCount} new</Text>
            </View>
          )}
        </View>
      </View>

      {/* PATIENT */}
      <Text style={styles.patientName}>{item.patient?.fullName || "Unknown Patient"}</Text>
      <Text style={styles.dateText}>
        Last Active: {formatDate(item.lastActivityDate || item.updatedAt)}
      </Text>
      <Text style={styles.dateText}>Expires: {formatDate(item.expiresAt)}</Text>

      {/* MESSAGE */}
      <View style={styles.messageBox}>
        <Text style={styles.messageLabel}>Last Message:</Text>
        <Text style={styles.messageText}>
          "{item.lastMessageText || "Tap chat to view messages."}"
        </Text>
      </View>

      {/* STAFF */}
      <View style={styles.staffRow}>
        <View style={styles.staffBlock}>
          <Text style={styles.staffLabel}>Nurse</Text>
          <Text style={styles.staffName}>{item.assignedNurseId?.fullName || "Unassigned"}</Text>
        </View>
        <View style={styles.staffBlock}>
          <Text style={styles.staffLabel}>Doctor</Text>
          <Text style={styles.staffName}>{item.assignedDoctorId?.fullName || "Unassigned"}</Text>
        </View>
      </View>

      {/* BUTTON */}
      <TouchableOpacity
        style={styles.chatButton}
        onPress={() =>
          router.push({
            pathname: "/FollowUpChat",
            params: { id: item.id },
          })
        }
      >
        <Text style={styles.chatButtonText}>Open Follow-Up Chat</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={data}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No follow-up messages match your criteria.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#eef3fb" },
  listContent: { paddingBottom: 40 },
  header: {
    paddingHorizontal: isMobile ? 16 : 24,
    paddingTop: isMobile ? 20 : 28,
    zIndex: 10,
  },
  backButton: {
    backgroundColor: "white",
    alignSelf: "flex-start",
    paddingHorizontal: isMobile ? 14 : 18,
    paddingVertical: isMobile ? 10 : 14,
    borderRadius: 12,
    marginBottom: 18,
  },
  backText: { fontWeight: "600", fontSize: isMobile ? 14 : 15 },
  heroCard: {
    backgroundColor: "white",
    borderRadius: 22,
    padding: isMobile ? 18 : 28,
    flexDirection: isMobile ? "column" : "row",
    justifyContent: "space-between",
    gap: isMobile ? 20 : 0,
  },
  heroTextContainer: { flex: 1 },
  heroTitle: {
    fontSize: isMobile ? 28 : 36,
    fontWeight: "bold",
    color: "#111827",
  },
  heroSubtitle: {
    marginTop: 8,
    fontSize: isMobile ? 14 : 16,
    color: "#64748b",
    lineHeight: isMobile ? 22 : 24,
  },
  unreadBox: { alignItems: isMobile ? "flex-start" : "center" },
  unreadNumber: {
    fontSize: isMobile ? 40 : 56,
    fontWeight: "bold",
    color: "#9333ea",
  },
  unreadLabel: { fontSize: isMobile ? 14 : 16, color: "#64748b" },
  searchContainer: {
    backgroundColor: "white",
    borderRadius: 22,
    marginTop: 20,
    marginBottom: 20,
    padding: isMobile ? 16 : 20,
    zIndex: 99,
  },
  searchInput: {
    backgroundColor: "#f1f5f9",
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: isMobile ? 14 : 16,
    fontSize: isMobile ? 14 : 16,
    marginBottom: 16,
  },
  dropdownHeader: {
    backgroundColor: "#f1f5f9",
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: isMobile ? 14 : 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dropdownHeaderText: {
    fontSize: isMobile ? 14 : 16,
    color: "#334155",
    fontWeight: "600",
  },
  dropdownIcon: { fontSize: 14, color: "#64748b" },
  dropdownList: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    backgroundColor: "white",
    borderRadius: 14,
    marginTop: 6,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    zIndex: 100,
  },
  dropdownItem: {
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  activeDropdownItem: { backgroundColor: "#f8fafc" },
  dropdownItemText: { fontSize: isMobile ? 14 : 16, color: "#475569" },
  activeDropdownItemText: { color: "#9333ea", fontWeight: "bold" },
  messageCard: {
    backgroundColor: "white",
    borderRadius: 22,
    padding: isMobile ? 18 : 24,
    marginHorizontal: isMobile ? 16 : 24,
    marginBottom: 18,
    borderLeftWidth: 6,
    borderLeftColor: "#9333ea",
  },
  topRow: {
    flexDirection: isMobile ? "column" : "row",
    justifyContent: "space-between",
    alignItems: isMobile ? "flex-start" : "center",
    gap: 14,
  },
  ticketRow: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 8 },
  ticketId: {
    fontSize: isMobile ? 16 : 18,
    fontWeight: "bold",
    color: "#9333ea",
  },
  arrow: { fontSize: 18, color: "#64748b" },
  original: { color: "#334155", fontSize: isMobile ? 13 : 15 },
  badges: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  statusBadge: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999 },
  unreadBadge: { backgroundColor: "#fee2e2" },
  repliedBadge: { backgroundColor: "#dbeafe" },
  statusText: { fontWeight: "bold", fontSize: isMobile ? 12 : 14 },
  unreadText: { color: "#dc2626" },
  repliedText: { color: "#2563eb" },
  newBadge: {
    backgroundColor: "#ef4444",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  newBadgeText: { color: "white", fontWeight: "bold", fontSize: isMobile ? 12 : 14 },
  patientName: {
    fontSize: isMobile ? 22 : 28,
    fontWeight: "bold",
    marginTop: 18,
    color: "#111827",
  },
  dateText: { marginTop: 6, fontSize: isMobile ? 13 : 14, color: "#64748b" },
  messageBox: {
    marginTop: 22,
    backgroundColor: "#eff6ff",
    borderWidth: 1,
    borderColor: "#bfdbfe",
    borderRadius: 18,
    padding: isMobile ? 16 : 20,
  },
  messageLabel: {
    fontWeight: "bold",
    fontSize: isMobile ? 14 : 16,
    marginBottom: 10,
  },
  messageText: {
    fontSize: isMobile ? 15 : 18,
    color: "#334155",
    fontStyle: "italic",
    lineHeight: isMobile ? 22 : 28,
  },
  staffRow: {
    flexDirection: isMobile ? "column" : "row",
    justifyContent: "space-between",
    gap: isMobile ? 14 : 0,
    marginTop: 22,
  },
  staffBlock: { flex: 1 },
  staffLabel: { fontWeight: "bold", fontSize: isMobile ? 13 : 14, color: "#111827" },
  staffName: { marginTop: 4, fontSize: isMobile ? 14 : 15, color: "#475569" },
  chatButton: {
    marginTop: 24,
    backgroundColor: "#9333ea",
    paddingVertical: isMobile ? 14 : 16,
    borderRadius: 16,
    alignItems: "center",
  },
  chatButtonText: { color: "white", fontWeight: "bold", fontSize: isMobile ? 14 : 16 },
  emptyContainer: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#94a3b8",
    fontStyle: "italic",
    textAlign: "center",
  },
});