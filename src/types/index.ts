export interface User{
    id: string;
    phoneNumber:string;
    displayName: string;
    avatarUrl?: string;
    isOnline?: boolean;
    lastSeen?: number;
}

export interface Conversation{
    id: string;
    type: "direct" | "group";
    participantIds: string[];
    name?: string;
    lastMessageText: string;
    lastMessageAt: number;
}

export interface Message{
    id: string;
    conversationId: string;
    senderId: string;
    text: string;
    createdAt: number;
}