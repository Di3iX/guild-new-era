import Phaser from 'phaser';
import type { BuildingData, GameCallbacks } from '@/types/game';
import { isWalkable, worldToMap } from '@/config/gameConfig';
import { Building } from '@/objects/Building';
import { MovementSystem } from './MovementSystem';
import { mapToWorld } from '@/config/gameConfig';

export class InteractionSystem {
  private focusedBuilding: BuildingData | null = null;
  private pointerMarker?: Phaser.GameObjects.Ellipse;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly buildings: Building[],
    private readonly movement: MovementSystem,
    private readonly callbacks: GameCallbacks,
  ) {
    scene.input.on('pointerdown', this.handlePointerDown, this);
  }

  handleArrival(building: BuildingData | null) {
    if (!building) return;
    this.callbacks.onBuildingFocused(building);
    this.callbacks.onInteractableChange(building);
  }

  interactWithFocused() {
    if (this.focusedBuilding) {
      this.callbacks.onBuildingFocused(this.focusedBuilding);
    }
  }

  clearFocus() {
    this.focusedBuilding = null;
    this.movement.cancel();
    this.pointerMarker?.destroy();
    this.pointerMarker = undefined;
    this.callbacks.onBuildingFocused(null);
    this.callbacks.onInteractableChange(null);
  }

  handleBuildingSelection(building: BuildingData) {
    this.focusBuilding(building);
  }

  private handlePointerDown(pointer: Phaser.Input.Pointer) {
    if (!pointer.isDown) return;
    const building = this.buildings.find((candidate) =>
      candidate.containsWorldPoint(pointer.worldX, pointer.worldY),
    );
    if (building) {
      this.focusBuilding(building.data);
      return;
    }

    const point = worldToMap(pointer.worldX, pointer.worldY);
    if (!isWalkable(point)) return;
    this.focusedBuilding = null;
    this.callbacks.onBuildingFocused(null);
    this.callbacks.onInteractableChange(null);
    this.movement.moveTo(point);
    this.markTarget(point);
  }

  private focusBuilding(building: BuildingData) {
    this.focusedBuilding = building;
    this.callbacks.onBuildingFocused(null);
    this.callbacks.onInteractableChange(null);
    this.movement.moveTo(building.approach, building);
    this.markTarget(building.approach);
  }

  private markTarget(point: { x: number; y: number }) {
    this.pointerMarker?.destroy();
    const worldPoint = mapToWorld(point);
    this.pointerMarker = this.scene.add
      .ellipse(worldPoint.x, worldPoint.y + 9, 30, 12, 0xe4c878, 0.22)
      .setStrokeStyle(2, 0xe4c878, 0.7)
      .setDepth(worldPoint.y - 2);
  }
}