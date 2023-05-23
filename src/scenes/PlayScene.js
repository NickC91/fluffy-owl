import BaseScene from './BaseScene'

const TreeRender = 5

class PlayScene extends BaseScene {
  constructor(config) {
    super('PlayScene', config)

    this.owl = null
    this.trees = null
    this.isPause = false

    this.treeHorizontalDistance = 0
    this.flapVelocity = 300

    this.score = 0
    this.scoreText = ''
    this.difficultyText = ''

    this.currentDifficulty = 'easy'
    this.difficulties = {
      'easy': {
        treeHorizontalDistanceRange: [300, 350],
        treeVerticalDistanceRange: [150, 200],
      },
      'normal': {
        treeHorizontalDistanceRange: [280, 330],
        treeVerticalDistanceRange: [140, 190],
      },
      'hard': {
        treeHorizontalDistanceRange: [250, 310],
        treeVerticalDistanceRange: [50, 100],
      },
    }
  }

  create() {
    this.currentDifficulty = 'easy'
    super.create()
    this.createOwl()
    this.createTree()
    this.createColliders()
    this.createScore()
    this.createPause()
    this.createDifficulty()
    this.handleInput()
    this.listenToEvents()

    this.anims.create({
      key: 'fly',
      frames: this.anims.generateFrameNumbers('owl', { start: 6, end: 8 }),
      frameRate: 4,
      repeat: -1,
    })

    this.owl.play('fly')
  }

  update() {
    this.checkGameStatus()
    this.recycleTrees()
  }

  listenToEvents() {
    if (this.pauseEvent) { return; }
    this.pauseEvent = this.events.on('resume', () => {
      this.initialTime = 3;
      this.countDownText = this.add.text(...this.screenCenter, 'Fly in: ' + this.initialTime, this.fontOptions).setOrigin(0.5);
      this.timedEvent = this.time.addEvent({
        delay: 1000,
        callback: this.countDown,
        callbackScope: this,
        loop: true
      })
    })
  }

  countDown() {
    this.initialTime--;
    this.countDownText.setText('Fly in: ' + this.initialTime);
    if (this.initialTime <= 0) {
      this.isPause = false
      this.countDownText.setText('');
      this.physics.resume();
      this.timedEvent.remove();
    }
  }

  createBg() {
    this.add.image(0, 0, 'sky').setOrigin(0, 0);
  }

  createOwl() {
    this.owl = this.physics.add.sprite(this.config.startPosition.x, this.config.startPosition.y, 'owl').setOrigin(0).setScale(1)
    this.owl.setBodySize(this.owl.width - 60, this.owl.height - 10)
    this.owl.body.gravity.y = 400
    this.owl.setCollideWorldBounds(true)
  }

  createTree() {
    this.trees = this.physics.add.group()
    for (let i = 0; i < TreeRender; i++) {
      const upTree = this.trees.create(0, 0, 'downTree').setOrigin(0, 1).setImmovable(true)
      const downTree = this.trees.create(0, 0, 'upTree').setOrigin(0, 0).setImmovable(true)
      this.placeTree(upTree, downTree)
    }
    this.trees.setVelocityX(-200)
  }

  createColliders() {
    this.physics.add.collider(this.owl, this.trees, this.gameOver, null, this)
  }

  createScore() {
    this.score = 0
    const bestScore = localStorage.getItem('bestScore')
    this.scoreText = this.add.text(16, 16, `Score: ${0}`, { fontSize: '32px', fill: '#000000' })
    this.add.text(16, 48, `Best: ${bestScore || 0}`, { fontSize: '18px', fill: '#000000' })
  }

  createDifficulty() {
    this.difficultyText = this.add.text(16, 64, `Diff: ${this.currentDifficulty}`, { fontSize: '16px', fill: '#000000' })
  }

  createPause() {
    this.isPause = false
    const pauseButton = this.add.image(this.config.width - 10, this.config.height - 10, 'pause').setOrigin(1).setScale(3).setInteractive()
    pauseButton.on('pointerdown', () => {
      this.isPause = true
      this.physics.pause()
      this.scene.pause()
      this.scene.launch('PauseScene')
    })
  }

  handleInput() {
    this.input.on('pointerdown', this.flap, this)
    this.input.keyboard.on('keydown-SPACE', this.flap, this)
  }

  checkGameStatus() {
    if (this.owl.getBounds().bottom >= this.config.height || this.owl.y <= 0) {
      this.gameOver()
    }
  }

  placeTree(uTree, lTree) {
    const difficulty = this.difficulties[this.currentDifficulty]
    const rightMostX = this.getRightMostTree()
    const treeVerticalDistance = Phaser.Math.Between(...difficulty.treeVerticalDistanceRange)
    const treeVerticalPosition = Phaser.Math.Between(0 + 20, this.config.height - 20 - treeVerticalDistance)
    const treeHorizontalDistance = Phaser.Math.Between(...difficulty.treeHorizontalDistanceRange)

    uTree.x = rightMostX + treeHorizontalDistance
    uTree.y = treeVerticalPosition

    lTree.x = uTree.x
    lTree.y = uTree.y + treeVerticalDistance
  }

  recycleTrees() {
    const tempTrees = []
    this.trees.getChildren().forEach((tree) => {
      if (tree.getBounds().right <= 0) {
        tempTrees.push(tree)
        if (tempTrees.length == 2) {
          this.placeTree(...tempTrees)
          this.increaseScore()
          this.saveBestScore()
          this.increaseDifficulty()
        }
      }
    })
  }

  increaseDifficulty() {
    if (this.score === 5) {
      this.currentDifficulty = 'normal';
    }
    if (this.score === 10) {
      this.currentDifficulty = 'hard';
    }
    this.difficultyText.setText(`Diff: ${this.currentDifficulty}`)
  }

  getRightMostTree() {
    let rightMostX = 0
    this.trees.getChildren().forEach(function (tree) {
      rightMostX = Math.max(tree.x, rightMostX)
    })
    return rightMostX
  }

  gameOver() {
    this.physics.pause()
    this.owl.setTint(0xEE4824)
    this.saveBestScore()
    this.time.addEvent({
      delay: 1000,
      callback: () => {
        this.scene.restart()
      },
      loop: false,
    })
  }

  saveBestScore() {
    const bestScoreText = localStorage.getItem('bestScore')
    const bestScore = bestScoreText && parseInt(bestScoreText, 10)
    if (!bestScore || this.score > bestScore) {
      localStorage.setItem('bestScore', this.score)
    }
  }

  flap() {
    if (this.isPause) { return }
    this.owl.body.velocity.y = -this.flapVelocity
  }

  increaseScore() {
    this.score++
    this.scoreText.setText(`Score: ${this.score}`)
  }
}

export default PlayScene