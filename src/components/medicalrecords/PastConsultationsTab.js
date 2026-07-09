import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';

export default function PastConsultationsTab({ patient }) {
  // Directly pull from live data, safely falling back to an empty array
  const historyData = patient?.history || [];

  const renderItem = ({ item }) => (
    <View style={styles.tableRow}>
      <Text style={[styles.cell, { flex: 1, fontWeight: '700', color: '#2563eb' }]}>
        {item.id}
      </Text>
      <Text style={[styles.cell, { flex: 1 }]}>{item.date}</Text>
      <Text style={[styles.cell, { flex: 1 }]}>{item.type}</Text>
      <Text style={[styles.cell, { flex: 1.5 }]}>{item.doctor}</Text>
      <Text style={[styles.cell, { flex: 2 }]} numberOfLines={1}>
        {item.complaint}
      </Text>
      <Text style={[styles.cell, { flex: 2 }]} numberOfLines={1}>
        {item.diagnosis}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Table Header */}
      <View style={styles.tableHeader}>
        <Text style={[styles.headerCell, { flex: 1 }]}>Ticket ID</Text>
        <Text style={[styles.headerCell, { flex: 1 }]}>Date</Text>
        <Text style={[styles.headerCell, { flex: 1 }]}>Type</Text>
        <Text style={[styles.headerCell, { flex: 1.5 }]}>Doctor</Text>
        <Text style={[styles.headerCell, { flex: 2 }]}>Complaint</Text>
        <Text style={[styles.headerCell, { flex: 2 }]}>Diagnosis</Text>
      </View>
      
      {/* Table Body */}
      <FlatList
        data={historyData}
        keyExtractor={(item) => item.id?.toString()}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No past consultation records found.</Text>
        }
      />
      
      {/* Pagination Container */}
      <View style={styles.pagination}>
        <TouchableOpacity style={styles.pageBtn}>
          <Text style={styles.pageText}>Prev</Text>
        </TouchableOpacity>
        <Text style={styles.pageIndicator}>
          {historyData.length > 0 ? 'Page 1' : 'Page 0'}
        </Text>
        <TouchableOpacity style={styles.pageBtn}>
          <Text style={styles.pageText}>Next</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "white", borderRadius: 8, borderWidth: 1, borderColor: "#e5e7eb", overflow: 'hidden' },
  tableHeader: { flexDirection: "row", backgroundColor: "#f8fafc", paddingVertical: 14, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: "#e5e7eb" },
  headerCell: { fontWeight: "700", color: "#4b5563", fontSize: 13 },
  tableRow: { flexDirection: "row", alignItems: "center", paddingVertical: 16, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
  cell: { color: "#111827", fontSize: 13 },
  emptyText: { padding: 20, textAlign: 'center', color: '#9ca3af', fontStyle: 'italic' },
  pagination: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderTopWidth: 1, borderTopColor: '#e5e7eb', backgroundColor: '#f8fafc' },
  pageBtn: { paddingVertical: 6, paddingHorizontal: 12, backgroundColor: 'white', borderWidth: 1, borderColor: '#d1d5db', borderRadius: 6 },
  pageText: { fontSize: 13, fontWeight: '600', color: '#374151' },
  pageIndicator: { fontSize: 13, color: '#6b7280' }
});