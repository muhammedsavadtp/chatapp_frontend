"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Plus, UserPlus, Users } from "lucide-react";
import { ChatList } from "./ChatList";
import { UserProfile } from "@/components/user/user-profile";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDispatch } from "react-redux";
import { markMessagesAsRead } from "@/lib/api/chatApi";
import { markMessagesRead } from "@/lib/redux/slices/chatSlice";

interface ChatSidebarProps {
  onChatSelect: (chat: any) => void;
}

export function ChatSidebar({ onChatSelect }: ChatSidebarProps) {
  const dispatch = useDispatch();

  const handleChatSelect = async (chat: any) => {
    onChatSelect(chat);
    if (chat.type === "personal" && chat.unread > 0) {
      try {
        await markMessagesAsRead(chat.id);
        dispatch(markMessagesRead(chat.id));
      } catch (error) {
        console.error("Error marking messages as read:", error);
      }
    }
  };

  const handleAddAction = (type: "add-contact" | "create-group") => {
    console.log(`Action: ${type}`);
  };

  return (
    <div className="flex flex-col h-full border-r">
     

      <Separator />

      <div className="flex-1 overflow-hidden">
        <ChatList
          onChatSelect={handleChatSelect}
          onAddAction={handleAddAction}
        />
      </div>

      <Separator />

      <div className="p-4">
        <UserProfile />
      </div>
    </div>
  );
}
