// /lib/socket.ts
import { io } from "socket.io-client";

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const socket = io(SOCKET_URL, {
  transports: ["websocket"],
  autoConnect: false,
});

socket.on("connect", () => console.log("Socket connected:", socket.id));
socket.on("connect_error", (error) =>
  console.error("Socket connection error:", error)
);

let lastUserId: string | null = null;

export const initializeSocket = (userId: string) => {
  if (lastUserId === userId && socket.connected) return;

  if (socket.connected) socket.disconnect();

  socket.connect();
  lastUserId = userId;
  socket.emit("join", userId);
};

export const emitSendMessage = (message: {
  recipientId: string;
  content: string;
  fileUrl?: string;
}) => {
  socket.emit("sendMessage", message);
};

// export const emitSendGroupMessage = (message: {
//   groupId: string;
//   content: string;
//   fileUrl?: string;
// }) => {
//   socket.emit("sendGroupMessage", message);
// };

// /lib/socket.ts (excerpt)
export const emitSendGroupMessage = (data: { groupId: string; content: string; fileUrl?: string }) => {
  socket.emit("sendGroupMessage", data);
};

export const onGroupMessageReceived = (callback: (msg: any) => void) => {
  socket.on("receiveGroupMessage", callback);
};

export const emitTyping = (data: {
  recipientId?: string;
  groupId?: string;
}) => {
  socket.emit("typing", data);
};

export const emitStopTyping = (data: {
  recipientId?: string;
  groupId?: string;
}) => {
  socket.emit("stopTyping", data);
};

export const onUserStatusUpdate = (
  callback: (data: { userId: string; status: string }) => void
) => socket.on("userStatus", callback);

export const onMessageReceived = (callback: (message: any) => void) =>
  socket.on("receiveMessage", callback);

// export const onGroupMessageReceived = (callback: (message: any) => void) =>
//   socket.on("receiveGroupMessage", callback);

export const onMessagesRead = (
  callback: (data: { recipientId: string; messages: any[] }) => void
) => socket.on("messagesRead", callback);

export const onUserTyping = (callback: (data: { senderId: string }) => void) =>
  socket.on("userTyping", callback);

export const onUserStoppedTyping = (
  callback: (data: { senderId: string }) => void
) => socket.on("userStoppedTyping", callback);

export default socket;
