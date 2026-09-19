import {
  collection,
  query,
  where,
  onSnapshot,
  getDocs,
  addDoc,
} from "firebase/firestore";
import { db } from "./firebase";
import { Conversation } from "../types";
import { getUserByPhoneNumber } from "./users";

export function sortConversationsByRecent(
  conversations: Conversation[],
): Conversation[] {
  return [...conversations].sort((a, b) => b.lastMessageAt - a.lastMessageAt);
}

export function formatTimestamp(timestamp: number): string {
  const diffMs = Date.now() - timestamp;
  const diffMinutes = Math.floor(diffMs / (60 * 1000));
  const diffHours = Math.floor(diffMs / (60 * 60 * 1000));

  if (diffMinutes < 1) {
    return "just now";
  }

  if (diffHours < 1) {
    return `${diffMinutes}m ago`;
  }
  return `${diffHours}h ago`;
}

export function subscribeToConversations(
  userId: string,
  callback: (conversations: Conversation[]) => void,
): () => void {
  const conversationsRef = collection(db, "conversations");
  const q = query(
    conversationsRef,
    where("participantIds", "array-contains", userId),
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const conversations: Conversation[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Conversation[];

    callback(conversations);
  });

  return unsubscribe;
}

export async function findOrCreateConversation(
  currentUserId: string,
  targetPhoneNumber: string
): Promise<string | null> {
  const targetUser = await getUserByPhoneNumber(targetPhoneNumber);

  if (!targetUser) {
    return null;
  }

  const conversationsRef = collection(db, "conversations");
  const q = query(
    conversationsRef,
    where("participantIds", "array-contains", currentUserId)
  );
  const snapshot = await getDocs(q);

  const existing = snapshot.docs.find((doc) => {
    const data = doc.data() as Conversation;
    return (
      data.type === "direct" &&
      data.participantIds.includes(targetUser.id)
    );
  });

  if (existing) {
    return existing.id;
  }

  const newConversationRef = await addDoc(conversationsRef, {
    type: "direct",
    participantIds: [currentUserId, targetUser.id],
    lastMessageText: "",
    lastMessageAt: Date.now(),
  });

  return newConversationRef.id;
}

export async function createGroupConversation(
  currentUserId: string,
  participantPhoneNumbers: string[],
  groupName: string
): Promise<string> {
  const participantIds: string[] = [currentUserId];

  for (const phoneNumber of participantPhoneNumbers) {
    const user = await getUserByPhoneNumber(phoneNumber);
    if (user) {
      participantIds.push(user.id);
    }
  }

  const conversationsRef = collection(db, "conversations");

  const newConversationRef = await addDoc(conversationsRef, {
    type: "group",
    name: groupName,
    participantIds,
    lastMessageText: "",
    lastMessageAt: Date.now(),
  });

  return newConversationRef.id;
}