import type { ItemDefinition, ItemId } from '@/types/items';

/** All item definitions for the first production chain */
export const ITEMS: Record<ItemId, ItemDefinition> = {
  iron_ore: {
    id: 'iron_ore',
    name: 'Железная руда',
    description: 'Сырая руда, добытая в шахте. Можно переплавить в железо.',
    category: 'resource',
    stackable: true,
    maxStack: 999,
  },
  iron: {
    id: 'iron',
    name: 'Железо',
    description: 'Переплавленная руда. Используется для создания простых предметов.',
    category: 'material',
    stackable: true,
    maxStack: 999,
  },
  nails: {
    id: 'nails',
    name: 'Гвозди',
    description: 'Простые железные гвозди. Всегда нужны в хозяйстве.',
    category: 'product',
    stackable: true,
    maxStack: 999,
  },
  horseshoe: {
    id: 'horseshoe',
    name: 'Подкова',
    description: 'Крепкая железная подкова.',
    category: 'product',
    stackable: true,
    maxStack: 99,
  },
  simple_sword: {
    id: 'simple_sword',
    name: 'Простой меч',
    description: 'Незамысловатый, но крепкий меч из железа.',
    category: 'product',
    stackable: true,
    maxStack: 20,
  },
};

/** Helper to get item definition safely */
export function getItemDef(id: ItemId): ItemDefinition {
  return ITEMS[id];
}
