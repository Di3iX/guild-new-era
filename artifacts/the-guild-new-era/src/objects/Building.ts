import Phaser from 'phaser';
import type { BuildingData } from '@/types/game';
import { mapToWorld } from '@/config/gameConfig';

export class Building {
  readonly data: BuildingData;
  readonly group: Phaser.GameObjects.Container;
  private readonly hitZone: Phaser.GameObjects.Zone;

  constructor(
    private readonly scene: Phaser.Scene,
    data: BuildingData,
    onSelect: (building: BuildingData) => void,
  ) {
    this.data = data;
    this.group = scene.add.container(0, 0);
    const point = mapToWorld(data.map);
    const colors = this.colorsFor(data.type);

    const shadow = scene.add.ellipse(
      point.x,
      point.y + 29,
      data.clickZone.width * 0.96,
      24,
      0x564630,
      0.27,
    );
    const body = scene.add.graphics();
    body.fillStyle(colors.wall, 1);
    body.fillRect(point.x - 35, point.y - 45, 70, 52);
    body.fillStyle(colors.trim, 1);
    body.fillRect(point.x - 38, point.y - 48, 76, 9);
    body.fillStyle(colors.roof, 1);
    body.fillTriangle(
      point.x - 49,
      point.y - 47,
      point.x + 49,
      point.y - 47,
      point.x,
      point.y - 88,
    );
    body.lineStyle(2, 0x483927, 0.65);
    body.strokeTriangle(
      point.x - 49,
      point.y - 47,
      point.x + 49,
      point.y - 47,
      point.x,
      point.y - 88,
    );
    body.fillStyle(colors.detail, 1);
    body.fillRect(point.x - 8, point.y - 22, 16, 29);
    body.fillStyle(0xd2bd7a, 1);
    body.fillRect(point.x - 24, point.y - 27, 12, 12);
    body.fillRect(point.x + 12, point.y - 27, 12, 12);

    const label = scene.add
      .text(point.x, point.y - 104, data.name, {
        color: '#3f3425',
        fontFamily: 'Avenir Next, Trebuchet MS, sans-serif',
        fontSize: '12px',
        fontStyle: 'bold',
        stroke: '#d5c898',
        strokeThickness: 4,
      })
      .setOrigin(0.5);
    this.hitZone = scene.add
      .zone(point.x, point.y - 35, data.clickZone.width, data.clickZone.height)
      .setInteractive({ useHandCursor: true });
    this.hitZone.on('pointerover', () => label.setScale(1.04));
    this.hitZone.on('pointerout', () => label.setScale(1));
    this.hitZone.on('pointerdown', () => onSelect(data));
    this.group.add([shadow, body, label, this.hitZone]);
    this.group.setDepth(point.y);
  }

  containsWorldPoint(x: number, y: number) {
    const point = mapToWorld(this.data.map);
    return (
      Math.abs(x - point.x) < this.data.clickZone.width / 2 &&
      Math.abs(y - (point.y - 36)) < this.data.clickZone.height / 2
    );
  }

  private colorsFor(type: BuildingData['type']) {
    if (type === 'forge')
      return { wall: 0x72564a, trim: 0x5b4238, roof: 0x433a3b, detail: 0x2e282a };
    if (type === 'mine')
      return { wall: 0x665c52, trim: 0x504940, roof: 0x3f4440, detail: 0x312f2a };
    if (type === 'market')
      return { wall: 0xb48452, trim: 0x7b5a3c, roof: 0x4b675b, detail: 0x754333 };
    if (type === 'forest')
      return { wall: 0x5a7a4a, trim: 0x3f5c35, roof: 0x2f4a28, detail: 0x3a5230 };
    if (type === 'carpentry')
      return { wall: 0x8b6a45, trim: 0x6a4f35, roof: 0x4a3a2a, detail: 0x3d2e22 };
    return { wall: 0x9b6e52, trim: 0x765039, roof: 0x574a48, detail: 0x52362d };
  }
}