import { useSyncExternalStore } from 'react';
import { familyStore } from '@/store/familyStore';

export function useFamily() {
  const state = useSyncExternalStore(
    familyStore.subscribe,
    familyStore.getSnapshot,
    familyStore.getSnapshot,
  );

  return {
    ...state,
    marry: familyStore.marry,
    haveChild: familyStore.haveChild,
    succeed: familyStore.succeed,
  };
}
