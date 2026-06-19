
import { create } from "zustand";

export const useCompanyLogoStore = create((set) => ({
  logoUrl: "",
  setLogoUrl: (logoUrl) => set({ logoUrl }),
}));