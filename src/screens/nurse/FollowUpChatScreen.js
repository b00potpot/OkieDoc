import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, router } from "expo-router";

// Import your mock data
import { mockFollowups } from "../../mock/followups";

export default function FollowUpChatScreen() {
  const { id } = useLocalSearchParams();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [followupDetails, setFollowupDetails] = useState(null);

  useEffect(() => {
    // Find the specific follow-up from mock data
    const found = mockFollowups.find((f) => f.id === id);
    if (found) {
      setFollowupDetails(found);
      // Simulate a message thread based on the mock message
      setMessages([
        { id: "1", sender: "patient", text: found.message, timestamp: "10:30 AM" },
        { id: "2", sender: "nurse", text: "Thank you for the update. I have noted this.", timestamp: "10:35 AM" },
      ]);
    }
  }, [id]);

  const sendMessage = () => {
    if (inputText.trim() === "") return;
    const newMessage = {
      id: Date.now().toString(),
      sender: "nurse",
      text: inputText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages([...messages, newMessage]);
    setInputText("");
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {followupDetails ? `Chat: ${followupDetails.patientName}` : "Loading..."}
        </Text>
        <TouchableOpacity>
          <Ionicons name="ellipsis-vertical" size={24} color="#111827" />
        </TouchableOpacity>
      </View>

      {/* Chat Messages */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.chatArea}
        keyboardVerticalOffset={100}
      >
        <ScrollView contentContainerStyle={styles.messageList}>
          {messages.map((msg) => (
            <View
              key={msg.id}
              style={[
                styles.messageBubble,
                msg.sender === "nurse" ? styles.myMessage : styles.theirMessage,
              ]}
            >
              <Text style={msg.sender === "nurse" ? styles.myText : styles.theirText}>
                {msg.text}
              </Text>
              <Text style={styles.timestamp}>{msg.timestamp}</Text>
            </View>
          ))}
        </ScrollView>

        {/* Input Area */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="Type a response..."
            value={inputText}
            onChangeText={setInputText}
          />
          <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
            <Ionicons name="send" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  header: {
    flexDirection: "row",
    padding: 16,
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  headerTitle: { fontSize: 16, fontWeight: "700" },
  chatArea: { flex: 1 },
  messageList: { padding: 16 },
  messageBubble: {
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
    maxWidth: "80%",
  },
  myMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#9333ea",
  },
  theirMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#e5e7eb",
  },
  myText: { color: "#fff" },
  theirText: { color: "#111827" },
  timestamp: { fontSize: 10, marginTop: 4, color: "#9ca3af", alignSelf: "flex-end" },
  inputContainer: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    alignItems: "center",
  },
  textInput: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: "#9333ea",
    padding: 12,
    borderRadius: 20,
  },
});