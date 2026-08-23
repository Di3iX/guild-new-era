import { useEffect, useRef } from 'react';
import { useCityGame } from '@/game/useCityGame';
import type { BuildingData, GameCallbacks, MapPoint } from '@/game/types';

interface CityGameProps extends GameCallbacks {
  onGameReady?: (actions: { interact: () => void; clearFocus: () => void }) => void;
}

export function CityGame({ onBuildingFocused, onInteractableChange, onPositionChange, onGameReady }: CityGameProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const actions = useCityGame(containerRef, { onBuildingFocused, onInteractableChange, onPositionChange });

  const readyRef = useRef(onGameReady);
  readyRef.current = onGameReady;
  useEffect(() => {
    readyRef.current?.(actions);
  }, [actions]);

  return (
    <div
      ref={containerRef}
      data-testid="game-city-canvas"
      className="guild-map-frame absolute inset-0 touch-none"
      aria-label="Карта города"
    />
  );
}

export type { BuildingData, MapPoint };