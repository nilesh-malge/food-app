import { create } from "zustand";

export interface CartLine {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
}

interface CartState {
  lines: CartLine[];
  addItem: (item: Omit<CartLine, "quantity">) => void;
  removeItem: (menuItemId: string) => void;
  setQuantity: (menuItemId: string, quantity: number) => void;
  clear: () => void;
  total: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  lines: [],
  addItem: (item) =>
    set((state) => {
      const existing = state.lines.find((l) => l.menuItemId === item.menuItemId);
      if (existing) {
        return {
          lines: state.lines.map((l) =>
            l.menuItemId === item.menuItemId ? { ...l, quantity: l.quantity + 1 } : l
          ),
        };
      }
      return { lines: [...state.lines, { ...item, quantity: 1 }] };
    }),
  removeItem: (menuItemId) =>
    set((state) => ({ lines: state.lines.filter((l) => l.menuItemId !== menuItemId) })),
  setQuantity: (menuItemId, quantity) =>
    set((state) => ({
      lines:
        quantity <= 0
          ? state.lines.filter((l) => l.menuItemId !== menuItemId)
          : state.lines.map((l) => (l.menuItemId === menuItemId ? { ...l, quantity } : l)),
    })),
  clear: () => set({ lines: [] }),
  total: () => get().lines.reduce((sum, l) => sum + l.price * l.quantity, 0),
}));
