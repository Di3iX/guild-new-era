import Phaser from 'phaser';
import {
  BUILDINGS,
  CITY_HEIGHT,
  CITY_WIDTH,
  TILE_HEIGHT,
  TILE_WIDTH,
} from './city-data';
import type { BuildingData, GameCallbacks, MapPoint } from './types';

const ORIGIN_X = 864;
const ORIGIN_Y = 68;
const WORLD_WIDTH = 1728;
const WORLD_HEIGHT = 940;

export class CityScene extends Phaser.Scene {
  private readonly callbacks: GameCallbacks;
  private player!: Phaser.GameObjects.Container;
  private playerPoint: MapPoint = { x: 11.5, y: 12 };
  private targetPoint: MapPoint | null = null;
  private focusedBuilding: BuildingData | null = null;
  private keys!: Record<string, Phaser.Input.Keyboard.Key>;
  private mapGraphics!: Phaser.GameObjects.Graphics;
  private buildingLayer!: Phaser.GameObjects.Container;
  private playerShadow!: Phaser.GameObjects.Ellipse;
  private pointerMarker?: Phaser.GameObjects.Ellipse;
  private walkClock = 0;

  constructor(callbacks: GameCallbacks) {
    super({ key: 'CityScene' });
    this.callbacks = callbacks;
  }

  create() {
    this.cameras.main.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    this.cameras.main.setZoom(this.getZoom());
    this.drawWorld();
    this.createBuildings();
    this.createPlayer();
    this.setupKeyboard();

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (!pointer.isDown) return;
      const point = this.worldToMap(pointer.worldX, pointer.worldY);
      const clicked = this.buildingAt(pointer.worldX, pointer.worldY);
      if (clicked) {
        this.focusBuilding(clicked);
      } else if (this.isWalkable(point)) {
        this.focusedBuilding = null;
        this.callbacks.onBuildingFocused(null);
        this.callbacks.onInteractableChange(null);
        this.moveTo(point);
      }
    });

    this.scale.on(Phaser.Scale.Events.RESIZE, () => {
      this.cameras.main.setZoom(this.getZoom());
    });
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
    this.emitPosition();
  }

  update(_: number, delta: number) {
    const direction = this.keyboardDirection();
    if (direction.x || direction.y) {
      this.targetPoint = null;
      this.focusedBuilding = null;
      this.callbacks.onBuildingFocused(null);
      this.callbacks.onInteractableChange(null);
      this.playerPoint.x = Phaser.Math.Clamp(this.playerPoint.x + direction.x * delta * 0.004, 1, CITY_WIDTH - 1);
      this.playerPoint.y = Phaser.Math.Clamp(this.playerPoint.y + direction.y * delta * 0.004, 1, CITY_HEIGHT - 1);
      this.paintPlayer(true, delta);
      this.emitPosition();
      return;
    }
    if (!this.targetPoint) return;
    const dx = this.targetPoint.x - this.playerPoint.x;
    const dy = this.targetPoint.y - this.playerPoint.y;
    const distance = Math.hypot(dx, dy);
    const step = delta * 0.0045;
    if (distance <= step) {
      this.playerPoint = { ...this.targetPoint };
      this.targetPoint = null;
      this.paintPlayer(false, delta);
      this.emitPosition();
      if (this.focusedBuilding && distance < 0.4) {
        this.callbacks.onBuildingFocused(this.focusedBuilding);
        this.callbacks.onInteractableChange(this.focusedBuilding);
      }
      return;
    }
    this.playerPoint.x += (dx / distance) * step;
    this.playerPoint.y += (dy / distance) * step;
    this.paintPlayer(true, delta);
    this.emitPosition();
  }

  interactWithFocused() {
    if (this.focusedBuilding) this.callbacks.onBuildingFocused(this.focusedBuilding);
  }

  clearFocus() {
    this.focusedBuilding = null;
    this.targetPoint = null;
    this.callbacks.onBuildingFocused(null);
    this.callbacks.onInteractableChange(null);
  }

  private drawWorld() {
    this.mapGraphics = this.add.graphics();
    this.mapGraphics.fillStyle(0xaaa277, 1);
    this.mapGraphics.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

    for (let y = 0; y < CITY_HEIGHT; y += 1) {
      for (let x = 0; x < CITY_WIDTH; x += 1) {
        const p = this.mapToWorld({ x, y });
        const isRoad = x === 11 || y === 12 || (x > 8 && x < 15 && y > 9 && y < 16);
        const shade = isRoad ? (x + y) % 2 ? 0xb4a780 : 0xb9ad86 : (x + y) % 3 ? 0xc1b68e : 0xbdae88;
        this.mapGraphics.fillStyle(shade, 1);
        this.mapGraphics.lineStyle(1, 0x978b67, 0.34);
        this.mapGraphics.beginPath();
        this.mapGraphics.moveTo(p.x, p.y - TILE_HEIGHT / 2);
        this.mapGraphics.lineTo(p.x + TILE_WIDTH / 2, p.y);
        this.mapGraphics.lineTo(p.x, p.y + TILE_HEIGHT / 2);
        this.mapGraphics.lineTo(p.x - TILE_WIDTH / 2, p.y);
        this.mapGraphics.closePath();
        this.mapGraphics.fillPath();
        this.mapGraphics.strokePath();
      }
    }
    this.drawTownSquare();
    this.drawDecorations();
  }

  private drawTownSquare() {
    const center = this.mapToWorld({ x: 12, y: 12 });
    this.mapGraphics.fillStyle(0x9a8d68, 0.36);
    this.mapGraphics.fillEllipse(center.x, center.y + 6, 344, 118);
    this.mapGraphics.lineStyle(2, 0x887b59, 0.45);
    this.mapGraphics.strokeEllipse(center.x, center.y + 6, 344, 118);
    this.mapGraphics.fillStyle(0x6c6b51, 1);
    this.mapGraphics.fillEllipse(center.x, center.y - 1, 42, 17);
    this.mapGraphics.fillStyle(0x8b8d68, 1);
    this.mapGraphics.fillRect(center.x - 3, center.y - 30, 6, 29);
    this.mapGraphics.fillTriangle(center.x - 14, center.y - 28, center.x + 14, center.y - 28, center.x, center.y - 48);
  }

  private drawDecorations() {
    const trees = [{ x: 2, y: 9 }, { x: 3, y: 10 }, { x: 21, y: 5 }, { x: 19, y: 20 }, { x: 7, y: 21 }, { x: 21, y: 19 }];
    trees.forEach((tree, index) => {
      const p = this.mapToWorld(tree);
      this.mapGraphics.fillStyle(0x62533e, 0.32);
      this.mapGraphics.fillEllipse(p.x, p.y + 12, 43, 15);
      this.mapGraphics.fillStyle(index % 2 ? 0x4f6750 : 0x59735a, 1);
      this.mapGraphics.fillCircle(p.x, p.y - 12, 17);
      this.mapGraphics.fillStyle(0x7e8d68, 0.72);
      this.mapGraphics.fillCircle(p.x - 8, p.y - 19, 8);
      this.mapGraphics.fillStyle(0x61533d, 1);
      this.mapGraphics.fillRect(p.x - 3, p.y - 3, 6, 20);
    });
    const cart = this.mapToWorld({ x: 18, y: 15 });
    this.mapGraphics.fillStyle(0x785a42, 1);
    this.mapGraphics.fillRect(cart.x - 22, cart.y - 16, 43, 17);
    this.mapGraphics.fillStyle(0x4e493a, 1);
    this.mapGraphics.fillCircle(cart.x - 13, cart.y + 5, 7);
    this.mapGraphics.fillCircle(cart.x + 13, cart.y + 5, 7);
  }

  private createBuildings() {
    this.buildingLayer = this.add.container(0, 0);
    BUILDINGS.forEach((building) => {
      const group = this.add.container(0, 0);
      const p = this.mapToWorld(building.map);
      const colors = this.buildingColors(building.type);
      const shadow = this.add.ellipse(p.x, p.y + 29, building.clickZone.width * 0.96, 24, 0x564630, 0.27);
      const body = this.add.graphics();
      body.fillStyle(colors.wall, 1);
      body.fillRect(p.x - 35, p.y - 45, 70, 52);
      body.fillStyle(colors.trim, 1);
      body.fillRect(p.x - 38, p.y - 48, 76, 9);
      body.fillStyle(colors.roof, 1);
      body.fillTriangle(p.x - 49, p.y - 47, p.x + 49, p.y - 47, p.x, p.y - 88);
      body.lineStyle(2, 0x483927, 0.65);
      body.strokeTriangle(p.x - 49, p.y - 47, p.x + 49, p.y - 47, p.x, p.y - 88);
      body.fillStyle(colors.detail, 1);
      body.fillRect(p.x - 8, p.y - 22, 16, 29);
      body.fillStyle(0xd2bd7a, 1);
      body.fillRect(p.x - 24, p.y - 27, 12, 12);
      body.fillRect(p.x + 12, p.y - 27, 12, 12);
      const label = this.add.text(p.x, p.y - 104, building.name, {
        color: '#3f3425',
        fontFamily: 'Avenir Next, Trebuchet MS, sans-serif',
        fontSize: '12px',
        fontStyle: 'bold',
        stroke: '#d5c898',
        strokeThickness: 4,
      }).setOrigin(0.5);
      const hit = this.add.zone(p.x, p.y - 35, building.clickZone.width, building.clickZone.height)
        .setInteractive({ useHandCursor: true });
      hit.on('pointerover', () => label.setScale(1.04));
      hit.on('pointerout', () => label.setScale(1));
      hit.on('pointerdown', () => this.focusBuilding(building));
      group.add([shadow, body, label, hit]);
      group.setDepth(p.y);
      this.buildingLayer.add(group);
    });
  }

  private createPlayer() {
    const p = this.mapToWorld(this.playerPoint);
    this.playerShadow = this.add.ellipse(p.x, p.y + 13, 28, 11, 0x433725, 0.36);
    this.player = this.add.container(p.x, p.y - 10);
    const cloak = this.add.graphics();
    cloak.fillStyle(0x8d4435, 1);
    cloak.fillTriangle(-13, 17, 13, 17, 0, -8);
    cloak.fillStyle(0x57392e, 1);
    cloak.fillCircle(0, -15, 9);
    cloak.fillStyle(0xc9a36a, 1);
    cloak.fillRect(-8, -22, 16, 5);
    cloak.lineStyle(2, 0x3d2d24, 0.72);
    cloak.strokeCircle(0, -15, 9);
    const marker = this.add.ellipse(0, 27, 42, 12, 0xd5bd69, 0.12).setStrokeStyle(2, 0xd8c36f, 0.72);
    this.player.add([marker, cloak]);
    this.player.setDepth(p.y + 30);
    this.playerShadow.setDepth(p.y + 10);
  }

  private setupKeyboard() {
    const keyboard = this.input.keyboard;
    if (!keyboard) return;
    this.keys = keyboard.addKeys('W,A,S,D,UP,LEFT,DOWN,RIGHT') as Record<string, Phaser.Input.Keyboard.Key>;
  }

  private keyboardDirection() {
    if (!this.keys) return { x: 0, y: 0 };
    const x = Number(this.keys.RIGHT?.isDown || this.keys.D?.isDown) - Number(this.keys.LEFT?.isDown || this.keys.A?.isDown);
    const y = Number(this.keys.DOWN?.isDown || this.keys.S?.isDown) - Number(this.keys.UP?.isDown || this.keys.W?.isDown);
    return { x, y };
  }

  private focusBuilding(building: BuildingData) {
    this.focusedBuilding = building;
    // Keep the building as a pending destination. React must not reveal
    // the building panel until the player has actually reached the entrance.
    this.callbacks.onBuildingFocused(null);
    this.callbacks.onInteractableChange(null);
    this.moveTo(building.approach);
  }

  private moveTo(point: MapPoint) {
    this.targetPoint = { ...point };
    if (this.pointerMarker) this.pointerMarker.destroy();
    const p = this.mapToWorld(point);
    this.pointerMarker = this.add.ellipse(p.x, p.y + 9, 30, 12, 0xe4c878, 0.22).setStrokeStyle(2, 0xe4c878, 0.7);
    this.pointerMarker.setDepth(p.y - 2);
  }

  private paintPlayer(isMoving = false, delta = 0) {
    const p = this.mapToWorld(this.playerPoint);
    if (isMoving) {
      this.walkClock += delta * 0.014;
    } else {
      this.walkClock = 0;
    }
    const bob = isMoving ? Math.sin(this.walkClock) * 2.2 : 0;
    const sway = isMoving ? 1 + Math.sin(this.walkClock * 1.7) * 0.025 : 1;
    this.player.setPosition(p.x, p.y - 10 - bob).setDepth(p.y + 30).setScale(sway, 1);
    this.playerShadow.setPosition(p.x, p.y + 13).setDepth(p.y + 10);
  }

  private emitPosition() {
    this.callbacks.onPositionChange({ ...this.playerPoint });
  }

  private mapToWorld(point: MapPoint) {
    return {
      x: ORIGIN_X + (point.x - point.y) * (TILE_WIDTH / 2),
      y: ORIGIN_Y + (point.x + point.y) * (TILE_HEIGHT / 2),
    };
  }

  private worldToMap(x: number, y: number): MapPoint {
    return {
      x: ((x - ORIGIN_X) / (TILE_WIDTH / 2) + (y - ORIGIN_Y) / (TILE_HEIGHT / 2)) / 2,
      y: ((y - ORIGIN_Y) / (TILE_HEIGHT / 2) - (x - ORIGIN_X) / (TILE_WIDTH / 2)) / 2,
    };
  }

  private buildingAt(x: number, y: number) {
    return BUILDINGS.find((building) => {
      const p = this.mapToWorld(building.map);
      return Math.abs(x - p.x) < building.clickZone.width / 2 && Math.abs(y - (p.y - 36)) < building.clickZone.height / 2;
    }) ?? null;
  }

  private isWalkable(point: MapPoint) {
    return point.x > 0.4 && point.y > 0.4 && point.x < CITY_WIDTH - 0.4 && point.y < CITY_HEIGHT - 0.4;
  }

  private getZoom() {
    return Math.min(1.08, Math.max(0.78, this.scale.width / 590));
  }

  private buildingColors(type: BuildingData['type']) {
    if (type === 'forge') return { wall: 0x72564a, trim: 0x5b4238, roof: 0x433a3b, detail: 0x2e282a };
    if (type === 'mine') return { wall: 0x665c52, trim: 0x504940, roof: 0x3f4440, detail: 0x312f2a };
    if (type === 'market') return { wall: 0xb48452, trim: 0x7b5a3c, roof: 0x4b675b, detail: 0x754333 };
    return { wall: 0x9b6e52, trim: 0x765039, roof: 0x574a48, detail: 0x52362d };
  }
}