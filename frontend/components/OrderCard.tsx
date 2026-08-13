"use client";

import { useEffect, useState } from "react";

interface OrderCardProps {
  order: {
    id: string;
    status: "PENDING" | "PREPARING" | "READY" | "COMPLETED" | "CANCELLED";
    createdAt: string;
    notes?: string | null;
    placedViaAdmin?: boolean;
    customer: { name: string };
    placedByStaff?: { name: string } | null;
    items: { id: string; quantity: number; menuItem: { name: string } }[];
  };
  onAdvance?: (nextStatus: string) => void;
  rotation?: number;
}

const NEXT_STATUS: Record<string, string | null> = {
  PENDING: "PREPARING",
  PREPARING: "READY",
  READY: "COMPLETED",
  COMPLETED: null,
  CANCELLED: null,
};

const ACTION_LABEL: Record<string, string> = {
  PENDING: "Start Preparing",
  PREPARING: "Mark Ready",
  READY: "Complete",
};

function ElapsedTimer({ since }: { since: string }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const start = new Date(since).getTime();
    const tick = () => setElapsed(Math.floor((Date.now() - start) / 1000));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [since]);

  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;
  const isLate = mins >= 10;

  return (
    <span className={`font-mono text-xs ${isLate ? "text-ember-400" : "text-paper-300/60"}`}>
      {mins}:{secs.toString().padStart(2, "0")}
    </span>
  );
}

export default function OrderCard({ order, onAdvance, rotation = 0 }: OrderCardProps) {
  const nextStatus = NEXT_STATUS[order.status];

  return (
    <div
      className="order-notch relative flex-shrink-0 bg-paper-50 px-4 pb-4 pt-6 shadow-order"
      style={{ transform: `rotate(${rotation}deg)`, width: "230px" }}
    >
      <div className="mb-2 flex items-center justify-between font-mono text-[11px] uppercase text-char-900/50">
        <span>#{order.id.slice(0, 6)}</span>
        <ElapsedTimer since={order.createdAt} />
      </div>

      <p className="mb-1 font-display text-sm uppercase tracking-tight text-char-900">
        {order.customer.name}
      </p>

      {order.placedViaAdmin && (
        <p className="mb-2 inline-block bg-brass-500/15 px-1.5 py-0.5 font-mono text-[10px] uppercase text-brass-600">
          Staff-assisted{order.placedByStaff ? ` · ${order.placedByStaff.name}` : ""}
        </p>
      )}

      <ul className="mb-3 space-y-1 border-t border-dashed border-char-900/20 pt-2 font-mono text-[12px] text-char-900">
        {order.items.map((it) => (
          <li key={it.id} className="flex justify-between">
            <span>{it.menuItem.name}</span>
            <span className="text-char-900/60">×{it.quantity}</span>
          </li>
        ))}
      </ul>

      {order.notes && (
        <p className="mb-3 bg-ember-700/10 px-2 py-1 font-mono text-[11px] italic text-ember-700">
          "{order.notes}"
        </p>
      )}

      {onAdvance && nextStatus && (
        <button
          onClick={() => onAdvance(nextStatus)}
          className="w-full bg-char-900 py-2 font-display text-[11px] uppercase tracking-wide text-paper-50 transition-colors hover:bg-ember-600"
        >
          {ACTION_LABEL[order.status]}
        </button>
      )}
    </div>
  );
}
