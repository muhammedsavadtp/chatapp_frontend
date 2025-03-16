// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

"use client";

import React, { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  MoreVertical,
  UserPlus,
  Shield,
  Trash2,
  X,
  Save,
  Users,
} from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/lib/redux/store";
// import { cn } from "@/lib/utils";
import { onUserStatusUpdate } from "@/lib/socket";
import { setSelectedChat } from "@/lib/redux/slices/chatSlice";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  // DialogFooter,
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
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface ChatHeaderProps {
  onToggleSidebar: () => void;
  showSidebar: boolean;
  isDesktop: boolean;
}

export function ChatHeader({
  onToggleSidebar,
  // showSidebar,
  isDesktop,
}: ChatHeaderProps) {
  const dispatch = useDispatch();
  const { selectedChat } = useSelector((state: RootState) => state.chat);
  const { profile } = useSelector((state: RootState) => state.user);
  const [isGroupDialogOpen, setIsGroupDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isRemoveMemberDialogOpen, setIsRemoveMemberDialogOpen] =
    useState(false);
  const [memberToRemove, setMemberToRemove] = useState<string | null>(null);
  const [groupName, setGroupName] = useState(selectedChat?.name || "");
  const [newMemberId, setNewMemberId] = useState("");
  const [newAdminId, setNewAdminId] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (selectedChat?.type === "personal") {
      onUserStatusUpdate(({ userId, status }) => {
        if (userId === selectedChat.id) {
          dispatch(setSelectedChat({ ...selectedChat, status }));
        }
      });
    }
    setGroupName(selectedChat?.name || ""); // Sync group name on change
  }, [selectedChat, dispatch]);

  const handleUpdateGroupName = async () => {
    if (!groupName.trim()) {
      toast({ title: "Group name cannot be empty" });
      return;
    }

    setIsLoading(true);
    try {
      const updatedGroup = await updateGroupName(selectedChat.id, groupName);
      dispatch(setSelectedChat(updatedGroup));
      toast({ title: "Group name updated successfully" });
    } catch (error) {
      toast({
        title: "Failed to update group name",
        description: error.message || "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddMember = async () => {
    if (!newMemberId.trim()) {
      toast({ title: "Member ID cannot be empty" });
      return;
    }

    setIsLoading(true);
    try {
      const updatedGroup = await addGroupMembers(selectedChat.id, [
        newMemberId,
      ]);
      dispatch(setSelectedChat(updatedGroup));
      setNewMemberId("");
      toast({ title: "Member added successfully" });
    } catch (error) {
      toast({
        title: "Failed to add member",
        description: error.message || "An unknown error occurred",
        variant: "destructive",
      });
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
      const updatedGroup = await removeGroupMember(
        selectedChat.id,
        memberToRemove
      );
      dispatch(setSelectedChat(updatedGroup));
      toast({ title: "Member removed successfully" });
    } catch (error) {
      toast({
        title: "Failed to remove member",
        description: error.message || "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setIsRemoveMemberDialogOpen(false);
      setMemberToRemove(null);
    }
  };

  const handleAddAdmin = async () => {
    if (!newAdminId.trim()) {
      toast({ title: "Admin ID cannot be empty" });
      return;
    }

    setIsLoading(true);
    try {
      const updatedGroup = await addGroupAdmin(selectedChat.id, newAdminId);
      dispatch(setSelectedChat(updatedGroup));
      setNewAdminId("");
      toast({ title: "Admin privileges granted successfully" });
    } catch (error) {
      toast({
        title: "Failed to add admin",
        description: error.message || "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteGroup = async () => {
    setIsLoading(true);
    try {
      await deleteGroup(selectedChat.id);
      dispatch(setSelectedChat(null));
      setIsGroupDialogOpen(false);
      setIsDeleteDialogOpen(false);
      toast({ title: "Group deleted successfully" });
    } catch (error) {
      toast({
        title: "Failed to delete group",
        description: error.message || "An unknown error occurred",
        variant: "destructive",
      });
      setIsDeleteDialogOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  if (!selectedChat) return null;

  const isAdmin =
    selectedChat.type === "group" && selectedChat.admins?.includes(profile?.id);
  const isCreator =
    selectedChat.type === "group" && selectedChat.createdBy === profile?.id;

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
                                (m) => m._id === selectedChat.createdBy
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
                        <div className="flex items-center gap-2">
                          <Input
                            id="add-member"
                            value={newMemberId}
                            onChange={(e) => setNewMemberId(e.target.value)}
                            disabled={isLoading}
                            placeholder="Enter user ID"
                          />
                          <Button
                            onClick={handleAddMember}
                            disabled={isLoading}
                            size="icon"
                          >
                            <UserPlus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Members List
                      </Label>
                      <div className="max-h-64 overflow-y-auto space-y-2">
                        {selectedChat.members.map((member) => (
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
                        <div className="flex items-center gap-2">
                          <Input
                            id="add-admin"
                            value={newAdminId}
                            onChange={(e) => setNewAdminId(e.target.value)}
                            disabled={isLoading}
                            placeholder="Enter member ID"
                          />
                          <Button
                            onClick={handleAddAdmin}
                            disabled={isLoading}
                            size="icon"
                          >
                            <Shield className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Only members already in the group can be promoted to
                          admin
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
                          .filter((member) =>
                            selectedChat.admins?.includes(member._id)
                          )
                          .map((member) => (
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

      {/* Remove Member Confirmation Dialog */}
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

      {/* Delete Group Confirmation Dialog */}
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
