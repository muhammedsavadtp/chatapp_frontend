// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
"use client";
import React, { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/lib/redux/store";
import {
  setMessages,
  addMessage,
  markMessagesRead,
} from "@/lib/redux/slices/chatSlice";
import { getMessages, markMessagesAsRead, uploadFile } from "@/lib/api/chatApi";
import socket, {
  emitSendMessage,
  emitSendGroupMessage,
  onMessageReceived,
  onGroupMessageReceived,
  emitTyping,
  emitStopTyping,
  onUserTyping,
  onUserStoppedTyping,
  onMessagesRead,
  emitJoinGroup,
} from "@/lib/socket";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Paperclip, Send, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export function ChatView() {
  const dispatch = useDispatch();
  const { selectedChat, messages } = useSelector(
    (state: RootState) => state.chat
  );
  const { profile } = useSelector((state: RootState) => state.user);
  const [newMessage, setNewMessage] = useState("");
  const [typingUsers, setTypingUsers] = useState<
    { id: string; name: string }[]
  >([]);
  const messageEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (selectedChat) {
      if (selectedChat.type === "group") {
        emitJoinGroup(selectedChat.id);
        console.log(`Joined group room: ${selectedChat.id}`);
      }

      const fetchMessages = async () => {
        try {
          const data = await getMessages(selectedChat.id);
          const fetchedMessages = Array.isArray(data)
            ? data
            : data.messages || [];
          dispatch(setMessages(fetchedMessages));
          if (
            selectedChat.type === "personal" &&
            fetchedMessages.some((msg) => !msg.read)
          ) {
            await markMessagesAsRead(selectedChat.id);
            dispatch(markMessagesRead(selectedChat.id));
          }
        } catch (error) {
          console.error("Error fetching messages:", error);
          dispatch(setMessages([]));
        }
      };
      fetchMessages();

      const messageListener = (msg) => {
        if (
          selectedChat.type === "personal" &&
          ((msg.recipient === profile?.id &&
            msg.sender._id === selectedChat.id) ||
            (msg.sender._id === profile?.id &&
              msg.recipient === selectedChat.id))
        ) {
          dispatch(addMessage(msg));
          if (!msg.read) {
            markMessagesAsRead(selectedChat.id);
            dispatch(markMessagesRead(selectedChat.id));
          }
        }
      };

      const groupMessageListener = (msg) => {
        if (selectedChat.type === "group" && msg.group === selectedChat.id) {
          dispatch(addMessage(msg));
        }
      };

      const messagesReadListener = ({
        recipientId,
        messages: updatedMessages,
      }) => {
        if (
          selectedChat.type === "personal" &&
          recipientId === selectedChat.id
        ) {
          dispatch(setMessages(updatedMessages));
        }
      };

      onMessageReceived(messageListener);
      onGroupMessageReceived(groupMessageListener);
      onMessagesRead(messagesReadListener);

      onUserTyping(({ senderId, groupId }) => {
        if (senderId !== profile?.id) {
          const senderName =
            selectedChat.members?.find((m) => m._id === senderId)?.name ||
            "Unknown";
          if (selectedChat.type === "group" && groupId === selectedChat.id) {
            setTypingUsers((prev) => {
              if (!prev.some((user) => user.id === senderId)) {
                return [...prev, { id: senderId, name: senderName }];
              }
              return prev;
            });
          } else if (
            selectedChat.type === "personal" &&
            senderId === selectedChat.id
          ) {
            setTypingUsers([{ id: senderId, name: selectedChat.name }]);
          }
        }
      });

      onUserStoppedTyping(({ senderId, groupId }) => {
        if (selectedChat.type === "group" && groupId === selectedChat.id) {
          setTypingUsers((prev) => prev.filter((user) => user.id !== senderId));
        } else if (
          selectedChat.type === "personal" &&
          senderId === selectedChat.id
        ) {
          setTypingUsers([]);
        }
      });

      return () => {
        socket.off("receiveMessage", messageListener);
        socket.off("receiveGroupMessage", groupMessageListener);
        socket.off("messagesRead", messagesReadListener);
        socket.off("userTyping");
        socket.off("userStoppedTyping");
      };
    }
  }, [selectedChat, dispatch, profile?.id]);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedChat || !profile) return;

    const messagePayload = {
      [selectedChat.type === "group" ? "groupId" : "recipientId"]:
        selectedChat.id,
      content: newMessage,
    };

    try {
      if (selectedChat.type === "group") {
        emitSendGroupMessage(messagePayload);
      } else {
        emitSendMessage(messagePayload);
      }
      setNewMessage("");
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        emitStopTyping({
          [selectedChat.type === "group" ? "groupId" : "recipientId"]:
            selectedChat.id,
        });
      }
    } catch (error) {
      console.error("Error emitting message:", error);
    }
  };

  const handleTyping = () => {
    if (!selectedChat) return;
    emitTyping({
      [selectedChat.type === "group" ? "groupId" : "recipientId"]:
        selectedChat.id,
    });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      emitStopTyping({
        [selectedChat.type === "group" ? "groupId" : "recipientId"]:
          selectedChat.id,
      });
    }, 2000);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedChat || !profile) return;

    try {
      const { fileUrl } = await uploadFile(file);
      const messagePayload = {
        [selectedChat.type === "group" ? "groupId" : "recipientId"]:
          selectedChat.id,
        content: "",
        fileUrl,
      };
      if (selectedChat.type === "group") {
        emitSendGroupMessage(messagePayload);
      } else {
        emitSendMessage(messagePayload);
      }
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  if (!selectedChat) return null;

  const groupedMessages: { [key: string]: unknown[] } = {};
  if (Array.isArray(messages)) {
    messages.forEach((message) => {
      const date = format(new Date(message.timestamp), "yyyy-MM-dd");
      if (!groupedMessages[date]) groupedMessages[date] = [];
      groupedMessages[date].push(message);
    });
  }

  return (
    <div className="flex flex-col h-[90vh]">
      <div className="flex-1 p-4 overflow-y-auto space-y-6">
        {Object.entries(groupedMessages).length > 0 ? (
          Object.entries(groupedMessages).map(([date, dateMessages]) => (
            <div key={date} className="space-y-4">
              <div className="flex justify-center">
                <div className="bg-muted text-xs px-2 py-1 rounded-full text-muted-foreground">
                  {format(new Date(date), "MMMM d, yyyy")}
                </div>
              </div>
              {dateMessages.map((message) => {
                const isCurrentUser = message.sender._id === profile?.id;
                const senderName =
                  message.sender.name || message.sender.username || "Unknown";
                return (
                  <div
                    key={message._id}
                    className={cn(
                      "flex items-end gap-2 group",
                      isCurrentUser ? "justify-end" : "justify-start"
                    )}
                  >
                    {!isCurrentUser && (
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={message.sender.profilePicture}
                          alt={senderName}
                        />
                        <AvatarFallback>
                          {senderName.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div className="max-w-[75%] flex flex-col">
                      {selectedChat.type === "group" && !isCurrentUser && (
                        <div className="text-xs text-muted-foreground">
                          {senderName}
                        </div>
                      )}
                      <div
                        className={cn(
                          "rounded-2xl px-4 py-2",
                          isCurrentUser
                            ? "bg-primary text-primary-foreground rounded-br-none"
                            : "bg-muted rounded-bl-none"
                        )}
                      >
                        {message.content ||
                          (message.fileUrl && (
                            <a
                              href={message.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              File
                            </a>
                          ))}
                      </div>
                      <div
                        className={cn(
                          "text-xs text-muted-foreground mt-1",
                          isCurrentUser ? "text-right" : "text-left"
                        )}
                      >
                        {format(new Date(message.timestamp), "h:mm a")}
                        {isCurrentUser && (
                          <span className="ml-1">
                            {message.status === "Read" ? "✓✓" : "✓"}
                          </span>
                        )}
                      </div>
                    </div>
                    {isCurrentUser && (
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>Edit</DropdownMenuItem>
                            <DropdownMenuItem>Forward</DropdownMenuItem>
                            <DropdownMenuItem>Reply</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))
        ) : (
          <div className="text-center text-muted-foreground">
            No messages yet
          </div>
        )}
        {typingUsers.length > 0 && (
          <div className="text-sm text-muted-foreground italic">
            {selectedChat.type === "group"
              ? `${typingUsers.map((user) => user.name).join(", ")} ${
                  typingUsers.length > 1 ? "are" : "is"
                } typing...`
              : `${typingUsers[0]?.name} is typing...`}
          </div>
        )}
        <div ref={messageEndRef} />
      </div>

      <div className="p-3 border-t">
        <div className="flex items-end gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Paperclip className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" side="top">
              <DropdownMenuItem asChild>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                  <Paperclip className="h-4 w-4 mr-2" />
                  File
                </label>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <div className="flex-1">
            <Input
              className="rounded-full"
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value);
                handleTyping();
              }}
              onKeyDown={(e) =>
                e.key === "Enter" && !e.shiftKey && handleSendMessage()
              }
            />
          </div>
          <Button
            className="rounded-full"
            size="icon"
            disabled={!newMessage.trim()}
            onClick={handleSendMessage}
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
