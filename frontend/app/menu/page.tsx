"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useCartStore } from "@/lib/cartStore";
import RoleGuard from "@/components/RoleGuard";

interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: string;
  imageUrl?: string;
  isAvailable: boolean;
  category: { id: string; name: string };
}

function MenuContent() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>(
    [],
  );
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [justAdded, setJustAdded] = useState<string | null>(null);
  const addItem = useCartStore((s) => s.addItem);

  useEffect(() => {
    api
      .get("/menu/categories")
      .then((res) => setCategories(res.data.categories));
  }, []);

  useEffect(() => {
    const params: Record<string, string> = { pageSize: "50" };
    if (activeCategory !== "all") params.categoryId = activeCategory;
    if (search) params.search = search;
    api.get("/menu", { params }).then((res) => setItems(res.data.items));
  }, [activeCategory, search]);

  function handleAdd(item: MenuItem, e: React.MouseEvent<HTMLButtonElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    window.dispatchEvent(
      new CustomEvent("cart:add", {
        detail: {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
        },
      }),
    );

    addItem({
      menuItemId: item.id,
      name: item.name,
      price: Number(item.price),
    });
    setJustAdded(item.id);
    setTimeout(() => setJustAdded(null), 900);
  }

  return (
    <div className="bg-flame-gradient min-h-[calc(100vh-64px)] px-3 py-6 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-3xl rounded-2xl bg-paper-50 p-5 shadow-2xl sm:p-8">
        <div className="mb-8 text-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-ember-600">
            Today's Board
          </p>
          <h1 className="font-display text-4xl uppercase tracking-tight text-char-900">
            The Menu
          </h1>
        </div>

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search Item…"
          className="mb-6 w-full border-b-2 border-char-900/15 bg-transparent py-2 font-body text-sm outline-none focus:border-ember-500"
        />

        <div className="mb-8 flex flex-wrap justify-center gap-2 border-b border-char-900/10 pb-4">
          <button
            onClick={() => setActiveCategory("all")}
            className={`font-display text-[13px] uppercase tracking-wide px-3 py-1 ${
              activeCategory === "all"
                ? "border-b-2 border-ember-500 text-char-900"
                : "text-char-900/50"
            }`}
          >
            All
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveCategory(c.id)}
              className={`font-display text-[13px] uppercase tracking-wide px-3 py-1 ${
                activeCategory === c.id
                  ? "border-b-2 border-ember-500 text-char-900"
                  : "text-char-900/50"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        <div className="divide-y divide-char-900/10">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 py-5 sm:gap-4"
            >
              {item.imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="h-14 w-14 flex-shrink-0 rounded-sm object-cover sm:h-16 sm:w-16"
                />
              )}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                  <h3 className="font-display text-base uppercase tracking-tight text-char-900 sm:text-lg">
                    {item.name}
                  </h3>
                  <span className="whitespace-nowrap font-mono text-sm text-char-900/80">
                    ₹{Number(item.price).toFixed(2)}
                  </span>
                </div>
                {item.description && (
                  <p className="mt-0.5 font-body text-sm text-char-900/60">
                    {item.description}
                  </p>
                )}
              </div>
              <button
                onClick={(e) => handleAdd(item, e)}
                className={`flex-shrink-0 rounded-full border px-4 py-1.5 font-display text-[12px] uppercase tracking-wide transition-all ${
                  justAdded === item.id
                    ? "border-herb-500 bg-herb-500 text-paper-50"
                    : "border-ember-500 text-ember-600 hover:border-transparent hover:bg-flame-gradient hover:text-white hover:shadow-md"
                }`}
              >
                {justAdded === item.id ? "Added" : "Add"}
              </button>
            </div>
          ))}
          {items.length === 0 && (
            <p className="py-10 text-center font-mono text-sm text-char-900/40">
              Nothing on the board matches that search.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function MenuPage() {
  return (
    <RoleGuard allowed={["CUSTOMER", "ADMIN"]}>
      <MenuContent />
    </RoleGuard>
  );
}
