import { useSyncExternalStore } from 'react';
import { ownershipStore } from '@/store/ownershipStore';

export function useOwnership() {
  const owned = useSyncExternalStore(
    ownershipStore.subscribe,
    ownershipStore.getSnapshot,
    ownershipStore.getSnapshot,
  );

  return {
    owned,
    isOwned: (id: string) => owned.includes(id),
    buy: (id: string) => ownershipStore.buy(id),
  };
}
