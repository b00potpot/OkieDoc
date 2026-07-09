import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function PatientQueueCard({ item, isSelected, onPress }) {
  // Logic mappings based on item status and type
  const isPending = item.status?.toLowerCase() === "pending";
  const isCallback = item.type === "callback";
  const isUrgent = item.status?.toLowerCase() === "urgent" || item.priority === "urgent";

  // Dynamic status colors
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "active": return "#16a34a";
      case "waiting": return "#60a5fa";
      case "urgent": return "#ef4444";
      default: return "#9ca3af";
    }
  };

  return (
    <TouchableOpacity
      style={[styles.patientCard, isSelected && styles.patientCardActive]}
      onPress={onPress}
    >
      <View style={styles.cardHeader}>
        <View style={styles.headerLeft}>
          <Text style={styles.ticket}>{item.ticket}</Text>
          
          {/* Conditional Callback Badge */}
          {isCallback && (
            <View style={styles.callbackBadge}>
              <Text style={styles.callbackBadgeText}>CB</Text>
            </View>
          )}

          {/* Conditional Urgent Tag */}
          {isUrgent && (
            <View style={styles.urgentBadge}>
              <Text style={styles.urgentBadgeText}>URGENT</Text>
            </View>
          )}
        </View>

        {/* Status Badge */}
        <View style={[styles.statusBadge, { borderColor: getStatusColor(item.status) }]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {item.status}
          </Text>
        </View>
      </View>

      <Text style={styles.patientNameCard}>{item.name}</Text>

      {/* Callback Contact Number */}
      {isCallback && item.contact && (
        <Text style={styles.callbackNumber}>{item.contact}</Text>
      )}

      {/* Communication Mode */}
      <View style={styles.cardRow}>
        <MaterialCommunityIcons
          name={isCallback ? "phone-outgoing" : "video-outline"}
          size={16}
          color="#6b7280"
        />
        <Text style={styles.typeText}>
          {isCallback ? "Callback Loop" : "Video Consultation"}
        </Text>
      </View>

      {/* Chief Complaint */}
      <Text style={styles.concernText} numberOfLines={2}>
        {item.concern}
      </Text>

      {/* Created Time */}
      <View style={styles.cardRow}>
        <MaterialCommunityIcons name="clock-outline" size={14} color="#9ca3af" />
        <Text style={styles.timeText}>{item.time || item.createdTime}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  patientCard: { 
    padding: 14, 
    backgroundColor: "#f9fafb", 
    borderRadius: 8, 
    marginBottom: 12, 
    borderWidth: 1, 
    borderColor: "#e5e7eb" 
  },
  patientCardActive: { 
    borderColor: "#2563eb", 
    backgroundColor: "#eff6ff" 
  },
  cardHeader: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "center", 
    marginBottom: 6 
  },
  headerLeft: { 
    flexDirection: "row", 
    alignItems: "center", 
    gap: 6 
  },
  ticket: { 
    fontSize: 12, 
    fontWeight: "700", 
    color: "#2563eb" 
  },
  callbackBadge: { 
    backgroundColor: "#fef3c7", 
    paddingHorizontal: 4, 
    paddingVertical: 2, 
    borderRadius: 4 
  },
  callbackBadgeText: { 
    fontSize: 10, 
    fontWeight: "bold", 
    color: "#d97706" 
  },
  urgentBadge: { 
    backgroundColor: "#fee2e2", 
    paddingHorizontal: 4, 
    paddingVertical: 2, 
    borderRadius: 4 
  },
  urgentBadgeText: { 
    fontSize: 10, 
    fontWeight: "bold", 
    color: "#dc2626" 
  },
  statusBadge: { 
    borderWidth: 1, 
    paddingVertical: 2, 
    paddingHorizontal: 6, 
    borderRadius: 4 
  },
  statusText: { 
    fontSize: 10, 
    fontWeight: "600", 
    textTransform: "capitalize" 
  },
  patientNameCard: { 
    fontSize: 15, 
    fontWeight: "600", 
    color: "#111827", 
    marginBottom: 4 
  },
  callbackNumber: { 
    fontSize: 13, 
    color: "#4b5563", 
    marginBottom: 4, 
    fontWeight: "500" 
  },
  cardRow: { 
    flexDirection: "row", 
    alignItems: "center", 
    gap: 6, 
    marginVertical: 4 
  },
  typeText: { 
    fontSize: 12, 
    color: "#4b5563" 
  },
  concernText: { 
    fontSize: 13, 
    color: "#6b7280", 
    marginVertical: 4 
  },
  timeText: { 
    fontSize: 11, 
    color: "#9ca3af" 
  },
});