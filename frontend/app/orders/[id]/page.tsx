"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import { useSocketEvent } from "@/hooks/useSocket";
import RoleGuard from "@/components/RoleGuard";

const STAGES = ["PENDING", "PREPARING", "READY", "COMPLETED"];
const STAGE_LABEL: Record<string, string> = {
  PENDING: "Order received",
  PREPARING: "On the fire",
  READY: "Ready for pickup",
  COMPLETED: "Completed",
};

interface Order {
  id: string;
  status: string;
  totalPrice: string;
  placedViaAdmin?: boolean;
  items: {
    id: string;
    quantity: number;
    priceEach: string;
    menuItem: { name: string };
  }[];
}

function TrackingContent() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    api.get(`/orders/${id}`).then((res) => setOrder(res.data.order));
  }, [id]);

  useSocketEvent("order:statusUpdate", (updated: Order) => {
    if (updated.id === id) setOrder(updated);
  });

  if (!order) {
    return (
      <p className="p-10 text-center font-mono text-sm text-char-900/40">
        Loading your order…
      </p>
    );
  }

  const stageIndex = STAGES.indexOf(order.status);
  const cancelled = order.status === "CANCELLED";

  return (
    <div className="bg-flame-gradient flex min-h-[calc(100vh-64px)] justify-center px-3 py-8 sm:px-4 sm:py-12">
      <div className="w-full max-w-md rounded-2xl bg-paper-50 p-5 shadow-2xl sm:p-8">
        <p className="mb-2 text-center font-mono text-[11px] uppercase tracking-[0.25em] text-ember-600">
          Order #{order.id.slice(0, 6)}
        </p>
        <h1 className="mb-8 text-center font-display text-3xl uppercase tracking-tight text-char-900">
          {cancelled ? "Order Cancelled" : "Tracking Your Order"}
        </h1>

        {order.placedViaAdmin && (
          <p className="mb-6 border border-brass-500/40 bg-brass-500/10 px-3 py-2 text-center font-mono text-xs text-brass-600">
            This order was placed for you by our staff.
          </p>
        )}

        {!cancelled && (
          <div className="relative mb-10">
            <div className="absolute left-0 right-0 top-[7px] h-[2px] bg-char-900/10" />
            <div
              className="absolute left-0 top-[7px] h-[2px] bg-ember-500 transition-all duration-500"
              style={{ width: `${(stageIndex / (STAGES.length - 1)) * 100}%` }}
            />
            <div className="relative flex justify-between">
              {STAGES.map((stage, i) => (
                <div
                  key={stage}
                  className="flex flex-1 flex-col items-center px-1"
                >
                  <div
                    className={`z-10 mb-2 h-3.5 w-3.5 rounded-full border-2 border-paper-50 ${
                      i <= stageIndex ? "bg-ember-500" : "bg-char-900/15"
                    }`}
                  />
                  <p
                    className={`text-center font-mono text-[9px] uppercase leading-tight sm:text-[10px] ${
                      i <= stageIndex ? "text-char-900" : "text-char-900/50"
                    }`}
                  >
                    {STAGE_LABEL[stage]}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-paper-50 px-6 py-5 shadow-card">
          <ul className="mb-4 space-y-1 font-mono text-sm text-char-900">
            {order.items.map((it) => (
              <li key={it.id} className="flex justify-between">
                <span>
                  {it.menuItem.name} ×{it.quantity}
                </span>
                <span>₹{(Number(it.priceEach) * it.quantity).toFixed(2)}</span>
              </li>
            ))}
          </ul>
          <div className="flex justify-between border-t border-char-900/15 pt-3 font-mono text-base font-semibold">
            <span>TOTAL</span>
            <span>₹{Number(order.totalPrice).toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OrderTrackingPage() {
  return (
    <RoleGuard allowed={["CUSTOMER", "ADMIN"]}>
      <TrackingContent />
    </RoleGuard>
  );
}
