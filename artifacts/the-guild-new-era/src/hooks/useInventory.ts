import { useSyncExternalStore } from 'react';
import { inventoryStore } from '@/store/inventoryStore';
import type { InventoryItems, ItemId } from '@/types/items';

/**
 * React hook for the inventory store.
 * Re-renders only when inventory changes.
 */
export function useInventory() {
  const items = useSyncExternalStore(
    inventoryStore.subscribe,
    inventoryStore.getSnapshot,
    inventoryStore.getSnapshot,
  );

  return {
    items,
    getAmount: (id: ItemId) => inventoryStore.getAmount(id),
    has: (id: ItemId, amount?: number) => inventoryStore.has(id, amount),
    add: (id: ItemId, amount: number) => inventoryStore.add(id, amount),
    remove: (id: ItemId, amount: number) => inventoryStore.remove(id, amount),
    setItems: (next: InventoryItems) => inventoryStore.setItems(next),
    clear: () => inventoryStore.clear(),
  };
}
