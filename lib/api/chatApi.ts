// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import axiosInstance from "./axiosInstance";

export interface Message {
  _id: string;
  sender: {
    _id: string;
    username: string;
    name: string;
    profilePicture: string;
  };
  recipient?: string;
  group?: string;
  content: string;
  fileUrl?: string;
  status: "Delivered" | "Read";
  read: boolean;
  timestamp: string;
  __v?: number;
}

export interface UserChat {
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

export const getMessages = async (recipientId: string): Promise<Message[]> => {
  const response = await axiosInstance.get(`/chat/messages/${recipientId}`);
  return response.data;
};

export const uploadFile = async (file: File): Promise<{ fileUrl: string }> => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await axiosInstance.post("/chat/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const getUserChats = async (): Promise<UserChat[]> => {
  const response = await axiosInstance.get("/chat/user-chats");
  return response.data;
};

export const markMessagesAsRead = async (
  recipientId: string
): Promise<{ message: string; modifiedCount: number }> => {
  const response = await axiosInstance.put("/chat/messages/read", {
    recipientId,
  });
  return response.data;
};
