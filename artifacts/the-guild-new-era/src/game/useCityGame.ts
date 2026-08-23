import { useCallback, useEffect, useMemo, useRef, type RefObject } from 'react';
import Phaser from 'phaser';
import { CityScene } from './CityScene';
import type { GameCallbacks } from './types';

export function useCityGame(containerRef: RefObject<HTMLDivElement | null>, callbacks: GameCallbacks) {
  const callbackRef = useRef(callbacks);
  callbackRef.current = callbacks;
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (!containerRef.current || gameRef.current) return undefined;
    const sceneCallbacks: GameCallbacks = {
      onBuildingFocused: (building) => callbackRef.current.onBuildingFocused(building),
      onInteractableChange: (building) => callbackRef.current.onInteractableChange(building),
      onPositionChange: (point) => callbackRef.current.onPositionChange(point),
    };
    gameRef.current = new Phaser.Game({
      type: Phaser.AUTO,
      parent: containerRef.current,
      backgroundColor: '#aaa277',
      scene: new CityScene(sceneCallbacks),
      scale: { mode: Phaser.Scale.RESIZE, autoCenter: Phaser.Scale.CENTER_BOTH, width: '100%', height: '100%' },
      render: { antialias: true, roundPixels: true },
      input: { activePointers: 3 },
      callbacks: { postBoot: (game) => game.canvas?.setAttribute('aria-label', 'Интерактивная карта города') },
    });
    return () => {
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, [containerRef]);

  const interact = useCallback(() => {
      const scene = gameRef.current?.scene.getScene('CityScene') as CityScene | undefined;
      scene?.interactWithFocused();
    }, []);
  const clearFocus = useCallback(() => {
      const scene = gameRef.current?.scene.getScene('CityScene') as CityScene | undefined;
      scene?.clearFocus();
    }, []);
  return useMemo(() => ({ interact, clearFocus }), [clearFocus, interact]);
}