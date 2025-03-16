// /components/chat/add-action-dialog.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/lib/redux/store";
import { addContact as addContactAction } from "@/lib/redux/slices/userSlice";
import { addChat, setChats } from "@/lib/redux/slices/chatSlice";
import { searchUsers, addContact as addContactApi } from "@/lib/api/userApi";
import { createGroup } from "@/lib/api/groupApi";
import { getContacts } from "@/lib/api/userApi";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Check, ChevronsUpDown, Search, Users, UserPlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
// Removed Command imports as we're using a custom implementation
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { getUserChats } from "@/lib/api/chatApi";

interface UserSearchResult {
  _id: string;
  name: string;
  username: string;
  profilePicture: string;
  status?: string;
  lastSeen?: string;
}

interface AddActionDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  onClose: () => void;
  type: "add-contact" | "create-group";
}

export function AddActionDialog({
  open,
  setOpen,
  onClose,
  type: initialType,
}: AddActionDialogProps) {
  const dispatch = useDispatch();
  const { profile } = useSelector((state: RootState) => state.user);
  const [activeTab, setActiveTab] = useState<string>(initialType);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<UserSearchResult[]>(
    []
  );
  const [contacts, setContacts] = useState<UserSearchResult[]>([]);
  const [isLoadingContacts, setIsLoadingContacts] = useState(false);

  // Fetch contacts when dialog opens or tab switches to "create-group"
  useEffect(() => {
    if (open && activeTab === "create-group") {
      const fetchContacts = async () => {
        setIsLoadingContacts(true);
        try {
          const fetchedContacts = await getContacts();
          console.log("Raw fetched contacts:", fetchedContacts);

          // Make sure fetchedContacts is treated as an array
          const contactsArray = Array.isArray(fetchedContacts)
            ? fetchedContacts
            : [];

          // Filter out the current user from contacts if they exist
          const filteredContacts = contactsArray.filter(
            (contact) => profile && contact._id !== profile.id
          );

          setContacts(filteredContacts);
          console.log("Processed contacts:", filteredContacts);
        } catch (error) {
          console.error("Error fetching contacts:", error);
          setContacts([]);
        } finally {
          setIsLoadingContacts(false);
        }
      };

      fetchContacts();
    }

    if (!open) {
      setSearchQuery("");
      setSearchResults([]);
      setIsSearching(false);
      setGroupName("");
      setSelectedMembers([]);
      // Don't clear contacts when closing dialog to prevent flashing empty state
      setActiveTab(initialType);
    }
  }, [open, activeTab, profile]);

  const handleTabChange = (value: string) => {
    console.log("Switching tab to:", value);
    setActiveTab(value);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const results = await searchUsers(searchQuery);
      setSearchResults(results.filter((user) => user._id !== profile?.id));
      console.log("Search results:", results);
    } catch (error) {
      console.error("Error searching users:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddContact = async (user: UserSearchResult) => {
    try {
      await addContactApi(user._id);
      dispatch(addContactAction(user));
      dispatch(
        addChat({
          id: user._id,
          name: user.name,
          avatar: user.profilePicture || "",
          status: "offline",
          lastSeen: "",
          lastMessage: "",
          time: "",
          unread: 0,
          type: "personal",
        })
      );
      setOpen(false);
    } catch (error) {
      console.error("Error adding contact:", error);
    }
  };

  const handleToggleMember = (contact: UserSearchResult) => {
    setSelectedMembers((prev) =>
      prev.some((m) => m._id === contact._id)
        ? prev.filter((m) => m._id !== contact._id)
        : [...prev, contact]
    );
  };

  const handleCreateGroup = async () => {
    if (groupName.trim() && selectedMembers.length > 0) {
      try {
        // Include current user in member list
        const memberIds = selectedMembers.map((m) => m._id);
        if (profile?.id) {
          memberIds.push(profile.id);
        }

        console.log("Creating group with:", { name: groupName, memberIds });
        const group = await createGroup({ name: groupName, memberIds });
        const newGroupChat = {
          id: group._id,
          name: group.name,
          avatar: group.avatar || "",
          status: "offline",
          lastSeen: "",
          lastMessage: "",
          time: "",
          unread: 0,
          type: "group",
          members: group.members.map((m: string) => ({
            _id: m,
            status: m === profile?.id ? "online" : "offline",
          })),
        };
        dispatch(addChat(newGroupChat));
        const updatedChats = await getUserChats();
        dispatch(setChats(updatedChats));
        setOpen(false);
      } catch (error) {
        console.error("Error creating group:", error);
      }
    } else {
      console.log(
        "Group creation failed: Invalid group name or no members selected"
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Conversation</DialogTitle>
          <DialogDescription>
            Add a new contact or create a group chat
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger
              value="add-contact"
              className="flex items-center gap-2"
            >
              <UserPlus className="h-4 w-4" />
              Add Contact
            </TabsTrigger>
            <TabsTrigger
              value="create-group"
              className="flex items-center gap-2"
            >
              <Users className="h-4 w-4" />
              Create Group
            </TabsTrigger>
          </TabsList>

          <TabsContent value="add-contact" className="mt-4">
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Search by username"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
                <Button
                  variant="secondary"
                  onClick={handleSearch}
                  disabled={isSearching}
                >
                  {isSearching ? (
                    <span className="animate-spin">⏳</span>
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium">Results</div>
                {searchResults.length === 0 && searchQuery && !isSearching && (
                  <div className="text-center p-4 text-muted-foreground text-sm">
                    No users found
                  </div>
                )}
                {isSearching && (
                  <div className="text-center p-4 text-muted-foreground text-sm">
                    Searching...
                  </div>
                )}
                <div className="space-y-2">
                  {searchResults.map((user) => (
                    <div
                      key={user._id}
                      className="flex items-center justify-between p-2 rounded-md hover:bg-muted"
                    >
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={user.profilePicture}
                            alt={user.name}
                          />
                          <AvatarFallback>
                            {user.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-sm">{user.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {user.username}
                          </div>
                        </div>
                      </div>
                      <Button size="sm" onClick={() => handleAddContact(user)}>
                        Add
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="create-group" className="mt-4">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Group Name</label>
                <Input
                  placeholder="Enter group name"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium">
                  Select Members{" "}
                  {selectedMembers.length > 0 && `(${selectedMembers.length})`}
                </label>
                <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between"
                    >
                      {selectedMembers.length > 0
                        ? `${selectedMembers.length} members selected`
                        : "Select members"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[300px] p-0">
                    <div className="bg-popover text-popover-foreground flex flex-col overflow-hidden rounded-md">
                      <div className="flex items-center border-b px-3">
                        {/* <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" /> */}
                        <input
                          className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                          placeholder="Search contacts..."
                          onChange={(e) => {
                            // You can implement search functionality here if needed
                          }}
                        />
                      </div>
                      <ScrollArea className="h-[200px] overflow-auto">
                        {isLoadingContacts ? (
                          <div className="text-center p-4 text-muted-foreground text-sm">
                            Loading contacts...
                          </div>
                        ) : contacts.length === 0 ? (
                          <div className="text-center p-4 text-muted-foreground text-sm">
                            No contacts available
                          </div>
                        ) : (
                          <div>
                            {contacts.map((contact) => (
                              <div
                                key={contact._id}
                                className="relative flex cursor-default select-none items-center justify-between rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                                onClick={() => handleToggleMember(contact)}
                              >
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-6 w-6">
                                    <AvatarImage
                                      src={contact.profilePicture}
                                      alt={contact.name}
                                    />
                                    <AvatarFallback>
                                      {contact.name
                                        .substring(0, 2)
                                        .toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span>{contact.name}</span>
                                </div>
                                <Check
                                  className={cn(
                                    "ml-auto h-4 w-4",
                                    selectedMembers.some(
                                      (m) => m._id === contact._id
                                    )
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </ScrollArea>
                    </div>
                  </PopoverContent>
                </Popover>
                {selectedMembers.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {selectedMembers.map((member) => (
                      <Badge
                        key={member._id}
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        {member.name}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 rounded-full ml-1 hover:bg-muted"
                          onClick={() => handleToggleMember(member)}
                        >
                          ×
                        </Button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            disabled={
              (activeTab === "add-contact" && searchResults.length === 0) ||
              (activeTab === "create-group" &&
                (!groupName.trim() || selectedMembers.length === 0))
            }
            onClick={
              activeTab === "create-group" ? handleCreateGroup : handleSearch
            }
          >
            {activeTab === "add-contact" ? "Search" : "Create Group"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
