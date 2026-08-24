import type { InventoryItems, ItemId } from '@/types/items';

/** Simple inventory store (no external dependencies). */

type Listener = () => void;

let items: InventoryItems = {};
const listeners = new Set<Listener>();

function emit() {
  listeners.forEach((listener) => listener());
}

export const inventoryStore = {
  /** Subscribe to changes (for React) */
  subscribe(listener: Listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  /** Get current snapshot */
  getSnapshot(): InventoryItems {
    return items;
  },

  /** Get amount of a specific item */
  getAmount(id: ItemId): number {
    return items[id] ?? 0;
  },

  /** Check if player has at least `amount` of item */
  has(id: ItemId, amount = 1): boolean {
    return this.getAmount(id) >= amount;
  },

  /** Add items */
  add(id: ItemId, amount: number) {
    if (amount <= 0) return;
    items = {
      ...items,
      [id]: (items[id] ?? 0) + amount,
    };
    emit();
  },

  /** Remove items. Returns true if successful. */
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
    emit();
    return true;
  },

  /** Set full inventory (useful for loading save) */
  setItems(next: InventoryItems) {
    items = { ...next };
    emit();
  },

  /** Clear everything */
  clear() {
    items = {};
    emit();
  },
};
