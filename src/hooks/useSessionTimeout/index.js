// src/hooks/useSessionTimeout.js — FULL REPLACEMENT
//
// Enforces the system-wide Session Timeout setting (set by Admin in
// Settings > Security) for EVERY logged-in user, regardless of role.
//
// USAGE: call useSessionTimeout() ONCE, inside MainLayout (the component
// that wraps every authenticated route — Admin/HR/PM/Employee all pass
// through it). Do not call it per-page, just once at that layout level.

import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import useUserStore from "../../zustand/useUserStore";

const TIMEOUT_MS = {
  "15min": 15 * 60 * 1000,
  "30min": 30 * 60 * 1000,
  "1hour": 60 * 60 * 1000,
  "4hour": 4 * 60 * 60 * 1000,
  "never": null,
};

const ACTIVITY_EVENTS = ["mousedown", "mousemove", "keydown", "scroll", "touchstart"];

export const useSessionTimeout = () => {
  const navigate = useNavigate();
  const clearUserData = useUserStore((state) => state.clearUserData);
  const timerRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;  // not logged in — nothing to enforce

    const timeoutKey = localStorage.getItem("sessionTimeout") || "30min";
    const durationMs = TIMEOUT_MS[timeoutKey];

    // "never" — no timeout enforcement, skip entirely
    if (!durationMs) return;

    const handleLogout = () => {
      // Use the store's own clear function so `user` state, token, and
      // sessionTimeout all get cleared consistently — same cleanup path
      // as a manual logout, not a separate ad-hoc one.
      clearUserData();
      navigate("/login", { replace: true, state: { sessionExpired: true } });
    };

    const resetTimer = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(handleLogout, durationMs);
    };

    resetTimer();

    ACTIVITY_EVENTS.forEach((evt) => window.addEventListener(evt, resetTimer));

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      ACTIVITY_EVENTS.forEach((evt) => window.removeEventListener(evt, resetTimer));
    };
  }, [navigate, clearUserData]);
};