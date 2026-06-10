import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";

import {
    Dimensions,
    Image,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

const { width } = Dimensions.get("window");

const isMobile = width < 768;

const nurseMessages = [
  {
    id: 1,
    sender: "nurse",
    text: "Hello! I’m Nurse Anna. How are you feeling today?",
  },
];

export default function FakeCallScreen() {
  const [callState, setCallState] = useState("connecting");

  const [muted, setMuted] = useState(false);

  const [cameraOn, setCameraOn] = useState(true);

  const [chatOpen, setChatOpen] = useState(false);

  const [message, setMessage] = useState("");

  const [messages, setMessages] =
    useState(nurseMessages);

  const [callEnded, setCallEnded] =
    useState(false);

  const [seconds, setSeconds] = useState(0);

  const autoCloseTimer = useRef(null);

  /* CONNECTING */
  useEffect(() => {
    const timeout = setTimeout(() => {
      setCallState("connected");
    }, 3000);

    return () => clearTimeout(timeout);
  }, []);

  /* CALL TIMER */
  useEffect(() => {
    let interval;

    if (callState === "connected") {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [callState]);

  /* AUTO CLOSE POPUP */
  useEffect(() => {
    if (callEnded) {
      autoCloseTimer.current = setTimeout(() => {
        setCallEnded(false);

        router.push("/NurseDashboard");
      }, 10000);
    }

    return () => {
      if (autoCloseTimer.current) {
        clearTimeout(autoCloseTimer.current);
      }
    };
  }, [callEnded]);

  const formattedTime = useMemo(() => {
    const mins = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");

    const secs = (seconds % 60)
      .toString()
      .padStart(2, "0");

    return `${mins}:${secs}`;
  }, [seconds]);

  const sendMessage = () => {
    if (!message.trim()) return;

    const newMessage = {
      id: Date.now(),
      sender: "user",
      text: message,
    };

    setMessages((prev) => [...prev, newMessage]);

    setMessage("");

    /* fake nurse reply */
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: "nurse",
          text: "Thank you for the update. I’ll note that down.",
        },
      ]);
    }, 1500);
  };

  const endCall = () => {
    setCallState("ended");

    setCallEnded(true);
  };

  const goBackNow = () => {
    if (autoCloseTimer.current) {
      clearTimeout(autoCloseTimer.current);
    }

    setCallEnded(false);

    router.push("/NurseDashboard");
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={
        Platform.OS === "ios"
          ? "padding"
          : undefined
      }
    >
      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>
            Telemedicine Consultation
          </Text>

          <Text style={styles.headerSubtitle}>
            Secure Nurse Video Call
          </Text>
        </View>

        <View style={styles.timerContainer}>
          <Ionicons
            name="time-outline"
            size={18}
            color="#111827"
          />

          <Text style={styles.timerText}>
            {formattedTime}
          </Text>
        </View>
      </View>

      {/* MAIN */}
      <View
        style={[
          styles.mainContent,

          isMobile && styles.mobileMainContent,
        ]}
      >
        {/* NURSE VIDEO */}
        <View style={styles.videoContainer}>
          {callState === "connecting" ? (
            <View style={styles.connectingContainer}>
              <Ionicons
                name="sync"
                size={50}
                color="#2563eb"
              />

              <Text style={styles.connectingText}>
                Connecting to Nurse...
              </Text>
            </View>
          ) : (
            <>
              {/* TOP STATUS */}
              <View style={styles.topOverlay}>
                <View style={styles.onlineContainer}>
                  <View style={styles.onlineDot} />

                  <Text style={styles.onlineText}>
                    Online
                  </Text>
                </View>
              </View>

              {/* CENTER */}
              <View style={styles.centerContent}>
                <Image
                  source={{
                    uri: "https://i.pravatar.cc/300?img=32",
                  }}
                  style={styles.nurseImage}
                />

                <Text style={styles.nurseName}>
                  Nurse Anna Cruz
                </Text>

                <Text style={styles.nurseRole}>
                  Nurse
                </Text>
              </View>

              {/* USER CAMERA */}
              <View style={styles.userPreview}>
                {cameraOn ? (
                  <>
                    <Image
                      source={{
                        uri: "https://i.pravatar.cc/300?img=12",
                      }}
                      style={styles.userImage}
                    />

                    <Text style={styles.userName}>
                      You
                    </Text>
                  </>
                ) : (
                  <View style={styles.cameraOff}>
                    <Ionicons
                      name="videocam-off"
                      size={30}
                      color="white"
                    />

                    <Text style={styles.userName}>
                      Camera Off
                    </Text>
                  </View>
                )}
              </View>
            </>
          )}

          {/* CONTROLS */}
          {callState === "connected" && (
            <View style={styles.controls}>
              <TouchableOpacity
                style={styles.controlButton}
                onPress={() =>
                  setMuted(!muted)
                }
              >
                <Ionicons
                  name={
                    muted ? "mic-off" : "mic"
                  }
                  size={24}
                  color="white"
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.controlButton}
                onPress={() =>
                  setCameraOn(!cameraOn)
                }
              >
                <Ionicons
                  name={
                    cameraOn
                      ? "videocam"
                      : "videocam-off"
                  }
                  size={24}
                  color="white"
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.controlButton}
              >
                <Ionicons
                  name="camera-reverse"
                  size={24}
                  color="white"
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.controlButton}
                onPress={() =>
                  setChatOpen(!chatOpen)
                }
              >
                <Ionicons
                  name="chatbubble"
                  size={24}
                  color="white"
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.endCallButton}
                onPress={endCall}
              >
                <Ionicons
                  name="call"
                  size={24}
                  color="white"
                />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* CHAT */}
        {chatOpen && (
          <View
            style={[
              styles.chatContainer,

              isMobile &&
                styles.mobileChatContainer,
            ]}
          >
            <View style={styles.chatHeader}>
              <Text style={styles.chatTitle}>
                Chat
              </Text>

              <TouchableOpacity
                onPress={() =>
                  setChatOpen(false)
                }
              >
                <Ionicons
                  name="close"
                  size={24}
                  color="#111827"
                />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.messagesContainer}
              contentContainerStyle={{
                paddingBottom: 10,
              }}
            >
              {messages.map((msg) => (
                <View
                  key={msg.id}
                  style={[
                    styles.messageBubble,

                    msg.sender === "user"
                      ? styles.userBubble
                      : styles.nurseBubble,
                  ]}
                >
                  <Text
                    style={[
                      styles.messageText,

                      msg.sender === "user" && {
                        color: "white",
                      },
                    ]}
                  >
                    {msg.text}
                  </Text>
                </View>
              ))}
            </ScrollView>

            <View style={styles.chatInputRow}>
              <TextInput
                value={message}
                onChangeText={setMessage}
                placeholder="Type a message..."
                style={styles.chatInput}
              />

              <TouchableOpacity
                style={styles.sendButton}
                onPress={sendMessage}
              >
                <Ionicons
                  name="send"
                  size={20}
                  color="white"
                />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {/* END CALL MODAL */}
      <Modal
        visible={callEnded}
        transparent
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Ionicons
              name="call-outline"
              size={60}
              color="#ef4444"
            />

            <Text style={styles.modalTitle}>
              Consultation Call Ended
            </Text>

            <Text style={styles.modalText}>
              Call Duration: {formattedTime}
            </Text>

            <Text style={styles.autoCloseText}>
              Returning to Nurse Dashboard in
              10 seconds...
            </Text>

            <TouchableOpacity
              style={styles.dashboardButton}
              onPress={goBackNow}
            >
              <Text
                style={styles.dashboardButtonText}
              >
                Return to Nurse Dashboard
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
  },

  header: {
    paddingTop: 55,
    paddingHorizontal: 18,
    paddingBottom: 14,

    backgroundColor: "#111827",

    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  headerTitle: {
    color: "white",
    fontSize: isMobile ? 20 : 28,
    fontWeight: "bold",
  },

  headerSubtitle: {
    color: "#94a3b8",
    marginTop: 4,
  },

  timerContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,

    backgroundColor: "white",

    paddingHorizontal: 12,
    paddingVertical: 8,

    borderRadius: 999,
  },

  timerText: {
    fontWeight: "bold",
  },

  mainContent: {
    flex: 1,
    flexDirection: "row",
  },

  mobileMainContent: {
    flexDirection: "column",
  },

  videoContainer: {
    flex: 1,
    backgroundColor: "#1e293b",
    position: "relative",
  },

  connectingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  connectingText: {
    marginTop: 20,
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },

  topOverlay: {
    position: "absolute",
    top: 20,
    right: 20,
    zIndex: 10,
  },

  onlineContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#111827",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },

  onlineDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    backgroundColor: "#22c55e",
    marginRight: 8,
  },

  onlineText: {
    color: "white",
    fontWeight: "600",
  },

  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  nurseImage: {
    width: isMobile ? 140 : 220,
    height: isMobile ? 140 : 220,
    borderRadius: 999,
    marginBottom: 20,
  },

  nurseName: {
    color: "white",
    fontSize: isMobile ? 24 : 38,
    fontWeight: "bold",
  },

  nurseRole: {
    color: "#cbd5e1",
    fontSize: 18,
    marginTop: 6,
  },

  userPreview: {
    position: "absolute",
    top: 20,
    left: 20,

    width: isMobile ? 100 : 180,
    height: isMobile ? 130 : 220,

    backgroundColor: "#334155",

    borderRadius: 18,
    overflow: "hidden",

    justifyContent: "center",
    alignItems: "center",
  },

  userImage: {
    width: "100%",
    height: "100%",
  },

  userName: {
    position: "absolute",
    bottom: 8,
    left: 8,
    color: "white",
    fontWeight: "bold",
  },

  cameraOff: {
    justifyContent: "center",
    alignItems: "center",
  },

  controls: {
    position: "absolute",
    bottom: 30,
    left: 0,
    right: 0,

    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",

    gap: 14,
  },

  controlButton: {
    width: isMobile ? 55 : 65,
    height: isMobile ? 55 : 65,

    borderRadius: 999,

    backgroundColor: "#334155",

    justifyContent: "center",
    alignItems: "center",
  },

  endCallButton: {
    width: isMobile ? 60 : 70,
    height: isMobile ? 60 : 70,

    borderRadius: 999,

    backgroundColor: "#ef4444",

    justifyContent: "center",
    alignItems: "center",
  },

  chatContainer: {
    width: 340,
    backgroundColor: "white",
    borderLeftWidth: 1,
    borderLeftColor: "#e5e7eb",
  },

  mobileChatContainer: {
    width: "100%",
    height: 320,
  },

  chatHeader: {
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",

    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  chatTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },

  messagesContainer: {
    flex: 1,
    padding: 14,
  },

  messageBubble: {
    maxWidth: "80%",
    padding: 14,
    borderRadius: 18,
    marginBottom: 12,
  },

  nurseBubble: {
    backgroundColor: "#f1f5f9",
    alignSelf: "flex-start",
  },

  userBubble: {
    backgroundColor: "#2563eb",
    alignSelf: "flex-end",
  },

  messageText: {
    color: "#111827",
  },

  chatInputRow: {
    flexDirection: "row",
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },

  chatInput: {
    flex: 1,
    backgroundColor: "#f1f5f9",
    borderRadius: 14,
    paddingHorizontal: 14,
    marginRight: 10,
  },

  sendButton: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: "#2563eb",

    justifyContent: "center",
    alignItems: "center",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",

    justifyContent: "center",
    alignItems: "center",

    padding: 20,
  },

  modalCard: {
    width: "100%",
    maxWidth: 420,

    backgroundColor: "white",

    borderRadius: 28,

    padding: 30,

    alignItems: "center",
  },

  modalTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#111827",
    marginTop: 20,
  },

  modalText: {
    marginTop: 14,
    fontSize: 18,
    color: "#475569",
  },

  autoCloseText: {
    marginTop: 10,
    color: "#94a3b8",
    textAlign: "center",
  },

  dashboardButton: {
    marginTop: 28,
    backgroundColor: "#2563eb",
    width: "100%",
    paddingVertical: 16,
    borderRadius: 18,
    alignItems: "center",
  },

  dashboardButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});