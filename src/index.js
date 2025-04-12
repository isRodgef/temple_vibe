import Phaser from 'phaser';
import MainScene from './scenes/MainScene';

// Game configuration
const config = {
    type: Phaser.AUTO,
    parent: 'game',
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    },
    scene: [MainScene]
};

// Initialize the game
const game = new Phaser.Game(config);
