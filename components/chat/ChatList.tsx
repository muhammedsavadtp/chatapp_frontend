"use client";

import React, { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/redux/store";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { formatTime } from "@/lib/utils/formateDate";

interface ChatListProps {
  onChatSelect: (chat: any) => void;
  onAddAction: (type: "add-contact" | "create-group") => void;
}

export function ChatList({ onChatSelect, onAddAction }: ChatListProps) {
  const { chats } = useSelector((state: RootState) => state.chat);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Filter chats based on tab and search query
  const getFilteredChats = (type: string) => {
    const typeFiltered =
      type === "all" ? chats : chats.filter((chat) => chat.type === type);

    if (!searchQuery.trim()) return typeFiltered;

    return typeFiltered.filter(
      (chat) =>
        chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const filteredChats = {
    all: getFilteredChats("all"),
    personal: getFilteredChats("personal"),
    group: getFilteredChats("group"),
  };

  return (
    <div className="flex flex-col h-full">
      {/* Search bar */}
      <div className="p-2 sticky top-0 bg-background z-10">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Tabs and chat list */}
      <div className="flex-1 overflow-y-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="personal">Personal</TabsTrigger>
            <TabsTrigger value="group">Group</TabsTrigger>
          </TabsList>

          {["all", "personal", "group"].map((tab) => (
            <TabsContent key={tab} value={tab}>
              <div className="space-y-2 p-2">
                {filteredChats[tab].map((chat) => (
                  <ChatItem key={chat.id} chat={chat} onSelect={onChatSelect} />
                ))}

                {filteredChats[tab].length === 0 && (
                  <div className="text-center p-4 text-muted-foreground">
                    {searchQuery
                      ? `No ${
                          tab === "all" ? "chats" : `${tab} chats`
                        } matching "${searchQuery}"`
                      : `No ${tab === "all" ? "chats" : `${tab} chats`} found`}
                  </div>
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}

interface ChatItemProps {
  chat: any;
  onSelect: (chat: any) => void;
}

function ChatItem({ chat, onSelect }: ChatItemProps) {
 console.log("chat ",chat );
  return (
    <div
      className="flex items-center gap-3 p-2 rounded-md hover:bg-muted cursor-pointer"
      onClick={() => onSelect(chat)}
    >
      <Avatar className="h-10 w-10">
        <AvatarImage src={chat.avatar} alt={chat.name} />
        <AvatarFallback>
          {chat.name.substring(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-baseline">
          <span className="font-medium text-sm truncate">{chat.name}</span>
          {chat.status !== "group" && <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
            {formatTime(chat.lastSeen)}
          </span>}
        </div>
        <div className="text-sm text-muted-foreground truncate">
          {chat.lastMessage}
        </div>
        {chat.type === "group" && (
          <div className="text-xs text-muted-foreground">
            {chat.members?.length} members
          </div>
        )}
      </div>
      {chat.unread > 0 && (
        <Badge variant="default" className="ml-2">
          {chat.unread}
        </Badge>
      )}
    </div>
  );
}
