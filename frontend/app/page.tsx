"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function RootPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) return router.push("/login");
    if (user.role === "ADMIN") return router.push("/admin/menu-management");
    if (user.role === "KITCHEN") return router.push("/kitchen");
    router.push("/menu");
  }, [user, loading, router]);

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-char-900">
      <p className="font-mono text-sm text-paper-300/50">Loading The Copper Grill…</p>
    </div>
  );
}
