// /components/chat/chat-sidebar.tsx
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

interface ChatSidebarProps {
  onChatSelect: (chat: any) => void;
}

export function ChatSidebar({ onChatSelect }: ChatSidebarProps) {
  const handleAddAction = (type: "add-contact" | "create-group") => {
    // This would be handled based on your application's requirements
    console.log(`Action: ${type}`);
  };

  return (
    <div className="flex flex-col h-full border-r">
      {/* <div className="p-4 flex items-center justify-between">
        <h2 className="text-xl font-bold">Chats</h2>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <Plus className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleAddAction("add-contact")}>
              <UserPlus className="mr-2 h-4 w-4" />
              <span>Add Contact</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleAddAction("create-group")}>
              <Users className="mr-2 h-4 w-4" />
              <span>Create Group</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div> */}

      <Separator />

      <div className="flex-1 overflow-hidden">
        <ChatList onChatSelect={onChatSelect} onAddAction={handleAddAction} />
      </div>

      <Separator />

      <div className="p-4">
        <UserProfile />
      </div>
    </div>
  );
}
