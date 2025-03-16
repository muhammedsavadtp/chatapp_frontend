// /lib/redux/slices/chatSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UserChat {
  id: string;
  name: string;
  avatar: string;
  status: string;
  lastSeen: string;
  lastMessage: string;
  time: string;
  unread: number;
  type: "personal" | "group";
}

interface Message {
  _id: string;
  sender: {
    _id: string;
    username: string;
    name: string;
    profilePicture: string;
  };
  recipient?: string; // Optional for personal chats
  group?: string; // Optional for group chats
  content: string;
  fileUrl?: string;
  status: "Delivered" | "Read";
  read: boolean;
  timestamp: string;
}

interface ChatState {
  chats: UserChat[];
  selectedChat: UserChat | null;
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
    setChats: (state, action: PayloadAction<UserChat[]>) => {
      state.chats = action.payload;
    },
    setSelectedChat: (state, action: PayloadAction<UserChat | null>) => {
      state.selectedChat = action.payload;
    },
    setMessages: (state, action: PayloadAction<Message[]>) => {
      state.messages = Array.isArray(action.payload) ? action.payload : [];
    },
    addChat: (state, action: PayloadAction<UserChat>) => {
      state.chats.push(action.payload);
    },
    addMessage: (state, action: PayloadAction<Message>) => {
      state.messages.push(action.payload);
      const chatId =
        action.payload.group ||
        action.payload.recipient ||
        action.payload.sender._id;
      const chat = state.chats.find((c) => c.id === chatId);
      if (chat) {
        chat.lastMessage =
          action.payload.content || (action.payload.fileUrl ? "File" : "");
        chat.time = new Date(action.payload.timestamp).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });
        if (action.payload.recipient === chat.id && !action.payload.read)
          chat.unread += 1;
      }
    },
    markMessagesRead: (state, action: PayloadAction<string>) => {
      if (state.selectedChat?.id === action.payload) {
        state.messages.forEach((msg) => {
          if (msg.recipient === state.selectedChat?.id && !msg.read) {
            msg.read = true;
            msg.status = "Read";
          }
        });
        const chat = state.chats.find((c) => c.id === action.payload);
        if (chat) chat.unread = 0;
      }
    },
    updateChatStatus: (
      state,
      action: PayloadAction<{ userId: string; status: string }>
    ) => {
      const chat = state.chats.find((c) => c.id === action.payload.userId);
      if (chat) chat.status = action.payload.status;
    },
  },
});

export const {
  setChats,
  setSelectedChat,
  setMessages,
  addChat,
  addMessage,
  markMessagesRead,
  updateChatStatus,
} = chatSlice.actions;
export default chatSlice.reducer;
