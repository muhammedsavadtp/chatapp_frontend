// /lib/redux/userSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { UserProfile, UserSearchResult } from "@/lib/api/userApi";

interface UserState {
  profile: UserProfile | null;
  contacts: UserSearchResult[];
}

const initialState: UserState = {
  profile: null,
  contacts: [],
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setProfile: (state, action: PayloadAction<UserProfile>) => {
      state.profile = action.payload;
    },
    setContacts: (state, action: PayloadAction<UserSearchResult[]>) => {
      state.contacts = action.payload;
    },
    addContact: (state, action: PayloadAction<UserSearchResult>) => {
      state.contacts.push(action.payload);
    },
    updateProfile: (state, action: PayloadAction<UserProfile>) => {
      state.profile = action.payload;
    },
  },
});

export const { setProfile, setContacts, addContact, updateProfile } =
  userSlice.actions;
export default userSlice.reducer;
