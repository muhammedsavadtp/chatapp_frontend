// /lib/api/userApi.ts
import axiosInstance from "./axiosInstance";

// Types
export interface UserSearchResult {
  _id: string;
  username: string;
  name: string;
  profilePicture: string;
}

export interface UserProfile {
  id: string;
  username: string;
  name: string;
  bio: string;
  profilePicture: string;
  status: string;
  lastSeen: string;
  contacts?: string[];
}

export interface UserContact {
  _id: string;
  name: string;
  username: string;
  profilePicture: string;
  status: string;
  lastSeen?: string;
}
// Search users by username
export const searchUsers = async (
  username: string
): Promise<UserSearchResult[]> => {
  const response = await axiosInstance.get(`/user/search?username=${username}`);
  return response.data;
};

// Add a contact
export const addContact = async (
  contactId: string
): Promise<{ message: string }> => {
  const response = await axiosInstance.post("/user/add-contact", { contactId });
  return response.data;
};

// Update user profile (using FormData)
export const updateProfile = async (data: {
  name?: string;
  bio?: string;
  username?: string;
  profilePicture?: File;
}): Promise<UserProfile> => {
  const formData = new FormData();
  if (data.name) formData.append("name", data.name);
  if (data.bio) formData.append("bio", data.bio);
  if (data.username) formData.append("username", data.username);
  if (data.profilePicture)
    formData.append("profilePicture", data.profilePicture);

  const response = await axiosInstance.put("/user/profile", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

// Get user profile
export const getProfile = async (): Promise<UserProfile> => {
  const response = await axiosInstance.get("/user/profile");
  return response.data;
};

// get user contacts 
export const getContacts = async (): Promise<UserContact[]> => {
  const response = await axiosInstance.get("/user/contacts");
  return response.data;
};
