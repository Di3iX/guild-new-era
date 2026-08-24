import Phaser from 'phaser';
import { BUILDINGS } from '@/config/cityData';
import {
  CITY_HEIGHT,
  CITY_WIDTH,
  TILE_HEIGHT,
  TILE_WIDTH,
  gameConfig,
  mapToWorld,
} from '@/config/gameConfig';
import { Building } from '@/objects/Building';
import { Player } from '@/objects/Player';
import { CameraSystem } from '@/systems/CameraSystem';
import { InteractionSystem } from '@/systems/InteractionSystem';
import { MovementSystem } from '@/systems/MovementSystem';
import type { GameCallbacks, MapPoint } from '@/types/game';

export class CityScene extends Phaser.Scene {
  private readonly callbacks: GameCallbacks;
  private player!: Player;
  private movement!: MovementSystem;
  private interaction!: InteractionSystem;
  private mapGraphics!: Phaser.GameObjects.Graphics;

  constructor(callbacks: GameCallbacks) {
    super({ key: 'CityScene' });
    this.callbacks = callbacks;
  }

  create() {
    this.drawWorld();
    const buildings = BUILDINGS.map(
      (building) =>
        new Building(this, building, (data) =>
          this.interaction.handleBuildingSelection(data),
        ),
    );
    this.player = new Player(this, { x: 11.5, y: 12 });
    this.movement = new MovementSystem(
      this,
      this.player,
      { x: 11.5, y: 12 },
      (point) => this.callbacks.onPositionChange(point),
      (building) => this.interaction.handleArrival(building),
    );
    this.interaction = new InteractionSystem(
      this,
      buildings,
      this.movement,
      this.callbacks,
    );
    new CameraSystem(this, this.player.container).setup();
    this.callbacks.onPositionChange(this.movement.currentPoint);
  }

  update(_: number, delta: number) {
    this.movement?.update(delta);
  }

  interactWithFocused() {
    this.interaction?.interactWithFocused();
  }

  clearFocus() {
    this.interaction?.clearFocus();
  }

  private drawWorld() {
    this.mapGraphics = this.add.graphics();
    this.mapGraphics.fillStyle(0xaaa277, 1);
    this.mapGraphics.fillRect(0, 0, gameConfig.world.width, gameConfig.world.height);
    for (let y = 0; y < CITY_HEIGHT; y += 1) {
      for (let x = 0; x < CITY_WIDTH; x += 1) {
        const point = mapToWorld({ x, y });
        const isRoad =
          x === 11 ||
          y === 12 ||
          (x > 8 && x < 15 && y > 9 && y < 16);
        const shade = isRoad
          ? (x + y) % 2
            ? 0xb4a780
            : 0xb9ad86
          : (x + y) % 3
            ? 0xc1b68e
            : 0xbdae88;
        this.mapGraphics.fillStyle(shade, 1);
        this.mapGraphics.lineStyle(1, 0x978b67, 0.34);
        this.mapGraphics.beginPath();
        this.mapGraphics.moveTo(point.x, point.y - TILE_HEIGHT / 2);
        this.mapGraphics.lineTo(point.x + TILE_WIDTH / 2, point.y);
        this.mapGraphics.lineTo(point.x, point.y + TILE_HEIGHT / 2);
        this.mapGraphics.lineTo(point.x - TILE_WIDTH / 2, point.y);
        this.mapGraphics.closePath();
        this.mapGraphics.fillPath();
        this.mapGraphics.strokePath();
      }
    }
    this.drawTownSquare();
    this.drawDecorations();
  }

  private drawTownSquare() {
    const center = mapToWorld({ x: 12, y: 12 });
    this.mapGraphics.fillStyle(0x9a8d68, 0.36);
    this.mapGraphics.fillEllipse(center.x, center.y + 6, 344, 118);
    this.mapGraphics.lineStyle(2, 0x887b59, 0.45);
    this.mapGraphics.strokeEllipse(center.x, center.y + 6, 344, 118);
    this.mapGraphics.fillStyle(0x6c6b51, 1);
    this.mapGraphics.fillEllipse(center.x, center.y - 1, 42, 17);
    this.mapGraphics.fillStyle(0x8b8d68, 1);
    this.mapGraphics.fillRect(center.x - 3, center.y - 30, 6, 29);
    this.mapGraphics.fillTriangle(
      center.x - 14,
      center.y - 28,
      center.x + 14,
      center.y - 28,
      center.x,
      center.y - 48,
    );
  }

  private drawDecorations() {
    const trees: MapPoint[] = [
      { x: 2, y: 9 },
      { x: 3, y: 10 },
      { x: 21, y: 5 },
      { x: 19, y: 20 },
      { x: 7, y: 21 },
      { x: 21, y: 19 },
    ];
    trees.forEach((tree, index) => {
      const point = mapToWorld(tree);
      this.mapGraphics.fillStyle(0x62533e, 0.32);
      this.mapGraphics.fillEllipse(point.x, point.y + 12, 43, 15);
      this.mapGraphics.fillStyle(index % 2 ? 0x4f6750 : 0x59735a, 1);
      this.mapGraphics.fillCircle(point.x, point.y - 12, 17);
      this.mapGraphics.fillStyle(0x7e8d68, 0.72);
      this.mapGraphics.fillCircle(point.x - 8, point.y - 19, 8);
      this.mapGraphics.fillStyle(0x61533d, 1);
      this.mapGraphics.fillRect(point.x - 3, point.y - 3, 6, 20);
    });
    const cart = mapToWorld({ x: 18, y: 15 });
    this.mapGraphics.fillStyle(0x785a42, 1);
    this.mapGraphics.fillRect(cart.x - 22, cart.y - 16, 43, 17);
    this.mapGraphics.fillStyle(0x4e493a, 1);
    this.mapGraphics.fillCircle(cart.x - 13, cart.y + 5, 7);
    this.mapGraphics.fillCircle(cart.x + 13, cart.y + 5, 7);
  }
}