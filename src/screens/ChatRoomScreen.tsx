import { useState, useEffect } from "react";
import { getUser } from "../services/users";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Button,
  FlatList,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../App";
import { subscribeToMessages, sendMessage } from "../services/messages";
import { Message } from "../types";
import { auth } from "../services/firebase";

type Props = NativeStackScreenProps<RootStackParamList, "ChatRoom">;

export default function ChatRoomScreen({ route }: Props) {
  const { contactId, contactName } = route.params;
  const conversationId = contactId;

  const [messageText, setMessageText] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [senderNames, setSenderNames] = useState<Record<string, string>>({});

  useEffect(() => {
    const unsubscribe = subscribeToMessages(conversationId, (data) => {
      setMessages(data);
    });

    return () => unsubscribe();
  }, [conversationId]);

  async function handleSend() {
    if (messageText.trim() === "") return;

    const senderId = auth.currentUser?.uid;
    if (!senderId) return;

    await sendMessage(conversationId, senderId, messageText);
    setMessageText("");
  }

  useEffect(() => {
    async function resolveSenderNames() {
      const names: Record<string, string> = { ...senderNames };
      let changed = false;

      for (const message of messages) {
        if (!names[message.senderId]) {
          const user = await getUser(message.senderId);
          names[message.senderId] = user?.displayName || "Unknown";
          changed = true;
        }
      }

      if (changed) {
        setSenderNames(names);
      }
    }

    resolveSenderNames();
  }, [messages]);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{contactName}</Text>
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const isMine = item.senderId === auth.currentUser?.uid;
          return (
            <View
              style={[
                styles.messageBubble,
                isMine ? styles.myMessage : styles.theirMessage,
              ]}
            >
              {!isMine && (
                <Text style={styles.senderName}>
                  {senderNames[item.senderId] || "..."}
                </Text>
              )}
              <Text style={styles.messageText}>{item.text}</Text>
            </View>
          );
        }}
        style={styles.list}
      />

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Type here..."
          value={messageText}
          onChangeText={setMessageText}
          onSubmitEditing={handleSend}
        />

        <Button title="Send" onPress={handleSend} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    paddingTop: 20,
  },
  header: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  list: {
    flex: 1,
    paddingHorizontal: 10,
  },
  messageBubble: {
    padding: 10,
    borderRadius: 12,
    marginVertical: 4,
    maxWidth: "75%",
  },
  myMessage: {
    backgroundColor: "#0d9588",
    alignSelf: "flex-end",
  },
  theirMessage: {
    backgroundColor: "#2a2a2a",
    alignSelf: "flex-start",
  },
  messageText: {
    fontSize: 16,
    color: "#fff",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: "#333",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#333",
    backgroundColor: "#1e1e1e",
    color: "#fff",
    borderRadius: 8,
    padding: 10,
    marginRight: 8,
  },
  senderName: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#aaa",
    marginBottom: 2,
  },
});
