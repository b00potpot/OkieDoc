import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const VARIANTS = {
  primary: {
    backgroundColor: "#2563eb",
    borderColor: "#2563eb",
    textColor: "#ffffff",
  },

  secondary: {
    backgroundColor: "#f3f4f6",
    borderColor: "#e5e7eb",
    textColor: "#374151",
  },

  success: {
    backgroundColor: "#16a34a",
    borderColor: "#16a34a",
    textColor: "#ffffff",
  },

  danger: {
    backgroundColor: "#dc2626",
    borderColor: "#dc2626",
    textColor: "#ffffff",
  },

  outline: {
    backgroundColor: "#ffffff",
    borderColor: "#d1d5db",
    textColor: "#374151",
  },

  disabled: {
    backgroundColor: "#d1d5db",
    borderColor: "#d1d5db",
    textColor: "#6b7280",
  },
};

export default function ActionButton({
  title,
  onPress,
  icon,
  variant = "primary",
  loading = false,
  disabled = false,
  style,
  textStyle,
}) {
  const currentVariant = disabled
    ? VARIANTS.disabled
    : VARIANTS[variant];

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.button,
        {
          backgroundColor:
            currentVariant.backgroundColor,
          borderColor:
            currentVariant.borderColor,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          color={currentVariant.textColor}
        />
      ) : (
        <View style={styles.content}>
          {icon ? (
            <Ionicons
              name={icon}
              size={18}
              color={currentVariant.textColor}
              style={styles.icon}
            />
          ) : null}

          <Text
            style={[
              styles.text,
              {
                color: currentVariant.textColor,
              },
              textStyle,
            ]}
          >
            {title}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 46,
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 12,
  },

  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  icon: {
    marginRight: 8,
  },

  text: {
    fontSize: 14,
    fontWeight: "600",
  },
});