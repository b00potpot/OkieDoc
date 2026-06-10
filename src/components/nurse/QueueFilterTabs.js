import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

export default function QueueFilterTabs({ activeTab, onTabChange, totalCount, consultCount, callbackCount }) {
  // Define tab data with dynamic counts
  const tabs = [
    { key: "all", label: "All", count: totalCount },
    { key: "consults", label: "Consults", count: consultCount },
    { key: "callbacks", label: "Callbacks", count: callbackCount },
  ];

  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false} 
      style={styles.scrollContainer}
    >
      <View style={styles.filterContainer}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.filterBtn, isActive && styles.filterBtnActive]}
              onPress={() => onTabChange(tab.key)}
            >
              <Text style={[styles.filterBtnText, isActive && styles.filterBtnTextActive]}>
                {tab.label} ({tab.count})
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: { marginBottom: 16 },
  filterContainer: { flexDirection: "row", gap: 8 },
  filterBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "#f3f4f6", // Neutral gray for inactive
  },
  filterBtnActive: { backgroundColor: "#111827" }, // Dark tone for active
  filterBtnText: { fontSize: 13, color: "#4b5563", fontWeight: "600" },
  filterBtnTextActive: { color: "#ffffff" },
});