// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import axiosInstance from "./axiosInstance";

// Types
export interface GroupMember {
  _id: string;
  username: string;
  name: string;
  profilePicture?: string;
  status?: string;
  lastSeen?: string;
}

export interface GroupMessage {
  _id: string;
  sender: {
    _id: string;
    username: string;
    name: string;
    profilePicture?: string;
    status?: string;
    lastSeen?: string;
  };
  group: string;
  content: string;
  fileUrl?: string;
  status: string;
  read: boolean;
  timestamp: string;
  __v: number;
}

export interface Group {
  _id: string;
  name: string;
  avatar?: string;
  members: GroupMember[];
  admins?: string[]; // Array of admin IDs
  createdBy: string;
  __v: number;
  lastMessage?: {
    _id: string;
    content: string;
    timestamp: string;
  };
}

// Create a group
export const createGroup = async (data: {
  name: string;
  memberIds: string[];
}): Promise<Group> => {
  const response = await axiosInstance.post("/group", data);
  return response.data;
};

// Get joined groups
export const getJoinedGroups = async (): Promise<Group[]> => {
  const response = await axiosInstance.get("/group/joined");
  return response.data;
};

// Get group messages
export const getGroupMessages = async (
  groupId: string
): Promise<GroupMessage[]> => {
  const response = await axiosInstance.get(`/group/messages/${groupId}`);
  return response.data;
};

// Get groups created by the user
export const getCreatedGroups = async (): Promise<Group[]> => {
  const response = await axiosInstance.get("/group/created");
  return response.data;
};

// Add members to a group
export const addGroupMembers = async (
  groupId: string,
  memberIds: string[]
): Promise<Group> => {
  const response = await axiosInstance.post(`/group/${groupId}/members`, {
    memberIds,
  });
  return response.data;
};

// Update group name
export const updateGroupName = async (
  groupId: string,
  name: string
): Promise<Group> => {
  const response = await axiosInstance.put(`/group/${groupId}/name`, { name });
  return response.data;
};

// Delete a group
export const deleteGroup = async (
  groupId: string
): Promise<{ message: string }> => {
  const response = await axiosInstance.delete(`/group/${groupId}`);
  return response.data;
};

// Remove a member from a group
export const removeGroupMember = async (
  groupId: string,
  memberId: string
): Promise<Group> => {
  const response = await axiosInstance.delete(
    `/group/${groupId}/members/${memberId}`
  );
  return response.data;
};

// Add an admin to a group
export const addGroupAdmin = async (
  groupId: string,
  memberId: string
): Promise<Group> => {
  const response = await axiosInstance.post(`/group/${groupId}/admins`, {
    memberId,
  });
  return response.data;
};
