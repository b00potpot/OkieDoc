import { View, Text, StyleSheet } from "react-native";

export default function StatusBadge({ status }: { status: string }) {
  const getColor = () => {
    switch (status) {
      case "Pending":
        return "#F59E0B"; // Orange

      case "Approved":
        return "#3B82F6"; // Blue

      case "Completed":
        return "#10B981"; // Green

      case "Cancelled":
        return "#EF4444"; // Red

      default:
        return "#6B7280";
    }
  };

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: getColor() + "20" }
      ]}
    >
      <Text
        style={[
          styles.text,
          { color: getColor() }
        ]}
      >
        {status}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    alignSelf: "flex-start",
  },

  text: {
    fontWeight: "600",
    fontSize: 12,
  },
});