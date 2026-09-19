import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../App";
import { useState, useEffect } from "react";
import { subscribeToConversations } from "../services/conversations";
import { getUser } from "../services/users";
import { Conversation } from "../types";
import { auth } from "../services/firebase";
import { logout } from "../services/auth";

type Props = NativeStackScreenProps<RootStackParamList, "ChatList">;

export default function ChatListScreen({ navigation }: Props) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [displayNames, setDisplayNames] = useState<Record<string, string>>({});
  const [onlineStatus, setOnlineStatus] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState("");

  const filteredConversations = conversations.filter((conversation) =>
    (displayNames[conversation.id] || "")
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    const unsubscribe = subscribeToConversations(userId, (data) => {
      setConversations(data);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    async function resolveNames() {
      const currentUserId = auth.currentUser?.uid;
      const names: Record<string, string> = {};
      const statuses: Record<string, boolean> = {};

      for (const conversation of conversations) {
        if (conversation.type === "group") {
          names[conversation.id] = conversation.name || "Group Chat";
          continue;
        }

        const otherUserId = conversation.participantIds.find(
          (id) => id !== currentUserId
        );
        if (otherUserId && !names[conversation.id]) {
          const user = await getUser(otherUserId);
          names[conversation.id] = user?.displayName || "Unknown";
          statuses[conversation.id] = user?.isOnline || false;
        }
      }

      setDisplayNames(names);
      setOnlineStatus(statuses);
    }

    resolveNames();
  }, [conversations]);

  return (
    <View style={styles.container}>
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate("NewChat")}
        >
          <Text style={styles.actionButtonText}>New Chat</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.logoutButton]}
          onPress={logout}
        >
          <Text style={styles.actionButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
      <TextInput
        style={styles.searchInput}
        placeholder="Search contacts..."
        placeholderTextColor="#999"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      <FlatList
        data={filteredConversations}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.contactRow}
            onPress={() =>
              navigation.navigate("ChatRoom", {
                contactId: item.id,
                contactName: displayNames[item.id] || "Chat",
              })
            }
          >
            <Text style={styles.contactName}>
              {item.type === "group"
                ? "👥 "
                : onlineStatus[item.id]
                ? "🟢 "
                : ""}
              {displayNames[item.id] || "..."}
            </Text>
            <Text style={styles.lastMessage}>{item.lastMessageText}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    paddingTop: 60,
  },
  buttonRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginBottom: 12,
    gap: 10,
  },
  actionButton: {
    flex: 1,
    backgroundColor: "#0d9588",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  logoutButton: {
    backgroundColor: "#3a3a3a",
  },
  actionButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },
  contactRow: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#2a2a2a",
  },
  contactName: {
    fontSize: 18,
    color: "#fff",
  },
  lastMessage: {
    fontSize: 14,
    color: "#999",
    marginTop: 4,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: "#333",
    backgroundColor: "#1e1e1e",
    color: "#fff",
    borderRadius: 8,
    padding: 10,
    marginHorizontal: 16,
    marginBottom: 10,
  },
});