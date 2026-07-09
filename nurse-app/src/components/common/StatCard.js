import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function StatCard({
  title,
  count = 0,
  icon = "stats-chart-outline",
  color = "#2563eb",
  subtitle,
  badge,
  active = false,
  onPress,
}) {
  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container
      onPress={onPress}
      activeOpacity={0.8}
      style={[
        styles.card,
        active && styles.activeCard,
      ]}
    >
      {/* Top Row */}
      <View style={styles.topRow}>
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: `${color}15` },
          ]}
        >
          <Ionicons
            name={icon}
            size={22}
            color={color}
          />
        </View>

        {badge ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {badge}
            </Text>
          </View>
        ) : null}
      </View>

      {/* Count */}
      <Text style={styles.count}>
        {count}
      </Text>

      {/* Title */}
      <Text style={styles.title}>
        {title}
      </Text>

      {/* Subtitle */}
      {subtitle ? (
        <Text style={styles.subtitle}>
          {subtitle}
        </Text>
      ) : null}
    </Container>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 14,
    padding: 16,
    minHeight: 120,
    justifyContent: "space-between",
    flex: 1,
  },

  activeCard: {
    borderColor: "#2563eb",
    borderWidth: 2,
  },

  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },

  badge: {
    backgroundColor: "#dc2626",
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
  },

  badgeText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "700",
  },

  count: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111827",
    marginTop: 14,
  },

  title: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginTop: 4,
  },

  subtitle: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 6,
  },
});