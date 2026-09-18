// src/zustand/useUnsavedChangesStore.js
import { create } from "zustand";

const SAVE_TIMEOUT_MS = 15000;

// Gives MUI's Dialog/Modal enough time to run its own exit transition and
// fully unmount before we tear down the page underneath it. Navigating in
// the SAME tick that closes the dialog can leave MUI's modal manager
// thinking a Modal is still open — it never gets to restore body scroll /
// pointer-events, and the whole app appears frozen until a hard refresh.
// This is exactly what was happening on "Discard & Leave": pendingNavigation()
// fired immediately, sometimes tearing down the entire page (route change)
// mid-transition.
const DIALOG_CLOSE_DELAY_MS = 300;

const leaveAfterDialogCloses = (navigateFn) => {
  if (!navigateFn) return;
  setTimeout(() => navigateFn(), DIALOG_CLOSE_DELAY_MS);
};

export const useUnsavedChangesStore = create((set, get) => ({
  isDirty: false,
  dialogOpen: false,
  pendingNavigation: null,
  saveHandler: null,
  saving: false,

  setDirty: (value) => set({ isDirty: value }),
  setSaveHandler: (fn) => set({ saveHandler: fn }),

 // src/zustand/useUnsavedChangesStore.js
guardNavigate: (navigateFn) => {
  if (!get().isDirty) {
    navigateFn();
    return;
  }
  // Don't reopen while a previous dialog instance is still closing —
  // this exact "close then immediately reopen" sequence is what can
  // leave MUI's Modal manager in a stuck, unclickable state.
  if (get().closing) return;
  set({ dialogOpen: true, pendingNavigation: navigateFn, saving: false });
},

confirmDiscard: () => {
  const { pendingNavigation } = get();
  set({ dialogOpen: false, pendingNavigation: null, isDirty: false, saving: false, closing: true });
  setTimeout(() => set({ closing: false }), 350);
  leaveAfterDialogCloses(pendingNavigation);
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
        leaveAfterDialogCloses(pendingNavigation);
      } else {
        set({ saving: false });
      }
    } catch {
      set({ saving: false });
    }
  },

  closeDialog: () => set({ dialogOpen: false, pendingNavigation: null, saving: false }),
}));