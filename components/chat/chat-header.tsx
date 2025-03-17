
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
"use client";

import React, { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  MoreVertical,
  // UserPlus,
  Shield,
  Trash2,
  X,
  Save,
  Users,
  Check,
  ChevronsUpDown,
} from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/lib/redux/store";
import { onUserStatusUpdate } from "@/lib/socket";
import { setSelectedChat } from "@/lib/redux/slices/chatSlice";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  addGroupMembers,
  updateGroupName,
  deleteGroup,
  removeGroupMember,
  addGroupAdmin,
} from "@/lib/api/groupApi";
import { getContacts } from "@/lib/api/userApi";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface ChatHeaderProps {
  onToggleSidebar: () => void;
  showSidebar: boolean;
  isDesktop: boolean;
}

interface UserContact {
  _id: string;
  name: string;
  username: string;
  profilePicture?: string;
  status?: string;
  lastSeen?: string;
}

export function ChatHeader({ onToggleSidebar, isDesktop }: ChatHeaderProps) {
  const dispatch = useDispatch();
  const { selectedChat } = useSelector((state: RootState) => state.chat);
  const { profile } = useSelector((state: RootState) => state.user);
  const [isGroupDialogOpen, setIsGroupDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isRemoveMemberDialogOpen, setIsRemoveMemberDialogOpen] =
    useState(false);
  const [memberToRemove, setMemberToRemove] = useState<string | null>(null);
  const [groupName, setGroupName] = useState(selectedChat?.name || "");
  const [isLoading, setIsLoading] = useState(false);
  const [adminSearchQuery, setAdminSearchQuery] = useState("");
  const [isAdminPopoverOpen, setIsAdminPopoverOpen] = useState(false);
  const [memberSearchQuery, setMemberSearchQuery] = useState("");
  const [isMemberPopoverOpen, setIsMemberPopoverOpen] = useState(false);
  const [contacts, setContacts] = useState<UserContact[]>([]);

  useEffect(() => {
    if (selectedChat?.type === "personal") {
      onUserStatusUpdate(({ userId, status }) => {
        if (userId === selectedChat.id) {
          dispatch(setSelectedChat({ ...selectedChat, status }));
        }
      });
    }
    setGroupName(selectedChat?.name || "");
  }, [selectedChat, dispatch]);

  useEffect(() => {
    if (isAdmin && isGroupDialogOpen) {
      fetchContacts();
    }
  }, [isGroupDialogOpen]);

  const fetchContacts = async () => {
    try {
      const userContacts = await getContacts();
      setContacts(userContacts);
    } catch (error) {
      toast.error("Failed to fetch contacts", { description: error.message });
    }
  };

  const normalizeGroup = (group: any) => ({
    id: group._id,
    type: "group",
    name: group.name,
    avatar: group.avatar || "/api/placeholder/40/40",
    members: group.members.map((m: any) => ({
      _id: m._id,
      name: m.name,
      username: m.username || m.name,
      profilePicture: m.profilePicture || "/api/placeholder/40/40",
      status: m.status || "offline",
      lastSeen: m.lastSeen,
    })),
    admins: group.admins.map((admin: any) =>
      typeof admin === "string" ? admin : admin._id
    ),
    createdBy: group.createdBy,
    lastMessage:
      typeof group.lastMessage === "string"
        ? group.lastMessage
        : group.lastMessage?._id || "",
    time:
      group.time ||
      new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    unread: group.unread || 0,
  });

  const handleUpdateGroupName = async () => {
    if (!groupName.trim()) {
      toast.info("Group name cannot be empty");
      return;
    }
    setIsLoading(true);
    try {
      console.log("Before update:", selectedChat);
      const updatedGroup = await updateGroupName(selectedChat.id, groupName);
      const normalizedGroup = normalizeGroup(updatedGroup);
      console.log("After update:", normalizedGroup);
      dispatch(setSelectedChat(normalizedGroup));
      toast.success("Group name updated successfully");
    } catch (error) {
      toast.error("Failed to update group name", { description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddMember = async (memberId: string) => {
    setIsLoading(true);
    try {
      // console.log("Before add member:", selectedChat);
      const updatedGroup = await addGroupMembers(selectedChat.id, [memberId]);
      const normalizedGroup = normalizeGroup(updatedGroup);
      // console.log("After add member:", normalizedGroup);
      dispatch(setSelectedChat(normalizedGroup));
      setMemberSearchQuery("");
      setIsMemberPopoverOpen(false);
      toast.success("Member added successfully");
    } catch (error) {
      toast.error("Failed to add member", { description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const confirmRemoveMember = (memberId: string) => {
    setMemberToRemove(memberId);
    setIsRemoveMemberDialogOpen(true);
  };

  const handleRemoveMember = async () => {
    if (!memberToRemove) return;
    setIsLoading(true);
    try {
      console.log("Before remove member:", selectedChat);
      const updatedGroup = await removeGroupMember(
        selectedChat.id,
        memberToRemove
      );
      const normalizedGroup = normalizeGroup(updatedGroup);
      console.log("After remove member:", normalizedGroup);
      dispatch(setSelectedChat(normalizedGroup));
      toast.success("Member removed successfully");
    } catch (error) {
      toast.error("Failed to remove member", { description: error.message });
    } finally {
      setIsLoading(false);
      setIsRemoveMemberDialogOpen(false);
      setMemberToRemove(null);
    }
  };

  const handleAddAdmin = async (memberId: string) => {
    setIsLoading(true);
    try {
      console.log("Before add admin:", selectedChat);
      const updatedGroup = await addGroupAdmin(selectedChat.id, memberId);
      const normalizedGroup = normalizeGroup(updatedGroup);
      console.log("After add admin:", normalizedGroup);
      dispatch(setSelectedChat(normalizedGroup));
      setAdminSearchQuery("");
      setIsAdminPopoverOpen(false);
      toast.success("Admin privileges granted successfully");
    } catch (error) {
      toast.error("Failed to add admin", { description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteGroup = async () => {
    setIsLoading(true);
    try {
      console.log("Before delete group:", selectedChat);
      await deleteGroup(selectedChat.id);
      dispatch(setSelectedChat(null));
      setIsGroupDialogOpen(false);
      setIsDeleteDialogOpen(false);
      toast.success("Group deleted successfully");
    } catch (error) {
      toast.error("Failed to delete group", { description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  if (!selectedChat) return null;

  const isAdmin =
    selectedChat.type === "group" && selectedChat.admins?.includes(profile?.id);
  const isCreator =
    selectedChat.type === "group" && selectedChat.createdBy === profile?.id;

  // All group members for admin selection (not just non-admins)
  const groupMembers =
    selectedChat.type === "group" ? selectedChat.members : [];
  const filteredGroupMembers = groupMembers.filter((member: any) =>
    member.name.toLowerCase().includes(adminSearchQuery.toLowerCase())
  );

  // Contacts not already in the group for member addition
  const availableContacts = contacts.filter(
    (contact) => !selectedChat.members.some((m: any) => m._id === contact._id)
  );
  const filteredContacts = availableContacts.filter((contact) =>
    contact.name.toLowerCase().includes(memberSearchQuery.toLowerCase())
  );

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
          {selectedChat.type === "group" ? (
            <Dialog
              open={isGroupDialogOpen}
              onOpenChange={setIsGroupDialogOpen}
            >
              <DialogTrigger asChild>
                <h2 className="font-semibold cursor-pointer hover:underline">
                  {selectedChat.name}
                </h2>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Group Settings</DialogTitle>
                  <DialogDescription>
                    Manage group details, members, and permissions
                  </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="info" className="w-full">
                  <TabsList className="grid grid-cols-3 mb-4">
                    <TabsTrigger value="info">Info</TabsTrigger>
                    <TabsTrigger value="members">Members</TabsTrigger>
                    <TabsTrigger value="admins">Admins</TabsTrigger>
                  </TabsList>

                  <TabsContent value="info" className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="group-name">Group Name</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="group-name"
                          value={groupName}
                          onChange={(e) => setGroupName(e.target.value)}
                          disabled={!isAdmin || isLoading}
                          placeholder="Enter group name"
                        />
                        {isAdmin && (
                          <Button
                            onClick={handleUpdateGroupName}
                            disabled={isLoading}
                            size="icon"
                          >
                            <Save className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Group Info</Label>
                      <Card>
                        <CardContent className="pt-4 space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm font-medium">
                              Total Members
                            </span>
                            <span>{selectedChat.members.length}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm font-medium">
                              Created By
                            </span>
                            <span>
                              {selectedChat.members.find(
                                (m: any) => m._id === selectedChat.createdBy
                              )?.name || "Unknown"}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {isCreator && (
                      <div className="pt-4">
                        <Button
                          variant="destructive"
                          onClick={() => setIsDeleteDialogOpen(true)}
                          disabled={isLoading}
                          className="w-full"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Group
                        </Button>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="members" className="space-y-4">
                    {isAdmin && (
                      <div className="space-y-2">
                        <Label htmlFor="add-member">Add New Member</Label>
                        <Popover
                          open={isMemberPopoverOpen}
                          onOpenChange={setIsMemberPopoverOpen}
                        >
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-between"
                              disabled={
                                isLoading || availableContacts.length === 0
                              }
                            >
                              {memberSearchQuery || "Select a contact"}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-[300px] p-0">
                            <div className="bg-popover text-popover-foreground flex flex-col overflow-hidden rounded-md">
                              <div className="flex items-center border-b px-3">
                                <Input
                                  className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 border-0"
                                  placeholder="Search contacts..."
                                  value={memberSearchQuery}
                                  onChange={(e) =>
                                    setMemberSearchQuery(e.target.value)
                                  }
                                  disabled={isLoading}
                                />
                              </div>
                              <ScrollArea className="h-[200px] overflow-auto">
                                {filteredContacts.length === 0 ? (
                                  <div className="text-center p-4 text-muted-foreground text-sm">
                                    {memberSearchQuery
                                      ? "No matching contacts found"
                                      : "All contacts are in the group"}
                                  </div>
                                ) : (
                                  filteredContacts.map((contact) => (
                                    <div
                                      key={contact._id}
                                      className="relative flex cursor-pointer select-none items-center justify-between rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                                      onClick={() =>
                                        handleAddMember(contact._id)
                                      }
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
                                      <Check className="h-4 w-4 opacity-0" />
                                    </div>
                                  ))
                                )}
                              </ScrollArea>
                            </div>
                          </PopoverContent>
                        </Popover>
                        <p className="text-xs text-muted-foreground">
                          Select a contact from your list to add to the group
                        </p>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Members List
                      </Label>
                      <div className="max-h-64 overflow-y-auto space-y-2">
                        {selectedChat.members.map((member: any) => (
                          <div
                            key={member._id}
                            className="flex justify-between items-center p-2 bg-secondary/20 rounded-md"
                          >
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarImage
                                  src={member.profilePicture}
                                  alt={member.name}
                                />
                                <AvatarFallback>
                                  {member.name.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <span>{member.name}</span>
                              {selectedChat.admins?.includes(member._id) && (
                                <Badge variant="outline" className="ml-2">
                                  <Shield className="h-3 w-3 mr-1" />
                                  Admin
                                </Badge>
                              )}
                              {member._id === selectedChat.createdBy && (
                                <Badge className="ml-2">Creator</Badge>
                              )}
                            </div>
                            {isAdmin &&
                              member._id !== profile?.id &&
                              member._id !== selectedChat.createdBy && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-destructive"
                                  onClick={() =>
                                    confirmRemoveMember(member._id)
                                  }
                                  disabled={isLoading}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="admins" className="space-y-4">
                    {isAdmin && (
                      <div className="space-y-2">
                        <Label htmlFor="add-admin">Add New Admin</Label>
                        <Popover
                          open={isAdminPopoverOpen}
                          onOpenChange={setIsAdminPopoverOpen}
                        >
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-between"
                              disabled={isLoading || groupMembers.length === 0}
                            >
                              {adminSearchQuery || "Select a group member"}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-[300px] p-0">
                            <div className="bg-popover text-popover-foreground flex flex-col overflow-hidden rounded-md">
                              <div className="flex items-center border-b px-3">
                                <Input
                                  className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 border-0"
                                  placeholder="Search members..."
                                  value={adminSearchQuery}
                                  onChange={(e) =>
                                    setAdminSearchQuery(e.target.value)
                                  }
                                  disabled={isLoading}
                                />
                              </div>
                              <ScrollArea className="h-[200px] overflow-auto">
                                {filteredGroupMembers.length === 0 ? (
                                  <div className="text-center p-4 text-muted-foreground text-sm">
                                    {adminSearchQuery
                                      ? "No matching members found"
                                      : "No members available"}
                                  </div>
                                ) : (
                                  filteredGroupMembers.map((member: any) => {
                                    const isAlreadyAdmin =
                                      selectedChat.admins?.includes(member._id);
                                    return (
                                      <div
                                        key={member._id}
                                        className={cn(
                                          "relative flex cursor-pointer select-none items-center justify-between rounded-sm px-2 py-1.5 text-sm outline-none",
                                          isAlreadyAdmin
                                            ? "opacity-50 cursor-not-allowed"
                                            : "hover:bg-accent hover:text-accent-foreground",
                                          "data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                                        )}
                                        onClick={() =>
                                          !isAlreadyAdmin &&
                                          handleAddAdmin(member._id)
                                        }
                                      >
                                        <div className="flex items-center gap-2">
                                          <Avatar className="h-6 w-6">
                                            <AvatarImage
                                              src={member.profilePicture}
                                              alt={member.name}
                                            />
                                            <AvatarFallback>
                                              {member.name
                                                .substring(0, 2)
                                                .toUpperCase()}
                                            </AvatarFallback>
                                          </Avatar>
                                          <span>{member.name}</span>
                                          {isAlreadyAdmin && (
                                            <Badge
                                              variant="outline"
                                              className="ml-2"
                                            >
                                              <Shield className="h-3 w-3 mr-1" />
                                              Admin
                                            </Badge>
                                          )}
                                        </div>
                                        {!isAlreadyAdmin && (
                                          <Check className="h-4 w-4 opacity-0" />
                                        )}
                                      </div>
                                    );
                                  })
                                )}
                              </ScrollArea>
                            </div>
                          </PopoverContent>
                        </Popover>
                        <p className="text-xs text-muted-foreground">
                          Select a group member to promote to admin
                        </p>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Current Admins
                      </Label>
                      <div className="max-h-64 overflow-y-auto space-y-2">
                        {selectedChat.members
                          .filter((member: any) =>
                            selectedChat.admins?.includes(member._id)
                          )
                          .map((member: any) => (
                            <div
                              key={member._id}
                              className="flex justify-between items-center p-2 bg-secondary/20 rounded-md"
                            >
                              <div className="flex items-center gap-2">
                                <Avatar className="h-6 w-6">
                                  <AvatarImage
                                    src={member.profilePicture}
                                    alt={member.name}
                                  />
                                  <AvatarFallback>
                                    {member.name.substring(0, 2).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <span>{member.name}</span>
                                {member._id === selectedChat.createdBy && (
                                  <Badge className="ml-2">Creator</Badge>
                                )}
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </DialogContent>
            </Dialog>
          ) : (
            <h2 className="font-semibold">{selectedChat.name}</h2>
          )}
          {selectedChat.type === "personal" && (
            <p className="text-sm text-muted-foreground">
              {selectedChat.status === "online"
                ? "Online"
                : selectedChat.lastSeen
                ? `Last seen: ${new Date(
                    selectedChat.lastSeen
                  ).toLocaleString()}`
                : "No activity yet"}
            </p>
          )}
          {selectedChat.type === "group" && (
            <p className="text-sm text-muted-foreground">
              {selectedChat.members.length} members
              {selectedChat.time ? ` • Last message: ${selectedChat.time}` : ""}
            </p>
          )}
        </div>
      </div>
      <Button variant="ghost" size="icon">
        <MoreVertical className="h-5 w-5" />
      </Button>

      <AlertDialog
        open={isRemoveMemberDialogOpen}
        onOpenChange={setIsRemoveMemberDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this member from the group? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveMember}
              disabled={isLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isLoading ? "Removing..." : "Remove Member"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Group</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the group and all its messages. This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteGroup}
              disabled={isLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isLoading ? "Deleting..." : "Delete Group"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
