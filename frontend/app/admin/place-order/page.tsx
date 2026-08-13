"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import RoleGuard from "@/components/RoleGuard";

interface Customer {
  id: string;
  name: string;
  phone: string;
}
interface MenuItem {
  id: string;
  name: string;
  price: string;
  isAvailable: boolean;
}
interface Line {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
}

function PlaceOrderContent() {
  const router = useRouter();
  const [customerSearch, setCustomerSearch] = useState("");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  );
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [lines, setLines] = useState<Line[]>([]);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api
      .get("/menu", { params: { pageSize: 100 } })
      .then((res) => setMenuItems(res.data.items));
  }, []);

  useEffect(() => {
    if (!customerSearch) {
      setCustomers([]);
      return;
    }
    const t = setTimeout(() => {
      api
        .get("/users/customers/search", { params: { search: customerSearch } })
        .then((res) => setCustomers(res.data.customers));
    }, 250);
    return () => clearTimeout(t);
  }, [customerSearch]);

  function addLine(item: MenuItem) {
    setLines((prev) => {
      const existing = prev.find((l) => l.menuItemId === item.id);
      if (existing) {
        return prev.map((l) =>
          l.menuItemId === item.id ? { ...l, quantity: l.quantity + 1 } : l,
        );
      }
      return [
        ...prev,
        {
          menuItemId: item.id,
          name: item.name,
          price: Number(item.price),
          quantity: 1,
        },
      ];
    });
  }

  function setQty(id: string, qty: number) {
    setLines((prev) =>
      qty <= 0
        ? prev.filter((l) => l.menuItemId !== id)
        : prev.map((l) => (l.menuItemId === id ? { ...l, quantity: qty } : l)),
    );
  }

  const total = lines.reduce((sum, l) => sum + l.price * l.quantity, 0);

  async function submit() {
    if (!selectedCustomer) {
      setError("Select which customer this order is for.");
      return;
    }
    if (lines.length === 0) {
      setError("Add at least one item.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const res = await api.post("/orders/on-behalf", {
        customerId: selectedCustomer.id,
        items: lines.map((l) => ({
          menuItemId: l.menuItemId,
          quantity: l.quantity,
        })),
        notes: notes || undefined,
      });
      router.push(`/orders/${res.data.order.id}`);
    } catch (err: any) {
      setError(err.response?.data?.error || "Couldn't place this order.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-flame-gradient px-6 py-8">
      <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-white/90">
        Admin
      </p>
      <h1 className="font-display text-3xl uppercase tracking-tight text-white">
        Place Order for a Customer
      </h1>
      <p className="mb-6 max-w-xl font-body text-sm text-white/80">
        Use this when a customer calls in, has trouble with the app, or is
        ordering as a walk-in. The order is created under their account and
        flagged as staff-assisted so it's traceable.
      </p>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_1fr_320px]">
        {/* Step 1: customer */}
        <div className="bg-paper-50 p-5 shadow-card">
          <h2 className="mb-3 font-display text-sm uppercase tracking-wide text-char-900">
            1. Customer
          </h2>
          {selectedCustomer ? (
            <div className="flex items-center justify-between bg-herb-500/10 px-3 py-2">
              <div>
                <p className="font-medium text-char-900">
                  {selectedCustomer.name}
                </p>
                <p className="font-mono text-xs text-char-900/50">
                  {selectedCustomer.phone}
                </p>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="font-mono text-xs text-ember-600 underline"
              >
                change
              </button>
            </div>
          ) : (
            <>
              <input
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                placeholder="Search name or phone…"
                className="mb-2 w-full border-b border-char-900/20 bg-transparent py-1.5 text-sm outline-none focus:border-ember-500"
              />
              <div className="max-h-48 overflow-y-auto">
                {customers.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCustomer(c)}
                    className="block w-full border-b border-char-900/5 py-2 text-left text-sm hover:bg-char-900/5"
                  >
                    <span className="font-medium text-char-900">{c.name}</span>{" "}
                    <span className="font-mono text-xs text-char-900/40">
                      {c.phone}
                    </span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Step 2: items */}
        <div className="bg-paper-50 p-5 shadow-card">
          <h2 className="mb-3 font-display text-sm uppercase tracking-wide text-char-900">
            2. Items
          </h2>
          <div className="max-h-80 space-y-1 overflow-y-auto">
            {menuItems
              .filter((m) => m.isAvailable)
              .map((item) => (
                <button
                  key={item.id}
                  onClick={() => addLine(item)}
                  className="flex w-full items-center justify-between border-b border-char-900/5 py-2 text-left text-sm hover:bg-char-900/5"
                >
                  <span className="text-char-900">{item.name}</span>
                  <span className="font-mono text-xs text-char-900/50">
                    ₹{Number(item.price).toFixed(2)}
                  </span>
                </button>
              ))}
          </div>
        </div>

        {/* Step 3: order preview */}
        <div className="relative bg-paper-50 px-5 pb-5 pt-6 shadow-order order-notch">
          <h2 className="mb-3 font-display text-sm uppercase tracking-wide text-char-900">
            Order Summary
          </h2>
          {lines.length === 0 ? (
            <p className="py-6 text-center font-mono text-xs text-char-900/40">
              No items yet.
            </p>
          ) : (
            <ul className="mb-3 space-y-2 font-mono text-xs text-char-900">
              {lines.map((l) => (
                <li
                  key={l.menuItemId}
                  className="flex items-center justify-between"
                >
                  <span>{l.name}</span>
                  <span className="flex items-center gap-1.5">
                    <button
                      onClick={() => setQty(l.menuItemId, l.quantity - 1)}
                      className="h-4 w-4 border border-char-900/30"
                    >
                      −
                    </button>
                    {l.quantity}
                    <button
                      onClick={() => setQty(l.menuItemId, l.quantity + 1)}
                      className="h-4 w-4 border border-char-900/30"
                    >
                      +
                    </button>
                  </span>
                </li>
              ))}
            </ul>
          )}
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Notes for kitchen…"
            rows={2}
            className="mb-3 w-full resize-none border-t border-dashed border-char-900/20 bg-transparent pt-2 font-mono text-xs text-char-900 outline-none"
          />
          <div className="mb-3 flex justify-between border-t border-char-900/20 pt-2 font-mono text-sm font-semibold text-char-900">
            <span>TOTAL</span>
            <span>₹{total.toFixed(2)}</span>
          </div>
          {error && (
            <p className="mb-3 font-mono text-xs text-ember-700">{error}</p>
          )}
          <button
            onClick={submit}
            disabled={submitting}
            className="w-full bg-ember-500 py-2.5 font-display text-xs uppercase tracking-wide text-paper-50 hover:bg-ember-600 disabled:opacity-60"
          >
            {submitting ? "Sending…" : "Send to Kitchen"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PlaceOrderPage() {
  return (
    <RoleGuard allowed={["ADMIN"]}>
      <PlaceOrderContent />
    </RoleGuard>
  );
}
