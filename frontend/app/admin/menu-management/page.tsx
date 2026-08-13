"use client";

import { useEffect, useState, FormEvent } from "react";
import { api } from "@/lib/api";
import RoleGuard from "@/components/RoleGuard";

interface Category {
  id: string;
  name: string;
}
interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: string;
  imageUrl?: string;
  isAvailable: boolean;
  category: Category;
}

function ManagementContent() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    imageUrl: "",
    categoryId: "",
  });
  const [newCategory, setNewCategory] = useState("");
  const [error, setError] = useState("");

  async function load() {
    const [menuRes, catRes] = await Promise.all([
      api.get("/menu", { params: { pageSize: 100 } }),
      api.get("/menu/categories"),
    ]);
    setItems(menuRes.data.items);
    setCategories(catRes.data.categories);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await api.post("/menu", {
        name: form.name,
        description: form.description || undefined,
        price: Number(form.price),
        imageUrl: form.imageUrl || undefined,
        categoryId: form.categoryId,
      });
      setForm({
        name: "",
        description: "",
        price: "",
        imageUrl: "",
        categoryId: "",
      });
      load();
    } catch (err: any) {
      setError(err.response?.data?.error || "Couldn't add that item.");
    }
  }

  async function toggleAvailable(item: MenuItem) {
    await api.patch(`/menu/${item.id}`, { isAvailable: !item.isAvailable });
    load();
  }

  async function remove(id: string) {
    await api.delete(`/menu/${id}`);
    load();
  }

  async function addCategory(e: FormEvent) {
    e.preventDefault();
    if (!newCategory.trim()) return;
    await api.post("/menu/categories", { name: newCategory });
    setNewCategory("");
    load();
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-flame-gradient px-6 py-8">
      <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-white/90">
        Admin
      </p>
      <h1 className="mb-6 font-display text-3xl uppercase tracking-tight text-white">
        Menu Management
      </h1>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
        <div className="bg-paper-50 shadow-card">
          <table className="w-full text-left font-body text-sm">
            <thead>
              <tr className="border-b border-char-900/15 font-mono text-[11px] uppercase text-char-900/50">
                <th className="px-4 py-3">Item</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Available</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-char-900/5">
                  <td className="px-4 py-3 font-medium text-char-900">
                    {item.name}
                  </td>
                  <td className="px-4 py-3 text-char-900/60">
                    {item.category.name}
                  </td>
                  <td className="px-4 py-3 font-mono">
                    ₹{Number(item.price).toFixed(2)}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleAvailable(item)}
                      className={`px-2 py-0.5 font-mono text-[11px] uppercase ${
                        item.isAvailable
                          ? "bg-herb-500/15 text-herb-600"
                          : "bg-char-900/10 text-char-900/50"
                      }`}
                    >
                      {item.isAvailable ? "Yes" : "No"}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => remove(item.id)}
                      className="font-mono text-[11px] text-ember-600 underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div>
          <form
            onSubmit={handleCreate}
            className="mb-6 bg-paper-50 p-5 shadow-card"
          >
            <h2 className="mb-4 font-display text-sm uppercase tracking-wide text-char-900">
              Add Item
            </h2>
            <input
              required
              placeholder="Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="mb-3 w-full border-b border-char-900/20 bg-transparent py-1.5 text-sm outline-none focus:border-ember-500"
            />
            <input
              placeholder="Description"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              className="mb-3 w-full border-b border-char-900/20 bg-transparent py-1.5 text-sm outline-none focus:border-ember-500"
            />
            <input
              required
              type="number"
              step="0.01"
              placeholder="Price"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              className="mb-3 w-full border-b border-char-900/20 bg-transparent py-1.5 text-sm outline-none focus:border-ember-500"
            />
            <input
              placeholder="Image URL"
              value={form.imageUrl}
              onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
              className="mb-3 w-full border-b border-char-900/20 bg-transparent py-1.5 text-sm outline-none focus:border-ember-500"
            />
            <select
              required
              value={form.categoryId}
              onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
              className="mb-4 w-full border-b border-char-900/20 bg-transparent py-1.5 text-sm outline-none focus:border-ember-500"
            >
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            {error && (
              <p className="mb-3 font-mono text-xs text-ember-700">{error}</p>
            )}
            <button
              type="submit"
              className="w-full bg-ember-500 py-2 font-display text-xs uppercase tracking-wide text-paper-50 hover:bg-ember-600"
            >
              Add to Menu
            </button>
          </form>

          <form onSubmit={addCategory} className="bg-paper-50 p-5 shadow-card">
            <h2 className="mb-3 font-display text-sm uppercase tracking-wide text-char-900">
              Add Category
            </h2>
            <div className="flex gap-2">
              <input
                placeholder="e.g. Desserts"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="flex-1 border-b border-char-900/20 bg-transparent py-1.5 text-sm outline-none focus:border-ember-500"
              />
              <button
                type="submit"
                className="bg-brass-500 px-3 font-display text-xs uppercase text-paper-50 hover:bg-brass-600"
              >
                Add
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function MenuManagementPage() {
  return (
    <RoleGuard allowed={["ADMIN"]}>
      <ManagementContent />
    </RoleGuard>
  );
}
