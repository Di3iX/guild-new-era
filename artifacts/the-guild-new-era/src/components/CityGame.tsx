import { useEffect, useRef } from 'react';
import { useCityGame } from '@/hooks/useCityGame';
import type { GameActions } from '@/types/game';
import type { GameEventHandlers } from '@/events/gameEvents';

interface CityGameProps extends GameEventHandlers {
  onGameReady?: (actions: GameActions) => void;
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
