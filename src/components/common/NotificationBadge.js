import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function NotificationBadge({ 
  count, 
  style, 
  textStyle, 
  showZero = false,
  maxCount = 99
}) {
  // Hide badge if count is 0 or undefined, unless explicitly told to show
  if (!showZero && (!count || count <= 0)) {
    return null;
  }

  // Format the display number to avoid breaking layouts with huge numbers
  const displayCount = count > maxCount ? `${maxCount}+` : count;

  return (
    <View style={[styles.badgeContainer, style]}>
      <Text style={[styles.badgeText, textStyle]}>
        {displayCount}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badgeContainer: {
    backgroundColor: '#ef4444', // Default OkieDoc+ red badge color
    borderRadius: 999,          // Fully rounded
    minWidth: 20,               // Ensures circular shape for single digits
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    marginLeft: 6,              // Standard offset from accompanying text/icons
  },
  badgeText: {
    color: 'white',
    fontSize: 11,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});