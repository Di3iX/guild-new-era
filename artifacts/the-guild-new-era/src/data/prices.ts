import type { ItemId } from '@/types/items';

/** Цена, за которую рынок покупает у игрока (продажа со стороны игрока) */
export const SELL_PRICES: Partial<Record<ItemId, number>> = {
  iron_ore: 3,
  iron: 12,
  nails: 4,
  horseshoe: 30,
  simple_sword: 50,
  reinforced_sword: 90,
  wood: 2,
  coal: 4,
  wooden_shield: 40,
  wooden_crate: 18,
};

/** Цена, по которой игрок покупает у рынка */
export const BUY_PRICES: Partial<Record<ItemId, number>> = {
  iron_ore: 5,
  iron: 18,
  nails: 7,
  horseshoe: 45,
  simple_sword: 75,
  reinforced_sword: 130,
  wood: 4,
  coal: 6,
  wooden_shield: 60,
  wooden_crate: 28,
};
