"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import RoleGuard from "@/components/RoleGuard";

interface LogEntry {
  id: string;
  action: string;
  createdAt: string;
  metadata: Record<string, unknown>;
  user: { name: string; email: string; role: string };
}

const ACTION_COLOR: Record<string, string> = {
  ORDER_PLACED_BY_ADMIN: "text-brass-600",
  ORDER_CANCELLED: "text-ember-700",
  ORDER_STATUS_UPDATED: "text-herb-600",
};

function AuditContent() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    api.get("/audit-logs", { params: { page, pageSize: 20 } }).then((res) => {
      setLogs(res.data.logs);
      setTotalPages(res.data.totalPages);
    });
  }, [page]);

  return (
    <div className="min-h-[calc(100vh-64px)] bg-flame-gradient px-6 py-8">
      <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-white/90">
        Admin
      </p>
      <h1 className="mb-6 font-display text-3xl uppercase tracking-tight text-white">
        Audit Log
      </h1>

      <div className="bg-paper-50 shadow-card">
        {logs.map((log) => (
          <div
            key={log.id}
            className="flex items-center justify-between border-b border-char-900/5 px-5 py-3 font-mono text-xs"
          >
            <div className="flex items-center gap-4">
              <span className="w-40 text-char-900/40">
                {new Date(log.createdAt).toLocaleString()}
              </span>
              <span
                className={`font-semibold ${ACTION_COLOR[log.action] || "text-char-900"}`}
              >
                {log.action}
              </span>
            </div>
            <span className="text-char-900/50">
              {log.user.name} ({log.user.role})
            </span>
          </div>
        ))}
        {logs.length === 0 && (
          <p className="py-10 text-center font-mono text-sm text-char-900/40">
            No activity recorded yet.
          </p>
        )}
      </div>

      <div className="mt-4 flex items-center justify-center gap-4 font-mono text-xs">
        <button
          disabled={page <= 1}
          onClick={() => setPage((p) => p - 1)}
          className="disabled:opacity-30"
        >
          ← Prev
        </button>
        <span>
          Page {page} of {totalPages || 1}
        </span>
        <button
          disabled={page >= totalPages}
          onClick={() => setPage((p) => p + 1)}
          className="disabled:opacity-30"
        >
          Next →
        </button>
      </div>
    </div>
  );
}

export default function AuditLogsPage() {
  return (
    <RoleGuard allowed={["ADMIN"]}>
      <AuditContent />
    </RoleGuard>
  );
}
