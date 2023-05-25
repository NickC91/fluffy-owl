import Phaser from 'phaser'

import PreloadScene from './scenes/PreloadScene'
import MenuScene from './scenes/MenuScene'
import PlayScene from './scenes/PlayScene'
import ScoreScene from './scenes/ScoreScene'
import PauseScene from './scenes/PauseScene'

const Width = 400
const Height = 600

const Owl_Position = {
  x: Width * 0.1,
  y: Height / 2,
}

const Shared_Config = {
  width: Width,
  height: Height,
  startPosition: Owl_Position
}

const Scenes = [PreloadScene, MenuScene, ScoreScene, PlayScene, PauseScene]
const createScene = Scene => new Scene(Shared_Config)
const initialScenes = () => Scenes.map(createScene)

const config = {
  type: Phaser.AUTO,
  ...Shared_Config,
  pixelArt: true,
  physics: {
    default: 'arcade',
    arcade: {
      //debug: true,
    },
  },
  scene: initialScenes()
}

new Phaser.Game(config)