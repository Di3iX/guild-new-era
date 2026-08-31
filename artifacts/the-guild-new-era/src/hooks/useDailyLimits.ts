import { useSyncExternalStore } from 'react';
import { dailyLimitsStore } from '@/store/dailyLimitsStore';
import {
  MINE_CONFIG,
  FORGE_CONFIG,
  FOREST_CONFIG,
  CARPENTRY_CONFIG,
} from '@/data/production';

export function useDailyLimits() {
  const state = useSyncExternalStore(
    dailyLimitsStore.subscribe,
    dailyLimitsStore.getSnapshot,
    dailyLimitsStore.getSnapshot,
  );

  const mineFreeLeft = Math.max(0, MINE_CONFIG.freeDigsPerDay - (state.mineDigsUsed ?? 0));
  const forgeFreeLeft = Math.max(
    0,
    FORGE_CONFIG.freeActionsPerDay - (state.forgeActionsUsed ?? 0),
  );
  const forestFreeLeft = Math.max(
    0,
    FOREST_CONFIG.freeChopsPerDay - (state.forestChopsUsed ?? 0),
  );
  const carpentryFreeLeft = Math.max(
    0,
    CARPENTRY_CONFIG.freeActionsPerDay - (state.carpentryActionsUsed ?? 0),
  );

  return {
    mineDigsUsed: state.mineDigsUsed ?? 0,
    forgeActionsUsed: state.forgeActionsUsed ?? 0,
    forestChopsUsed: state.forestChopsUsed ?? 0,
    carpentryActionsUsed: state.carpentryActionsUsed ?? 0,
    mineFreeLeft,
    forgeFreeLeft,
    forestFreeLeft,
    carpentryFreeLeft,
    useMineDig: () => dailyLimitsStore.useMineDig(),
    useForgeAction: () => dailyLimitsStore.useForgeAction(),
    useForestChop: () => dailyLimitsStore.useForestChop(),
    useCarpentryAction: () => dailyLimitsStore.useCarpentryAction(),
  };
}