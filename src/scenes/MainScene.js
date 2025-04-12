import Phaser from 'phaser';

class MainScene extends Phaser.Scene {
    constructor() {
        super('MainScene');
    }

    preload() {
        // Load placeholder assets
        this.load.image('player', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAJZJREFUWEftlkEKgDAMBJv//2c9CT1LRCg0TXqQPXrZnc5Cto2Hn+3wfAqgAlKBVwXM7FyWHZD0rXf2CgDL/UErwFMgAGIALKdmZ7drHa0iwHR3prfQBEAzoA6gGVAH0AyoA2gG1AE0A+oAmoGfA9BPSA5Oc6A6gOZAdQDNgeqAMgfcfZJ0xB5wAFEVCIAYQCqQCvyvwAWZzR4hfPIKQwAAAABJRU5ErkJggg==');
        this.load.image('ground', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAAA8CAYAAAD7l5WKAAAAAXNSR0IArs4c6QAAAERJREFUeF7twTEBAAAAwqD1T+1nCqAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgNcA4QAAAQ4w2RkAAAAASUVORK5CYII=');
        this.load.image('obstacle', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAAXNSR0IArs4c6QAAADxJREFUOE9jZKAyYKSyeQyjBg4DMzJCw3AUDAPBjIyMjP+hYfiP0TCEhR4jdCwjI+P/0TCEhR4jdOyoC6kXhgDulRgVXKhMFQAAAABJRU5ErkJggg==');
    }

    create() {
        // Game configuration
        this.gameSpeed = 5;
        this.gameOver = false;
        this.score = 0;
        
        // Setup world
        this.createWorld();
        
        // Setup player
        this.createPlayer();
        
        // Setup obstacles
        this.obstacles = this.physics.add.group();
        this.obstacleTimer = this.time.addEvent({
            delay: 2000,
            callback: this.addObstacle,
            callbackScope: this,
            loop: true
        });
        
        // Setup collisions
        this.physics.add.collider(this.player, this.obstacles, this.hitObstacle, null, this);
        
        // Setup controls
        this.cursors = this.input.keyboard.createCursorKeys();
        
        // Setup score display
        this.scoreText = this.add.text(16, 16, 'Score: 0', { 
            fontSize: '24px', 
            fill: '#fff',
            fontFamily: 'Arial'
        });
        
        // Setup game over text (hidden initially)
        this.gameOverText = this.add.text(400, 300, 'GAME OVER\nClick to Restart', { 
            fontSize: '32px', 
            fill: '#fff',
            fontFamily: 'Arial',
            align: 'center'
        }).setOrigin(0.5);
        this.gameOverText.visible = false;
        
        // Setup restart on click
        this.input.on('pointerdown', () => {
            if (this.gameOver) {
                this.scene.restart();
            }
        });
    }
    
    createWorld() {
        // Create three lanes
        this.laneWidth = 200;
        this.lanePositions = [
            this.cameras.main.width / 2 - this.laneWidth,
            this.cameras.main.width / 2,
            this.cameras.main.width / 2 + this.laneWidth
        ];
        
        // Create ground
        this.ground = this.add.tileSprite(
            this.cameras.main.width / 2,
            this.cameras.main.height - 50,
            this.cameras.main.width,
            100,
            'ground'
        );
        
        // Add some visual lane markers
        for (let i = 0; i < 3; i++) {
            this.add.line(
                0, 0,
                this.lanePositions[i], 100,
                this.lanePositions[i], this.cameras.main.height - 100,
                0x444444, 0.3
            ).setOrigin(0, 0);
        }
    }
    
    createPlayer() {
        // Create player in the middle lane
        this.currentLane = 1; // Middle lane
        this.player = this.physics.add.sprite(
            this.lanePositions[this.currentLane],
            this.cameras.main.height - 150,
            'player'
        );
        this.player.setCollideWorldBounds(true);
        
        // Player is changing lanes
        this.isChangingLanes = false;
    }
    
    addObstacle() {
        if (this.gameOver) return;
        
        // Randomly select a lane
        const lane = Phaser.Math.Between(0, 2);
        
        // Create obstacle at the top of the screen in the selected lane
        const obstacle = this.obstacles.create(
            this.lanePositions[lane],
            0,
            'obstacle'
        );
        
        // Set obstacle properties
        obstacle.setVelocityY(200 + this.gameSpeed * 10);
        obstacle.setImmovable(true);
        
        // Destroy obstacle when it goes off screen
        obstacle.checkWorldBounds = true;
        obstacle.outOfBoundsKill = true;
    }
    
    hitObstacle() {
        this.gameSpeed = 0;
        this.gameOver = true;
        this.obstacleTimer.remove();
        
        // Stop all obstacles
        this.obstacles.children.iterate((obstacle) => {
            obstacle.setVelocityY(0);
        });
        
        // Show game over text
        this.gameOverText.visible = true;
    }
    
    changeLane(direction) {
        if (this.isChangingLanes || this.gameOver) return;
        
        // Calculate new lane
        const newLane = Phaser.Math.Clamp(this.currentLane + direction, 0, 2);
        
        // Only change if it's a different lane
        if (newLane === this.currentLane) return;
        
        // Set changing lanes flag
        this.isChangingLanes = true;
        
        // Animate player to new lane
        this.tweens.add({
            targets: this.player,
            x: this.lanePositions[newLane],
            duration: 200,
            ease: 'Power2',
            onComplete: () => {
                this.currentLane = newLane;
                this.isChangingLanes = false;
            }
        });
    }

    update() {
        if (this.gameOver) return;
        
        // Move ground to create scrolling effect
        this.ground.tilePositionY -= this.gameSpeed;
        
        // Handle input
        if (Phaser.Input.Keyboard.JustDown(this.cursors.left)) {
            this.changeLane(-1);
        } else if (Phaser.Input.Keyboard.JustDown(this.cursors.right)) {
            this.changeLane(1);
        }
        
        // Increase score
        this.score += this.gameSpeed / 10;
        this.scoreText.setText('Score: ' + Math.floor(this.score));
        
        // Gradually increase game speed
        this.gameSpeed += 0.001;
    }
}

export default MainScene;
