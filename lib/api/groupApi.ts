// /lib/api/groupApi.ts
import axiosInstance from "./axiosInstance";

// Types
export interface GroupMember {
  _id: string;
  username: string;
}

export interface GroupMessage {
  _id: string;
  sender: {
    _id: string;
    username: string;
  };
  group: string;
  content: string;
  fileUrl: string;
  status: string;
  read: boolean;
  timestamp: string;
  __v: number;
}

export interface Group {
  _id: string;
  name: string;
  members: GroupMember[];
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
}): Promise<any> => {
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
