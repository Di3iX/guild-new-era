/** Unique item identifiers */
export type ItemId =
  | 'iron_ore'
  | 'iron'
  | 'nails'
  | 'horseshoe'
  | 'simple_sword';

/** Item category for filtering and UI */
export type ItemCategory = 'resource' | 'material' | 'product';

/** Static definition of an item */
export interface ItemDefinition {
  id: ItemId;
  name: string;
  description: string;
  category: ItemCategory;
  stackable: boolean;
  maxStack?: number;
}

/** Runtime inventory: item id → quantity */
export type InventoryItems = Partial<Record<ItemId, number>>;
