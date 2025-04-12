import Phaser from 'phaser';

class MainScene extends Phaser.Scene {
    constructor() {
        super('MainScene');
    }

    preload() {
        // Load assets here
        // this.load.image('sky', 'assets/sky.png');
        // this.load.image('ground', 'assets/platform.png');
        // this.load.image('star', 'assets/star.png');
        // this.load.spritesheet('dude', 'assets/dude.png', { frameWidth: 32, frameHeight: 48 });
    }

    create() {
        // Create game objects here
        this.add.text(400, 300, 'Temple Vibe', { 
            fontSize: '32px', 
            fill: '#fff',
            fontFamily: 'Arial'
        }).setOrigin(0.5);
        
        // Display instructions
        this.add.text(400, 350, 'Game is ready for development!', { 
            fontSize: '18px', 
            fill: '#fff',
            fontFamily: 'Arial'
        }).setOrigin(0.5);
    }

    update() {
        // Game loop logic here
    }
}

export default MainScene;
