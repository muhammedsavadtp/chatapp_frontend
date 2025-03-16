"use client";

import React, { useEffect, useState } from "react";
import useMediaQuery from "./hooks/useMediaQuery";
import { ChatSidebar } from "@/components/chat/chat-sidebar";
import { ChatHeader } from "@/components/chat/chat-header";
import { ChatView } from "@/components/chat/chat-view";
import { AddActionDialog } from "@/components/chat/add-action-dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { initializeSocket, onUserStatusUpdate } from "@/lib/socket";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/lib/redux/store";
import { getUserChats } from "@/lib/api/chatApi";
import {
  setChats,
  setSelectedChat,
  updateChatStatus,
} from "@/lib/redux/slices/chatSlice";
import { setProfile } from "@/lib/redux/slices/userSlice";
import { getProfile } from "@/lib/api/userApi";

export default function ChatPage() {
  const dispatch = useDispatch();
  const { chats, selectedChat } = useSelector((state: RootState) => state.chat);
  const { profile } = useSelector((state: RootState) => state.user);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<"add-contact" | "create-group">(
    "add-contact"
  );
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const userChats = await getUserChats();

        console.log("user chats ", userChats);
        dispatch(setChats(userChats));
        const userProfile = await getProfile();
        dispatch(setProfile(userProfile));

        if (userProfile?.id) {
          initializeSocket(userProfile.id);
          onUserStatusUpdate(({ userId, status }) => {
            dispatch(updateChatStatus({ userId, status }));
            if (selectedChat?.id === userId) {
              dispatch(setSelectedChat({ ...selectedChat, status }));
            }
          });
        }
      } catch (error) {
        console.error("Error fetching initial data:", error);
      }
    };
    fetchInitialData();
  }, [dispatch, selectedChat]);

  const handleChatSelect = (chat: any) => {
    dispatch(setSelectedChat(chat));
  };

  const handleBackToSidebar = () => {
    dispatch(setSelectedChat(null));
  };

  const handleAddAction = (type: "add-contact" | "create-group") => {
    setDialogType(type);
    setDialogOpen(true);
  };

  return (
    <div className="flex h-screen bg-background">
      {(isDesktop || !selectedChat) && (
        <div
          className={cn(
            "flex flex-col border-r transition-all duration-300",
            isDesktop
              ? "relative w-full max-w-xs"
              : "absolute inset-0 z-10 bg-background w-full h-full"
          )}
        >
          <div className="flex items-center justify-between p-4 border-b">
            <h1 className="text-xl font-bold">Chats</h1>
            <Button
              size="icon"
              variant="ghost"
              className="rounded-full bg-green-500 hover:bg-green-600 text-white"
              onClick={() => handleAddAction("add-contact")}
            >
              <Plus className="h-5 w-5" />
            </Button>
          </div>
          <ChatSidebar onChatSelect={handleChatSelect} />
        </div>
      )}

      {(isDesktop || selectedChat) && (
        <div
          className={cn(
            "flex-1 flex flex-col h-full",
            !isDesktop && "absolute inset-0 z-20"
          )}
        >
          {selectedChat ? (
            <>
              <ChatHeader
                onToggleSidebar={handleBackToSidebar}
                showSidebar={false}
                isDesktop={isDesktop}
              />
              <ChatView />
            </>
          ) : (
            <div className="flex items-center justify-center h-full flex-col p-4">
              <h2 className="text-2xl font-bold mb-2">Welcome to ChatApp</h2>
              <p className="text-muted-foreground mb-4">
                Select a chat or start a new conversation
              </p>
            </div>
          )}
        </div> 
      )}

      <AddActionDialog
        open={dialogOpen}
        setOpen={setDialogOpen}
        onClose={() => setDialogOpen(false)}
        type={dialogType}
      />
    </div>
  );
}
