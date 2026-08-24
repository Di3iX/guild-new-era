import Phaser from 'phaser';
import type { BuildingData, MapPoint } from '@/types/game';
import { CITY_HEIGHT, CITY_WIDTH } from '@/config/gameConfig';
import { Player } from '@/objects/Player';

export class MovementSystem {
  private target: MapPoint | null = null;
  private destinationBuilding: BuildingData | null = null;
  private readonly keys: Record<string, Phaser.Input.Keyboard.Key>;
  private point: MapPoint;

  constructor(
    scene: Phaser.Scene,
    private readonly player: Player,
    initialPoint: MapPoint,
    private readonly onPositionChange: (point: MapPoint) => void,
    private readonly onArrive: (building: BuildingData | null) => void,
  ) {
    this.point = { ...initialPoint };
    this.keys = scene.input.keyboard
      ? (scene.input.keyboard.addKeys(
          'W,A,S,D,UP,LEFT,DOWN,RIGHT',
        ) as Record<string, Phaser.Input.Keyboard.Key>)
      : {};
  }

  get currentPoint() {
    return { ...this.point };
  }

  moveTo(point: MapPoint, building: BuildingData | null = null) {
    this.target = { ...point };
    this.destinationBuilding = building;
  }

  cancel() {
    this.target = null;
    this.destinationBuilding = null;
  }

  update(delta: number) {
    const direction = this.keyboardDirection();
    if (direction.x || direction.y) {
      this.cancel();
      this.point.x = Phaser.Math.Clamp(
        this.point.x + direction.x * delta * 0.004,
        1,
        CITY_WIDTH - 1,
      );
      this.point.y = Phaser.Math.Clamp(
        this.point.y + direction.y * delta * 0.004,
        1,
        CITY_HEIGHT - 1,
      );
      this.player.paint(this.point, true, delta);
      this.onPositionChange(this.currentPoint);
      return;
    }

    if (!this.target) return;
    const dx = this.target.x - this.point.x;
    const dy = this.target.y - this.point.y;
    const distance = Math.hypot(dx, dy);
    const step = delta * 0.0045;
    if (distance <= step) {
      this.point = { ...this.target };
      const arrivedBuilding = this.destinationBuilding;
      this.cancel();
      this.player.paint(this.point);
      this.onPositionChange(this.currentPoint);
      this.onArrive(arrivedBuilding);
      return;
    }

    this.point.x += (dx / distance) * step;
    this.point.y += (dy / distance) * step;
    this.player.paint(this.point, true, delta);
    this.onPositionChange(this.currentPoint);
  }

  private keyboardDirection() {
    const x =
      Number(this.keys.RIGHT?.isDown || this.keys.D?.isDown) -
      Number(this.keys.LEFT?.isDown || this.keys.A?.isDown);
    const y =
      Number(this.keys.DOWN?.isDown || this.keys.S?.isDown) -
      Number(this.keys.UP?.isDown || this.keys.W?.isDown);
    return { x, y };
  }
}