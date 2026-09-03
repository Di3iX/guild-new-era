import { FORGE_CONFIG, CARPENTRY_CONFIG } from './production';

export type ChainTier = 0 | 1 | 2;

export interface ChainNode {
  itemId: string;
  name: string;
  tier: ChainTier;
  /** id зданий, где можно добыть/произвести предмет */
  producedAt: string[];
  /** id рецепта в actionsById, если предмет — результат крафта (tier > 0) */
  sourceAction?: string;
}

/** Объединённый реестр всех крафт-рецептов (кузница + плотницкая) для поиска по id */
export const actionsById = {
  ...FORGE_CONFIG.actions,
  ...CARPENTRY_CONFIG.actions,
} as const;

export type ActionId = keyof typeof actionsById;

export const RESOURCE_CHAINS: Record<string, ChainNode> = {
  // Сырьё (tier 0)
  iron_ore: {
    itemId: 'iron_ore',
    name: 'Железная руда',
    tier: 0,
    producedAt: ['north-mine'],
  },
  coal: {
    itemId: 'coal',
    name: 'Уголь',
    tier: 0,
    producedAt: ['north-mine'],
  },
  wood: {
    itemId: 'wood',
    name: 'Дерево',
    tier: 0,
    producedAt: ['south-forest'],
  },

  // Полуфабрикаты (tier 1)
  iron: {
    itemId: 'iron',
    name: 'Слиток железа',
    tier: 1,
    producedAt: ['iron-spark'],
    sourceAction: 'smelt',
  },

  // Готовые товары (tier 2)
  nails: {
    itemId: 'nails',
    name: 'Гвозди',
    tier: 2,
    producedAt: ['iron-spark'],
    sourceAction: 'nails',
  },
  horseshoe: {
    itemId: 'horseshoe',
    name: 'Подковы',
    tier: 2,
    producedAt: ['iron-spark'],
    sourceAction: 'horseshoe',
  },
  simple_sword: {
    itemId: 'simple_sword',
    name: 'Простой меч',
    tier: 2,
    producedAt: ['iron-spark'],
    sourceAction: 'simple_sword',
  },
  reinforced_sword: {
    itemId: 'reinforced_sword',
    name: 'Укреплённый меч',
    tier: 2,
    producedAt: ['iron-spark'],
    sourceAction: 'reinforced_sword',
  },
  wooden_shield: {
    itemId: 'wooden_shield',
    name: 'Деревянный щит',
    tier: 2,
    producedAt: ['oak-workshop'],
    sourceAction: 'wooden_shield',
  },
  wooden_crate: {
    itemId: 'wooden_crate',
    name: 'Деревянный ящик',
    tier: 2,
    producedAt: ['oak-workshop'],
    sourceAction: 'wooden_crate',
  },
};
