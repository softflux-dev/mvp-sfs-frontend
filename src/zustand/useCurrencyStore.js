// src/zustand/useCurrencyStore.js — 
import { create } from "zustand";

const STORAGE_KEY = "app_currency";

const FALLBACK = { code: "USD", name: "US Dollar", symbol: "$", locale: "en-US", decimals: 2 };

// Hydrate from localStorage so amounts don't flash the wrong symbol on reload
const readCached = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : FALLBACK;
  } catch {
    return FALLBACK;
  }
};

export const useCurrencyStore = create((set) => ({
  currency: readCached(),
  setCurrency: (currency) => {
    if (!currency?.code) return;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(currency)); } catch { /* ignore */ }
    set({ currency });
  },
}));