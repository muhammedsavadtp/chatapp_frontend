export interface Chat {
  id: string;
  name: string;
  status?: "online" | "offline";
  [key: string]: unknown;
}

export interface UserProfile {
  id: string;
  [key: string]: unknown;
}

export type DialogType = "add-contact" | "create-group";
