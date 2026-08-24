import Phaser from 'phaser';
import { gameConfig } from '@/config/gameConfig';

export class CameraSystem {
  constructor(
    private readonly scene: Phaser.Scene,
    private readonly target: Phaser.GameObjects.GameObject,
  ) {}

  setup() {
    const camera = this.scene.cameras.main;
    camera.setBounds(0, 0, gameConfig.world.width, gameConfig.world.height);
    camera.setZoom(this.zoomForWidth());
    camera.startFollow(this.target, true, 0.08, 0.08);
    this.scene.scale.on(Phaser.Scale.Events.RESIZE, () => {
      camera.setZoom(this.zoomForWidth());
    });
  }

  private zoomForWidth() {
    return Math.min(
      gameConfig.scale.maxZoom,
      Math.max(
        gameConfig.scale.minZoom,
        this.scene.scale.width / gameConfig.scale.referenceWidth,
      ),
    );
  }
}