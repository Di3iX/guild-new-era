import type { MapPoint } from '@/types/game';

export const CITY_WIDTH = 24;
export const CITY_HEIGHT = 24;
export const TILE_WIDTH = 72;
export const TILE_HEIGHT = 36;

export const WORLD_WIDTH = 1728;
export const WORLD_HEIGHT = 940;
export const MAP_ORIGIN: MapPoint = { x: 864, y: 68 };

export const DEFAULT_PLAYER_POINT: MapPoint = { x: 11.5, y: 12 };

export const gameConfig = {
  backgroundColor: '#aaa277',
  tile: { width: TILE_WIDTH, height: TILE_HEIGHT },
  world: { width: WORLD_WIDTH, height: WORLD_HEIGHT },
  scale: { minZoom: 0.78, maxZoom: 1.08, referenceWidth: 590 },
};

export function mapToWorld(point: MapPoint) {
  return {
    x: MAP_ORIGIN.x + (point.x - point.y) * (TILE_WIDTH / 2),
    y: MAP_ORIGIN.y + (point.x + point.y) * (TILE_HEIGHT / 2),
  };
}

export function worldToMap(x: number, y: number): MapPoint {
  return {
    x:
      ((x - MAP_ORIGIN.x) / (TILE_WIDTH / 2) +
        (y - MAP_ORIGIN.y) / (TILE_HEIGHT / 2)) /
      2,
    y:
      ((y - MAP_ORIGIN.y) / (TILE_HEIGHT / 2) -
        (x - MAP_ORIGIN.x) / (TILE_WIDTH / 2)) /
      2,
  };
}

export function isWalkable(point: MapPoint) {
  return (
    point.x > 0.4 &&
    point.y > 0.4 &&
    point.x < CITY_WIDTH - 0.4 &&
    point.y < CITY_HEIGHT - 0.4
  );
}