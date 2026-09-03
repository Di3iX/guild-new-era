import { useMemo } from 'react';
import {
  RESOURCE_CHAINS,
  actionsById,
  type ChainNode,
} from '@/data/productionChains';

export interface ChainStep {
  node: ChainNode;
  /** название рецепта, которым получен этот шаг (undefined для сырья) */
  actionName?: string;
  /** сколько единиц предыдущего шага уходит на этот (undefined для сырья) */
  inputAmount?: number;
  /** сколько единиц этого шага получается за один крафт */
  outputAmount?: number;
  /** плата в золоте за один крафт (action.cost), undefined для сырья */
  craftFee?: number;
  /** доп. ингредиент рецепта (например, уголь для переплавки), если есть */
  extra?: {
    itemId: string;
    name: string;
    amount: number;
  };
}

/**
 * Строит полный маршрут предмета от сырья до готового товара.
 * Пример для 'nails': [iron_ore, iron, nails]
 */
export function useResourceChain(itemId: string): ChainStep[] | null {
  return useMemo(() => {
    const startNode = RESOURCE_CHAINS[itemId];
    if (!startNode) return null;

    const steps: ChainStep[] = [];
    let current: ChainNode | undefined = startNode;

    // идём от готового товара к сырью, затем разворачиваем
    while (current) {
      const action = current.sourceAction
        ? actionsById[current.sourceAction as keyof typeof actionsById]
        : undefined;

      const extra = action && 'extra' in action && action.extra
        ? {
            itemId: action.extra.itemId,
            name: RESOURCE_CHAINS[action.extra.itemId]?.name ?? action.extra.itemId,
            amount: action.extra.amount,
          }
        : undefined;

      steps.unshift({
        node: current,
        actionName: action?.name,
        inputAmount: action?.input.amount,
        outputAmount: action?.output.amount,
        craftFee: action?.cost,
        extra,
      });

      if (!action) break;
      current = RESOURCE_CHAINS[action.input.itemId];
    }

    return steps;
  }, [itemId]);
}

