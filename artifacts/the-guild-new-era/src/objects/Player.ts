import Phaser from 'phaser';
import type { MapPoint } from '@/types/game';
import { mapToWorld } from '@/config/gameConfig';

export class Player {
  readonly shadow: Phaser.GameObjects.Ellipse;
  readonly container: Phaser.GameObjects.Container;
  private walkClock = 0;

  constructor(scene: Phaser.Scene, point: MapPoint) {
    const position = mapToWorld(point);
    this.shadow = scene.add.ellipse(
      position.x,
      position.y + 13,
      28,
      11,
      0x433725,
      0.36,
    );
    this.container = scene.add.container(position.x, position.y - 10);

    const cloak = scene.add.graphics();
    cloak.fillStyle(0x8d4435, 1);
    cloak.fillTriangle(-13, 17, 13, 17, 0, -8);
    cloak.fillStyle(0x57392e, 1);
    cloak.fillCircle(0, -15, 9);
    cloak.fillStyle(0xc9a36a, 1);
    cloak.fillRect(-8, -22, 16, 5);
    cloak.lineStyle(2, 0x3d2d24, 0.72);
    cloak.strokeCircle(0, -15, 9);

    const marker = scene.add
      .ellipse(0, 27, 42, 12, 0xd5bd69, 0.12)
      .setStrokeStyle(2, 0xd8c36f, 0.72);
    this.container.add([marker, cloak]);
    this.paint(point);
  }

  paint(point: MapPoint, isMoving = false, delta = 0) {
    const position = mapToWorld(point);
    if (isMoving) this.walkClock += delta * 0.014;
    else this.walkClock = 0;

    const bob = isMoving ? Math.sin(this.walkClock) * 2.2 : 0;
    const sway = isMoving
      ? 1 + Math.sin(this.walkClock * 1.7) * 0.025
      : 1;
    this.container
      .setPosition(position.x, position.y - 10 - bob)
      .setDepth(position.y + 30)
      .setScale(sway, 1);
    this.shadow
      .setPosition(position.x, position.y + 13)
      .setDepth(position.y + 10);
  }
}