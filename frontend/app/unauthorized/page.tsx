"use client";

import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center bg-char-900 px-6 text-center">
      <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.25em] text-ember-400">Order Denied</p>
      <h1 className="mb-4 font-display text-4xl uppercase tracking-tight text-paper-50">Not part of your access</h1>
      <p className="mb-6 max-w-sm font-body text-sm text-paper-300/60">
        Your role doesn't have access to this page. If that seems wrong, check with an admin.
      </p>
      <Link href="/menu" className="bg-ember-500 px-5 py-2.5 font-display text-xs uppercase tracking-wide text-paper-50 hover:bg-ember-600">
        Back to the menu
      </Link>
    </div>
  );
}
