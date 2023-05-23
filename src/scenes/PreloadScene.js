import Phaser from "phaser";

class PreloadScene extends Phaser.Scene {
  constructor() {
    super("PreloadScene");
  }

  preload() {
    this.load.image('sky', 'assets/sky-bg.jpg');
    this.load.spritesheet('owl', 'assets/owl.png', {
      frameWidth: 92, frameHeight: 32
    })
    this.load.image('upTree', 'assets/tree-res.png')
    this.load.image('downTree', 'assets/branch-res.png')
    this.load.image('pause', 'assets/pause.png')
    this.load.image('back', 'assets/back.png')
  }

  create() {
    this.scene.start('MenuScene')
  }
}

export default PreloadScene