export const MINE_CONFIG = {
  freeDigsPerDay: 5,
  digCost: 3,
  digDurationSec: 9,
  oreMin: 4,
  oreMax: 6,
  coalChance: 0.45,
  coalMin: 1,
  coalMax: 2,
} as const;

export const FOREST_CONFIG = {
  freeChopsPerDay: 5,
  chopCost: 2,
  chopDurationSec: 7,
  woodMin: 3,
  woodMax: 5,
} as const;

export const FORGE_CONFIG = {
  freeActionsPerDay: 5,
  actions: {
    smelt: {
      id: 'smelt',
      name: 'Переплавить руду',
      input: { itemId: 'iron_ore' as const, amount: 3 },
      extra: { itemId: 'coal' as const, amount: 1 },
      output: { itemId: 'iron' as const, amount: 1 },
      durationSec: 7,
      cost: 2,
    },
    nails: {
      id: 'nails',
      name: 'Сделать гвозди',
      input: { itemId: 'iron' as const, amount: 1 },
      output: { itemId: 'nails' as const, amount: 4 },
      durationSec: 5,
      cost: 2,
    },
    horseshoe: {
      id: 'horseshoe',
      name: 'Сделать подковы',
      input: { itemId: 'iron' as const, amount: 2 },
      output: { itemId: 'horseshoe' as const, amount: 1 },
      durationSec: 7,
      cost: 3,
    },
    simple_sword: {
      id: 'simple_sword',
      name: 'Сделать простой меч',
      input: { itemId: 'iron' as const, amount: 3 },
      output: { itemId: 'simple_sword' as const, amount: 1 },
      durationSec: 12,
      cost: 4,
    },
  },
} as const;

export const CARPENTRY_CONFIG = {
  freeActionsPerDay: 5,
  actions: {
    wooden_shield: {
      id: 'wooden_shield',
      name: 'Сделать деревянный щит',
      input: { itemId: 'wood' as const, amount: 3 },
      extra: { itemId: 'iron' as const, amount: 1 },
      output: { itemId: 'wooden_shield' as const, amount: 1 },
      durationSec: 10,
      cost: 3,
    },
  },
} as const;

export const MARKET_TAX_RATE = 0.1;