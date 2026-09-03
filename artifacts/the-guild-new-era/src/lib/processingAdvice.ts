import { actionsById, RESOURCE_CHAINS } from '@/data/productionChains';
import { SELL_PRICES, BUY_PRICES } from '@/data/prices';
import type { ItemId } from '@/types/items';

export interface ProcessingOption {
  outputItemId: string;
  outputName: string;
  /** чистая выручка с одной единицы исходного товара при переработке */
  perUnitValue: number;
  /** прибавка по сравнению с прямой продажей этого товара как есть */
  gain: number;
}

/**
 * Проверяет, есть ли рецепт, который использует itemId как вход, и выгоднее
 * ли переработать его в этот выходной товар и продать, чем продать напрямую.
 * Сравнивается только один шаг переработки (не вся цепочка до конца).
 *
 * Это чистая функция (не хук) — считает дёшево, можно вызывать в .map().
 */
export function getProcessingAdvice(itemId: string): ProcessingOption | null {
  const directSellPrice = SELL_PRICES[itemId as ItemId] ?? 0;
  const options: ProcessingOption[] = [];

  for (const action of Object.values(actionsById)) {
    if (action.input.itemId !== itemId) continue;

    const outputSell = SELL_PRICES[action.output.itemId as ItemId] ?? 0;
    if (outputSell <= 0) continue;

    const extra = 'extra' in action ? action.extra : undefined;
    const extraCost = extra ? (BUY_PRICES[extra.itemId as ItemId] ?? 0) * extra.amount : 0;

    const revenue = action.output.amount * outputSell - extraCost - action.cost;
    const perUnitValue = revenue / action.input.amount;
    const gain = perUnitValue - directSellPrice;

    if (gain > 0) {
      options.push({
        outputItemId: action.output.itemId,
        outputName: RESOURCE_CHAINS[action.output.itemId]?.name ?? action.output.itemId,
        perUnitValue: Math.round(perUnitValue * 100) / 100,
        gain: Math.round(gain * 100) / 100,
      });
    }
  }

  if (options.length === 0) return null;

  options.sort((a, b) => b.gain - a.gain);
  return options[0];
}
