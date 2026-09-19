import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../App";
import {
  findOrCreateConversation,
  createGroupConversation,
} from "../services/conversations";
import { auth } from "../services/firebase";
import { isValidPhoneNumber } from "../utils/validation";

type Props = NativeStackScreenProps<RootStackParamList, "NewChat">;

export default function NewChatScreen({ navigation }: Props) {
  const [mode, setMode] = useState<"direct" | "group">("direct");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [groupPhoneNumbers, setGroupPhoneNumbers] = useState("");
  const [groupName, setGroupName] = useState("");
  const [error, setError] = useState("");

  async function handleStartDirectChat() {
    setError("");

    if (!isValidPhoneNumber(phoneNumber)) {
      setError(
        "Please enter a valid phone number with country code, e.g. +19078374571",
      );
      return;
    }

    const currentUserId = auth.currentUser?.uid;
    if (!currentUserId) return;

    const conversationId = await findOrCreateConversation(
      currentUserId,
      phoneNumber,
    );

    if (!conversationId) {
      setError("No account found with that phone number.");
      return;
    }

    navigation.navigate("ChatRoom", {
      contactId: conversationId,
      contactName: phoneNumber,
    });
  }

  async function handleCreateGroup() {
    setError("");
    const currentUserId = auth.currentUser?.uid;
    if (!currentUserId) return;

    if (groupName.trim() === "") {
      setError("Please enter a group name.");
      return;
    }

    const phoneNumbers = groupPhoneNumbers
      .split(",")
      .map((n) => n.trim())
      .filter((n) => n !== "");

    const invalidNumbers = phoneNumbers.filter((n) => !isValidPhoneNumber(n));
    if (invalidNumbers.length > 0) {
      setError(
        `Invalid number(s): ${invalidNumbers.join(", ")}. Use full format e.g. +19078374571`,
      );
      return;
    }

    const conversationId = await createGroupConversation(
      currentUserId,
      phoneNumbers,
      groupName,
    );

    navigation.navigate("ChatRoom", {
      contactId: conversationId,
      contactName: groupName,
    });
  }

  return (
    <View style={styles.container}>
      <View style={styles.modeRow}>
        <TouchableOpacity
          style={[
            styles.modeButton,
            mode === "direct" && styles.modeButtonActive,
          ]}
          onPress={() => setMode("direct")}
        >
          <Text style={styles.modeButtonText}>Direct Chat</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.modeButton,
            mode === "group" && styles.modeButtonActive,
          ]}
          onPress={() => setMode("group")}
        >
          <Text style={styles.modeButtonText}>Group Chat</Text>
        </TouchableOpacity>
      </View>

      {mode === "direct" ? (
        <>
          <Text style={styles.label}>Start a direct chat</Text>
          <TextInput
            placeholder="Phone number"
            placeholderTextColor="#999"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            onSubmitEditing={handleStartDirectChat}
            style={styles.input}
          />
          {error !== "" && <Text style={styles.error}>{error}</Text>}
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleStartDirectChat}
          >
            <Text style={styles.actionButtonText}>Start Chat</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text style={styles.label}>Create a group chat</Text>
          <TextInput
            placeholder="Group name"
            placeholderTextColor="#999"
            value={groupName}
            onChangeText={setGroupName}
            style={styles.input}
          />
          <TextInput
            placeholder="Phone numbers, separated by commas"
            placeholderTextColor="#999"
            value={groupPhoneNumbers}
            onChangeText={setGroupPhoneNumbers}
            onSubmitEditing={handleCreateGroup}
            style={styles.input}
          />
          {error !== "" && <Text style={styles.error}>{error}</Text>}
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleCreateGroup}
          >
            <Text style={styles.actionButtonText}>Create Group</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    padding: 20,
  },
  modeRow: {
    flexDirection: "row",
    marginBottom: 20,
    gap: 10,
  },
  modeButton: {
    flex: 1,
    backgroundColor: "#2a2a2a",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  modeButtonActive: {
    backgroundColor: "#0d9588",
  },
  modeButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  label: {
    color: "#fff",
    fontSize: 16,
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#333",
    backgroundColor: "#1e1e1e",
    color: "#fff",
    borderRadius: 8,
    padding: 10,
    marginVertical: 10,
  },
  error: {
    color: "#ff6b6b",
    marginBottom: 10,
  },
  actionButton: {
    backgroundColor: "#0d9588",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 10,
  },
  actionButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});
