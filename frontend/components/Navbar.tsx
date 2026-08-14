"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useCartStore } from "@/lib/cartStore";

function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const active = pathname === href;
  return (
    <Link
      href={href}
      className={`shrink-0 whitespace-nowrap border-b-2 pb-1 font-display text-[13px] uppercase tracking-wide transition-colors ${
        active
          ? "border-white text-white"
          : "border-transparent text-white/70 hover:border-white/60 hover:text-white"
      }`}
    >
      {children}
    </Link>
  );
}

function CartNavLink() {
  const pathname = usePathname();
  const active = pathname === "/cart";
  const itemCount = useCartStore((s) =>
    s.lines.reduce((sum, l) => sum + l.quantity, 0),
  );

  const [bump, setBump] = useState(false);
  const prevCount = useRef(itemCount);

  useEffect(() => {
    if (itemCount > prevCount.current) {
      setBump(true);
      const t = setTimeout(() => setBump(false), 350);
      prevCount.current = itemCount;
      return () => clearTimeout(t);
    }
    prevCount.current = itemCount;
  }, [itemCount]);

  return (
    <Link
      id="cart-nav-link"
      href="/cart"
      className={`relative shrink-0 whitespace-nowrap border-b-2 pb-1 font-display text-[13px] uppercase tracking-wide transition-colors ${
        active
          ? "border-white text-white"
          : "border-transparent text-white/70 hover:border-white/60 hover:text-white"
      }`}
    >
      Cart
      {itemCount > 0 && (
        <span
          className={`absolute -right-4 -top-3 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-char-900 px-1 font-mono text-[10px] font-medium leading-none text-white shadow-sm ${
            bump ? "cart-badge-bump" : ""
          }`}
        >
          {itemCount > 99 ? "99+" : itemCount}
        </span>
      )}
    </Link>
  );
}

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 bg-flame-gradient px-3 shadow-md sm:px-6">
      <Link href="/menu" className="shrink-0">
        <span className="font-display text-lg font-bold uppercase tracking-tight text-paper-50 sm:text-2xl">
          The Copper Grill
        </span>
      </Link>

      <div className="flex min-w-0 items-center gap-4 overflow-x-auto py-3 sm:gap-6">
        {user?.role === "CUSTOMER" && (
          <>
            <NavLink href="/menu">Menu</NavLink>
            <CartNavLink />
          </>
        )}

        {user?.role === "KITCHEN" && <NavLink href="/kitchen">Kitchen</NavLink>}

        {user?.role === "ADMIN" && (
          <>
            <NavLink href="/admin/menu-management">Menu</NavLink>
            <NavLink href="/admin/staff-management">Staff</NavLink>
            <NavLink href="/admin/place-order">Place Order</NavLink>
            <NavLink href="/admin/audit-logs">Audit Log</NavLink>
            <NavLink href="/kitchen">Kitchen</NavLink>
          </>
        )}

        {user ? (
          <div className="flex shrink-0 items-center gap-3 border-l border-white/25 pl-4 sm:pl-6">
            <span className="hidden font-mono text-[11px] uppercase text-white/70 sm:inline">
              {user.role}
            </span>
            <button
              onClick={logout}
              className="rounded-full bg-char-900 px-3 py-1.5 font-display text-[12px] uppercase tracking-wide text-white shadow-md transition-opacity hover:opacity-90 sm:text-[13px]"
            >
              Log out
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            className="shrink-0 rounded-full bg-char-900 px-3 py-1.5 font-display text-[12px] uppercase tracking-wide text-white shadow-md transition-opacity hover:opacity-90 sm:px-4 sm:text-[13px]"
          >
            Log in
          </Link>
        )}
      </div>
    </nav>
  );
}
