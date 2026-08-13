"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

type Tab = "customer" | "staff";

export default function LoginPage() {
  const { loginStaff, loginCustomer } = useAuth();
  const [tab, setTab] = useState<Tab>("customer");

  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [needsName, setNeedsName] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleCustomerSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await loginCustomer(phone.trim(), needsName ? name.trim() : undefined);
    } catch (err: any) {
      const msg =
        err?.response?.data?.error ||
        "Couldn't sign you in. Check your details and try again.";
      if (msg.toLowerCase().includes("enter your name")) {
        setNeedsName(true);
        setError("First time ordering with us — what's your name?");
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleStaffSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await loginStaff(email.trim(), password);
    } catch (err: any) {
      setError(
        err?.response?.data?.error ||
          "Couldn't sign you in. Check your details and try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-flame-gradient px-3 py-8 sm:px-4 sm:py-12">
      <div className="w-full max-w-sm rounded-2xl bg-paper-50 p-6 shadow-2xl sm:p-8">
        <h1 className="mb-1 text-center font-display text-3xl uppercase tracking-tight text-char-900">
          The Copper Grill
        </h1>
        <p className="mb-6 text-center text-sm text-char-900/50">
          {tab === "customer" ? "Order food from your phone" : "Staff sign-in"}
        </p>

        <div className="mb-6 flex rounded-full bg-char-900/5 p-1">
          <button
            type="button"
            onClick={() => {
              setTab("customer");
              setError("");
            }}
            className={`flex-1 rounded-full py-2 text-sm font-medium transition ${
              tab === "customer"
                ? "bg-flame-gradient text-white shadow-md"
                : "text-char-900/50"
            }`}
          >
            Customer
          </button>
          <button
            type="button"
            onClick={() => {
              setTab("staff");
              setError("");
            }}
            className={`flex-1 rounded-full py-2 text-sm font-medium transition ${
              tab === "staff"
                ? "bg-flame-gradient text-white shadow-md"
                : "text-char-900/50"
            }`}
          >
            Staff
          </button>
        </div>

        {error && (
          <p className="mb-4 rounded-lg bg-ember-500/10 px-3 py-2 text-sm text-ember-700">
            {error}
          </p>
        )}

        {tab === "customer" ? (
          <form onSubmit={handleCustomerSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-char-900/50">
                Mobile number
              </label>
              <input
                type="tel"
                required
                maxLength={10}
                placeholder="9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                className="w-full rounded-xl border border-char-900/10 bg-white px-4 py-3 text-char-900 outline-none focus:border-ember-500"
              />
            </div>

            {needsName && (
              <div>
                <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-char-900/50">
                  Your name
                </label>
                <input
                  type="text"
                  required
                  placeholder="What should we call you?"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-char-900/10 bg-white px-4 py-3 text-char-900 outline-none focus:border-ember-500"
                  autoFocus
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-flame-gradient py-3 font-medium text-white shadow-md transition hover:opacity-90 disabled:opacity-60"
            >
              {loading
                ? "Please wait…"
                : needsName
                  ? "Create account & continue"
                  : "Continue"}
            </button>

            <p className="text-center text-xs text-char-900/40">
              No password needed — just your phone number.
            </p>

            <button
              type="button"
              onClick={() => {
                setPhone("9999999999");
                setNeedsName(false);
                setError("");
              }}
              className="w-full rounded-lg border border-dashed border-char-900/15 py-2 text-center font-mono text-[11px] text-char-900/50 hover:border-ember-500 hover:text-ember-600"
            >
              Test account: 9999999999
            </button>
          </form>
        ) : (
          <form onSubmit={handleStaffSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-char-900/50">
                Email
              </label>
              <input
                type="email"
                required
                placeholder="you@coppergrill.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-char-900/10 bg-white px-4 py-3 text-char-900 outline-none focus:border-ember-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-char-900/50">
                Password
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-char-900/10 bg-white px-4 py-3 text-char-900 outline-none focus:border-ember-500"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-flame-gradient py-3 font-medium text-white shadow-md transition hover:opacity-90 disabled:opacity-60"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>

            <div className="space-y-1.5 rounded-lg border border-dashed border-char-900/15 p-2">
              <button
                type="button"
                onClick={() => {
                  setEmail("admin@foodapp.com");
                  setPassword("Password@123");
                  setError("");
                }}
                className="block w-full text-center font-mono text-[11px] text-char-900/50 hover:text-ember-600"
              >
                Test Admin: admin@foodapp.com / Password@123
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmail("kitchen@foodapp.com");
                  setPassword("Password@123");
                  setError("");
                }}
                className="block w-full text-center font-mono text-[11px] text-char-900/50 hover:text-ember-600"
              >
                Test Kitchen: kitchen@foodapp.com / Password@123
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
