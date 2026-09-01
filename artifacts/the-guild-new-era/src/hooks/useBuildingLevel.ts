import { useSyncExternalStore } from 'react';
import {
  upgradeStore,
  UPGRADE_COSTS,
  UPGRADE_MAX_LEVEL,
} from '@/store/upgradeStore';

export function useBuildingLevel(buildingId: string) {
  const state = useSyncExternalStore(
    upgradeStore.subscribe,
    upgradeStore.getSnapshot,
    upgradeStore.getSnapshot,
  );

  const level = state[buildingId] ?? 1;
  const maxLevel = UPGRADE_MAX_LEVEL;
  const nextLevel = level + 1;
  const upgradeCost =
    level < maxLevel ? (UPGRADE_COSTS[nextLevel] ?? 0) : 0;
  const canUpgrade = level < maxLevel;

  return {
    level,
    maxLevel,
    upgradeCost,
    canUpgrade,
    upgrade: () => upgradeStore.upgrade(buildingId),
  };
}
