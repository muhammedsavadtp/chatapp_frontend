// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
"use client";

import React, { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/lib/redux/store";
import { logout } from "@/lib/redux/slices/authSlice";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Settings, LogOut, Camera, Trash2 } from "lucide-react";
import { getProfile, updateProfile } from "@/lib/api/userApi";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { removeStorageValue } from "@/lib/utils/storage";
import { setProfile } from "@/lib/redux/slices/userSlice";

export function UserProfile() {
  const router = useRouter();
  const state = useSelector((state: RootState) => state);
  const { profile } = state.user;
  const user = profile;
  const dispatch = useDispatch();

  const [isUpdating, setIsUpdating] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    username: user?.username || "",
    bio: user?.bio || "",
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Sync formData with user data when user changes
  useEffect(() => {
    setFormData({
      name: user?.name || "",
      username: user?.username || "",
      bio: user?.bio || "",
    });
    // Clear previewImage when user.profilePicture is null
    if (!user?.profilePicture) {
      setPreviewImage(null);
      setSelectedImage(null);
    }
  }, [user]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = async () => {
    try {
      setIsUpdating(true);
      const updateData = {
        profilePicture: null,
      };

      const updatedProfile = await updateProfile(updateData);

      if (updatedProfile) {
        // Update Redux store
        dispatch({
          type: "auth/setCredentials",
          payload: {
            user: updatedProfile,
            token: state.auth.token,
          },
        });
        // Explicitly clear local state
        setSelectedImage(null);
        setPreviewImage(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        getUserProfile();
        toast("Profile picture removed successfully");
      }
    } catch (error) {
      console.error("Failed to remove profile picture:", error);
      toast(`Error: ${error.message || "Failed to remove profile picture"}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      setIsUpdating(true);
      const updateData = {};

      if (formData.name !== user?.name) updateData.name = formData.name;
      if (formData.username !== user?.username)
        updateData.username = formData.username;
      if (formData.bio !== user?.bio) updateData.bio = formData.bio;

      if (selectedImage) {
        updateData.profilePicture = selectedImage;
      } else {
        updateData.profilePicture = null;
      }

      if (Object.keys(updateData).length > 0) {
        const updatedProfile = await updateProfile(updateData);

        if (updatedProfile) {
          dispatch({
            type: "auth/setCredentials",
            payload: {
              user: updatedProfile,
              token: state.auth.token,
            },
          });
          setSelectedImage(null);
          setPreviewImage(null);
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
          getUserProfile();
          toast("Your profile has been updated successfully");
        }
      } else {
        toast("No changes to update");
      }
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast(`Error: ${error.message || "Failed to update profile"}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    removeStorageValue("auth_token");
    router.push("/auth");
  };
  const getUserProfile = async () => {
    const userProfile = await getProfile();
    dispatch(setProfile(userProfile));
  };
  useEffect(() => {
    getUserProfile();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10 border-2 border-primary">
          <AvatarImage
            src={
              previewImage ||
              (user?.profilePicture
                ? `${process.env.NEXT_PUBLIC_API_URL}${user?.profilePicture}`
                : undefined)
            }
            alt={user?.name}
          />
          <AvatarFallback>
            {user?.name?.substring(0, 2).toUpperCase() || "US"}
          </AvatarFallback>
        </Avatar>
        <div className="hidden md:block">
          <div className="font-medium">{user?.name}</div>
          <div className="text-xs text-muted-foreground">@{user?.username}</div>
        </div>
      </div>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon">
            <Settings className="h-5 w-5" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="space-y-4">
            <h4 className="font-medium text-lg">Profile Settings</h4>

            <div className="flex justify-center mb-4">
              <div className="relative">
                <Avatar className="h-20 w-20">
                  <AvatarImage
                    src={
                      previewImage ||
                      (user?.profilePicture
                        ? `${process.env.NEXT_PUBLIC_API_URL}${user?.profilePicture}`
                        : undefined)
                    }
                    alt={user?.name}
                  />
                  <AvatarFallback>
                    {user?.name?.substring(0, 2).toUpperCase() || "US"}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute bottom-0 right-0 flex gap-1">
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-6 w-6 rounded-full"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUpdating}
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                  {(previewImage || user?.profilePicture) && (
                    <Button
                      variant="destructive"
                      size="icon"
                      className="h-6 w-6 rounded-full"
                      onClick={handleRemoveImage}
                      disabled={isUpdating}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <Input
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Your name"
                disabled={isUpdating}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Username</label>
              <Input
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="Your username"
                disabled={isUpdating}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Bio</label>
              <Textarea
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                placeholder="Tell us about yourself"
                rows={3}
                disabled={isUpdating}
              />
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
              <Button onClick={handleUpdateProfile} disabled={isUpdating}>
                {isUpdating ? "Updating..." : "Update Profile"}
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
