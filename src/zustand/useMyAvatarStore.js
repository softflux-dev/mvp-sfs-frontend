// src/zustand/useMyAvatarStore.js — NEW FILE

import { create } from "zustand";

export const useMyAvatarStore = create((set) => ({
  avatarUrl: "",
  setAvatarUrl: (avatarUrl) => set({ avatarUrl }),
}));