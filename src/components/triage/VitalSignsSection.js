import React, { useState } from 'react';
import { TextInput, View, Text } from 'react-native';

export default function VitalSignsSection({ setVitals }) {
  const [bp, setBp] = useState('');
  const bloodPressureRegex = /^\d+\/\d+$/;

  const handleBpChange = (text) => {
    setBp(text);
    if (bloodPressureRegex.test(text)) {
      setVitals(prev => ({ ...prev, bp: text }));
    }
  };

  return (
    <View>
      <TextInput 
        placeholder="BP (e.g., 120/80)" 
        value={bp} 
        onChangeText={handleBpChange} 
        style={{ borderWidth: 1, padding: 8 }} 
      />
      <TextInput 
        placeholder="Heart Rate" 
        keyboardType="numeric" 
        style={{ borderWidth: 1, padding: 8, marginTop: 10 }} 
      />
    </View>
  );
}