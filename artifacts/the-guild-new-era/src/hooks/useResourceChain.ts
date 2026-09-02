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
  /** доп. ингредиент рецепта (например, уголь для переплавки), если есть */
  extraItemId?: string;
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

      steps.unshift({
        node: current,
        actionName: action?.name,
        extraItemId: action && 'extra' in action ? action.extra?.itemId : undefined,
      });

      if (!action) break;
      current = RESOURCE_CHAINS[action.input.itemId];
    }

    return steps;
  }, [itemId]);
}
