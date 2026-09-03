import { useSyncExternalStore } from 'react';
import { professionStore } from '@/store/professionStore';
import { PROFESSIONS, getRequiredProfession, type ProfessionId } from '@/data/professions';

export function useProfession() {
  const learned = useSyncExternalStore(
    professionStore.subscribe,
    professionStore.getSnapshot,
    professionStore.getSnapshot,
  ) as ProfessionId[];

  const hasProfession = (id: ProfessionId) => learned.includes(id);

  /** Может ли игрок владеть этим зданием (учтена ли нужная профессия) */
  const canOwnBuilding = (buildingId: string): boolean => {
    const required = getRequiredProfession(buildingId);
    if (!required) return true; // здание не привязано к профессии
    return hasProfession(required.id);
  };

  return {
    learned,
    hasProfession,
    canOwnBuilding,
    learn: (id: ProfessionId) => professionStore.learn(id),
    professions: PROFESSIONS,
  };
}
