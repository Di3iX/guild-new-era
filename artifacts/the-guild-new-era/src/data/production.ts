/** Production & economy config for the first gameplay loop */

export const MINE_CONFIG = {
  /** Free digs per day */
  freeDigsPerDay: 5,
  /** Gold cost after free digs are used */
  digCost: 3,
  /** Seconds for one dig action */
  digDurationSec: 9,
  /** Ore amount range per dig (before any future modifiers) */
  oreMin: 4,
  oreMax: 6,
} as const;

export const FORGE_CONFIG = {
  freeActionsPerDay: 5,
  actions: {
    smelt: {
      id: 'smelt',
      name: 'Переплавить руду',
      input: { itemId: 'iron_ore' as const, amount: 3 },
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

export const MARKET_TAX_RATE = 0.1; // 10%
