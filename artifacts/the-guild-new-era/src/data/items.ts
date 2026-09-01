import type { ItemDefinition, ItemId } from '@/types/items';

export const ITEMS: Record<ItemId, ItemDefinition> = {
  iron_ore: {
    id: 'iron_ore',
    name: 'Железная руда',
    description: 'Сырая руда из шахты.',
    category: 'resource',
    stackable: true,
    maxStack: 999,
  },
  iron: {
    id: 'iron',
    name: 'Железо',
    description: 'Переплавленная руда.',
    category: 'material',
    stackable: true,
    maxStack: 999,
  },
  nails: {
    id: 'nails',
    name: 'Гвозди',
    description: 'Простые железные гвозди.',
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
    description: 'Меч из железа.',
    category: 'product',
    stackable: true,
    maxStack: 20,
  },
  reinforced_sword: {
    id: 'reinforced_sword',
    name: 'Укреплённый меч',
    description: 'Более крепкий меч. Доступен с 2 уровня кузницы.',
    category: 'product',
    stackable: true,
    maxStack: 20,
  },
  wood: {
    id: 'wood',
    name: 'Дерево',
    description: 'Строительный лес. Можно добыть в лесу или купить на рынке.',
    category: 'resource',
    stackable: true,
    maxStack: 999,
  },
  coal: {
    id: 'coal',
    name: 'Уголь',
    description: 'Нужен для плавки руды.',
    category: 'resource',
    stackable: true,
    maxStack: 999,
  },
  wooden_shield: {
    id: 'wooden_shield',
    name: 'Деревянный щит',
    description: 'Щит из дерева, укреплённый железом.',
    category: 'product',
    stackable: true,
    maxStack: 20,
  },
  wooden_crate: {
    id: 'wooden_crate',
    name: 'Деревянный ящик',
    description: 'Прочный ящик. Доступен с 2 уровня плотницкой.',
    category: 'product',
    stackable: true,
    maxStack: 50,
  },
};

export function getItemDef(id: ItemId): ItemDefinition {
  return ITEMS[id];
}