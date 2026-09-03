import { useMemo } from 'react';
import { useResourceChain } from './useResourceChain';
import { BUY_PRICES, SELL_PRICES } from '@/data/prices';
import type { ItemId } from '@/types/items';

export interface CostStepBreakdown {
  itemId: string;
  name: string;
  /** себестоимость одной единицы на этом шаге */
  unitCost: number;
}

export interface TrueCostResult {
  itemId: string;
  /** себестоимость одной единицы конечного товара */
  unitCost: number;
  /** цена продажи на рынке (без учёта налога) */
  sellPrice: number;
  /** прибыль с единицы: sellPrice - unitCost */
  margin: number;
  /** прибыль в % от себестоимости, null если себестоимость 0 */
  marginPercent: number | null;
  /** себестоимость на каждом шаге цепочки, от сырья до товара */
  breakdown: CostStepBreakdown[];
}

/**
 * Считает себестоимость товара, если бы всё сырьё покупалось на рынке
 * (BUY_PRICES) плюс плата за каждый крафт (action.cost), и сравнивает
 * с ценой продажи на рынке (SELL_PRICES).
 */
export function useTrueCost(itemId: string): TrueCostResult | null {
  const steps = useResourceChain(itemId);

  return useMemo(() => {
    if (!steps) return null;

    let unitCost = 0;
    const breakdown: CostStepBreakdown[] = [];

    for (const step of steps) {
      if (!step.actionName) {
        // сырьё — себестоимость равна рыночной цене покупки
        unitCost = BUY_PRICES[step.node.itemId as ItemId] ?? 0;
      } else {
        const inputTotal = unitCost * (step.inputAmount ?? 1);
        const extraTotal = step.extra
          ? (BUY_PRICES[step.extra.itemId as ItemId] ?? 0) * step.extra.amount
          : 0;
        const craftFee = step.craftFee ?? 0;
        const outputAmount = step.outputAmount ?? 1;

        unitCost = (inputTotal + extraTotal + craftFee) / outputAmount;
      }

      breakdown.push({
        itemId: step.node.itemId,
        name: step.node.name,
        unitCost: Math.round(unitCost * 100) / 100,
      });
    }

    const sellPrice = SELL_PRICES[itemId as ItemId] ?? 0;
    const margin = Math.round((sellPrice - unitCost) * 100) / 100;
    const marginPercent = unitCost > 0 ? Math.round((margin / unitCost) * 1000) / 10 : null;

    return {
      itemId,
      unitCost: Math.round(unitCost * 100) / 100,
      sellPrice,
      margin,
      marginPercent,
      breakdown,
    };
  }, [steps, itemId]);
}
