// src/zustand/useUnsavedChangesStore.js
import { create } from "zustand";

const SAVE_TIMEOUT_MS = 15000;

export const useUnsavedChangesStore = create((set, get) => ({
  isDirty: false,
  dialogOpen: false,
  pendingNavigation: null,
  saveHandler: null,
  saving: false,

  setDirty: (value) => set({ isDirty: value }),
  setSaveHandler: (fn) => set({ saveHandler: fn }),

  guardNavigate: (navigateFn) => {
    if (!get().isDirty) {
      navigateFn();
      return;
    }
    // Always open fresh — clears any stale "saving" state left over from
    // a previous attempt (e.g. a hung/unwired tab), so the dialog never
    // opens already showing a spinner for work that isn't actually running.
    set({ dialogOpen: true, pendingNavigation: navigateFn, saving: false });
  },

  confirmDiscard: () => {
    const { pendingNavigation } = get();
    set({ dialogOpen: false, pendingNavigation: null, isDirty: false, saving: false });
    pendingNavigation?.();
  },

  confirmSave: async () => {
    const { saveHandler, pendingNavigation } = get();
    if (!saveHandler) {
      // No save handler registered for the active tab — nothing to save,
      // safest is to just leave (matches "no unsaved changes worth losing").
      get().confirmDiscard();
      return;
    }
    set({ saving: true });

    // Hang-safety: if a tab's save handler never resolves (network stall,
    // or the handler being unwired/broken), don't leave the dialog stuck
    // on "Saving..." forever — surface it as a failure after a timeout.
    const timeout = new Promise((resolve) =>
      setTimeout(() => resolve({ success: false, timedOut: true }), SAVE_TIMEOUT_MS)
    );

    try {
      const result = await Promise.race([saveHandler(), timeout]);
      if (result?.success) {
        set({ dialogOpen: false, pendingNavigation: null, isDirty: false, saving: false });
        pendingNavigation?.();
      } else {
        set({ saving: false });
      }
    } catch {
      set({ saving: false });
    }
  },

  closeDialog: () => set({ dialogOpen: false, pendingNavigation: null, saving: false }),
}));