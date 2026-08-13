"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, Role } from "@/hooks/useAuth";

/**
 * Frontend route guard. This is a UX convenience only — it hides pages
 * and redirects unauthorized users so the app *feels* correctly scoped.
 * The real enforcement happens in the backend's `authorize()` middleware
 * on every API call and socket event; a user could disable JS and still
 * not be able to perform an action their role doesn't allow.
 */
export default function RoleGuard({
  allowed,
  children,
}: {
  allowed: Role[];
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || !allowed.includes(user.role))) {
      router.push(user ? "/unauthorized" : "/login");
    }
  }, [user, loading, allowed, router]);

  if (loading || !user || !allowed.includes(user.role)) {
    return (
      <div className="flex h-[60vh] items-center justify-center text-char-800/60">
        Checking access…
      </div>
    );
  }

  return <>{children}</>;
}
