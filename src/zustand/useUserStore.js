import { create } from "zustand";
import { persist } from "zustand/middleware";

const useUserStore = create(
  persist(
    (set) => ({
      user: null,
      setUserData: (user) => set({ user }),
      clearUserData: () => {
        set({ user: null });
        localStorage.removeItem("userData");
        localStorage.removeItem("token");
      },
    }),
    {
      name: "userData",
    }
  )
);

export default useUserStore;
