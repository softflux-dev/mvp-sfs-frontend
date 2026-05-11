// src/zustand/useUserStore.js
import { create } from "zustand";
import { persist } from "zustand/middleware";

const useUserStore = create(
  persist(
    (set) => ({
      user: null,
      authEmail: "",         
      resetToken: "",         

      setUserData:    (user)       => set({ user }),
      setAuthEmail:   (authEmail)  => set({ authEmail }),
      setResetToken:  (resetToken) => set({ resetToken }),

      clearUserData: () => {
        set({ user: null, authEmail: "", resetToken: "" });
        localStorage.removeItem("userData");
        localStorage.removeItem("token");
      },
    }),
    { name: "userData" }
  )
);

export default useUserStore;