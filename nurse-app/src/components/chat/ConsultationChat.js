import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export default function ConsultationChat({ messages, onSendMessage, currentUser }) {
  const [text, setText] = useState('');

  const renderMessage = ({ item }) => {
    const isMe = item.senderId === currentUser.id;
    return (
      <View style={[styles.bubbleWrapper, isMe ? styles.myBubble : styles.theirBubble]}>
        <Text style={styles.messageText}>{item.text}</Text>
        <Text style={styles.timestamp}>{item.timestamp}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.listContent}
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder="Type a message..."
        />
        <TouchableOpacity onPress={() => { onSendMessage(text); setText(''); }}>
          <MaterialIcons name="send" size={24} color="#2563eb" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  listContent: { padding: 16 },
  bubbleWrapper: { padding: 12, borderRadius: 12, marginVertical: 4, maxWidth: '80%' },
  myBubble: { alignSelf: 'flex-end', backgroundColor: '#dbeafe' },
  theirBubble: { alignSelf: 'flex-start', backgroundColor: '#f3f4f6' },
  messageText: { fontSize: 14, color: '#111827' },
  timestamp: { fontSize: 10, color: '#6b7280', marginTop: 4, textAlign: 'right' },
  inputContainer: { flexDirection: 'row', padding: 12, borderTopWidth: 1, borderColor: '#e5e7eb', alignItems: 'center' },
  input: { flex: 1, padding: 8, backgroundColor: '#f9fafb', borderRadius: 8, marginRight: 10 }
});