export type ProfessionId = 'blacksmith' | 'carpenter';

export interface ProfessionDef {
  id: ProfessionId;
  name: string;
  description: string;
  /** id зданий, которыми можно владеть, изучив эту профессию */
  allowedBuildingIds: string[];
  /** стоимость обучения в золоте */
  learnCost: number;
}

export const PROFESSIONS: Record<ProfessionId, ProfessionDef> = {
  blacksmith: {
    id: 'blacksmith',
    name: 'Кузнец',
    description: 'Право владеть кузницей и работать с металлом.',
    allowedBuildingIds: ['iron-spark'],
    learnCost: 200,
  },
  carpenter: {
    id: 'carpenter',
    name: 'Плотник',
    description: 'Право владеть плотницкой мастерской и работать с деревом.',
    allowedBuildingIds: ['oak-workshop'],
    learnCost: 200,
  },
};

/** Находит профессию, которая открывает право владеть данным зданием */
export function getRequiredProfession(buildingId: string): ProfessionDef | null {
  const match = (Object.values(PROFESSIONS) as ProfessionDef[]).find((p) =>
    p.allowedBuildingIds.includes(buildingId),
  );
  return match ?? null;
}
