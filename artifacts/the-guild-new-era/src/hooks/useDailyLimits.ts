import { useSyncExternalStore } from 'react';
import { dailyLimitsStore } from '@/store/dailyLimitsStore';
import { MINE_CONFIG, FORGE_CONFIG } from '@/data/production';

export function useDailyLimits() {
  const state = useSyncExternalStore(
    dailyLimitsStore.subscribe,
    dailyLimitsStore.getSnapshot,
    dailyLimitsStore.getSnapshot,
  );

  const mineFreeLeft = Math.max(0, MINE_CONFIG.freeDigsPerDay - state.mineDigsUsed);
  const forgeFreeLeft = Math.max(0, FORGE_CONFIG.freeActionsPerDay - state.forgeActionsUsed);

  return {
    mineDigsUsed: state.mineDigsUsed,
    forgeActionsUsed: state.forgeActionsUsed,
    mineFreeLeft,
    forgeFreeLeft,
    useMineDig: () => dailyLimitsStore.useMineDig(),
    useForgeAction: () => dailyLimitsStore.useForgeAction(),
  };
}
