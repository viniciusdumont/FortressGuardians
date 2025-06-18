class GameOverScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameOverScene' });
    }

    preload() {
        this.load.image('GameOver', 'assets/tela_derrota.png');
        this.load.image('BotaoTA', 'assets/botao_derrota.png');
    }

    create() {
        const screenWidth = this.scale.width;
        const screenHeight = this.scale.height;

        const background = this.add.image(screenWidth / 2, screenHeight / 2, 'GameOver');
        background.setDisplaySize(screenWidth, screenHeight);


        const retryButton = this.add.image(screenWidth / 2, screenHeight / 2 + 200, 'BotaoTA')
        .setOrigin(0.5)
        .setScale(0.9)
        .setInteractive({ useHandCursor: true });

        retryButton.on('pointerover', () => {
        retryButton.setTint(0xcccccc);
    });

        retryButton.on('pointerout', () => {
        retryButton.clearTint();
    });

        retryButton.on('pointerdown', () => {
        this.scene.start('main'); 
    });
    }
}