export type ItemId =
  | 'iron_ore'
  | 'iron'
  | 'nails'
  | 'horseshoe'
  | 'simple_sword'
  | 'reinforced_sword'
  | 'wood'
  | 'coal'
  | 'wooden_shield'
  | 'wooden_crate';

export type ItemCategory = 'resource' | 'material' | 'product';

export interface ItemDefinition {
  id: ItemId;
  name: string;
  description: string;
  category: ItemCategory;
  stackable: boolean;
  maxStack?: number;
}

export type InventoryItems = Partial<Record<ItemId, number>>;