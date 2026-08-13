"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/lib/cartStore";
import { api } from "@/lib/api";
import RoleGuard from "@/components/RoleGuard";

function CartContent() {
  const { lines, setQuantity, removeItem, clear, total } = useCartStore();
  const [notes, setNotes] = useState("");
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function placeOrder() {
    setError("");
    setPlacing(true);
    try {
      const res = await api.post("/orders", {
        items: lines.map((l) => ({
          menuItemId: l.menuItemId,
          quantity: l.quantity,
        })),
        notes: notes || undefined,
      });
      clear();
      router.push(`/orders/${res.data.order.id}`);
    } catch (err: any) {
      setError(
        err.response?.data?.error ||
          "Couldn't place your order. Please try again.",
      );
    } finally {
      setPlacing(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-64px)] justify-center bg-flame-gradient px-3 py-8 sm:px-4 sm:py-12">
      <div className="w-full max-w-md">
        <p className="mb-2 text-center font-mono text-sm font-bold uppercase tracking-[0.25em] text-white">
          Order Summary
        </p>

        <div className="relative bg-paper-50 px-4 pb-6 pt-8 shadow-order order-notch sm:px-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-1 border-b border-dashed border-char-900/20 pb-3 font-mono text-[11px] uppercase text-char-900/50">
            <span>The Copper Grill — Your Cart</span>
            <span>{new Date().toLocaleDateString()}</span>
          </div>

          {lines.length === 0 ? (
            <p className="py-10 text-center font-mono text-sm text-char-900/40">
              Your cart is empty. Head to the menu to add something.
            </p>
          ) : (
            <div className="space-y-4">
              {lines.map((line) => (
                <div
                  key={line.menuItemId}
                  className="flex items-start justify-between gap-3 font-mono text-sm"
                >
                  <div>
                    <p className="text-char-900">{line.name}</p>
                    <div className="mt-1 flex items-center gap-2 text-char-900/60">
                      <button
                        onClick={() =>
                          setQuantity(line.menuItemId, line.quantity - 1)
                        }
                        className="h-5 w-5 border border-char-900/30"
                      >
                        −
                      </button>
                      <span>{line.quantity}</span>
                      <button
                        onClick={() =>
                          setQuantity(line.menuItemId, line.quantity + 1)
                        }
                        className="h-5 w-5 border border-char-900/30"
                      >
                        +
                      </button>
                      <button
                        onClick={() => removeItem(line.menuItemId)}
                        className="ml-2 text-ember-600 underline"
                      >
                        remove
                      </button>
                    </div>
                  </div>
                  <span className="whitespace-nowrap text-char-900">
                    ₹{(line.price * line.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          )}

          {lines.length > 0 && (
            <>
              <div className="my-4 border-t border-dashed border-char-900/20 pt-4">
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Kitchen notes (allergies, spice level…)"
                  rows={2}
                  className="w-full resize-none bg-transparent font-mono text-xs text-char-900 outline-none placeholder:text-char-900/40"
                />
              </div>

              <div className="flex items-center justify-between border-t border-char-900/20 pt-3 font-mono text-base font-semibold text-char-900">
                <span>TOTAL</span>
                <span>₹{total().toFixed(2)}</span>
              </div>

              {error && (
                <p className="mt-3 font-mono text-xs text-ember-700">{error}</p>
              )}

              <button
                onClick={placeOrder}
                disabled={placing}
                className="mt-5 w-full rounded-xl bg-flame-gradient py-3 font-display text-sm uppercase tracking-wide text-white shadow-md transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                {placing ? "Placing order…" : "Confirm Order"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CartPage() {
  return (
    <RoleGuard allowed={["CUSTOMER"]}>
      <CartContent />
    </RoleGuard>
  );
}
