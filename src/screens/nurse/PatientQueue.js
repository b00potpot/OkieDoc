import { useEffect, useState } from "react";
import { Button, FlatList, Text, View } from "react-native";
import { router } from "expo-router";
import api from "../../services/api";

export default function PatientQueue() {
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const res = await api.get("/patients");
      setPatients(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 20 }}>Patient Queue</Text>
      <FlatList
        data={patients}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={{ marginVertical: 10 }}>
            <Text>{item.name}</Text>
            <Button
              title="View"
              onPress={() =>
                // Pass the item data safely through Expo Router
                router.push({
                  pathname: "/PatientDetails", // Adjust pathname to match your actual file structure
                  params: { id: item.id, name: item.name, age: item.age } 
                })
              }
            />
          </View>
        )}
      />
    </View>
  );
}