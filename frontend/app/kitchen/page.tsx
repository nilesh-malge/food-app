"use client";

import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { useSocketEvent } from "@/hooks/useSocket";
import RoleGuard from "@/components/RoleGuard";
import OrderCard from "@/components/OrderCard";

interface Order {
  id: string;
  status: "PENDING" | "PREPARING" | "READY" | "COMPLETED" | "CANCELLED";
  createdAt: string;
  notes?: string | null;
  placedViaAdmin?: boolean;
  customer: { name: string };
  placedByStaff?: { name: string } | null;
  items: { id: string; quantity: number; menuItem: { name: string } }[];
}

// Small deterministic per-card tilt so the rail looks physically clipped,
// not uniformly grid-aligned — but restrained (max ~1.5deg) so it reads as
// a detail, not a gimmick.
function tiltFor(id: string) {
  const n = id.charCodeAt(0) + id.charCodeAt(id.length - 1);
  return ((n % 30) - 15) / 10;
}

const COLUMNS: { status: Order["status"]; label: string }[] = [
  { status: "PENDING", label: "New" },
  { status: "PREPARING", label: "On the Fire" },
  { status: "READY", label: "Ready for Pass" },
];

function KitchenContent() {
  const [orders, setOrders] = useState<Order[]>([]);

  const loadOrders = useCallback(async () => {
    const res = await api.get("/orders");
    setOrders(
      res.data.orders.filter(
        (o: Order) => o.status !== "COMPLETED" && o.status !== "CANCELLED",
      ),
    );
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  useSocketEvent("order:new", () => loadOrders());
  useSocketEvent("order:statusUpdate", () => loadOrders());
  useSocketEvent("order:cancelled", () => loadOrders());

  async function advance(orderId: string, nextStatus: string) {
    await api.patch(`/orders/${orderId}/status`, { status: nextStatus });
    // Optimistically remove COMPLETED orders from the board; socket event
    // will reconcile the rest.
    if (nextStatus === "COMPLETED") {
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
    }
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-flame-gradient px-6 py-8">
      <div className="mb-6 flex items-baseline justify-between">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-white/80">
            Back of House
          </p>
          <h1 className="font-display text-3xl uppercase tracking-tight text-paper-50">
            Kitchen
          </h1>
        </div>
        <p className="font-mono text-xs text-white/70">
          {orders.length} orders on the board
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {COLUMNS.map((col) => {
          const colOrders = orders.filter((o) => o.status === col.status);
          return (
            <div key={col.status} className="rounded-sm bg-char-800/60 p-4">
              <div className="mb-4 flex items-center justify-between border-b border-char-700 pb-2">
                <h2 className="font-display text-sm uppercase tracking-wide text-paper-50">
                  {col.label}
                </h2>
                <span className="font-mono text-xs text-paper-300/50">
                  {colOrders.length}
                </span>
              </div>
              <div className="flex flex-wrap gap-5 px-1 pt-1">
                {colOrders.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    rotation={tiltFor(order.id)}
                    onAdvance={(next) => advance(order.id, next)}
                  />
                ))}
                {colOrders.length === 0 && (
                  <p className="py-6 font-mono text-xs text-paper-300/30">
                    Nothing here right now.
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function KitchenPage() {
  return (
    <RoleGuard allowed={["KITCHEN", "ADMIN"]}>
      <KitchenContent />
    </RoleGuard>
  );
}
