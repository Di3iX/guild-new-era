export type BuildingType = 'house' | 'forge' | 'mine' | 'market';

export interface MapPoint {
  x: number;
  y: number;
}

export interface PlayerState {
  name: string;
  location: string;
  gold: number;
  health: number;
}

export interface BuildingData {
  id: string;
  type: BuildingType;
  name: string;
  map: MapPoint;
  approach: MapPoint;
  clickZone: { width: number; height: number };
  description: string;
  detail: string;
}

export interface GameCallbacks {
  onBuildingFocused: (building: BuildingData | null) => void;
  onInteractableChange: (building: BuildingData | null) => void;
  onPositionChange: (point: MapPoint) => void;
}

export interface GameActions {
  interact: () => void;
  clearFocus: () => void;
}