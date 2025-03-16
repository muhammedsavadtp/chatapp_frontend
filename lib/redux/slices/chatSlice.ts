import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Message {
  _id: string;
  sender: { _id: string; name: string; profilePicture?: string };
  recipient?: string;
  group?: string;
  content: string;
  fileUrl?: string;
  timestamp: string;
  status: "Sent" | "Delivered" | "Read";
  read: boolean;
}

interface Chat {
  id: string;
  name: string;
  avatar: string;
  status: string;
  lastSeen?: string;
  lastMessage: string;
  time: string;
  unread: number;
  type: "personal" | "group";
  members?: unknown[];
  admins?: string[];
  createdBy?: string;
}

interface ChatState {
  chats: Chat[];
  selectedChat: Chat | null;
  messages: Message[];
}

const initialState: ChatState = {
  chats: [],
  selectedChat: null,
  messages: [],
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setChats(state, action: PayloadAction<Chat[]>) {
      state.chats = action.payload;
    },
    setSelectedChat(state, action: PayloadAction<Chat | null>) {
      state.selectedChat = action.payload;
    },
    setMessages(state, action: PayloadAction<Message[]>) {
      state.messages = action.payload;
    },
    addMessage(state, action: PayloadAction<Message>) {
      state.messages.push(action.payload);
    },
    markMessagesRead(state, action: PayloadAction<string>) {
      state.messages = state.messages.map((msg) =>
        msg.sender._id === action.payload && !msg.read
          ? { ...msg, status: "Read", read: true }
          : msg
      );
      const chat = state.chats.find((c) => c.id === action.payload);
      if (chat) chat.unread = 0;
    },
    updateChatStatus(
      state,
      action: PayloadAction<{ userId: string; status: string }>
    ) {
      state.chats = state.chats.map((chat) =>
        chat.id === action.payload.userId
          ? { ...chat, status: action.payload.status }
          : chat
      );
    },
    updateChatLastMessage(
      state,
      action: PayloadAction<{
        chatId: string;
        lastMessage: string;
        unread: boolean;
      }>
    ) {
      const chat = state.chats.find((c) => c.id === action.payload.chatId);
      if (chat) {
        chat.lastMessage = action.payload.lastMessage;
        chat.time = new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });
        if (action.payload.unread) {
          chat.unread = (chat.unread || 0) + 1;
        }
      }
    },
    addChat(state, action: PayloadAction<Chat>) {
      // Prevent duplicate chats by checking if the chat already exists
      if (!state.chats.some((chat) => chat.id === action.payload.id)) {
        state.chats.push(action.payload);
      }
    },
  },
});

export const {
  setChats,
  setSelectedChat,
  setMessages,
  addMessage,
  markMessagesRead,
  updateChatStatus,
  updateChatLastMessage,
  addChat,
} = chatSlice.actions;

export default chatSlice.reducer;
