import type { InventoryItems, ItemId } from '@/types/items';

type Listener = () => void;

const STORAGE_KEY = 'guild-inventory';

function load(): InventoryItems {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as InventoryItems;
  } catch {
    return {};
  }
}

function save(items: InventoryItems) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // ignore
  }
}

let items: InventoryItems = load();
const listeners = new Set<Listener>();

function emit() {
  listeners.forEach((listener) => listener());
}

export const inventoryStore = {
  subscribe(listener: Listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  getSnapshot(): InventoryItems {
    return items;
  },

  getAmount(id: ItemId): number {
    return items[id] ?? 0;
  },

  has(id: ItemId, amount = 1): boolean {
    return this.getAmount(id) >= amount;
  },

  add(id: ItemId, amount: number) {
    if (amount <= 0) return;
    items = {
      ...items,
      [id]: (items[id] ?? 0) + amount,
    };
    save(items);
    emit();
  },

  remove(id: ItemId, amount: number): boolean {
    if (amount <= 0) return true;
    const current = items[id] ?? 0;
    if (current < amount) return false;

    const next = current - amount;
    if (next <= 0) {
      const { [id]: _, ...rest } = items;
      items = rest;
    } else {
      items = { ...items, [id]: next };
    }
    save(items);
    emit();
    return true;
  },

  setItems(next: InventoryItems) {
    items = { ...next };
    save(items);
    emit();
  },

  clear() {
    items = {};
    save(items);
    emit();
  },
};