"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import type { SafeUser } from "@/lib/auth";

interface AuthContextType {
  user: SafeUser | null;
  isLoading: boolean;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({
  children,
  initialUser = null,
}: {
  children: ReactNode;
  initialUser?: SafeUser | null;
}) {
  const router = useRouter();
  const [user, setUser] = useState<SafeUser | null>(initialUser ?? null);
  const [isLoading, setIsLoading] = useState(false);

  const refreshUser = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setUser(data.user || null);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialUser === undefined) {
      let isMounted = true;
      fetch("/api/auth/me")
        .then((res) => (res.ok ? res.json() : { user: null }))
        .then((data) => {
          if (isMounted) setUser(data.user || null);
        })
        .catch(() => {
          if (isMounted) setUser(null);
        });
      return () => {
        isMounted = false;
      };
    }
  }, [initialUser]);

  const logout = async () => {
    setIsLoading(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      router.push("/");
      router.refresh();
    } catch (err) {
      console.error("[Auth] Logout failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, refreshUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
