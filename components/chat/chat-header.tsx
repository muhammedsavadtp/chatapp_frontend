// /components/chat/chat-header.tsx
"use client";

import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/redux/store";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Menu, ArrowLeft, MoreVertical, Phone, Video } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

interface ChatHeaderProps {
  onToggleSidebar: () => void;
  showSidebar: boolean;
  isDesktop: boolean;
}

export function ChatHeader({
  onToggleSidebar,
  showSidebar,
  isDesktop,
}: ChatHeaderProps) {
  const { selectedChat } = useSelector((state: RootState) => state.chat);
  if (!selectedChat) return null;

  const isGroup = selectedChat.type === "group";
  const onlineMembers =
    selectedChat.members?.filter((m) => m.status === "online").length || 0;

  // Determine status text and visibility
  const statusText = isGroup
    ? `${onlineMembers} online`
    : selectedChat.status === "online"
    ? "Online"
    // : selectedChat.lastSeen
    // ? `Last seen: ${new Date(selectedChat.lastSeen).toLocaleString()}`
    : "Offline";

  return (
    <div className="border-b p-3 flex items-center justify-between bg-background">
      <div className="flex items-center gap-3">
        {!isDesktop && !showSidebar && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleSidebar}
            className="lg:hidden"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        {isDesktop && (
          <Button variant="ghost" size="icon" onClick={onToggleSidebar}>
            <Menu className="h-5 w-5" />
          </Button>
        )}
        <Avatar className="h-10 w-10">
          <AvatarImage
            src={selectedChat.avatar || ""}
            alt={selectedChat.name}
            className={selectedChat.avatar ? "" : "hidden"} // Hide if no avatar
          />
          <AvatarFallback>
            {selectedChat.name.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <div className="font-medium text-sm flex items-center gap-2">
            {selectedChat.name}
            {isGroup && (
              <Badge variant="outline" className="text-xs">
                {selectedChat.members?.length || 0} members
              </Badge>
            )}
          </div>
          <div
            className={`text-xs ${
              selectedChat.status === "online"
                ? "text-green-500"
                : "text-muted-foreground"
            }`}
          >
            {statusText}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" className="rounded-full">
          <Phone className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Video className="h-5 w-5" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>View profile</DropdownMenuItem>
            <DropdownMenuItem>Search in conversation</DropdownMenuItem>
            <DropdownMenuItem>Notification settings</DropdownMenuItem>
            {isGroup && <DropdownMenuItem>Group settings</DropdownMenuItem>}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">
              {isGroup ? "Leave group" : "Block contact"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
