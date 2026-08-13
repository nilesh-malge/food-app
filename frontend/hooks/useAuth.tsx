"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";

export type Role = "ADMIN" | "KITCHEN" | "CUSTOMER";

export interface AuthUser {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  role: Role;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  loginStaff: (email: string, password: string) => Promise<void>;
  loginCustomer: (phone: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
  refetch: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  async function fetchMe() {
    try {
      const res = await api.get("/auth/me");
      setUser(res.data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchMe();
  }, []);

  async function loginStaff(email: string, password: string) {
    const res = await api.post("/auth/login", { email, password });
    setUser(res.data.user);
    routeByRole(res.data.user.role);
  }

  // Single step: existing customers sign in, new phone numbers sign up
  // (name is required by the backend only the first time).
  async function loginCustomer(phone: string, name?: string) {
    const res = await api.post("/auth/customer-login", { phone, name });
    setUser(res.data.user);
    router.push("/menu");
  }

  async function logout() {
    await api.post("/auth/logout");
    setUser(null);
    router.push("/login");
  }

  function routeByRole(role: Role) {
    if (role === "ADMIN") router.push("/admin/menu-management");
    else if (role === "KITCHEN") router.push("/kitchen");
    else router.push("/menu");
  }

  return (
    <AuthContext.Provider value={{ user, loading, loginStaff, loginCustomer, logout, refetch: fetchMe }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
