"use client";

import React, { useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ChevronLeft, MoreVertical } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/lib/redux/store";
import { cn } from "@/lib/utils";
import { onUserStatusUpdate } from "@/lib/socket";
import { setSelectedChat } from "@/lib/redux/slices/chatSlice";

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
  const dispatch = useDispatch();
  const { selectedChat } = useSelector((state: RootState) => state.chat);

  useEffect(() => {
    if (selectedChat?.type === "personal") {
      onUserStatusUpdate(({ userId, status }) => {
        if (userId === selectedChat.id) {
          dispatch(setSelectedChat({ ...selectedChat, status }));
        }
      });
    }
  }, [selectedChat, dispatch]);

  if (!selectedChat) return null;

  return (
    <div className="flex items-center justify-between p-4 border-b">
      <div className="flex items-center gap-3">
        {!isDesktop && (
          <Button variant="ghost" size="icon" onClick={onToggleSidebar}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
        )}
        <Avatar className="h-10 w-10">
          <AvatarImage src={selectedChat.avatar} alt={selectedChat.name} />
          <AvatarFallback>
            {selectedChat.name.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <h2 className="font-semibold">{selectedChat.name}</h2>
          {selectedChat.type === "personal" && (
            <p className="text-sm text-muted-foreground">
              {selectedChat.status === "online"
                ? "Online"
                : `Last seen: ${new Date(
                    selectedChat.lastSeen
                  ).toLocaleString()}`}
            </p>
          )}
          {selectedChat.type === "group" && (
            <p className="text-sm text-muted-foreground">
              {selectedChat.members.length} members
            </p>
          )}
        </div>
      </div>
      <Button variant="ghost" size="icon">
        <MoreVertical className="h-5 w-5" />
      </Button>
    </div>
  );
}
