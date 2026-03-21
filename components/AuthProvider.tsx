"use client";

import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase/client";

/**
 * Keeps Firebase Auth initialized on the client.
 * Auth protection is done per-page via useAuth() hook.
 */
export default function AuthProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Ensure Firebase Auth listener is active globally
    const unsubscribe = onAuthStateChanged(auth, () => {});
    return unsubscribe;
  }, []);

  return <>{children}</>;
}
