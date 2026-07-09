import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';

export default function AuditTrailTab({ patient }) {
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Only fetch if a valid patient object with an ID was passed
    if (patient?.id) {
      fetchAuditLogs();
    } else {
      setLoading(false);
    }
  }, [patient?.id]);

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      setError(null);

      // Replace this URL with your actual endpoint or Axios service call
      // Example: await api.get(`/patients/${patient.id}/audit-logs`)
      const response = await fetch(`/api/patients/${patient.id}/audit-logs`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch audit logs');
      }

      const data = await response.json();
      setAuditLogs(data || []);
    } catch (err) {
      console.error("Error fetching audit logs:", err);
      setError("Could not load the audit trail.");
    } finally {
      setLoading(false);
    }
  };

  // Helper function to format Sails.js ISO date strings into readable formats
  const formatDateTime = (isoString) => {
    if (!isoString) return 'N/A';
    const date = new Date(isoString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerBox]}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centerBox]}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (auditLogs.length === 0) {
    return (
      <View style={[styles.container, styles.centerBox]}>
        <Text style={styles.emptyText}>No activity recorded yet.</Text>
      </View>
    );
  }

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
      {auditLogs.map((log, index) => (
        <View key={log.id} style={styles.timelineRow}>
          
          {/* Vertical Line & Dot */}
          <View style={styles.timelineGraphic}>
            <View style={styles.dot} />
            {index !== auditLogs.length - 1 && <View style={styles.line} />}
          </View>

          {/* Content Box */}
          <View style={styles.contentBox}>
            {/* Note: Adjust the keys (createdAt, action, details, performedBy) 
              below to match the exact JSON keys returned by your Sails backend.
            */}
            <Text style={styles.dateText}>{formatDateTime(log.createdAt)}</Text>
            <Text style={styles.actionText}>{log.action || 'System Action'}</Text>
            <Text style={styles.descText}>{log.details || log.description}</Text>
            
            {/* Optional chaining handles nested populated user data gracefully */}
            <Text style={styles.userText}>
              Performed by: {log.performedBy?.fullName || log.performedBy || 'System'}
            </Text>
          </View>
          
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingVertical: 10, paddingHorizontal: 4 },
  centerBox: { flex: 1, justifyContent: 'center', alignItems: 'center', minHeight: 200 },
  timelineRow: { flexDirection: 'row', minHeight: 90 },
  timelineGraphic: { width: 30, alignItems: 'center' },
  dot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#2563eb', marginTop: 4, zIndex: 10 },
  line: { width: 2, flex: 1, backgroundColor: '#bfdbfe', marginTop: -4 },
  contentBox: { flex: 1, paddingBottom: 24, paddingLeft: 12 },
  dateText: { fontSize: 12, color: '#6b7280', fontWeight: '600', marginBottom: 2 },
  actionText: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 4 },
  descText: { fontSize: 14, color: '#4b5563', marginBottom: 6 },
  userText: { fontSize: 12, color: '#9ca3af', fontStyle: 'italic' },
  errorText: { color: '#ef4444', fontSize: 14, fontWeight: '600' },
  emptyText: { color: '#6b7280', fontSize: 14, fontStyle: 'italic' }
});