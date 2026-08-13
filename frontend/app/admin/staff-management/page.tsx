"use client";

import { useEffect, useState, FormEvent } from "react";
import { api } from "@/lib/api";
import RoleGuard from "@/components/RoleGuard";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

function StaffContent() {
  const [users, setUsers] = useState<User[]>([]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "KITCHEN",
  });
  const [error, setError] = useState("");

  async function load() {
    const res = await api.get("/users");
    setUsers(res.data.users);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await api.post("/users/staff", form);
      setForm({ name: "", email: "", password: "", role: "KITCHEN" });
      load();
    } catch (err: any) {
      setError(err.response?.data?.error || "Couldn't create that account.");
    }
  }

  async function toggleActive(user: User) {
    await api.patch(`/users/${user.id}/active`, { isActive: !user.isActive });
    load();
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-flame-gradient px-6 py-8">
      <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-white/90">
        Admin
      </p>
      <h1 className="mb-6 font-display text-3xl uppercase tracking-tight text-white">
        Staff &amp; Users
      </h1>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_300px]">
        <div className="bg-paper-50 shadow-card">
          <table className="w-full text-left font-body text-sm">
            <thead>
              <tr className="border-b border-char-900/15 font-mono text-[11px] uppercase text-char-900/50">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-char-900/5">
                  <td className="px-4 py-3 font-medium text-char-900">
                    {u.name}
                  </td>
                  <td className="px-4 py-3 text-char-900/60">{u.email}</td>
                  <td className="px-4 py-3 font-mono text-[11px] uppercase">
                    {u.role}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 font-mono text-[11px] uppercase ${u.isActive ? "bg-herb-500/15 text-herb-600" : "bg-ember-700/10 text-ember-700"}`}
                    >
                      {u.isActive ? "Active" : "Disabled"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => toggleActive(u)}
                      className="font-mono text-[11px] text-ember-600 underline"
                    >
                      {u.isActive ? "Deactivate" : "Activate"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <form
          onSubmit={handleCreate}
          className="h-fit bg-paper-50 p-5 shadow-card"
        >
          <h2 className="mb-4 font-display text-sm uppercase tracking-wide text-char-900">
            Add Staff Account
          </h2>
          <input
            required
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="mb-3 w-full border-b border-char-900/20 bg-transparent py-1.5 text-sm outline-none focus:border-ember-500"
          />
          <input
            required
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="mb-3 w-full border-b border-char-900/20 bg-transparent py-1.5 text-sm outline-none focus:border-ember-500"
          />
          <input
            required
            type="password"
            minLength={8}
            placeholder="Temporary password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="mb-3 w-full border-b border-char-900/20 bg-transparent py-1.5 text-sm outline-none focus:border-ember-500"
          />
          <select
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            className="mb-4 w-full border-b border-char-900/20 bg-transparent py-1.5 text-sm outline-none focus:border-ember-500"
          >
            <option value="KITCHEN">Kitchen Staff</option>
            <option value="ADMIN">Admin</option>
          </select>
          {error && (
            <p className="mb-3 font-mono text-xs text-ember-700">{error}</p>
          )}
          <button
            type="submit"
            className="w-full bg-ember-500 py-2 font-display text-xs uppercase tracking-wide text-paper-50 hover:bg-ember-600"
          >
            Create Account
          </button>
          <p className="mt-3 font-mono text-[10px] text-char-900/40"></p>
        </form>
      </div>
    </div>
  );
}

export default function StaffManagementPage() {
  return (
    <RoleGuard allowed={["ADMIN"]}>
      <StaffContent />
    </RoleGuard>
  );
}
