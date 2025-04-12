import Phaser from 'phaser';

class MainScene extends Phaser.Scene {
    constructor() {
        super('MainScene');
    }

    preload() {
        // Load placeholder assets
        this.load.image('obstacle', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAAXNSR0IArs4c6QAAADxJREFUOE9jZKAyYKSyeQyjBg4DMzJCw3AUDAPBjIyMjP+hYfiP0TCEhR4jdCwjI+P/0TCEhR4jdOyoC6kXhgDulRgVXKhMFQAAAABJRU5ErkJggg==');
        this.load.image('tile', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAAXNSR0IArs4c6QAAAfFJREFUeF7tmk1OwzAQhd9sWHAJLsEluAQrVhyBS3AJLsElWLHiCFyCSwQkJFJXTZ3Y8/P8k9hqVTWO5/vmjT12Oi3Lsiz4538dAHQEGAOoFqAa4BpAtYBqgGsA1QKqAa4BVAuoBrgGUC2gGuAaQLWAaoBrgDYt8PV+i/X9FtPpDMvnl+SfJwGwf3vB7vWpAnCxvMZ8cZV8QFUAIQgEwQUiCYDQyQqCJICYM5IAQhAoIkgAiDkjGYAQhNXdBrP5ZRSEw/4Du9dNNRBJAKiTKSLQJEgAiDkjCwCKCBQJFBFZAFBEoEjICiAVBCoAqQBkA0ARgSIhOwCKCNkBpIJQBEAKCMUAxIJQFEAMCMUB+EAoBsB1Mj1Hg/Xt/QbH4wGrh6fqfxYAIQj0XC4IxQGETqbn6Dn6G0UEiogQhKIAQifTc/RcKAhFAMScnBuEbABiTs4JQhYAsU6mEWHdoIhYP25bQUgGINbJISPTiDQiNIKQBEDKyaEgJAOQcnJuEJIAyHVyThCiAUg5mYzMRqbn2MhkZDIyG5lGJiOTkdnINDIZmYxMRiYjk5HJyGRkMjIZmYxMRiYjk5HJyGRkMjIZmYxMRiYjk5HJyGRkMjIZmYxMRiYjk5HJyGRkMjIZmYxMRiYjk5HJyGRkMjIZmYxMRiYjk5H/AEamA5VDDMF2AAAAAElFTkSuQmCC');
    }

    create() {
        // Game configuration
        this.gameSpeed = 5;
        this.gameOver = false;
        this.score = 0;
        
        // Setup 3D world
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
        // Create a 3D-like world with perspective
        this.worldWidth = 800;
        this.worldDepth = 20; // Number of rows in our 3D grid
        this.tileSize = 40;
        
        // Create three lanes
        this.laneWidth = this.worldWidth / 3;
        this.lanePositions = [
            this.worldWidth / 6,
            this.worldWidth / 2,
            this.worldWidth - (this.worldWidth / 6)
        ];
        
        // Create floor tiles with perspective
        this.floorTiles = [];
        
        // Create a container for all floor tiles
        this.floorContainer = this.add.container(0, 0);
        
        // Create grid of tiles with perspective
        for (let z = 0; z < this.worldDepth; z++) {
            const row = [];
            for (let x = 0; x < 3; x++) { // 3 lanes
                // Calculate perspective scaling
                const scale = this.getPerspectiveScale(z);
                const depth = z / this.worldDepth; // 0 to 1 (0 = closest, 1 = farthest)
                
                // Calculate tile position with perspective
                const tileX = this.lanePositions[x];
                const tileY = this.cameras.main.height - 100 - (z * this.tileSize * scale);
                
                // Create tile with perspective
                const tile = this.add.image(tileX, tileY, 'tile')
                    .setScale(scale)
                    .setAlpha(1 - (depth * 0.5)) // Fade into distance
                    .setTint(0x777777);
                
                // Add to container
                this.floorContainer.add(tile);
                row.push(tile);
            }
            this.floorTiles.push(row);
        }
        
        // Add side walls with perspective
        this.createWalls();
    }
    
    createWalls() {
        // Left wall
        this.leftWall = [];
        this.rightWall = [];
        
        for (let z = 0; z < this.worldDepth; z++) {
            const scale = this.getPerspectiveScale(z);
            const depth = z / this.worldDepth;
            
            // Left wall
            const leftX = 0;
            const leftY = this.cameras.main.height - 100 - (z * this.tileSize * scale);
            const leftWallTile = this.add.rectangle(
                leftX, 
                leftY, 
                this.laneWidth / 2, 
                this.tileSize * scale, 
                0x555555, 
                1 - (depth * 0.5)
            ).setOrigin(0, 0.5);
            
            // Right wall
            const rightX = this.worldWidth - (this.laneWidth / 2);
            const rightY = leftY;
            const rightWallTile = this.add.rectangle(
                rightX, 
                rightY, 
                this.laneWidth / 2, 
                this.tileSize * scale, 
                0x555555, 
                1 - (depth * 0.5)
            ).setOrigin(0, 0.5);
            
            this.leftWall.push(leftWallTile);
            this.rightWall.push(rightWallTile);
            
            this.floorContainer.add(leftWallTile);
            this.floorContainer.add(rightWallTile);
        }
    }
    
    getPerspectiveScale(z) {
        // Calculate scale based on depth (z)
        // Closer tiles are larger, farther tiles are smaller
        const minScale = 0.2;
        const maxScale = 1.0;
        return maxScale - ((z / this.worldDepth) * (maxScale - minScale));
    }
    
    createPlayer() {
        // Create player in the middle lane
        this.currentLane = 1; // Middle lane
        
        // Create a container for the player
        this.player = this.add.container(
            this.lanePositions[this.currentLane],
            this.cameras.main.height - 150
        );
        
        // Add physics to the container
        this.physics.world.enable(this.player);
        
        // Create human-like character using polygons
        this.createHumanCharacter();
        
        // Set physics properties
        this.player.body.setSize(30, 60);
        this.player.body.setCollideWorldBounds(true);
        
        // Player is changing lanes
        this.isChangingLanes = false;
        
        // Animation state
        this.runningFrame = 0;
        this.runningSpeed = 0.15;
        
        // Start running animation
        this.runTimer = this.time.addEvent({
            delay: 100,
            callback: this.animateRunning,
            callbackScope: this,
            loop: true
        });
    }
    
    addObstacle() {
        if (this.gameOver) return;
        
        // Randomly select a lane
        const lane = Phaser.Math.Between(0, 2);
        
        // Create obstacle container
        const obstacleContainer = this.add.container(
            this.lanePositions[lane],
            0
        );
        
        // Add physics to container
        this.physics.world.enable(obstacleContainer);
        
        // Create humanoid enemy using polygons
        this.createEnemyCharacter(obstacleContainer);
        
        // Set physics properties
        obstacleContainer.body.setSize(30, 60);
        obstacleContainer.body.setVelocityY(200 + this.gameSpeed * 10);
        obstacleContainer.body.setImmovable(true);
        
        // Add to obstacles group
        this.obstacles.add(obstacleContainer);
        
        // Destroy obstacle when it goes off screen
        obstacleContainer.body.checkWorldBounds = true;
        obstacleContainer.body.onWorldBounds = true;
        
        // Listen for world bounds and destroy if out of bounds
        this.physics.world.on('worldbounds', (body) => {
            if (body.gameObject === obstacleContainer && body.y > this.cameras.main.height) {
                obstacleContainer.destroy();
            }
        });
    }
    
    hitObstacle() {
        this.gameSpeed = 0;
        this.gameOver = true;
        this.obstacleTimer.remove();
        this.runTimer.remove();
        
        // Stop all obstacles
        this.obstacles.children.iterate((obstacle) => {
            obstacle.setVelocityY(0);
        });
        
        // Show game over text
        this.gameOverText.visible = true;
        
        // Make player red to indicate hit
        this.playerParts.forEach(part => {
            part.setStrokeStyle(2, 0xff0000);
            part.setFillStyle(0xff3333);
        });
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
        
        // Move floor tiles to create scrolling effect
        this.moveFloor();
        
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
    
    moveFloor() {
        // Move all floor tiles to create scrolling effect
        for (let z = 0; z < this.worldDepth; z++) {
            for (let x = 0; x < 3; x++) {
                const tile = this.floorTiles[z][x];
                
                // Move tile down
                tile.y += this.gameSpeed * (z / 5 + 1); // Closer tiles move faster
                
                // If tile is off screen, reset to top with new perspective
                if (tile.y > this.cameras.main.height) {
                    // Reset to top row
                    const newZ = 0;
                    const scale = this.getPerspectiveScale(newZ);
                    tile.y = this.cameras.main.height - 100 - (this.worldDepth * this.tileSize * scale);
                    tile.setScale(this.getPerspectiveScale(0));
                    tile.setAlpha(1);
                }
            }
        }
        
        // Move walls
        for (let z = 0; z < this.worldDepth; z++) {
            const leftWall = this.leftWall[z];
            const rightWall = this.rightWall[z];
            
            leftWall.y += this.gameSpeed * (z / 5 + 1);
            rightWall.y += this.gameSpeed * (z / 5 + 1);
            
            if (leftWall.y > this.cameras.main.height) {
                const newZ = 0;
                const scale = this.getPerspectiveScale(newZ);
                leftWall.y = this.cameras.main.height - 100 - (this.worldDepth * this.tileSize * scale);
                leftWall.height = this.tileSize * scale;
                leftWall.setAlpha(1);
                
                rightWall.y = leftWall.y;
                rightWall.height = this.tileSize * scale;
                rightWall.setAlpha(1);
            }
        }
    }
    
    createHumanCharacter() {
        // Store all player parts for animation and coloring
        this.playerParts = [];
        
        // Colors
        const skinColor = 0xf8d5a3;
        const hairColor = 0x3a3a3a;
        const shirtColor = 0x3232e6;
        const pantsColor = 0x1a1a1a;
        const shoeColor = 0x4a4a4a;
        
        // Head
        const head = this.add.polygon(0, -30, [
            -8, -8,   // top left
            8, -8,    // top right
            10, 0,    // middle right
            8, 8,     // bottom right
            -8, 8,    // bottom left
            -10, 0    // middle left
        ], skinColor);
        head.setStrokeStyle(1, 0x000000);
        this.player.add(head);
        this.playerParts.push(head);
        
        // Hair
        const hair = this.add.polygon(0, -35, [
            -8, -3,   // top left
            8, -3,    // top right
            8, 3,     // bottom right
            -8, 3     // bottom left
        ], hairColor);
        this.player.add(hair);
        this.playerParts.push(hair);
        
        // Eyes
        const leftEye = this.add.circle(-4, -30, 1.5, 0x000000);
        const rightEye = this.add.circle(4, -30, 1.5, 0x000000);
        this.player.add(leftEye);
        this.player.add(rightEye);
        this.playerParts.push(leftEye);
        this.playerParts.push(rightEye);
        
        // Torso
        const torso = this.add.polygon(0, -10, [
            -10, -10,  // top left
            10, -10,   // top right
            8, 10,    // bottom right
            -8, 10    // bottom left
        ], shirtColor);
        torso.setStrokeStyle(1, 0x000000);
        this.player.add(torso);
        this.playerParts.push(torso);
        
        // Arms
        this.leftArm = this.add.polygon(-12, -10, [
            -2, -10,  // top left
            2, -10,   // top right
            2, 10,    // bottom right
            -2, 10    // bottom left
        ], skinColor);
        this.leftArm.setStrokeStyle(1, 0x000000);
        
        this.rightArm = this.add.polygon(12, -10, [
            -2, -10,  // top left
            2, -10,   // top right
            2, 10,    // bottom right
            -2, 10    // bottom left
        ], skinColor);
        this.rightArm.setStrokeStyle(1, 0x000000);
        
        this.player.add(this.leftArm);
        this.player.add(this.rightArm);
        this.playerParts.push(this.leftArm);
        this.playerParts.push(this.rightArm);
        
        // Legs
        this.leftLeg = this.add.polygon(-5, 10, [
            -3, 0,    // top left
            3, 0,     // top right
            3, 20,    // bottom right
            -3, 20    // bottom left
        ], pantsColor);
        this.leftLeg.setStrokeStyle(1, 0x000000);
        
        this.rightLeg = this.add.polygon(5, 10, [
            -3, 0,    // top left
            3, 0,     // top right
            3, 20,    // bottom right
            -3, 20    // bottom left
        ], pantsColor);
        this.rightLeg.setStrokeStyle(1, 0x000000);
        
        this.player.add(this.leftLeg);
        this.player.add(this.rightLeg);
        this.playerParts.push(this.leftLeg);
        this.playerParts.push(this.rightLeg);
        
        // Shoes
        const leftShoe = this.add.polygon(-5, 30, [
            -4, -2,   // top left
            4, -2,    // top right
            5, 2,     // bottom right
            -5, 2     // bottom left
        ], shoeColor);
        leftShoe.setStrokeStyle(1, 0x000000);
        
        const rightShoe = this.add.polygon(5, 30, [
            -4, -2,   // top left
            4, -2,    // top right
            5, 2,     // bottom right
            -5, 2     // bottom left
        ], shoeColor);
        rightShoe.setStrokeStyle(1, 0x000000);
        
        this.player.add(leftShoe);
        this.player.add(rightShoe);
        this.playerParts.push(leftShoe);
        this.playerParts.push(rightShoe);
    }
    
    createEnemyCharacter(container) {
        // Colors - temple guardian/mummy colors
        const bodyColor = 0xd4bc7d; // Bandage color
        const accentColor = 0x8a6642; // Darker accent
        const eyeColor = 0xff0000; // Glowing red eyes
        
        // Head
        const head = this.add.polygon(0, -30, [
            -8, -8,   // top left
            8, -8,    // top right
            10, 0,    // middle right
            8, 8,     // bottom right
            -8, 8,    // bottom left
            -10, 0    // middle left
        ], bodyColor);
        head.setStrokeStyle(1, accentColor);
        container.add(head);
        
        // Eyes
        const leftEye = this.add.circle(-4, -30, 2, eyeColor);
        const rightEye = this.add.circle(4, -30, 2, eyeColor);
        container.add(leftEye);
        container.add(rightEye);
        
        // Headdress
        const headdress = this.add.polygon(0, -40, [
            -10, 0,   // bottom left
            10, 0,    // bottom right
            0, -10    // top
        ], accentColor);
        container.add(headdress);
        
        // Torso
        const torso = this.add.polygon(0, -10, [
            -10, -10,  // top left
            10, -10,   // top right
            8, 10,    // bottom right
            -8, 10    // bottom left
        ], bodyColor);
        torso.setStrokeStyle(1, accentColor);
        container.add(torso);
        
        // Arms - outstretched to look menacing
        const leftArm = this.add.polygon(-15, -15, [
            -2, -5,  // top left
            2, -5,   // top right
            2, 5,    // bottom right
            -2, 5    // bottom left
        ], bodyColor);
        leftArm.setStrokeStyle(1, accentColor);
        leftArm.setRotation(-0.5);
        
        const rightArm = this.add.polygon(15, -15, [
            -2, -5,  // top left
            2, -5,   // top right
            2, 5,    // bottom right
            -2, 5    // bottom left
        ], bodyColor);
        rightArm.setStrokeStyle(1, accentColor);
        rightArm.setRotation(0.5);
        
        container.add(leftArm);
        container.add(rightArm);
        
        // Legs
        const leftLeg = this.add.polygon(-5, 10, [
            -3, 0,    // top left
            3, 0,     // top right
            3, 20,    // bottom right
            -3, 20    // bottom left
        ], bodyColor);
        leftLeg.setStrokeStyle(1, accentColor);
        
        const rightLeg = this.add.polygon(5, 10, [
            -3, 0,    // top left
            3, 0,     // top right
            3, 20,    // bottom right
            -3, 20    // bottom left
        ], bodyColor);
        rightLeg.setStrokeStyle(1, accentColor);
        
        container.add(leftLeg);
        container.add(rightLeg);
        
        // Add some bandage details
        for (let i = 0; i < 3; i++) {
            const bandage = this.add.rectangle(0, -20 + (i * 10), 20, 2, accentColor);
            container.add(bandage);
        }
    }
    
    animateRunning() {
        if (this.gameOver) return;
        
        this.runningFrame += this.runningSpeed;
        
        // Animate legs for running
        const legSwing = Math.sin(this.runningFrame) * 10;
        
        // Move legs in opposite directions
        this.leftLeg.setPosition(-5, 10 + legSwing/2);
        this.rightLeg.setPosition(5, 10 - legSwing/2);
        
        // Animate arms for running
        const armSwing = Math.sin(this.runningFrame) * 5;
        
        // Move arms in opposite directions to legs
        this.leftArm.setPosition(-12, -10 - armSwing/2);
        this.rightArm.setPosition(12, -10 + armSwing/2);
    }
}

export default MainScene;
