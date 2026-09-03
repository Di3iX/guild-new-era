import { useSyncExternalStore } from 'react';
import { marketPriceStore } from '@/store/marketPriceStore';
import { SELL_PRICES, BUY_PRICES } from '@/data/prices';
import type { ItemId } from '@/types/items';

export type PriceTrend = 'up' | 'down' | 'flat';

export function useMarketPrices() {
  // подписка нужна только чтобы компонент перерисовался при изменении цен
  useSyncExternalStore(
    marketPriceStore.subscribe,
    marketPriceStore.getSnapshot,
    marketPriceStore.getSnapshot,
  );

  const getSellPrice = (itemId: ItemId): number => {
    const base = SELL_PRICES[itemId] ?? 0;
    return Math.max(0, Math.round(base * marketPriceStore.getMultiplier(itemId)));
  };

  const getBuyPrice = (itemId: ItemId): number => {
    const base = BUY_PRICES[itemId] ?? 0;
    return Math.max(0, Math.round(base * marketPriceStore.getMultiplier(itemId)));
  };

  const getTrend = (itemId: ItemId): PriceTrend => {
    const mult = marketPriceStore.getMultiplier(itemId);
    if (mult > 1.02) return 'up';
    if (mult < 0.98) return 'down';
    return 'flat';
  };

  return {
    getSellPrice,
    getBuyPrice,
    getTrend,
    registerSale: marketPriceStore.registerSale,
    registerPurchase: marketPriceStore.registerPurchase,
  };
}
