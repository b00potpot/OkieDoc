import { Button, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";

export default function PatientDetails() {
  // Extract params using Expo Router
  const params = useLocalSearchParams(); 
  // Assuming patient was passed as a stringified JSON or separate params
  const patientName = params.name; 
  const patientAge = params.age;

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 20 }}>Patient Details</Text>
      <Text>Name: {patientName}</Text>
      <Text>Age: {patientAge}</Text>
      <Button
        title="Create Consultation Ticket"
        onPress={() =>
          // Pass params via router.push
          router.push({
            pathname: "/CreateTicket",
            params: { name: patientName, age: patientAge }
          })
        }
      />
    </View>
  );
}