"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { login as apiLogin, me } from "@/lib/api";
import { clearSession, getStoredUser, getToken, persistSession } from "@/lib/storage";
import type { User } from "@/lib/types";

interface AuthContextValue {
  user: User | null;
  ready: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const PUBLIC_PATHS = new Set(["/", "/login"]);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const token = getToken();
    const stored = getStoredUser();
    if (!token) {
      setReady(true);
      return;
    }
    if (stored) setUser(stored);
    me()
      .then((next) => {
        persistSession(token, next);
        setUser(next);
      })
      .catch(() => {
        clearSession();
        setUser(null);
      })
      .finally(() => setReady(true));
  }, []);

  useEffect(() => {
    if (!ready) return;
    const isPublic = PUBLIC_PATHS.has(pathname);
    if (!user && !isPublic) router.replace("/login");
    if (user && pathname === "/login") router.replace("/dashboard");
  }, [ready, user, pathname, router]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      ready,
      async login(email, password) {
        const result = await apiLogin(email, password);
        persistSession(result.accessToken, result.user);
        setUser(result.user);
        router.replace("/dashboard");
      },
      logout() {
        clearSession();
        setUser(null);
        router.replace("/login");
      },
    }),
    [user, ready, router],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
